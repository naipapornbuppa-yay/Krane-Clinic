/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function syncPaymentFooterSavings(){
    const payment=document.getElementById('payment');
    if(!payment) return;
    const footerBaht=amount => '฿'+Number(amount).toLocaleString('en-US');
    const promo=Math.min(paymentDue,appliedPromo ? Math.max(0,Number(appliedPromo.amount) || 0) : 0);
    const savings=Math.max(0,paymentCredit)+Math.max(0,paymentConsultationDiscount)+promo;
    const due=currentMedicationDue();
    const total=payment.querySelector('.screen__footer [data-payment-total]');
    const saveWrap=payment.querySelector('[data-payment-save]');
    const saveAmount=payment.querySelector('[data-payment-save-amt]');
    const originalTotal=payment.querySelector('[data-payment-was]');
    if(total) total.textContent=footerBaht(due);
    if(saveWrap) saveWrap.hidden=savings<=0;
    if(originalTotal) originalTotal.hidden=savings<=0;
    if(saveAmount) saveAmount.textContent=footerBaht(savings);
    if(originalTotal) originalTotal.textContent=footerBaht(due+savings);
  }

  function enforceCheckoutSequence(){
    const body=document.querySelector('#payment > .screen__body');
    if(!body) return;
    ['order','addons','total','fulfillment','address','delivery','payment','offers','context','eco','rewards','assurance'].forEach(key => {
      body.querySelectorAll(`:scope > [data-checkout-sequence="${key}"]`).forEach(section => body.appendChild(section));
    });
  }

  function syncOrderCheckout(){
    const refillCheckout=flowState.orderState.checkoutOrigin==='refill';
    const storedRefillMedicineKeys=flowState.orderState.refillMedicineKeys || [];
    const refillMedicineKeys=new Set(storedRefillMedicineKeys.length
      ? storedRefillMedicineKeys
      : Object.keys(MEDICINE_PRICES).filter(key => Number(flowState.orderState.quantities[key] || 0)>0));
    Object.entries(MEDICINE_PRICES).forEach(([key,unit]) => {
      const quantity=Math.max(0,Number(flowState.orderState.quantities[key] || 0));
      // Keep checkout quantities aligned with the patient's pre-pay medicine
      // selection. The per-item maximum still comes from the prescription.
      document.querySelectorAll(`#payment [data-order-item="${key}"], #payment-items [data-order-item="${key}"]`).forEach(row => {
        /* A refill basket represents the selected prescription(s), not the
           entire medicine catalogue. Eligibility is separate from quantity so
           an included medicine reduced to zero can still be added back. */
        row.hidden=flowState.orderState.clinicalPrescription ? !key.startsWith('clinical-') : refillCheckout && !refillMedicineKeys.has(key);
        const qty=row.querySelector('[data-order-qty]');
        const qtyControl=row.querySelector('[data-qty-n]');
        const price=row.querySelector('[data-order-price],[data-line-price]');
        if(qty) qty.textContent=`จำนวน ${quantity} แผง`;
        if(qtyControl){
          qtyControl.textContent=String(quantity);
          const control=qtyControl.closest('[data-qty]');
          const min=Number(control?.dataset.min ?? 1);
          const max=Number(control?.dataset.max ?? quantity);
          const minus=control?.querySelector('[data-qty-minus]');
          const plus=control?.querySelector('[data-qty-plus]');
          if(minus) minus.disabled=quantity<=min;
          if(plus) plus.disabled=quantity>=max;
        }
        if(price) price.textContent=baht(unit*quantity);
        /* A declined medicine used to disappear from the basket, which left no
           way back now that quantities are edited in place. It stays listed and
           dimmed, with only the plus enabled (client, 10 Sep). */
        if(row.closest('#payment')) row.classList.toggle('is-declined',quantity<=0);
      });
    });
    document.querySelectorAll('[data-addon-option]').forEach(option => {
      const key=option.dataset.addonOption;
      const quantity=Math.max(0,Math.min(10,Number(flowState.orderState.addonQuantities[key] || 0)));
      const selected=quantity>0;
      option.classList.toggle('has-quantity',selected);
      const action=option.querySelector('[data-addon-action]');
      const count=option.querySelector('[data-addon-count]');
      const thai=document.documentElement.lang==='th';
      if(action) action.textContent='+';
      if(count){ count.hidden=!selected; count.textContent=`${quantity} ${thai ? 'ชิ้น' : 'pcs'}`; }
      const name=option.querySelector('.checkout-addon-card__copy strong')?.textContent.trim() || '';
      option.setAttribute('aria-label',document.documentElement.lang==='th'
        ? `เพิ่ม ${name} อีก 1 ชิ้น ขณะนี้ ${quantity} ชิ้น สูงสุด 10 ชิ้น`
        : `Add one more ${name}. ${quantity} in cart, maximum 10.`);
    });
    document.querySelectorAll('#payment [data-order-addon]').forEach(row => {
      const key=row.dataset.orderAddon;
      const included=Boolean(flowState.orderState.addOns[key]);
      const quantity=Math.max(0,Math.min(10,Number(flowState.orderState.addonQuantities[key] || 0)));
      row.hidden=!included;
      row.classList.toggle('is-declined',included && quantity<=0);
      const price=row.querySelector('[data-order-addon-price]');
      const quantityLabel=row.querySelector('[data-order-addon-quantity]');
      if(price) price.textContent=baht((ADDON_PRICES[key] || 0)*quantity);
      if(quantityLabel) quantityLabel.textContent=`${quantity} ชิ้น`;
    });
    /* The picked-add-on list lives under the picker now, so it has to disappear
       with its last row rather than leave an empty card behind. */
    const pickedAddons=document.querySelector('#payment [data-addon-picked-list]');
    if(pickedAddons){
      pickedAddons.hidden=![...pickedAddons.querySelectorAll('[data-order-addon]')].some(row => !row.hidden);
    }
    /* Once no nearby branch can deliver today, the two timed options cannot
       be honoured, so the checkout stops offering them and says why where the
       list used to be. */
    const sameDayOff=Boolean(flowState.orderState.sameDayUnavailable);
    document.querySelectorAll('[data-delivery-value]').forEach(option => {
      const value=option.dataset.deliveryValue;
      const selected=value===flowState.orderState.deliveryMethod;
      option.setAttribute('aria-selected',String(selected));
      option.setAttribute('aria-checked',String(selected));
      if(value==='same-day' || value==='priority') option.hidden=sameDayOff;
    });
    document.querySelectorAll('[data-payment-sla-notice]').forEach(notice => { notice.hidden=!sameDayOff; });
  }

  function confirmListAddress(){
    const entry=savedAddresses()[addressListSelected];
    if(!entry){
      showActionToast('กรุณาเลือกหรือเพิ่มที่อยู่จัดส่ง','warning');
      return;
    }
    flowState.orderState.address={...entry};
    flowState.orderState.addressConfirmed=true;
    flowState.addressDraft={...entry,remember:true};
    rememberDeliveryAddress(flowState.orderState.address,{index:addressListSelected});
    invalidateFulfillmentQuote();
    persistAddressBook();
    persistFlowState();
    syncDeliveryAddress();
    focusCheckoutDelivery=true;
    replaceCurrent('payment');
    startInlineDeliveryQuote();
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_payment_400(){
  document.addEventListener('krane:accept-plan',()=>{importClinicalPrescription(window.KraneClinical.plan());refreshMedicationCheckout();show('payment');});
}


  function startRefill(choice){
    const picks = choice==='all'
      ? availableRefillKeys()
      : (REFILL_PRESCRIPTIONS[choice] ? [choice] : []);
    if(!picks.length) return false;
    const quantities={cough:0,loratadine:0,paracetamol:0,naproxen:0};
    picks.forEach(key => {
      Object.entries(REFILL_PRESCRIPTIONS[key].quantities).forEach(([med,qty]) => {
        quantities[med]=Math.max(quantities[med] || 0, qty);
      });
    });
    const refillMedicineKeys=[...new Set(picks.flatMap(key => Object.keys(REFILL_PRESCRIPTIONS[key].quantities)))];
    Object.assign(flowState.orderState,{
      quantities,
      checkoutOrigin:'refill',
      refillPrescriptionKeys:picks,
      refillMedicineKeys
    });
    resetOptionalAddOns();
    /* The doctor already wrote this prescription, so a refill must not ask for a
       second consultation fee on the way to the same checkout. */
    Object.assign(flowState,{entryChannel:'direct',draftReady:true,consultationPaid:true,
      consultationFeeAcknowledged:true,directGeneralHealthComplete:true});
    persistFlowState();
    closeRefillSheet();
    refreshMedicationCheckout();
    show('payment');
    return true;
  }

  function flagCheckoutBlocker(state){
    const entry=CHECKOUT_BLOCKERS[state];
    if(!entry) return;
    const [selector,message]=entry;
    const target=document.querySelector('#payment '+selector);
    const guidedMessage=state==='address-required' && flowState.orderState.fulfillmentMode==='pickup'
      ? 'กรุณาเลือกตำแหน่งของคุณก่อนค้นหาร้านยา'
      : message;
    showActionToast(guidedMessage,'warning');
    if(!target) return;
    const body=document.querySelector('#payment .screen__body');
    if(body){
      const top=body.scrollTop + (target.getBoundingClientRect().top - body.getBoundingClientRect().top) - 96;
      body.scrollTo({top:Math.max(0,top), behavior:reduceMotion ? 'auto' : 'smooth'});
    }
    clearTimeout(checkoutBlockerTimer);
    document.querySelectorAll('#payment .is-blocking').forEach(el => el.classList.remove('is-blocking'));
    // Restart the animation even when the same row is tapped twice.
    void target.offsetWidth;
    target.classList.add('is-blocking');
    checkoutBlockerTimer=setTimeout(() => target.classList.remove('is-blocking'), 2600);
  }

  function syncCheckoutReadiness(){
    const button=document.querySelector('#payment [data-payment-go]');
    if(!button) return;
    const actionState=checkoutActionState();
    /* While location or pickup branch is missing, the grey button names that
       next step. It stays pressable so it can point to the required row rather
       than becoming a dead control that only reports the problem. */
    const actionable=actionState==='ready' || actionState==='quote-required';
    const guidedMissing=actionState==='address-required' || actionState==='pickup-branch-required';
    button.setAttribute('aria-disabled',String(!actionable && !guidedMissing));
    button.disabled=!actionable && !guidedMissing;
    button.classList.toggle('btn--blocked',!actionable);
    const label=button.querySelector('[data-payment-cta-label]');
    if(!label) return;
    if(actionState==='address-required') label.textContent=flowState.orderState.fulfillmentMode==='pickup' ? 'เพิ่มตำแหน่ง' : 'กรอกที่อยู่';
    else if(actionState==='pickup-branch-required') label.textContent='เลือกร้านยา';
    else if(actionState==='quote-calculating') label.textContent='กำลังคำนวณค่าจัดส่ง';
    else if(!actionable) label.textContent='ชำระเงิน';
    else if(!hasFulfillableItems() && currentMedicationDue()<=0) label.textContent='ยืนยันและดูเอกสาร';
    else if(currentMedicationDue()<=0) label.textContent='ยืนยันคำสั่งซื้อ';
    else label.textContent='ชำระเงิน';
  }

  function refreshMedicationCheckout(){
    deliveryMethod=flowState.orderState.deliveryMethod || 'same-day';
    const pickup=flowState.orderState.fulfillmentMode==='pickup';
    const subtotal=medicineSubtotal();
    const addon=selectedAddOnTotal();
    const fulfillable=hasFulfillableItems();
    const delivery=fulfillable && !pickup ? deliveryFeeFor(deliveryMethod) : 0;
    // Medicine benefits never silently pay for delivery or optional retail add-ons.
    const credit=Math.min(subtotal,partnerMedicineCoverageCredit());
    const consultationBalance=consultationBalanceDue();
    const refillCheckout=flowState.orderState.checkoutOrigin==='refill';
    // New patients are the default state in this prototype. The first visit is
    // free: show the original fee crossed out, expose the discount in the bill,
    // and subtract it from the amount due rather than styling the row only.
    const consultationDiscount=firstConsultationDiscount();
    const consultationDue=Math.max(0,consultationBalance-consultationDiscount);
    setPaymentContext({
      due:Math.max(0,consultationDue + subtotal + addon + delivery - credit),
      subtotal,
      addon,
      delivery,
      credit,
      consultationDiscount,
      method:deliveryMethod
    });
    const paymentJourney=document.querySelector('#payment > .care-journey');
    const consultationOrderRow=document.querySelector('#payment [data-order-consultation]');
    const consultationRow=document.querySelector('#payment [data-payment-consultation-row]');
    const consultationAmounts=[...document.querySelectorAll('#payment [data-payment-consultation]')];
    // A home-screen refill is a prescription-only order, not a new clinical
    // journey. Remove both the three-step consultation progress and its fee
    // line items so checkout starts directly with the repeat prescription.
    if(paymentJourney) paymentJourney.hidden=refillCheckout || flowState.entryChannel==='partner';
    if(consultationOrderRow) consultationOrderRow.hidden=refillCheckout;
    if(consultationRow) consultationRow.hidden=refillCheckout;
    if(!refillCheckout && consultationAmounts.length){
      const consultationText=consultationDiscount>0 ? baht(consultationDue) : (flowState.consultationPaid ? 'ชำระแล้ว' : baht(consultationDue));
      consultationAmounts.forEach(node => { node.textContent=consultationText; });
      document.querySelectorAll('#payment [data-payment-consultation-price]').forEach(price => {
        const original=price.querySelector('[data-payment-consultation-original]');
        if(original) original.hidden=consultationDiscount<=0;
        price.dataset.discounted=String(consultationDiscount>0);
      });
    }
    document.querySelectorAll('#payment [data-fulfillment-section]').forEach(section => { section.hidden=!fulfillable; });
    document.querySelectorAll('#payment [data-fulfillment-mode-option]').forEach(option => {
      const selected=option.dataset.fulfillmentModeOption===(pickup ? 'pickup' : 'delivery');
      option.setAttribute('aria-selected',String(selected));
    });
    document.querySelectorAll('#payment [data-fulfillment-panel]').forEach(panel => {
      panel.hidden=!fulfillable || panel.dataset.fulfillmentPanel!==(pickup ? 'pickup' : 'delivery');
    });
    document.querySelectorAll('#payment [data-fulfillment-address-section]').forEach(section => {
      section.hidden=!fulfillable;
    });
    document.querySelectorAll('#payment [data-delivery-address-detail-section]').forEach(section => {
      section.hidden=!fulfillable || pickup;
    });
    /* Same row, two jobs: it routes the courier on delivery and finds the
       nearest branch on pickup, so it says which one it is doing. */
    const addressLabel=document.querySelector('#payment [data-fulfillment-address-label]');
    const addressTitle=document.querySelector('#payment [data-fulfillment-address-title]');
    const addressValue=document.querySelector('#payment [data-payment-address]');
    const addressAction=document.querySelector('#payment [data-payment-address-action]');
    const addressRow=document.querySelector('#payment [data-payment-address-row]');
    const checkoutAddress=flowState.orderState.address || {};
    const addressConfirmed=Boolean(flowState.orderState.addressConfirmed && checkoutAddress.building && checkoutAddress.line && checkoutAddress.district);
    if(addressLabel) addressLabel.textContent=pickup ? 'ตำแหน่งของคุณ' : 'การจัดส่ง';
    if(addressTitle){
      addressTitle.textContent=pickup ? 'ตำแหน่งสำหรับค้นหาสาขาใกล้คุณ' : 'ที่อยู่จัดส่ง';
      addressTitle.hidden=addressConfirmed;
    }
    // Nothing chosen yet leaves the row on its label alone (client, 23 Sep) —
    // the action tag beside it is what says the address is still to be added.
    if(addressValue && !addressConfirmed){ addressValue.textContent=''; addressValue.hidden=true; }
    if(addressAction){
      addressAction.textContent=pickup ? 'เพิ่มตำแหน่ง' : 'เพิ่มที่อยู่';
      addressAction.hidden=addressConfirmed;
    }
    if(addressRow) addressRow.setAttribute('aria-label',addressConfirmed
      ? `${pickup ? 'เปลี่ยนตำแหน่ง' : 'เปลี่ยนที่อยู่จัดส่ง'}: ${deliveryAddressSummary(checkoutAddress)}`
      : (pickup ? 'เพิ่มตำแหน่งเพื่อค้นหาสาขาใกล้คุณ' : 'เพิ่มที่อยู่จัดส่ง'));
    const noFulfillmentNotice=document.querySelector('#payment [data-no-fulfillment-notice]');
    if(noFulfillmentNotice) noFulfillmentNotice.hidden=fulfillable;
    const medicineRow=document.querySelector('#payment [data-payment-medicine-row]');
    if(medicineRow) medicineRow.hidden=subtotal<=0;
    const deliveryRow=document.querySelector('#payment [data-payment-delivery-row]');
    if(deliveryRow) deliveryRow.hidden=!fulfillable;
    const calc=document.querySelector('#payment .checkout-calc');
    if(calc) calc.hidden=!fulfillable || pickup;
    const assurance=document.querySelector('#payment [data-checkout-assurance]');
    if(assurance) assurance.textContent=fulfillable
      ? (pickup
        ? (flowState.orderState.stockLocked ? 'ร้านยายืนยันสาขารับยา สต็อก และราคาสุทธิแล้วก่อนชำระเงิน' : 'ระบบจะยืนยันสาขารับยา สต็อก และราคาสุทธิก่อนเปิดการชำระเงิน')
        : (flowState.orderState.stockLocked ? 'ร้านยายืนยันใบสั่งยา สต็อก และราคาสุทธิแล้วก่อนชำระเงิน' : 'ระบบจะให้ร้านยายืนยันใบสั่งยา สต็อก และราคาสุทธิก่อนเปิดการชำระเงิน'))
      : 'ไม่มีรายการจัดส่ง คุณสามารถจบขั้นตอนและเปิดดูเอกสารได้ทันที';
    syncPickupBranch();
    syncCheckoutReadiness();
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_payment_537(){

  /* The order summary hands out its steppers only while the reader is editing,
     so the default state reads as a statement of the order rather than a cart.
     The quantity and its unit stay put in both modes. */
  document.body.addEventListener('click', e => {
    const editToggle=e.target.closest('[data-order-edit]');
    if(!editToggle) return;
    if(editToggle.classList.contains('checkout-order__line-edit')){
      openPaymentItemSheet(editToggle.closest('[data-order-item]'),editToggle);
      return;
    }
    const list=document.getElementById(editToggle.getAttribute('aria-controls'));
    if(!list) return;
    const editing=!list.classList.contains('is-editing');
    list.classList.toggle('is-editing',editing);
    document.querySelectorAll('#payment [data-order-edit]').forEach(button => {
      button.setAttribute('aria-pressed',String(editing));
      button.textContent=editing ? 'เสร็จสิ้น' : (button.classList.contains('checkout-order__line-edit') ? 'แก้ไข' : 'แก้ไขจำนวน');
    });
    const cap=document.querySelector('[data-order-cap]');
    if(cap) cap.hidden=!editing;
  });
}


  function renderPromo(){
    const label = document.querySelector('[data-payment-promo]');
    const row = document.querySelector('[data-payment-promo-row]');
    const code = document.querySelector('[data-payment-promo-code]');
    const amt = document.querySelector('[data-payment-promo-amount]');
    if(appliedPromo){
      // "WELCOME100 \u00b7 \u0e25\u0e14 \u0e3f 100": the verb leads in Thai, and it needs the space.
      if(label){ label.textContent = appliedPromo.code + ' \u00b7 \u0e25\u0e14 ' + baht(appliedPromo.amount); label.hidden = false; }
      if(row) row.hidden = false;
      if(code) code.textContent = '\u0e42\u0e04\u0e49\u0e14 ' + appliedPromo.code;
      if(amt) amt.textContent = '- ' + baht(appliedPromo.amount);
    }else{
      // No code applied: the row keeps its label alone, with nothing under it.
      if(label){ label.textContent = ''; label.hidden = true; }
      if(row) row.hidden = true;
    }
    const due = Math.max(0, paymentDue - (appliedPromo ? appliedPromo.amount : 0));
    flowState.orderState.promoCode=appliedPromo ? appliedPromo.code : '';
    flowState.orderState.promoAmount=appliedPromo ? appliedPromo.amount : 0;
    flowState.orderState.amountDue=due;
    ['payment','payment-gw'].forEach(id => {
      const screen = document.getElementById(id);
      if(!screen) return;
      screen.querySelectorAll('[data-payment-total]').forEach(el => { el.textContent = baht(due); });
    });
    syncPaymentFooterSavings();
    const checkout=document.getElementById('payment');
    if(checkout){
      checkout.querySelectorAll('[data-payment-required-section]').forEach(section => { section.hidden=due<=0; });
    }
    syncMedicationFailureAmount(due);
    persistFlowState();
    syncPaymentOutcome();
    syncCheckoutReadiness();
  }

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_payment_owned_273(){
if(paymentMethodModal){
    paymentMethodModal.addEventListener('click', event => {
      const option = event.target.closest('[data-method-option]');
      /* Picking a method IS the answer — the sheet used to ask for a second
         press on "ใช้วิธีนี้" (client, 18 Aug). Same rule the single-choice
         intake pages follow: the tap commits and the sheet closes. */
      if(option){
        pendingPaymentMethod = option.dataset.methodOption;
        syncPaymentMethodOptions();
        paymentMethod = pendingPaymentMethod;
        flowState.orderState.paymentMethod=paymentMethod;
        persistFlowState();
        const label = document.querySelector('[data-payment-method]');
        if(label) label.textContent = paymentMethodNames[paymentMethod];
        syncCheckoutReadiness();
        closePaymentMethodModal();
        return;
      }
      if(event.target.closest('[data-payment-method-close]')){
        closePaymentMethodModal();
        return;
      }
    });
  }
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_payment_owned_277(){
document.body.addEventListener('click', e => {
    if(e.target.closest('[data-open-methods]')){
      openPaymentMethodModal();
      return;
    }
    if(e.target.closest('[data-open-promo]')){
      openPromoModal();
      return;
    }
    if(!e.target.closest('[data-payment-go]')) return;
    if(paymentDeadlineExpired()){
      showActionToast('หมดเวลาชำระเงิน กรุณาให้ร้านยายืนยันสต็อกและยอดอีกครั้ง','warning');
      return;
    }
    const checkoutState=checkoutActionState();
    if(checkoutState==='payment-method-required'){
      openPaymentMethodModal();
      return;
    }
    if(checkoutState==='quote-required'){
      startInlineDeliveryQuote();
      return;
    }
    if(checkoutState!=='ready'){
      flagCheckoutBlocker(checkoutState);
      return;
    }
    const due=currentMedicationDue();
    if(due<=0){
      flowState.orderState.paidAmount=0;
      flowState.orderState.paidMethod='covered';
      flowState.orderState.paidAt=Date.now();
      flowState.orderState.paidDeliveryMethod=flowState.orderState.fulfillmentMode==='pickup' ? 'pickup' : flowState.orderState.deliveryMethod;
      flowState.consultationPaid=true;
      flowState.paymentResolution='covered';
      flowState.documentsUnlocked=true;
      flowState.orderDelivered=false;
      flowState.csatDone=false;
      flowState.csatDeliveryPrompted=false;
      flowState.deliveryNotified=false;
      /* A new payment starts a new parcel. The arrival stamp is written once
         and then read back, so leaving the previous order's stamp in place made
         this one report that it had arrived before it was paid for
         (client, 29 Sep). */
      flowState.orderState.deliveredAt=null;
      window.KraneGoldenDemo?.writeState({fulfilmentStatus:'Preparing'});
      persistFlowState();
      syncPaymentOutcome();
      show(hasFulfillableItems() ? 'payment-success' : 'my-documents');
      return;
    }
    show('payment-gw');
    resetGatewayAttempt('payment-gw');
    activateGatewayMethod('payment-gw',paymentMethod,{persistMedicationMethod:true});
  });
}

/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function deliveryOutcomeLabel(method=flowState.orderState.paidDeliveryMethod || flowState.orderState.deliveryMethod){
    const thai=document.documentElement.lang==='th';
    if(method==='pickup') return thai ? 'รับที่ร้าน · ระบบจะแจ้งเมื่อพร้อมรับ' : 'Store pickup · we will notify you when ready';
    if(method==='priority') return thai ? 'ด่วนพิเศษ · ประมาณ 60 นาที' : 'Priority · about 60 min';
    if(method==='same-day') return thai ? 'ภายในวันนี้ · ก่อน 18:00 น.' : 'Same day · by 6pm';
    if(method==='scheduled') return thai ? 'จัดส่งตามช่วงเวลาที่เลือก' : 'Scheduled delivery';
    return thai ? `ส่งพรุ่งนี้ · คาดว่าจะถึง ${tomorrowLabel()}` : `Ships tomorrow · arrives ${tomorrowLabel()}`;
  }

  function setPaymentContext({due=558, subtotal=438, addon=0, delivery=120, credit=0, consultationDiscount=0, method='same-day'}={}){
    // The checkout and the bank gateway are separate screens, so both are updated.
    const screens = ['payment','payment-gw'].map(id => document.getElementById(id)).filter(Boolean);
    if(!screens.length) return;
    const payment = screens[0];
    flowState.orderState.deliveryMethod=method;
    deliveryMethod=method;
    syncOrderCheckout();
    const slaNotice = payment.querySelector('[data-payment-sla-notice]');
    if(slaNotice) slaNotice.hidden = !flowState.orderState.sameDayUnavailable;
    const deliveryLabel = payment.querySelector('[data-payment-delivery-label]');
    const deliveryLabels={priority:'ค่าจัดส่งด่วนพิเศษ','same-day':'ค่าจัดส่งมาตรฐาน',postal:'ค่าจัดส่งแบบประหยัด',scheduled:'ค่าจัดส่งตามเวลา'};
    if(deliveryLabel) deliveryLabel.textContent = flowState.orderState.fulfillmentMode==='pickup' ? 'รับยาที่ร้าน' : (deliveryLabels[method] || 'ค่าจัดส่ง');
    const subtotalEl = payment.querySelector('[data-payment-subtotal]');
    const insuranceRow = payment.querySelector('[data-payment-insurance]');
    const insuranceSummary = payment.querySelector('[data-payment-insurance-summary]');
    const creditEl = payment.querySelector('[data-payment-credit]');
    const insuranceLabel = payment.querySelector('[data-payment-insurance-label]');
    const methodLabel = payment.querySelector('[data-payment-method]');
    // Figma has one subtotal row for all products; optional add-ons are folded
    // into that figure instead of creating a third breakdown line.
    if(subtotalEl) subtotalEl.textContent = baht(subtotal + addon);
    // the fee shows twice: in the bill rows and on the delivery option card
    payment.querySelectorAll('[data-payment-delivery]').forEach(el => { el.textContent = baht(delivery); });
    // Same-day delivery is distance-based, so before an address exists it can only
    // be quoted as a range. Postal stays free because it is flat-rate nationwide.
    const addrKnown = Boolean(flowState.orderState.addressConfirmed);
    const quoteCalculating = flowState.orderState.deliveryQuoteStatus==='calculating';
    payment.querySelectorAll('[data-payment-same-day-fee]').forEach(el => {
      const calculating=quoteCalculating && method==='same-day';
      el.textContent = calculating ? 'กำลังคำนวณ' : (addrKnown ? baht(deliveryFeeFor('same-day')) : 'คำนวณหลังใส่ที่อยู่');
      el.dataset.feeEstimated = addrKnown ? 'false' : 'true';
      el.dataset.feeCalculating=String(calculating);
      el.setAttribute('aria-busy',String(calculating));
    });
    payment.querySelectorAll('[data-payment-priority-fee]').forEach(el => {
      const calculating=quoteCalculating && method==='priority';
      el.textContent = calculating ? 'กำลังคำนวณ' : (addrKnown ? baht(deliveryFeeFor('priority')) : 'ค่าประมาณ ฿140 ถึง ฿240');
      el.dataset.feeEstimated = addrKnown ? 'false' : 'true';
      el.dataset.feeCalculating=String(calculating);
      el.setAttribute('aria-busy',String(calculating));
    });
    if(insuranceRow) insuranceRow.hidden = credit <= 0;
    if(insuranceSummary) insuranceSummary.hidden = credit <= 0;
    if(creditEl) creditEl.textContent = '- ' + baht(credit);
    if(insuranceLabel) insuranceLabel.textContent = credit > 0
      ? `${flowState.coverage.provider || 'กรมธรรม์'} · ${baht(credit)}`
      : '';
    if(methodLabel) methodLabel.textContent=PAYMENT_METHOD_LABELS[flowState.orderState.paymentMethod] || PAYMENT_METHOD_LABELS.qr;
    paymentConsultationDiscount=Math.max(0,Number(consultationDiscount) || 0);
    const consultationDiscountRow=payment.querySelector('[data-payment-consultation-discount-row]');
    const consultationDiscountAmount=payment.querySelector('[data-payment-consultation-discount]');
    if(consultationDiscountRow) consultationDiscountRow.hidden=paymentConsultationDiscount<=0;
    if(consultationDiscountAmount) consultationDiscountAmount.textContent='- '+baht(paymentConsultationDiscount);

    // Quote time, so the fee reads as a live calculation rather than a fixed charge.
    const calcTime = payment.querySelector('[data-fee-calc-time]');
    if(calcTime) calcTime.textContent = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
    // Carry the distance the address screen worked out, if the patient set one.
    const kmTarget = payment.querySelector('[data-payment-km]');
    if(kmTarget){
      /* Only worth showing once there is a distance to show: before an address
         exists the option card already says the fee is calculated later. */
      const known = flowState.orderState.fulfillmentMode!=='pickup' && flowState.orderState.addressConfirmed;
      kmTarget.hidden = !known;
      if(known) kmTarget.textContent = `${flowState.orderState.address.km || '3.2'} กม.`;
    }
    const promoRow = payment.querySelector('[data-payment-promo-row]');
    const promoLabel = payment.querySelector('[data-payment-promo]');
    if(promoRow) promoRow.hidden = !appliedPromo;
    if(promoLabel){
      /* Client, 23 Sep: "ใส่โค้ดส่วนลด" under "โค้ดส่วนลด" was the label again
         as an instruction, so the line appears only once a code is applied. */
      promoLabel.textContent = appliedPromo ? `${appliedPromo.code} · ลด ${baht(appliedPromo.amount)}` : '';
      promoLabel.hidden = !appliedPromo;
    }
    paymentDue = due;
    paymentCredit = Math.max(0,Number(credit) || 0);
    const finalDue=currentMedicationDue();
    flowState.orderState.amountDue=finalDue;
    const points=payment.querySelector('[data-payment-points]');
    if(points) points.textContent=`${Math.max(0,Math.floor(finalDue/10))} คะแนน`;
    const noPayment=finalDue<=0;
    payment.querySelectorAll('[data-payment-required-section]').forEach(section => { section.hidden=noPayment; });
    syncMedicationFailureAmount(finalDue);
    screens.forEach(screen => {
      screen.querySelectorAll('[data-payment-total]').forEach(el => { el.textContent = baht(finalDue); });
      const qr = screen.querySelector('svg[data-qr]');
      if(qr){ qr.dataset.qrSeed = String(finalDue); drawQR(qr); }
    });
    syncPaymentFooterSavings();
    persistFlowState();
    syncPaymentOutcome();
    syncCheckoutReadiness();
  }

  function importClinicalPrescription(plan){
    if(!plan || plan.outcome!=='prescription' || !plan.items.length)return;
    const existing=flowState.orderState.clinicalPrescription;
    if(existing?.id!==plan.id){flowState.orderState.quantities={};flowState.orderState.clinicalPrescription=plan;flowState.orderState.checkoutOrigin='consultation';}
    document.querySelectorAll('[data-clinical-order-item]').forEach(row=>row.remove());
    plan.items.forEach((item,index)=>{
      const key='clinical-'+index;MEDICINE_PRICES[key]=item.price;
      if(existing?.id!==plan.id)flowState.orderState.quantities[key]=item.qty;
      for(const screen of ['payment','payment-items']){
        const host=document.querySelector('#'+screen+' [data-order-item]')?.parentElement;if(!host)continue;
        const row=document.createElement('div');row.className='checkout-order__item';row.dataset.orderItem=key;row.dataset.clinicalOrderItem='';
        const body=document.createElement('span');body.className='checkout-order__body';
        const name=document.createElement('span');name.className='checkout-order__name';name.textContent=item.name;
        const note=document.createElement('span');note.className='checkout-order__note';note.textContent=item.directions||item.dirTH||item.dir||'';body.append(name,note);row.append(body);
        const price=document.createElement('span');price.dataset.orderPrice='';price.className='checkout-order__price';row.append(price);
        const qty=document.createElement('span');qty.dataset.qty='';qty.dataset.min='0';qty.dataset.max=String(item.qty);qty.dataset.unit=String(item.price);qty.className='qty checkout-order__stepper';
        qty.innerHTML='<button type="button" class="qty-btn" data-qty-minus aria-label="ลดจำนวน">−</button><span data-qty-n></span><button type="button" class="qty-btn" data-qty-plus aria-label="เพิ่มจำนวน">+</button>';row.append(qty);host.append(row);
      }
    });persistFlowState();
  }

  function ensurePaymentDeadline(){
    const expiresAt=Number(flowState.orderState.paymentExpiresAt);
    if(Number.isFinite(expiresAt) && expiresAt>0){
      const oneHourLimit=Date.now()+PAYMENT_WINDOW_MS;
      if(expiresAt>oneHourLimit){ flowState.orderState.paymentExpiresAt=oneHourLimit; persistFlowState(); return oneHourLimit; }
      return expiresAt;
    }
    flowState.orderState.paymentExpiresAt=Date.now()+PAYMENT_WINDOW_MS;
    persistFlowState();
    return flowState.orderState.paymentExpiresAt;
  }

  function paymentDeadlineExpired(){
    const expiresAt=Number(flowState.orderState.paymentExpiresAt);
    return Number.isFinite(expiresAt) && expiresAt>0 && expiresAt<=Date.now();
  }

  /* Counted in minutes, not hours: the window is one hour, so an "01:" that
     never changes is a wasted field. A full hour reads 60:00 and ticks down. */
  function formatPaymentCountdown(milliseconds){
    const totalSeconds=Math.max(0,Math.ceil(milliseconds/1000));
    const minutes=Math.floor(totalSeconds/60);
    const seconds=totalSeconds%60;
    return [minutes,seconds].map(value=>String(value).padStart(2,'0')).join(':');
  }

  function renderPaymentDeadline(){
    const expiresAt=ensurePaymentDeadline();
    const remaining=Math.max(0,expiresAt-Date.now());
    const expired=remaining<=0;
    document.querySelectorAll('[data-payment-deadline]').forEach(deadline=>{
      deadline.dataset.expired=String(expired);
      const time=deadline.querySelector('[data-payment-deadline-time]');
      const title=deadline.querySelector('[data-payment-deadline-title]');
      const copy=deadline.querySelector('[data-payment-deadline-copy]');
      const retry=deadline.querySelector('[data-payment-deadline-retry]');
      // The countdown lives inside the title, so only the words around it change.
      if(title){
        const lead=title.childNodes[0];
        const text=expired ? 'หมดเวลาชำระเงินแล้ว' : 'กรุณาชำระเงินภายใน ';
        if(lead && lead.nodeType===3) lead.nodeValue=text;
        else title.insertBefore(document.createTextNode(text),title.firstChild);
        if(time) time.hidden=expired;
      }
      if(copy) copy.textContent=expired ? 'ให้ร้านยายืนยันสต็อกและยอดอีกครั้งก่อนชำระเงิน' : 'ร้านยาสำรองสินค้าและราคานี้ไว้ให้คุณ';
      if(time){ time.textContent=formatPaymentCountdown(remaining); time.setAttribute('datetime',expired ? 'PT0S' : `PT${Math.ceil(remaining/1000)}S`); }
      if(retry) retry.hidden=!expired;
    });
    document.querySelectorAll('#payment [data-payment-go],#payment-gw [data-payment-submit]').forEach(button=>{
      if(expired){ button.disabled=true; button.setAttribute('aria-disabled','true'); }
      else if(button.closest('#payment-gw')){ button.disabled=false; button.setAttribute('aria-disabled','false'); }
    });
    if(expired){
      const label=document.querySelector('#payment [data-payment-cta-label]');
      if(label) label.textContent='หมดเวลาชำระเงิน';
      clearInterval(paymentDeadlineTimer);
      paymentDeadlineTimer=null;
    }
  }

  function startPaymentDeadlineTimer(){
    clearInterval(paymentDeadlineTimer);
    renderPaymentDeadline();
    if(!paymentDeadlineExpired()) paymentDeadlineTimer=setInterval(renderPaymentDeadline,1000);
  }

  function stopPaymentDeadlineTimer(){ clearInterval(paymentDeadlineTimer); paymentDeadlineTimer=null; }

  function calculatedSameDayDeliveryFee(){
    const km=Math.max(0,Number(flowState.orderState.address?.km || 0));
    return Math.max(80,Math.ceil((80 + km * 10) / 10) * 10);
  }

  function deliveryFeeFor(method=flowState.orderState.deliveryMethod){
    if(flowState.orderState.fulfillmentMode==='pickup') return 0;
    if(method==='postal') return 0;
    const quoted=Number(flowState.orderState.deliveryQuoteAmount);
    if(method===flowState.orderState.deliveryMethod && flowState.orderState.deliveryQuoteStatus==='accepted' && Number.isFinite(quoted) && quoted>0) return quoted;
    const standard=calculatedSameDayDeliveryFee();
    return method==='priority' ? standard+60 : standard;
  }

  /* The delivery option already shows the calculated fee, so "calculate delivery
     first" was a step with nothing in it: the button read that instead of paying
     and opened a screen that locked the same number (client, 17 Sep). Once the
     address and method are known, the fee on screen is the quote. Changing either
     still invalidates it, and the next pass locks the new fee. Stock and
     acceptance follow payment, as agreed on 20 Aug. */
  function lockShownDeliveryQuote(){
    const order=flowState.orderState;
    if(order.deliveryQuoteStatus==='accepted' || order.deliveryQuoteStatus==='calculating' || !hasFulfillableItems()) return;
    const pickup=order.fulfillmentMode==='pickup';
    const address=order.address || {};
    if(!(order.addressConfirmed && address.building && address.line && address.district)) return;
    if(!pickup && !order.deliveryMethod) return;
    order.deliveryQuoteStatus='accepted';
    order.deliveryQuoteAmount=pickup ? 0 : deliveryFeeFor(order.deliveryMethod);
    persistFlowState();
  }

  function startInlineDeliveryQuote(){
    clearTimeout(deliveryQuoteTimer);
    clearInterval(deliveryQuoteCountdownTimer);
    const order=flowState.orderState;
    const pickup=order.fulfillmentMode==='pickup';
    const address=order.address || {};
    if(!hasFulfillableItems()) return;
    if(!(order.addressConfirmed && address.building && address.line && address.district)) return;
    if(!pickup && !order.deliveryMethod) return;
    if(pickup || order.deliveryMethod==='postal'){
      order.deliveryQuoteStatus='accepted';
      order.deliveryQuoteAmount=0;
      ensurePaymentDeadline();
      persistFlowState();
      refreshMedicationCheckout();
      return;
    }
    order.deliveryQuoteStatus='calculating';
    order.deliveryQuoteAmount=null;
    persistFlowState();
    refreshMedicationCheckout();
    deliveryQuoteTimer=setTimeout(() => {
      const current=flowState.orderState;
      const amount=current.deliveryMethod==='same-day'
        ? calculatedSameDayDeliveryFee()
        : deliveryFeeFor(current.deliveryMethod);
      current.deliveryQuoteStatus='accepted';
      current.deliveryQuoteAmount=amount;
      ensurePaymentDeadline();
      persistFlowState();
      refreshMedicationCheckout();
    },reduceMotion ? 600 : 3500);
  }

  function checkoutActionState(){
    lockShownDeliveryQuote();
    const address=flowState.orderState.address || {};
    if(!hasFulfillableItems()) return currentMedicationDue()>0 && !flowState.orderState.paymentMethod ? 'payment-method-required' : 'ready';
    const pickup=flowState.orderState.fulfillmentMode==='pickup';
    if(!(flowState.orderState.addressConfirmed && address.building && address.line && address.district)) return 'address-required';
    if(pickup && !pickupBranchForCurrentLocation()) return 'pickup-branch-required';
    if(!pickup && !flowState.orderState.deliveryMethod) return 'delivery-method-required';
    /* Stock, acceptance and preparation all happen after the money is taken
       (client, 20 Aug), the way a delivery app does it. */
    if(flowState.orderState.deliveryQuoteStatus==='calculating') return 'quote-calculating';
    if(flowState.orderState.deliveryQuoteStatus!=='accepted') return 'quote-required';
    if(currentMedicationDue()>0 && !flowState.orderState.paymentMethod) return 'payment-method-required';
    return 'ready';
  }

  function checkoutIsReady(){ return checkoutActionState()==='ready'; }

  function setMedicationCheckoutContext(){ refreshMedicationCheckout(); }

  // medical certificate add-on (client 5 Jul): paid together with the doctor fee.
  // Keep the review screen, hosted gateway, QR and submit CTA on one amount.
  function syncConsultationPaymentAmount(){
    const certificate=document.querySelector('#consultpay [data-cert-check]');
    const on=Boolean(certificate?.checked);
    const balance=consultationBalanceDue();
    const covered=Math.max(0,CONSULTATION_FEE_BAHT-balance);
      // The medical certificate is free, so ticking it never changes the amount.
      const amount=balance;
    const fullyCovered=consultationBalanceDue()<=0 && CONSULTATION_FEE_BAHT>0;
    const row = document.querySelector('#consultpay [data-cert-row]');
    if(row) row.hidden = !on;
    /* The first consultation is discounted in full at checkout, so quoting the
       list price alone read as a charge the patient would still pay. The list
       price stays visible, struck through, beside what is actually due
       (client, 29 Sep). */
    const listPrice=CONSULTATION_FEE_BAHT;
    const feeDue=Math.max(0,listPrice-firstConsultationDiscount());
    const base=document.querySelector('#consultpay [data-consult-base-amount]');
    const listEl=document.querySelector('#consultpay [data-consult-list-amount]');
    if(base) base.textContent=baht(feeDue);
    if(listEl){
      listEl.textContent=baht(listPrice);
      listEl.hidden=feeDue>=listPrice;
    }
    const coverageRow=document.querySelector('#consultpay [data-consult-coverage-row]');
    const coverageAmount=document.querySelector('#consultpay [data-consult-coverage-amount]');
    if(coverageRow) coverageRow.hidden=covered<=0;
    if(coverageAmount) coverageAmount.textContent=fullyCovered ? 'ครอบคลุมเต็มจำนวน' : '- '+baht(covered);
    const amt = baht(amount);
    const a = document.querySelector('#consultpay [data-pay-amt]');
    const b = document.querySelector('#consultpay [data-pay-btn-amt]');
    if(a) a.textContent = amt;
    if(b) b.textContent = amt;
    document.querySelectorAll('#consultpay-gw [data-consult-payment-total]').forEach(total => {
      total.textContent=amt;
    });
    const qr=document.querySelector('#consultpay-gw svg[data-qr]');
    if(qr){ qr.dataset.qrSeed=String(amount); drawQR(qr); }
  }

  function openPaymentItemSheet(row,trigger){
    if(!paymentItemSheet || !row) return;
    const isAddon=Boolean(row.dataset.orderAddon);
    const key=isAddon ? row.dataset.orderAddon : row.dataset.orderItem;
    const control=row.querySelector('[data-qty]');
    if(!key || (!isAddon && !control)) return;
    const quantity=Math.max(0,Number(isAddon
      ? flowState.orderState.addonQuantities[key]
      : flowState.orderState.quantities[key]) || 0);
    paymentItemDraft={
      key,
      type:isAddon ? 'addon' : 'medicine',
      quantity,
      originalQuantity:quantity,
      max:isAddon ? 10 : Number(control.dataset.max || quantity),
      unit:isAddon ? Number(ADDON_PRICES[key] || 0) : Number(control.dataset.unit || 0),
      allowIncrease:true
    };
    paymentItemReturnFocus=trigger || null;
    const sourceImage=row.querySelector('.checkout-order__thumb img');
    const image=paymentItemSheet.querySelector('[data-payment-item-image]');
    if(image && sourceImage) image.src=sourceImage.currentSrc || sourceImage.src;
    const name=paymentItemSheet.querySelector('[data-payment-item-name]');
    const description=paymentItemSheet.querySelector('[data-payment-item-description]');
    if(name) name.textContent=row.querySelector('.checkout-order__name')?.textContent.trim() || 'รายการยา';
    if(description) description.textContent=row.querySelector('.checkout-order__note')?.textContent.trim() || '';
    syncPaymentItemDraft();
    paymentItemSheet.hidden=false;
    paymentItemSheet.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    paymentItemSheet.querySelector('.payment-item-dialog')?.focus({preventScroll:true});
  }

  function closePaymentItemSheet(){
    if(!paymentItemSheet || paymentItemSheet.hidden) return;
    paymentItemSheet.hidden=true;
    paymentItemSheet.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    paymentItemDraft=null;
    const focusTarget=paymentItemReturnFocus;
    paymentItemReturnFocus=null;
    focusTarget?.focus({preventScroll:true});
  }

  function commitPaymentItemQuantity(quantity){
    if(!paymentItemDraft) return;
    const key=paymentItemDraft.key;
    const isAddon=paymentItemDraft.type==='addon';
    const nextQuantity=Math.max(0,Math.min(paymentItemDraft.max,quantity));
    if(isAddon){
      flowState.orderState.addOns[key]=nextQuantity>0;
      flowState.orderState.addonQuantities[key]=nextQuantity;
    }else{
      flowState.orderState.quantities[key]=nextQuantity;
    }
    invalidateFulfillmentQuote();
    persistFlowState();
    syncOrderCheckout();
    syncDeclinedMedicines();
    refreshMedicationCheckout();
    closePaymentItemSheet();
    const zeroMessage=isAddon ? 'ปรับสินค้าเป็น 0 ชิ้นแล้ว' : 'นำยาออกจากรายการแล้ว';
    showActionToast(nextQuantity<=0 ? zeroMessage : 'อัปเดตจำนวนแล้ว','success');
  }

  function syncPaymentMethodOptions(){
    if(!paymentMethodModal) return;
    paymentMethodModal.querySelectorAll('[data-method-option]').forEach(option => {
      option.setAttribute('aria-selected', String(option.dataset.methodOption === pendingPaymentMethod));
    });
  }


  function openPaymentMethodModal(){
    if(!paymentMethodModal) return;
    pendingPaymentMethod = paymentMethod;
    syncPaymentMethodOptions();
    paymentMethodModal.hidden = false;
    paymentMethodModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    const selected = paymentMethodModal.querySelector('[data-method-option][aria-selected="true"]');
    if(selected) selected.focus();
  }

  function closePaymentMethodModal(){
    if(!paymentMethodModal) return;
    paymentMethodModal.hidden = true;
    paymentMethodModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    const trigger = document.querySelector('[data-open-methods]');
    if(trigger) trigger.focus();
  }

  function openPromoModal(){
    if(!promoModal) return;
    pendingPromoCode = appliedPromo && appliedPromo.code;
    promoModal.querySelectorAll('[data-promo-option]').forEach(opt => {
      opt.setAttribute('aria-selected', String(opt.dataset.promoOption === pendingPromoCode));
    });
    const input = promoModal.querySelector('#promoInput');
    if(input) input.value = appliedPromo ? appliedPromo.code : '';
    const status = promoModal.querySelector('[data-promo-status]');
    if(status) status.textContent = '';
    promoModal.hidden = false;
    promoModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    if(input) input.focus();
  }

  function closePromoModal(){
    if(!promoModal) return;
    promoModal.hidden = true;
    promoModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    const trigger = document.querySelector('[data-open-promo]');
    if(trigger) trigger.focus();
  }

  function applyPromoCode(rawCode){
    const status = promoModal && promoModal.querySelector('[data-promo-status]');
    const code = (rawCode || '').trim().toUpperCase();
    if(!code){ if(status) status.textContent = '\u0e01\u0e23\u0e2d\u0e01\u0e42\u0e04\u0e49\u0e14\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e14\u0e49\u0e32\u0e19\u0e1a\u0e19'; return; }
    const found = validPromoCodes[code];
    if(!found){ if(status) status.textContent = '\u0e42\u0e04\u0e49\u0e14\u0e19\u0e35\u0e49\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e43\u0e0a\u0e49\u0e44\u0e14\u0e49 \u0e2b\u0e23\u0e37\u0e2d\u0e2b\u0e21\u0e14\u0e2d\u0e32\u0e22\u0e38\u0e41\u0e25\u0e49\u0e27'; return; }
    appliedPromo = { code, amount: found.amount };
    renderPromo();
    closePromoModal();
    showActionToast('\u0e43\u0e0a\u0e49\u0e42\u0e04\u0e49\u0e14 ' + code + ' \u0e41\u0e25\u0e49\u0e27', 'success');
  }

  /* Asked to rate and choosing not to, the patient still needs the order's
     own ending somewhere they can find it. The completion goes to the alert
     list rather than disappearing with the dialog. */
  function revealDeliveryNotification(){
    flowState.deliveryNotified=true;
    persistFlowState();
    syncDeliveryNotification();
  }

  function syncDeliveryNotification(){
    if(orderFulfilmentStatus()==='Delivered' && !flowState.deliveryNotified){flowState.deliveryNotified=true;persistFlowState();}
    const notif=document.querySelector('[data-notif-delivered]');
    if(notif) notif.hidden=!flowState.deliveryNotified;
    const review=document.querySelector('[data-notif-review]');
    const preview=new URLSearchParams(location.search).get('screens')==='1';
    if(review) review.hidden=!!flowState.csatDone || !(flowState.deliveryNotified || preview);
  }


  /* Tracking marks the order received; the review is asked once, after
     payment (client, 19 Aug). */
  /* The prototype's order timeline is fixed rather than clock-driven: paid at
     11:12, prepared at 11:18, in the patient's hands just after noon. */
  // Explicit CMS demo order is a read-only snapshot; never overwrite the user's basket/address.
  function goldenOrderSnapshot(){
    if(new URLSearchParams(location.search).get('demoOrder')!=='golden') return null;
    const demo=window.KraneGoldenDemo,fixture=demo?.fixture,prescription=demo?.readState().prescription;
    if(!fixture || !prescription) return fixture || null;
    return {...fixture,treatment:{...fixture.treatment,medicines:prescription.items.map(item=>({name:item.name,dosage:item.directions || item.dirTH || item.dir || '',price:item.price*item.qty,quantity:item.qty})),medicineFee:prescription.total},order:{...fixture.order,total:prescription.total+fixture.order.deliveryFee}};
  }

  /* One figure for what this order charged, read by the parcel list and the
     activity card alike, so the two can never show different totals for the
     same order (client, 14 Sep). Checkout records it at payment; until then it
     is worked out the way checkout works it out. Whatever of the consultation
     fee is left after the goods is what this payment carried for it. */
  function orderChargeSummary(){
    const golden=goldenOrderSnapshot();
    if(golden) return {method:'same-day',subtotal:golden.treatment.medicineFee,addon:0,delivery:golden.order.deliveryFee,credit:0,promo:0,total:golden.order.total,consultationCharged:0};
    const pickup=flowState.orderState.fulfillmentMode==='pickup';
    const method=pickup ? 'pickup' : (flowState.orderState.paidDeliveryMethod || flowState.orderState.deliveryMethod || 'same-day');
    const subtotal=medicineSubtotal();
    const addon=selectedAddOnTotal();
    const delivery=hasFulfillableItems() && !pickup ? deliveryFeeFor(method) : 0;
    const credit=Math.min(subtotal,partnerMedicineCoverageCredit());
    const promo=appliedPromo ? Math.max(0,Number(appliedPromo.amount) || 0) : 0;
    const goods=subtotal+addon+delivery-credit;
    const recorded=Number(flowState.orderState.paidAmount);
    const total=flowState.orderState.paidAmount!=null && Number.isFinite(recorded)
      ? Math.max(0,recorded)
      : Math.max(0,consultationBalanceDue()+goods-promo);
    const consultationCharged=flowState.orderState.checkoutOrigin==='refill'
      ? 0
      : Math.max(0,Math.min(CONSULTATION_FEE_BAHT,total+promo-goods));
    return {method,subtotal,addon,delivery,credit,promo,total,consultationCharged};
  }

  function selectedOrderSnapshotItems(){
    const golden=goldenOrderSnapshot();
    if(golden) return golden.treatment.medicines.map((item,index)=>({key:'golden-'+index,quantity:item.quantity || 1,imageSource:''}));
    const items=[];
    const collect=(quantities,itemAttribute) => {
      Object.entries(quantities || {}).forEach(([key,value]) => {
        const quantity=Number(value);
        if(quantity<=0) return;
        const image=document.querySelector(`#payment [${itemAttribute}="${key}"] img`);
        items.push({key,quantity,imageSource:image?.getAttribute('src') || ''});
      });
    };
    collect(flowState.orderState.quantities,'data-order-item');
    collect(flowState.orderState.addonQuantities,'data-order-addon');
    return items;
  }

  function syncPostPaymentPanels(){
    const charge=orderChargeSummary();
    const methodKey=flowState.orderState.paidMethod || flowState.orderState.paymentMethod || 'qr';
    const method=PAYMENT_METHOD_LABELS[methodKey] || 'QR Code';
    const discount=Math.max(0,charge.credit+charge.promo);
    const address=goldenOrderSnapshot()?.order.address || (flowState.orderState.addressConfirmed ? deliveryAddressSummary() : 'ยังไม่ได้เลือกที่อยู่จัดส่ง');
    const courier=charge.method==='pickup' ? 'รับที่ร้านขายยา' : (charge.method==='postal' ? 'ไปรษณีย์ไทย' : 'Lalamove');
    const instruction=String(flowState.orderState.address?.note || '').trim() || 'โทรก่อนถึงและวางไว้ที่ล็อบบี้';
    const snapshotItems=selectedOrderSnapshotItems();
    setPostpayText('[data-postpay-method]',method);
    setPostpayText('[data-postpay-total]',baht(charge.total));
    setPostpayText('[data-postpay-subtotal]',baht(charge.subtotal+charge.addon+charge.consultationCharged));
    setPostpayText('[data-postpay-delivery]',charge.delivery ? baht(charge.delivery) : 'ฟรี');
    setPostpayText('[data-postpay-discount]','− '+baht(discount));
    setPostpayHidden('[data-postpay-discount-row]',discount<=0);
    setPostpayText('[data-postpay-arrival]',deliveryArrivalWindow());
    setPostpayText('[data-postpay-address]',address);
    setPostpayText('[data-postpay-courier]',courier);
    setPostpayText('[data-postpay-instruction]',instruction);
    setPostpayText('[data-postpay-item-count]',`${snapshotItems.length} รายการ`);
    /* The count and preview come from the same basket. The old markup always
       showed two medicine photos even when the order said three items. Clone
       the checkout photos for every selected line item, including add-ons. */
    renderPostpaySnapshotThumbnails(snapshotItems);
  }

  function orderFulfilmentStatus(){
    if(flowState.orderDelivered) return 'Delivered';
    const demoState=window.KraneGoldenDemo?.readState();
    // A normal showcase opens where a newly paid order really is: the pharmacy
    // is preparing it. A later stage requires an explicit demoStatus or CMS
    // state. The CMS half of that was unreachable: this returned early on the
    // demo stage alone, so an order the admin had moved to Delivered still read
    // as preparing on every ?demoStage= link. updatedAt is null until something
    // actually writes the shared state, which is what separates a fresh demo
    // from one the clinic side has driven.
    if(window.kraneDemoStage && !window.kraneDemoStatus && !demoState?.updatedAt) return 'Preparing';
    const status=demoState?.fulfilmentStatus;
    return ORDER_STAGES[status] ? status : 'Preparing';
  }

  function syncTrackingDelivery(){
    const status=orderFulfilmentStatus();
    const stage=ORDER_STAGES[status];
    const delivered=status==='Delivered';
    if(delivered){
      revealDeliveryNotification();
      if(!flowState.csatDone && !flowState.csatDeliveryPrompted && document.querySelector('#tracking.active')){
        flowState.csatDeliveryPrompted=true;persistFlowState();
        const target=document.querySelector('.screen.active')?.id || 'tracking';
        requestAnimationFrame(()=>openCsatModal(target));
      }
    }
    const activeIndex=delivered ? ORDER_STEP_ORDER.length : ORDER_STEP_ORDER.indexOf(stage.active);
    const screen=document.getElementById('tracking');
    if(screen){
      screen.querySelectorAll('[data-track-step]').forEach(step => {
        const index=ORDER_STEP_ORDER.indexOf(step.dataset.trackStep);
        step.classList.toggle('done',index<activeIndex);
        step.classList.toggle('active',index===activeIndex);
      });
      // Keep the preparation step label consistent throughout tracking.
      const prepared=screen.querySelector('[data-track-step="prepared"] strong');
      if(prepared) prepared.textContent='กำลังจัดยา';
      const deliveredStep=screen.querySelector('[data-track-step="delivered"] strong');
      if(deliveredStep)deliveredStep.textContent=ORDER_STAGES.Delivered.label;
      /* Client, 23 Sep: the two ends of the journey carry a time — when the
         money was taken, and when the parcel arrives. The paid stamp is the
         moment of payment; a deep-linked demo has never been through checkout,
         so the first visit fixes one shortly before now and keeps it rather
         than moving the time on every render. The last step shows the arrival
         window's end until the order is delivered, then the delivered stamp. */
      const paidTime=screen.querySelector('[data-track-time="paid"]');
      if(paidTime){
        if(!flowState.orderState.paidAt){
          flowState.orderState.paidAt=Date.now()-25*60000;
          persistFlowState();
        }
        paidTime.textContent=clockStamp(new Date(flowState.orderState.paidAt));
      }
      const deliveredTime=screen.querySelector('[data-track-time="delivered"]');
      if(deliveredTime){
        /* Until it arrives this is the end of the arrival window, with a tilde
           marking it as the estimate it is — a word there would have to be
           translated and would wrap the 10px column onto two lines. Arrival stamps the order once and then reads back, so
           the time the patient saw on the day is the time they see later. */
        if(delivered && !flowState.orderState.deliveredAt){
          flowState.orderState.deliveredAt=Date.now();
          persistFlowState();
        }
        deliveredTime.textContent=delivered
          ? clockStamp(new Date(flowState.orderState.deliveredAt))
          : '~'+deliveryArrivalWindow().split(' - ').pop();
      }
      const hint=screen.querySelector('[data-track-step="delivered"] .hint');
      /* A step that says it is finished should say when, in the same format
         as the paid step above it (client, 13 Sep). */
      if(hint) hint.textContent=delivered ? 'ได้รับแล้ว · '+new Date(flowState.orderState.deliveredAt).toLocaleString(document.documentElement.lang==='th' ? 'th-TH' : 'en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : 'รอดำเนินการ';
      // Receipt can only be confirmed while the order is actually on its way.
      const confirmButton=screen.querySelector('[data-delivery-confirm]');
      if(confirmButton) confirmButton.hidden=stage.active!=='out';
    }
    document.querySelectorAll('[data-order-progress-badge]').forEach(badge => {
      badge.textContent=stage.label;
      badge.className='badge badge--'+stage.tone;
    });
    /* The bar reads the same stage the badge does. A null active stage is
       delivered, so every segment is behind the patient. */
    const orderSteps=['prepared','dispatch','out','delivered'];
    const at=stage.active ? orderSteps.indexOf(stage.active) : orderSteps.length;
    document.querySelectorAll('[data-order-progress] [data-order-step]').forEach(step => {
      const index=orderSteps.indexOf(step.dataset.orderStep);
      step.classList.toggle('is-done',index<at);
      step.classList.toggle('is-current',index===at);
    });
    document.querySelectorAll('[data-order-progress]').forEach(bar => {
      if(bar.closest('#activity')) bar.hidden=delivered;
      const thaiLabel='ความคืบหน้าคำสั่งซื้อ · '+stage.label;
      const englishStage={prepared:'dispensing',dispatch:'rider collecting your order',out:'out for delivery'}[stage.active] || 'delivered';
      // Dynamic accessibility copy must use the current language immediately;
      // waiting for the translation observer leaves a Thai label for one frame.
      bar.removeAttribute('data-al-th');
      bar.dataset.progressLabelTh=thaiLabel;
      bar.dataset.progressLabelEn='Order progress · '+englishStage;
      bar.setAttribute('aria-label',document.documentElement.lang==='th' ? thaiLabel : bar.dataset.progressLabelEn);
    });
    document.querySelectorAll('[data-order-progress-note]').forEach(note => { note.textContent=stage.note; });
    const charge=orderChargeSummary();
    document.querySelectorAll('[data-order-total]').forEach(amount => { amount.textContent=baht(charge.total); });
    syncTrackingDetails(delivered);
    if(goldenOrderSnapshot()) syncPostPaymentPanels();
  }

  function deliveryArrivalWindow(){
    const minutes=flowState.orderState.deliveryMethod==='postal' ? 24*60 : 95;
    const from=new Date(Date.now()+(minutes-40)*60000);
    const to=new Date(Date.now()+minutes*60000);
    const clock=d => String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    return clock(from)+' - '+clock(to);
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_orders_selectBank(e, bank) {
      bank.closest('.bank-grid').querySelectorAll('[data-bank-select]').forEach(b => b.classList.toggle('is-selected', b === bank));
      showActionToast('เลือกธนาคารแล้ว');
      return true;

  return false;
}

function kraneHandle_orders_quantity(e, qbtn) {
      const ctl = qbtn.closest('[data-qty]');
      const nEl = ctl.querySelector('[data-qty-n]');
      const min = parseInt(ctl.dataset.min || '1', 10);
      const max = parseInt(ctl.dataset.max, 10), unit = parseInt(ctl.dataset.unit, 10);
      let q = parseInt(nEl.textContent, 10);
      q = qbtn.hasAttribute('data-qty-minus') ? Math.max(min, q - 1) : Math.min(max, q + 1);
      const item=ctl.closest('[data-order-item]')?.dataset.orderItem;
      const nextQuantities=Object.assign({},flowState.orderState.quantities,item ? {[item]:q} : {});
      nEl.textContent = q;
      ctl.querySelector('[data-qty-minus]').disabled = q <= min;
      ctl.querySelector('[data-qty-plus]').disabled = q >= max;
      const row=ctl.closest('[data-order-item]');
      const line = row?.querySelector('[data-line-price],[data-order-price]');
      if(line) line.textContent = '฿ ' + (unit * q).toLocaleString();
      if(item){
        flowState.orderState.quantities[item]=q;
        invalidateFulfillmentQuote();
        persistFlowState();
        syncOrderCheckout();
        syncDeclinedMedicines();
        refreshMedicationCheckout();
      }
      return true;

  return false;
}

/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */



  function fillDoctorName(root){
    (root || document).querySelectorAll('[data-doctor-name]').forEach(el => { el.textContent = DOCTOR_NAME; });
  }

  function followUpAppointmentFor(node){
    if(!node) return null;
    const program=window.kraneTreatmentPause;
    if(program?.isPaused(node.dataset.followupCase))return null;
    const resumed=program?.appointmentFor(node.dataset.followupCase);
    if(resumed)return new Date(resumed);
    if(program?.hasCancelledFollowup(node.dataset.followupCase))return null;
    const caseId=node.dataset.followupCase || node.dataset.followupIso || String(node.dataset.followupOffset || 'followup');
    if(followUpAppointments.has(caseId)) return followUpAppointments.get(caseId);
    const offset=Number(node.dataset.followupOffset);
    if(!Number.isFinite(offset)) return null;
    let when;
    const seededMinutes=Number(node.dataset.followupDemoMinutes);
    if(Number.isFinite(seededMinutes)){
      /* The profile's normal demo data must still read like a real clinic
         appointment. Keep it at the next 11:00 business-day slot instead of
         deriving a late-night time from when the page happens to be opened.
         The explicit demo states remain relative so QA can exercise the room
         opening transition without waiting. */
      if(followUpDemoState==='ready' || followUpDemoState==='now'){
        const demoMinutes=followUpDemoState==='ready' ? 8 : 0;
        when=new Date(Date.now()+(demoMinutes*60000));
        when.setMilliseconds(0);
      }else{
        when=new Date();
        when.setHours(11,0,0,0);
        if(when.getTime()<=Date.now()) when.setDate(when.getDate()+1);
        while(when.getDay()===0 || when.getDay()===6) when.setDate(when.getDate()+1);
      }
    }else{
      when=new Date();
      when.setHours(10,0,0,0);
      when.setDate(when.getDate()+offset);
    }
    followUpAppointments.set(caseId,when);
    return when;
  }

  function seedClinicalDemoStage(target){
    // Review links must keep the shared consent screen usable on its own. In the
    // real journey OTP is already complete before this step; seed only that
    // prerequisite here and leave the consent itself unread for interaction.
    // Opened from the rail, the password step needs a verified phone behind it.
    if(target==='set-password'){
      Object.assign(flowState,{draftReady:true,accountCreated:true,otpVerified:true,passwordSet:false});
      persistFlowState();
      return;
    }
    if(target==='consent-terms'){
      Object.assign(flowState,{accountCreated:true,otpVerified:true,passwordSet:true});
      if(flowState.entryChannel==='partner'){
        flowState.partnerPhoneVerified=true;
      }
      persistFlowState();
      isAuthenticated=true;
      syncConsentContinue();
      return;
    }
    // The review directory may open this form directly. Seed only the steps
    // before it, leaving the patient details unconfirmed for the reviewer.
    if(target==='patient-info'){
      Object.assign(flowState,{
        entryChannel:'direct',draftReady:true,accountCreated:true,otpVerified:true,
        passwordSet:true,consentsComplete:true,patientInfoComplete:false
      });
      persistFlowState();
      isAuthenticated=true;
      return;
    }
    const directGate=target==='intake-general' && flowState.entryChannel==='direct';
    if(!REQUIRED_CARE_TARGETS.has(target) && !directGate) return;
    // Review entry to downstream partner screens needs the completed PHR prerequisite.
    if(flowState.entryChannel==='partner' && DIRECT_PRE_DOCTOR_GATE_TARGETS.has(target)) seedPartnerStage('matching');
    Object.assign(flowState,{
      draftReady:true,accountCreated:true,otpVerified:true,passwordSet:true,consentsComplete:true,
      patientInfoComplete:true,identityVerified:true,patientName:flowState.patientName || 'มะลิ ส.'
    });
    if(directGate){
      flowState.consultationFeeAcknowledged=true;
      flowState.directGeneralHealthComplete=false;
    } else if(flowState.entryChannel==='direct' && ['matching','appointment','appointment-booked','consultpay','consultpay-gw','consultpay-fail','waitroom','consult','video','rx-writing','rx-plan','address','delivery-quote','pharmacy-search','pharmacypending','payment-items','payment','payment-gw','payment-processing','payment-success','insurance','insurance-result','payfail','tracking','order-summary','feedback','feedbackdone','upload-rx'].includes(target)){
      flowState.consultationFeeAcknowledged=true;
      flowState.directGeneralHealthComplete=true;
    }
    saveConsentRecords('direct',Object.entries(consentDocuments).map(([type,document]) => ({
      type,version:document.version,acceptedAt:new Date().toISOString()
    })));
    /* Anything downstream of the address step reads that address back, and a
       deep link never walked through it. Without this the tracking demo showed
       "no delivery address chosen" on a delivered order. */
    if(['tracking','order-summary','payment-items','payment','payment-gw','payment-processing','payment-success','payfail','delivery-quote',
        'pharmacy-search','pharmacypending'].includes(target)
       && !flowState.orderState.addressConfirmed){
      Object.assign(flowState.orderState.address,{
        building:'ลุมพินี เพลส พระราม 4',floor:'ชั้น 12 ห้อง 1204',line:'1922 ถนนพระรามที่ 4',
        subdistrict:'คลองเตย',districtName:'คลองเตย',province:'กรุงเทพมหานคร',postcode:'10110',
        district:'คลองเตย กรุงเทพมหานคร 10110',km:'3.2',
        recipientFirstName:splitRecipientName(flowState.patientName || 'มะลิ ส.').firstName,
        recipientLastName:splitRecipientName(flowState.patientName || 'มะลิ ส.').lastName,
        recipientName:flowState.patientName || 'มะลิ ส.',recipientPhone:flowState.verifiedPhone || '0812345678'
      });
      flowState.orderState.addressConfirmed=true;
    }
    if(['payment','payment-gw','payment-processing','payment-success','payfail','tracking','order-summary'].includes(target)){
      flowState.consultationPaid=true;
    }
    if(target==='payment'){
      flowState.orderState.address={};
      flowState.orderState.addressConfirmed=false;
      flowState.orderState.deliveryQuoteStatus='pending';
      flowState.orderState.deliveryQuoteAmount=null;
    }
    persistFlowState();
    isAuthenticated=true;
    hasActiveCase=true;
  }

  /* The picker keeps the group in selectedCategoryId and the condition in
     selectedConditionId, so both are checked — a deep link can set either. */
  function needsAppointment(){
    return APPOINTMENT_ONLY.has(selectedCategoryId) || APPOINTMENT_ONLY.has(selectedConditionId);
  }

  function consultationBalanceDue(){
    if(flowState.orderState.checkoutOrigin === 'refill') return 0;
    if(flowState.consultationPaid) return 0;
    if(flowState.entryChannel === 'partner'){
      const explicitBalance=flowState.partnerConsultationBalanceDue;
      if(typeof explicitBalance === 'number' && Number.isFinite(explicitBalance)) return Math.max(0,explicitBalance);
    }
    const credit=Number(flowState.coverage?.consultationCredit || 0);
    return Math.max(0,CONSULTATION_FEE_BAHT-credit);
  }

  function firstConsultationDiscount(){
    if(flowState.orderState.checkoutOrigin==='refill') return 0;
    // The current prototype represents a patient's first Krane consultation.
    // Keep the full discount visible even when the consultation step itself has
    // already been completed; that flag means "past the fee step", not a repeat visit.
    return CONSULTATION_FEE_BAHT;
  }

  function appointmentSlotUnavailable(minutes,dayIndex,now){
    const currentMinutes=now.getHours()*60+now.getMinutes();
    if(dayIndex===0 && minutes<currentMinutes+15) return true;
    const slotIndex=(minutes-540)/15;
    // Deterministic sample occupancy, varied by day; no backend availability is implied.
    return (slotIndex+dayIndex*3)%9===0 || (slotIndex+dayIndex*7)%17===0;
  }

  function syncConsultationCoverageLabels(){
    const due=consultationBalanceDue();
    const covered=due<=0;
    const coveredPartner=covered && flowState.entryChannel==='partner';
    document.querySelectorAll('[data-consultation-balance-label]').forEach(label => {
      label.textContent=coveredPartner ? 'ค่าปรึกษาแพทย์ (ใช้สิทธิ์ประกัน)' : (covered ? 'ค่าปรึกษาแพทย์' : 'ค่าปรึกษาแพทย์ที่ต้องชำระ');
    });
    document.querySelectorAll('[data-consultation-balance-amount]').forEach(amount => {
      amount.textContent=coveredPartner ? 'ครอบคลุม' : (covered ? baht(CONSULTATION_FEE_BAHT) : baht(due));
    });
    document.querySelectorAll('[data-consultation-balance-hint]').forEach(hint => {
      hint.hidden=false;
      hint.textContent=coveredPartner
        ? 'ตรวจสอบสิทธิ์ประกันแล้ว ไม่มีการเรียกเก็บค่าปรึกษาในขั้นตอนนี้'
        : covered
          ? `สิทธิ์ประกันครอบคลุมค่าปรึกษาแพทย์ ${baht(CONSULTATION_FEE_BAHT)} จึงไม่ต้องชำระค่าปรึกษา ณ ขั้นตอนนี้`
        : 'ชำระครั้งเดียวก่อนเข้าพบแพทย์ หากแพทย์สั่งยา ค่ายาและค่าจัดส่งจะแยกชำระภายหลัง';
    });
    const paymentStatus=document.querySelector('[data-consultation-payment-status]');
    if(paymentStatus) paymentStatus.textContent=coveredPartner
      ? 'ตรวจสอบสิทธิ์ประกันแล้ว'
      : covered
        ? `${baht(CONSULTATION_FEE_BAHT)} อยู่ในสิทธิ์`
      : `${baht(CONSULTATION_FEE_BAHT)} ชำระแล้ว`;
  }

  function consultationHandoffTarget(){
    const timing=flowState.consultationPaymentTiming === 'before' ? 'before' : 'after';
    const booked=Boolean(flowState.appointmentWhen);
    const preDoctorTarget=flowState.entryChannel==='direct' && !flowState.directGeneralHealthComplete
      ? 'intake-general'
      : (booked ? 'appointment-booked' : 'waitroom');
    if(consultationBalanceDue()<=0) return preDoctorTarget;
    return timing==='before' || !flowState.consultationFeeAcknowledged ? 'consultpay' : preDoctorTarget;
  }

  function savePendingQueue(){
    if(queuePreview || !pendingQueue) return;
    saveIntakeDraft(); persistFlowState();
    pendingQueue.session={};
    [FLOW_STATE_KEY,DRAFT_KEY,CONSENT_RECORD_KEY].forEach(key => pendingQueue.session[key]=readSessionJson(key));
    writeLocalJson(QUEUE_KEY,pendingQueue);
  }

  function leaveCsat(){
    // Asked from the order it is about, the patient is already on the target
    // screen and there is nowhere to go.
    if(document.querySelector('.screen.active')?.id === csatTarget) return;
    // The automatic hop replaces the payment screen in history; the CTA pushes.
    if(csatReplaces) replaceCurrent(csatTarget); else show(csatTarget);
  }

  function closeCsatModal(){
    if(!csatModal) return;
    csatModal.hidden = true;
    csatModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  function csatScore(group){
    return csatModal?.querySelectorAll(`[data-csat-${group}] .star.on`).length || 0;
  }

  function stopTrackingDemoWalk(){
    window.clearTimeout(trackingDemoTimer);
    trackingDemoTimer=0;
  }

  /* The arrival window, the courier block and the order footer all read from
     the order the patient actually placed, so the screen never shows a basket
     or an address that belongs to nobody. The rider's own details stay fixed:
     there is no dispatch service behind the prototype to name a real one. */
  function syncTrackingDetails(delivered){
    const screen=document.getElementById('tracking');
    if(!screen) return;
    const golden=goldenOrderSnapshot();
    const pickup=!golden && flowState.orderState.fulfillmentMode==='pickup';
    const state=screen.querySelector('[data-delivery-eta-state]');
    const windowEl=screen.querySelector('[data-delivery-eta-window]');
    const label=screen.querySelector('.delivery-eta__label');
    const outForDelivery=screen.querySelector('[data-track-step="out"]')?.classList.contains('active');
    const preparing=screen.querySelector('[data-track-step="prepared"]')?.classList.contains('active');
    if(label) label.textContent=delivered ? 'ส่งถึงเมื่อ' : (pickup ? 'รับได้ประมาณ' : 'ถึงประมาณ');
    screen.querySelector('.delivery-eta')?.classList.toggle('is-delivered',Boolean(delivered));
    /* The card is scanned, not read: one clause each. */
    if(state){
      state.textContent=delivered
        ? 'จัดส่งสำเร็จ'
        : pickup
          ? 'รับยาได้ที่ร้าน'
          : outForDelivery
            ? 'กำลังจัดส่ง'
            : orderFulfilmentStatus()==='Rider pickup'
              ? 'กำลังจัดส่ง'
            : preparing
              ? 'กำลังจัดยา'
              : 'กำลังจัดส่ง';
    }
    if(windowEl) windowEl.textContent=delivered ? clockStamp(new Date(flowState.orderState.deliveredAt || Date.now())) : deliveryArrivalWindow();
    /* Reached from an activity card rather than through the address step, the
       row read "no delivery address chosen" on an order already on the road.
       An empty address is a missing fact, so the row goes rather than states it. */
    const address=screen.querySelector('[data-delivery-address]');
    const hasAddress=Boolean(golden || flowState.orderState.addressConfirmed);
    if(address && hasAddress) address.textContent=golden?.order.address || deliveryAddressSummary();
    if(golden){
      screen.querySelector('[data-delivery-recipient]').textContent=golden.patient.name;
      const phone=screen.querySelector('[data-delivery-recipient-phone]');
      if(phone){phone.textContent=golden.patient.phone;phone.removeAttribute('href');}
    }
    screen.querySelectorAll('[data-delivery-courier]').forEach(courier => {
      courier.textContent=!golden && flowState.orderState.deliveryMethod==='postal' ? 'ไปรษณีย์ไทย' : 'Lalamove';
    });
    // The courier rows are meaningless for a counter pickup.
    screen.querySelectorAll('[data-delivery-courier],[data-delivery-address]').forEach(el => {
      const fact=el.closest('.delivery-fact');
      if(!fact) return;
      fact.hidden = pickup || (el.hasAttribute('data-delivery-address') && !hasAddress);
    });
    /* Same-day and postal are two different deliveries, and the screen was
       showing both: a rider with a live position and a Thailand Post tracking
       number for the same order. A parcel number belongs to the postal one, a
       named rider to the same-day one, and only one of them is ever true. */
    const postal=!golden && !pickup && flowState.orderState.deliveryMethod==='postal';
    const deliveryIcon=screen.querySelector('[data-track-step="out"] use');
    if(deliveryIcon) deliveryIcon.setAttribute('href',postal ? '#krane-delivery-truck' : '#krane-delivery-motorcycle');
    const parcelCard=screen.querySelector('[data-tracking-reference]');
    if(parcelCard) parcelCard.hidden=!postal;
    /* Rendered from the order, not written into the markup, so it always shows
       what was actually paid for including anything declined at checkout. */
    const items=document.querySelector('#order-summary [data-delivery-items]');
    if(items){
      const charge=orderChargeSummary();
      const rows=[];
      /* The list reads like the receipt: every line this order involved, then
         the one amount it charged, which is the same amount the activity card
         shows. The consultation leads it the way it leads checkout; when it was
         settled before this payment, or a plan covered it, the line says so
         rather than adding to the total (client, 13 and 14 Sep). */
      const consultationRow=document.querySelector('#payment [data-order-consultation]');
      if(consultationRow && flowState.orderState.checkoutOrigin!=='refill'){
        const covered=Math.max(0,Math.min(CONSULTATION_FEE_BAHT,Number(flowState.coverage?.consultationCredit || 0)));
        rows.push({
          name:consultationRow.querySelector('.checkout-order__name')?.textContent || 'ค่าปรึกษาแพทย์',
          description:consultationRow.querySelector('.checkout-order__note')?.textContent || '',
          quantity:charge.consultationCharged>0 ? '1 ครั้ง' : (covered ? 'อยู่ในสิทธิ์' : 'ชำระแล้วตอนปรึกษา'),
          price:charge.consultationCharged,
          priceText:charge.consultationCharged ? '' : '฿ 0',
          icon:consultationRow.querySelector('.checkout-order__thumb')
        });
      }
      Object.entries(MEDICINE_PRICES).forEach(([key,unit]) => {
        const quantity=Math.max(0,Number(flowState.orderState.quantities[key] || 0));
        if(!quantity) return;
        const paymentRow=document.querySelector(`#payment [data-order-item="${key}"]`);
        const name=paymentRow?.querySelector('.checkout-order__name')?.textContent || key;
        const description=paymentRow?.querySelector('.checkout-order__note')?.textContent || '';
        const photo=paymentRow?.querySelector('.checkout-order__thumb img')?.getAttribute('src') || '';
        rows.push({name,description,quantity:quantity+' แผง',price:unit*quantity,photo});
      });
      Object.entries(ADDON_PRICES).forEach(([key,price]) => {
        const quantity=Math.max(0,Math.min(10,Number(flowState.orderState.addonQuantities[key] || 0)));
        if(!quantity) return;
        const paymentRow=document.querySelector(`#payment [data-order-addon="${key}"]`);
        const name=paymentRow?.querySelector('.checkout-order__name')?.textContent || key;
        const description=paymentRow?.querySelector('.checkout-order__note')?.textContent || '';
        const photo=paymentRow?.querySelector('.checkout-order__thumb img')?.getAttribute('src') || '';
        rows.push({name,description,quantity:quantity+' ชิ้น',price:price*quantity,photo});
      });
      if(hasFulfillableItems()){
        const courierIcon=screen.querySelector('[data-delivery-courier]')?.closest('.delivery-fact')?.querySelector('.delivery-fact__icon');
        rows.push({
          name:charge.method==='pickup' ? 'รับยาที่ร้าน' : 'ค่าจัดส่ง',
          description:charge.method==='pickup' ? 'ร้านยาฟาสซิโน' : charge.method==='postal' ? 'ไปรษณีย์ไทย' : 'Lalamove ภายในวัน',
          quantity:'',
          price:charge.delivery,
          priceText:charge.delivery ? '' : 'ฟรี',
          icon:courierIcon
        });
      }
      if(charge.credit) rows.push({name:'สิทธิ์ประกันค่ายา',description:'',quantity:'',price:-charge.credit});
      if(charge.promo) rows.push({name:'ส่วนลด',description:appliedPromo?.code || '',quantity:'',price:-charge.promo});
      if(golden){
        rows.splice(0,rows.length,...golden.treatment.medicines.map(item=>({name:item.name,description:item.dosage,quantity:item.quantity ? String(item.quantity) : '',price:item.price})),{name:'ค่าจัดส่ง',description:'Lalamove',quantity:'',price:golden.order.deliveryFee});
      }
      items.replaceChildren(...rows.map(row => {
        const line=document.createElement('div');
        // A credit or a discount has no picture, so it takes the two-column row.
        line.className=row.photo || row.icon ? 'delivery-item' : 'delivery-item delivery-item--adjust';
        if(row.photo){
          const thumb=document.createElement('span');
          thumb.className='delivery-item__thumb';
          thumb.setAttribute('aria-hidden','true');
          const image=document.createElement('img');
          image.src=row.photo;
          image.alt='';
          image.loading='lazy';
          image.decoding='async';
          thumb.append(image);
          line.append(thumb);
        }
        else if(row.icon){
          const thumb=document.createElement('span');
          thumb.className='delivery-item__thumb delivery-item__thumb--service';
          thumb.append(...row.icon.cloneNode(true).childNodes);
          line.append(thumb);
        }
        const body=document.createElement('span');
        body.className='delivery-item__body';
        const name=document.createElement('span');
        name.className='delivery-item__name';
        name.textContent=row.name;
        const description=document.createElement('span');
        description.className='delivery-item__description';
        description.textContent=row.description;
        body.append(name,description);
        const meta=document.createElement('span');
        meta.className='delivery-item__meta';
        const price=document.createElement('span');
        price.className='delivery-item__price';
        price.textContent=row.priceText || (row.price<0 ? '−'+baht(-row.price) : baht(row.price));
        const quantity=document.createElement('span');
        quantity.className='delivery-item__quantity';
        quantity.textContent=row.quantity;
        meta.append(price,quantity);
        line.append(body,meta);
        return line;
      }));
      if(rows.length){
        const foot=document.createElement('div');
        foot.className='delivery-item delivery-item--total';
        const label=document.createElement('span');
        label.className='delivery-item__name';
        label.textContent='ยอดชำระ';
        const price=document.createElement('span');
        price.className='delivery-item__price';
        price.textContent=baht(charge.total);
        foot.append(label,price);
        items.append(foot);
        /* Client, 5 Oct: the list already names every line and the amount, so
           the "สรุปการชำระเงิน" card under it was the same three numbers a
           second time. The one thing it said that the list did not is how the
           order was paid, which belongs with the amount it paid. */
        const method=document.createElement('div');
        method.className='delivery-item delivery-item--method';
        const methodLabel=document.createElement('span');
        methodLabel.className='delivery-item__name';
        methodLabel.textContent='ชำระด้วย';
        const methodValue=document.createElement('span');
        methodValue.className='delivery-item__price';
        methodValue.textContent=screen.querySelector('[data-postpay-method]')?.textContent?.trim()
          || document.querySelector('#payment [data-payment-method]')?.textContent?.trim() || 'QR Code';
        method.append(methodLabel,methodValue);
        items.append(method);
      }
      items.closest('.stack-2').hidden=!rows.length;
    }
    const recipient=screen.querySelector('[data-delivery-recipient]');
    const recipientPhone=screen.querySelector('[data-delivery-recipient-phone]');
    const savedName=String(flowState.orderState.address.recipientName || flowState.patientName || '').trim();
    const savedPhone=String(flowState.orderState.address.recipientPhone || flowState.verifiedPhone || '').trim();
    if(recipient && savedName) recipient.textContent=savedName;
    if(recipientPhone && savedPhone){
      recipientPhone.textContent=formatThaiPhone(savedPhone);
      recipientPhone.href='tel:+66'+normalizePhone(savedPhone).replace(/^0/,'');
    }
    const recipientFact=recipientPhone?.closest('.delivery-fact');
    // Who it is going to still matters when it is going by post.
    if(recipientFact) recipientFact.hidden=pickup;
    /* The rider only exists once the order has left the pharmacy, and never for
       post or a counter pickup. */
    const riderLine=screen.querySelector('[data-track-rider]');
    if(riderLine){
      const outStep=screen.querySelector('[data-track-step="out"]');
      const onTheRoad=Boolean(outStep && (outStep.classList.contains('active') || outStep.classList.contains('done')));
      riderLine.hidden=pickup || postal || !onTheRoad;
    }
    const riderButton=screen.querySelector('[data-rider-locate]');
    if(riderButton) riderButton.hidden=pickup || postal || !outForDelivery;
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_clinical_csatOpen(e, csatGo) { openCsatModal(csatGo.dataset.csatGo); return true;
  return false;
}

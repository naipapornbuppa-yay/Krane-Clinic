/* pharmacy-search: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_pharmacy_search_demoNoStock(e, noStock) {
      if(noStock.closest('.rail')){
        seedClinicalDemoStage('pharmacy-search');
        history=seededHistory('pharmacy-search');
      }
      pharmacyForceDecline = true;
      show('pharmacy-search',!noStock.closest('.rail'));
      return true;

  return false;
}

/** Route lifecycle, including cleanup on exit/re-entry. Invoked at the original router position. */
function kraneRoute_pharmacy_search_2(id){
clearTimeout(phTimer); clearTimeout(phFailTimer); clearTimeout(phStageTimer); clearInterval(phCountdownTimer);
    const pScr = document.getElementById('pharmacy-search');
    if(id === 'pharmacy-search' && pScr){
      const thai=document.documentElement.lang==='th';
      const heading = pScr.querySelector('[data-ph-heading] .h1');
      const hint = pScr.querySelector('[data-ph-heading] .muted');
      const graphic = pScr.querySelector('[data-ph-graphic]');
      const phCountdown = pScr.querySelector('[data-ph-countdown]');
      if(graphic){
        graphic.classList.remove('state-view__visual--danger');
        graphic.classList.add('state-view__visual--loading');
      }
      /* Two named stages on one clock: finding a pharmacy, then the pharmacist
         checking the order (client, 19 Aug). A retry re-enters at stage one. */
      const phHeadings = thai
        ? ['กำลังค้นหาร้านยาใกล้คุณ','กำลังตรวจสอบร้านยาอื่น','กำลังตรวจสอบร้านยาอื่น']
        : ['Finding a pharmacy near you','Checking another pharmacy','Checking another pharmacy'];
      if(heading) heading.textContent = phHeadings[Math.min(pharmacyRetryCount, 2)];
      if(hint) hint.textContent = pharmacyRetryCount
        ? (thai ? 'ร้านก่อนหน้านี้มีสินค้าไม่ครบ กำลังหาร้านใหม่ก่อนเปิดการชำระเงิน' : 'The previous pharmacy did not have every item. Checking another branch before payment.')
        : (thai ? 'ส่งรายการให้ร้านยาที่ใกล้ที่สุดก่อนเปิดการชำระเงิน' : 'Sending the order to the nearest pharmacy before payment opens.');
      if(!pharmacyRetryCount){
        phStageTimer=setTimeout(() => {
          if(!pScr.classList.contains('active')) return;
          if(heading) heading.textContent = thai ? 'เภสัชกรกำลังตรวจสอบรายการ' : 'Pharmacist checking your order';
          if(hint) hint.textContent = thai
            ? 'ตรวจใบสั่งยา สต็อก และราคาสุทธิก่อนชำระเงิน'
            : 'Checking the prescription, stock and final price before payment.';
        }, reduceMotion ? 600 : 4200);
      }
      let phElapsedSeconds=0;
      paintElapsedTimer(phCountdown,phElapsedSeconds);
      phCountdownTimer=setInterval(() => {
        if(!pScr.classList.contains('active')){ clearInterval(phCountdownTimer); return; }
        phElapsedSeconds+=1;
        paintElapsedTimer(phCountdown,phElapsedSeconds);
      },1000);
      phTimer = setTimeout(() => {
        if(!pScr.classList.contains('active')) return;
        if(pharmacyForceDecline){
          pharmacyForceDecline = false; // one-shot demo trigger
          // Failed state: shown automatically, no action required from the patient.
          if(heading) heading.textContent = thai ? 'กำลังตรวจสอบร้านยาอื่น' : 'Checking another pharmacy';
          if(hint) hint.textContent = thai ? 'ร้านก่อนหน้านี้มีสินค้าไม่ครบ กำลังหาร้านใหม่ก่อนเปิดการชำระเงิน' : 'The previous pharmacy did not have every item. Checking another branch before payment.';
          if(graphic){
            graphic.classList.remove('state-view__visual--loading');
            graphic.classList.add('state-view__visual--danger');
          }
          phFailTimer = setTimeout(() => {
            if(!pScr.classList.contains('active')) return;
            pharmacyRetryCount += 1;
            if(pharmacyRetryCount >= 3){
              /* Client, 5 Oct: this used to be a screen of its own that said
                 no branch could deliver today and offered one button, which
                 was the button the patient had already pressed on checkout.
                 The checkout says it instead: same-day and priority come off
                 the list, the order falls back to standard post, and a toast
                 says why. Nothing else about the page changes. */
              deliveryMethod = 'postal';
              flowState.orderState.deliveryMethod='postal';
              flowState.orderState.fulfillmentMode='delivery';
              flowState.orderState.sameDayUnavailable=true;
              flowState.orderState.deliveryQuoteStatus='accepted';
              flowState.orderState.deliveryQuoteAmount=0;
              flowState.orderState.stockLocked=true;
              flowState.orderState.pharmacyAccepted=true;
              flowState.orderState.pharmacyPrepared=false;
              flowState.orderState.paymentExpiresAt=Date.now()+PAYMENT_WINDOW_MS;
              persistFlowState();
              pharmacyRetryCount = 0;
              pharmacyForceDecline = false;
              refreshMedicationCheckout();
              replaceCurrent('payment');
              showActionToast('ไม่มีร้านที่ส่งได้ภายในวัน เปลี่ยนเป็นจัดส่งมาตรฐาน 1 ถึง 3 วัน ไม่มีค่าใช้จ่ายเพิ่ม','warning');
              return;
            }
            show('pharmacy-search', false);
          }, 1400);
          return;
        }
        pharmacyRetryCount = 0;
        if(window.KraneGoldenDemo) window.KraneGoldenDemo.advanceFulfilment('Pharmacy accepted');
        const lockedDeliveryFee=flowState.orderState.fulfillmentMode==='pickup' ? 0 : (flowState.orderState.deliveryMethod==='same-day' ? calculatedSameDayDeliveryFee() : 0);
        flowState.orderState.deliveryQuoteStatus='accepted';
        flowState.orderState.deliveryQuoteAmount=lockedDeliveryFee;
        flowState.orderState.stockLocked=true;
        flowState.orderState.pharmacyAccepted=true;
        flowState.orderState.pharmacyPrepared=false;
        flowState.orderState.paymentExpiresAt=Date.now()+PAYMENT_WINDOW_MS;
        persistFlowState();
        /* Stock recheck is a pre-payment detour, not fulfilment. Return to the
           same checkout with the refreshed quote; no payment or tracking state
           is created here. */
        replaceCurrent('payment');
        showActionToast('ร้านยายืนยันสต็อกและอัปเดตยอดแล้ว','success');
      }, 10000);
    }
}

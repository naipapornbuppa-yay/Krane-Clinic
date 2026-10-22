/* delivery-quote: Owns quote display, count-up and delayed transition. Shared fulfilment pricing/state remain central. Baseline exit guard prevents navigation; re-entry resets the timers.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

/** Activation/event branch; called in its original order by shared/lib/navigation.js. */
function kraneHandle_delivery_quote_lifecycle_15(){

      clearTimeout(deliveryQuoteTimer);
      clearInterval(deliveryQuoteCountdownTimer);
      /* SCR-013B confirms the delivery method and shows only an estimate. The
         next SCR-014 owns pharmacy acceptance, stock and final pricing. Keeping
         those responsibilities separate prevents checkout opening too early. */
      const quoteScreen=document.getElementById('delivery-quote');
      const title=quoteScreen?.querySelector('[data-delivery-quote-title]');
      const copy=quoteScreen?.querySelector('[data-delivery-quote-copy]');
      if(!hasFulfillableItems()){
        replaceCurrent('payment');
        return true;
      }
      invalidateFulfillmentQuote();
      persistFlowState();
      /* One state, not two (client, 23 Aug): title, one line, counter — the
         same shape as every other loading screen. The old version changed its
         own heading halfway through, which read as two pages in five seconds. */
      quoteScreen.dataset.quoteState='estimating';
      const pickup=flowState.orderState.fulfillmentMode==='pickup';
      if(title) title.textContent=pickup ? 'กำลังค้นหาสาขารับยา' : 'กำลังคำนวณค่าจัดส่ง';
      if(copy) copy.textContent=pickup ? 'ตรวจสอบสาขาใกล้คุณและเวลารับยา' : 'ตรวจสอบพื้นที่จัดส่งและค่าจัดส่งโดยประมาณ';
      const quoteCountdown=quoteScreen.querySelector('[data-delivery-quote-timer]');
      let quoteElapsedSeconds=0;
      paintElapsedTimer(quoteCountdown,quoteElapsedSeconds);
      clearInterval(deliveryQuoteCountdownTimer);
      deliveryQuoteCountdownTimer=setInterval(() => {
        quoteElapsedSeconds+=1;
        paintElapsedTimer(quoteCountdown,quoteElapsedSeconds);
        if(quoteElapsedSeconds>=DELIVERY_QUOTE_SECONDS) clearInterval(deliveryQuoteCountdownTimer);
      },1000);
      deliveryQuoteTimer=setTimeout(() => {
        clearInterval(deliveryQuoteCountdownTimer);
        if(!quoteScreen?.classList.contains('active')) return;
        const sameDay=!pickup && flowState.orderState.deliveryMethod==='same-day';
        const estimate=sameDay ? calculatedSameDayDeliveryFee() : 0;
        quoteScreen.dataset.quoteState='estimated';
        /* The quote is the last thing checkout was waiting on, so it is banked
           here and the patient is put back where they were — on the delivery
           section they just filled in. */
        flowState.orderState.deliveryQuoteStatus='accepted';
        flowState.orderState.deliveryQuoteAmount=pickup ? 0 : estimate;
        ensurePaymentDeadline();
        persistFlowState();
        refreshMedicationCheckout();
        focusCheckoutDelivery=true;
        replaceCurrent('payment');
      }, reduceMotion ? 600 : DELIVERY_QUOTE_SECONDS*1000);

return false;
}

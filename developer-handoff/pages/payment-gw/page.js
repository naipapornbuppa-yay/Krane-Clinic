/* payment-gw: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_payment_gw_550(){
  // switch panes inside any gateway
  document.body.addEventListener('click', e => {
    const tab = e.target.closest('.gw-tab'); if(!tab) return;
    const gw = tab.closest('[data-gw]'); if(!gw) return;
    const key = tab.dataset.gwTab;
    const screen=gw.closest('.screen');
    activateGatewayMethod(screen?.id,key,{persistMedicationMethod:screen?.id==='payment-gw'});
  });
}


// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_payment_gw_submit(event) {
      if(paymentDeadlineExpired()){
        showActionToast('หมดเวลาชำระเงิน กรุณาให้ร้านยายืนยันสต็อกและยอดอีกครั้ง','warning');
        return true;
      }
      flowState.orderState.paidAmount=currentMedicationDue();
      flowState.orderState.paidMethod=paymentMethod;
      flowState.orderState.paidAt=Date.now();
      flowState.orderState.paidDeliveryMethod=flowState.orderState.fulfillmentMode==='pickup' ? 'pickup' : flowState.orderState.deliveryMethod;
      flowState.orderState.paymentExpiresAt=null;
      flowState.consultationPaid=true;
      flowState.paymentResolution='final-paid';
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
      show('payment-success');
      return true;

  return false;
}

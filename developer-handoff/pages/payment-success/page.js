/* payment-success: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */


  function syncPaymentOutcome(){
    const paid=Number(flowState.orderState.paidAmount ?? currentMedicationDue());
    const net=paid;
    const method=PAYMENT_METHOD_LABELS[flowState.orderState.paidMethod || flowState.orderState.paymentMethod] || 'Original payment method';
    ['payfail','payment-processing','payment-success','pharmacypending','tracking','order-summary'].forEach(id => {
      const screen=document.getElementById(id);
      if(!screen) return;
      screen.querySelectorAll('[data-payment-outcome-amount]').forEach(el => { el.textContent=baht(net); });
      screen.querySelectorAll('[data-payment-outcome-method]').forEach(el => { el.textContent=method; });
      screen.querySelectorAll('[data-payment-outcome-delivery]').forEach(el => { el.textContent=deliveryOutcomeLabel(); });
    });
    const success=document.getElementById('payment-success');
    const successTitle=success?.querySelector('[data-payment-success-title]');
    const successCopy=success?.querySelector('[data-payment-success-copy]');
    const successCta=success?.querySelector('[data-payment-success-cta]');
    const thai=document.documentElement.lang==='th';
    const hasDelivery=hasFulfillableItems();
    /* The heading says what just happened, not what is waiting behind it: this
       is the screen that closes the payment, so it confirms the payment. What
       the patient gets and what happens next belong in the line under it, and
       the button names one destination instead of two (client, 10 Sep). */
    if(successTitle) successTitle.textContent=thai ? 'ชำระเงินเรียบร้อยแล้ว' : 'Payment complete';
    if(successCopy) successCopy.textContent=hasDelivery
      ? (thai ? 'ร้านขายยาได้รับคำสั่งซื้อและกำลังเตรียมยาให้คุณ' : 'The pharmacy received your order and is preparing your medicine.')
      : (thai ? 'ชำระเงินสำเร็จแล้ว ใบรับรองแพทย์และเอกสารการรักษาเปิดดูหรือดาวน์โหลดได้ทุกเมื่อ' : 'Payment is complete. Your medical certificate and treatment documents are ready to open or download.');
    if(successCta){
      successCta.dataset.go=hasDelivery ? 'tracking' : 'my-documents';
      successCta.textContent=hasDelivery
        ? (thai ? 'ติดตามคำสั่งซื้อ' : 'Track order')
        : (thai ? 'ดูเอกสาร' : 'View documents');
    }
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_payment_success_tracking(e, paidTracking) {
      flowState.orderDelivered=false;
      flowState.csatDeliveryPrompted=false;
      flowState.deliveryNotified=false;
      flowState.orderState.deliveredAt=null;
      flowState.orderState.justPaidTracking=true;
      window.kraneDemoStatus='';
      window.KraneGoldenDemo?.writeState({fulfilmentStatus:'Preparing'});
      persistFlowState();

  return false;
}

/** Activation/event branch; called in its original order by shared/lib/navigation.js. */
function kraneHandle_payment_success_lifecycle_6(){
try{window.KraneClinical.patch({orderStatus:'paid'});}catch{showActionToast('ส่งสถานะการชำระเงินไม่ได้ กรุณาลองอีกครั้ง','warning');}
return false;
}

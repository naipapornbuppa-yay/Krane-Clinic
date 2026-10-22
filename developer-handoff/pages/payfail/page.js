/* payfail: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  function syncMedicationFailureAmount(amount=currentMedicationDue()){
    const failureTotal=document.querySelector('#payfail [data-payment-failure-total]');
    if(failureTotal) failureTotal.textContent=baht(amount);
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_payfail_retry(event) {
      resetGatewayAttempt('payment-gw');
      show('payment-gw');
      activateGatewayMethod('payment-gw',paymentMethod,{persistMedicationMethod:true});
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_payfail_alternate(event) {
      show('payment');
      window.requestAnimationFrame(openPaymentMethodModal);

  return false;
}

function kraneHandle_payfail_retry(event) {
      resetGatewayAttempt('payment-gw');
      show('payment-gw');
      activateGatewayMethod('payment-gw',paymentMethod,{persistMedicationMethod:true});
      return true;

  return false;
}

function kraneHandle_payfail_alternate(event) {
      show('payment');
      window.requestAnimationFrame(openPaymentMethodModal);

  return false;
}

function syncMedicationFailureAmount(amount=currentMedicationDue()){
    const failureTotal=document.querySelector('#payfail [data-payment-failure-total]');
    if(failureTotal) failureTotal.textContent=baht(amount);
  }
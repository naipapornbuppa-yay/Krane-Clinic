function kraneHandle_consultpay_fail_retry(event) {
      resetGatewayAttempt('consultpay-gw');
      show('consultpay-gw');
      return true;

  return false;
}

function kraneHandle_consultpay_fail_alternate(event) {
      show('consultpay');

  return false;
}
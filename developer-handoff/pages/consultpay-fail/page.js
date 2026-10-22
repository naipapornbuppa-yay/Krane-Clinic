/* pages/consultpay-fail/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_consultpay_fail_retry(event) {
      resetGatewayAttempt('consultpay-gw');
      show('consultpay-gw');
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_consultpay_fail_alternate(event) {
      show('consultpay');

  return false;
}

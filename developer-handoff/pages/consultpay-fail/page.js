/* consultpay-fail: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

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

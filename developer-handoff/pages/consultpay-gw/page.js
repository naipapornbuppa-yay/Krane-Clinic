/* consultpay-gw: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_consultpay_gw_submit(event) {
      flowState.consultationPaid=true;
      flowState.paymentResolution='consultation-paid';
      persistFlowState();
      show(consultationHandoffTarget());
      return true;

  return false;
}

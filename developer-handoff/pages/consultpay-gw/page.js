/* pages/consultpay-gw/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_consultpay_gw_submit(event) {
      flowState.consultationPaid=true;
      flowState.paymentResolution='consultation-paid';
      persistFlowState();
      show(consultationHandoffTarget());
      return true;

  return false;
}

/* pages/partner-phr/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_partner_phr_complete(e, partnerComplete) {
      submitOnce('partner-phr',partnerComplete,() => {
        flowState.draftReady=true;
        flowState.accountCreated=true;
        flowState.otpVerified=true;
        flowState.consentsComplete=true;
        flowState.patientInfoComplete=true;
        flowState.identityVerified=true;
        flowState.patientName=flowState.partnerName || flowState.patientName || '';
        flowState.partnerReviewComplete=true;
        flowState.partnerReviewConfirmedAt=new Date().toISOString();
        flowState.lastRequiredScreen='matching';
        persistFlowState();
        showActionToast('ตรวจสอบสิทธิ์ประกันแล้ว กำลังจับคู่แพทย์','success');
        show(partnerClinicalStartTarget());
      });
      return true;

  return false;
}

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

function syncPartnerReview(){
    const phrName=document.querySelector('[data-partner-phr-name]');
    if(phrName) phrName.textContent=flowState.partnerName || flowState.patientName || '—';
    const phrPayment=document.querySelector('[data-partner-phr-payment]');
    if(phrPayment) phrPayment.textContent=flowState.partnerPaymentMethod==='self-pay' ? 'ชำระเงินเอง' : 'ใช้สิทธิ์ประกันสุขภาพ';
  }
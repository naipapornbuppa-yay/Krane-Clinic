/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */



// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_partner_patient_info_continue(e, partnerInfoContinue) {
      const name=partnerNameValue();
      const phone=document.getElementById('partner-phone')?.value.trim() || '';
      const selected=document.querySelector('#partner-patient-info [data-partner-payment-choice-value][aria-selected="true"]');
      const paymentMethod=selected?.dataset.partnerPaymentChoiceValue || 'insurance';
      if(!name){ showActionToast('กรุณากรอกชื่อและนามสกุล','warning'); return true; }
      if(!isValidThaiMobile(phone)){ showActionToast('กรุณากรอกเบอร์มือถือ 10 หลักให้ถูกต้อง','warning'); return true; }
      if(flowState.partnerInfoComplete && flowState.partnerPhoneVerified
         && normalizePhone(phone)===normalizePhone(flowState.partnerPhone)){
        flowState.partnerName=name;
        flowState.partnerPaymentMethod=paymentMethod;
        completePartnerPatientInfo();
        return true;
      }
      { // Verify a new phone once, then reuse its completed verification.
        flowState.partnerName=name;
        flowState.partnerPaymentMethod=paymentMethod;
        flowState.partnerPendingPhone=normalizePhone(phone);
        flowState.partnerPhoneVerified=false;
        flowState.partnerPhoneOtpPending=true;
        flowState.partnerInfoContinueAfterOtp=true;
        persistFlowState();
        show('otp'); return true;
      }
      return true;

  return false;
}

// Called once at the original bootstrap position.
function kraneInit_partner_patient_info_nameInput() {
document.body.addEventListener('input',event => {
    if(!event.target.matches?.('#partner-first-name,#partner-last-name')) return;
    flowState.partnerName=partnerNameValue();
    persistFlowState();
  });
}

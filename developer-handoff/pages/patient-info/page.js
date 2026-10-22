/* pages/patient-info/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_patient_info_continue(e, patientInfoContinue) {
      const name=patientNameValue();
      const phoneInput=document.getElementById('patient-phone');
      // Off the general path the choice is not rendered, so self-pay stands in
      // rather than blocking on a question the patient was never asked.
      const paymentChoice=isGeneralPath()
        ? (document.querySelector('#patient-info [data-patient-payment-choice-value][aria-selected="true"]')?.dataset.patientPaymentChoiceValue || '')
        : 'self-pay';
      if(!name){ showActionToast('กรุณากรอกชื่อและนามสกุล','warning'); return true; }
      if(phoneInput && !phoneInput.readOnly){
        if(!isValidThaiMobile(phoneInput.value)){
          showActionToast('กรุณากรอกเบอร์มือถือ 10 หลักให้ถูกต้อง','warning');
          phoneInput.focus();
          return true;
        }
        if(normalizePhone(phoneInput.value)!==normalizePhone(flowState.verifiedPhone)){
          flowState.pendingPhone=normalizePhone(phoneInput.value);
          flowState.phoneOtpPending=true;
          flowState.phoneOtpReturn='patient-info';
          flowState.phoneOtpDestination='';
          flowState.phoneOtpCompletesAuth=false;
          persistFlowState();
          show('otp');
          return true;
        }
        phoneInput.readOnly=true;
        phoneInput.setAttribute('aria-readonly','true');
        const phoneNote=document.querySelector('#patient-info [data-phone-note]');
        const phoneEdit=document.querySelector('#patient-info [data-phone-edit]');
        if(phoneNote) phoneNote.textContent='ยืนยันด้วยรหัส OTP แล้ว';
        if(phoneEdit) phoneEdit.textContent='เปลี่ยนเบอร์';
      }
      if(!paymentChoice){ showActionToast('กรุณาเลือกว่าจะใช้สิทธิ์ประกันหรือชำระเอง','warning'); return true; }
      submitOnce('patient-info',patientInfoContinue,() => {
        flowState.patientInfoComplete=true;
        flowState.patientName=name;
        flowState.profileDisplayName=name;
        flowState.paymentPreference=paymentChoice;
        if(paymentChoice==='self-pay') flowState.coverage={provider:'',policyId:'',consultationCredit:0,medicineCredit:0};
        persistFlowState();
        showActionToast('บันทึกข้อมูลผู้รับบริการแล้ว','success');
        if(paymentChoice==='insurance'){
          insuranceEntry='profile';
          show('insurance');
        } else show(directNextAfterPatientInfo());
      });
      return true;

  return false;
}

// Called once at the original bootstrap position.
function kraneInit_patient_info_restorePhone() {
if(restoredPatientPhone && flowState.verifiedPhone) restoredPatientPhone.value=formatPhoneForDisplay(flowState.verifiedPhone);
}

// Called once at the original bootstrap position.
function kraneInit_patient_info_restoreName() {
if(restoredFirstName && restoredLastName){
    if(flowState.patientName){
      const parts=flowState.patientName.trim().split(/\s+/);
      restoredFirstName.value=parts.shift() || '';
      restoredLastName.value=parts.join(' ');
    }
    [restoredFirstName,restoredLastName].forEach(input => input.addEventListener('input',() => {
      flowState.patientName=patientNameValue();
      persistFlowState();
    }));
  }
}

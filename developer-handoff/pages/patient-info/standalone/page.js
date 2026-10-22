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

function kraneInit_patient_info_restorePhone() {
if(restoredPatientPhone && flowState.verifiedPhone) restoredPatientPhone.value=formatPhoneForDisplay(flowState.verifiedPhone);
}

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

function kraneHandle_patient_info_lifecycle_10(){

      // Direct Krane visitors self-pay by default. Keep an explicit insurance
      // choice if the patient already made one; partner entry uses its own state.
      if(flowState.entryChannel==='direct' && !flowState.paymentPreference){
        flowState.paymentPreference='self-pay';
        persistFlowState();
      }
      document.querySelectorAll('#patient-info [data-patient-payment-choice-value]').forEach(option => {
        option.setAttribute('aria-selected',String(option.dataset.patientPaymentChoiceValue===flowState.paymentPreference));
      });

return false;
}

function patientNameValue(){
    const first=document.getElementById('patient-first-name')?.value.trim() || '';
    const last=document.getElementById('patient-last-name')?.value.trim() || '';
    return [first,last].filter(Boolean).join(' ');
  }

function syncPatientInfoPrefill(){
    // A new phone signup has only a verified phone. Names appear here only
    // after a previous identity step or an authenticated provider supplied them.
    const saved=splitRecipientName(flowState.patientName);
    const first=document.getElementById('patient-first-name');
    const last=document.getElementById('patient-last-name');
    const phone=document.getElementById('patient-phone');
    if(first) first.value=saved.firstName;
    if(last) last.value=saved.lastName;
    if(phone) phone.value=flowState.verifiedPhone ? formatPhoneForDisplay(flowState.verifiedPhone) : '';
  }
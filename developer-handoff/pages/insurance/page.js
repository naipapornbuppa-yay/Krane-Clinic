/* insurance: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_insurance_entry(e, goInsurance) {
      insuranceEntry = goInsurance.dataset.insuranceEntry || (goInsurance.closest('#patient-info') ? 'profile' : 'checkout');
      if(insuranceEntry==='partner' && goInsurance.closest('.rail')) seedPartnerStage('partner-insurance');

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_insurance_confirm(e, insuranceConfirm) {
      const insuranceId=document.getElementById('insurance-id');
      const insuranceDob=document.getElementById('insurance-dob');
      if(!insuranceId?.value.trim()){
        showActionToast('กรุณากรอกเลขบัตรหรือหนังสือเดินทาง','warning');
        insuranceId?.focus();
        return true;
      }
      if(!insuranceDob?.value){
        showActionToast('กรุณาเลือกวันเกิด','warning');
        insuranceDob?.focus();
        return true;
      }
      if(insuranceEntry === 'partner'){
        flowState.entryChannel='partner';
        // This was entered for eligibility immediately before general health.
        // Carry the user's real answer forward instead of using a demo birthday.
        flowState.partnerIdentityDob=insuranceDob.value;
        flowState.partnerPaymentChosen=true;
        flowState.partnerPaymentMethod='insurance';
        flowState.partnerConsultationBalanceDue=null;
        flowState.partnerMedicineCredit=0;
        flowState.coverage={provider:'MTL Group',policyId:'',consultationCredit:CONSULTATION_FEE_BAHT,medicineCredit:0};
        persistFlowState();
        showActionToast('พบสิทธิ์ประกันที่ใช้ได้ 1 รายการ','success');
        show('partner-insurance');
        return true;
      }
      if(insuranceEntry === 'profile'){
        flowState.paymentPreference='insurance';
        flowState.coverage={provider:'เฮลท์ แฮปปี้',policyId:'POL-88123',consultationCredit:CONSULTATION_FEE_BAHT,medicineCredit:1000};
        persistFlowState();
        show('insurance-result');
        return true;
      }
      flowState.entryChannel='insured';
      flowState.coverage={provider:'AIA เฮลท์ แฮปปี้',policyId:'POL-88123',consultationCredit:CONSULTATION_FEE_BAHT,medicineCredit:1000};
      persistFlowState();
      refreshMedicationCheckout();
      show('payment');
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_insurance_documentType(e, tog) {
        const input=document.getElementById('insurance-id');
        const passport=tog.dataset.insuranceDoc==='passport';
        if(input){
          input.value='';
          input.inputMode=passport ? 'text' : 'numeric';
          input.maxLength=passport ? 32 : 17;
          input.placeholder=passport ? 'เช่น AB1234567' : '0-0000-00000-00-0';
          document.querySelector('label[for="insurance-id"]').textContent=passport ? 'เลขหนังสือเดินทาง' : 'เลขบัตรประชาชน';
          input.toggleAttribute('data-national-id',!passport);
          syncFloatingFieldState(input.closest('.float-field'));
        }

  return false;
}

/** Activation/event branch; called in its original order by shared/lib/navigation.js. */
function kraneHandle_insurance_lifecycle_11(){

      const isProfile = insuranceEntry === 'profile';
      const isPartner = insuranceEntry === 'partner';
      const isSetup = isProfile || isPartner;
      document.getElementById('insurance')?.setAttribute('data-insurance-context',isSetup ? 'setup' : 'checkout');
      const order = document.querySelector('#insurance [data-insurance-order]');
      const setupTitle = document.querySelector('#insurance [data-insurance-setup-title]');
      const profileHint = document.querySelector('#insurance [data-insurance-profile-hint]');
      const orderActions = document.querySelectorAll('#insurance [data-insurance-order-action]');
      const confirmBtn = document.querySelector('#insurance [data-insurance-confirm]');
      if(order) order.hidden = isSetup;
      if(setupTitle) setupTitle.hidden = !isSetup;
      if(profileHint) profileHint.hidden = !isSetup;
      orderActions.forEach(btn => { btn.hidden = isSetup; });
      if(confirmBtn) confirmBtn.textContent = isProfile ? 'บันทึกข้อมูลประกัน' : 'ตรวจสอบสิทธิ์';

return false;
}

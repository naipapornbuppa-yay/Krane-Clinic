/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function returnFromPhoneOtp(target){
    if(history[history.length-1]==='otp') history.pop();
    show(target,false);
  }

  function prepareFreshOtpChallenge(){
    const input=document.querySelector('#otp [data-otp-code]');
    const submit=document.querySelector('#otp [data-auth-complete]');
    if(input) input.value='';
    renderOtpCells(input);
    if(submit) submit.disabled=true;
    window.requestAnimationFrame(() => {
      if(!document.getElementById('otp')?.classList.contains('active')) return;
      input?.focus({preventScroll:true});
    });
  }

  function renderOtpCells(input){
    const value=(input?.value || '').replace(/\D/g,'').slice(0,6);
    const cells=[...document.querySelectorAll('#otp [data-otp-cell]')];
    cells.forEach((cell,index) => {
      cell.textContent=value[index] || '';
      cell.classList.toggle('is-filled',index<value.length);
      cell.classList.toggle('is-current',value.length<6 && index===value.length);
    });
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_otp_366(){
  document.addEventListener('input',event => {
    const input=event.target.closest('[data-otp-code]');
    if(!input) return;
    input.value=input.value.replace(/\D/g,'').slice(0,6);
    renderOtpCells(input);
    const submit=document.querySelector('#otp [data-auth-complete]');
    if(submit) submit.disabled=input.value.length!==6;
  });
}


// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_otp_submit(e, authComplete) {
      const otpCode=document.querySelector('#otp [data-otp-code]');
      if(!otpCode || !/^\d{6}$/.test(otpCode.value)){
        showActionToast('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก','warning');
        otpCode?.focus();
        return true;
      }
      if(flowState.partnerPhoneOtpPending){
        submitOnce('partner-phone-otp',authComplete,() => {
          flowState.partnerPhone=flowState.partnerPendingPhone || flowState.partnerPhone;
          flowState.partnerPendingPhone='';
          flowState.partnerPhoneOtpPending=false;
          flowState.partnerPhoneVerified=true;
          flowState.verifiedPhone=flowState.partnerPhone;
          flowState.otpVerified=true;
          persistFlowState();
          const phone=document.getElementById('partner-phone');
          const note=document.querySelector('#partner-patient-info [data-phone-note]');
          const edit=document.querySelector('#partner-patient-info [data-phone-edit]');
          if(phone){
            phone.value=formatPhoneForDisplay(flowState.partnerPhone);
            phone.readOnly=true;
            phone.setAttribute('aria-readonly','true');
          }
          if(note) note.textContent='ยืนยันด้วยรหัส OTP แล้ว';
          if(edit) edit.textContent='เปลี่ยนเบอร์';
          showActionToast('ยืนยันเบอร์โทรศัพท์ใหม่แล้ว','success');
          if(flowState.partnerInfoContinueAfterOtp){
            flowState.partnerInfoContinueAfterOtp=false;
            persistFlowState();
            if(history[history.length-1]==='otp') history.pop();
            completePartnerPatientInfo();
          }else{
            returnFromPhoneOtp('partner-patient-info');
          }
        });
        return true;
      }
      if(flowState.phoneOtpPending){
        submitOnce('phone-change-otp',authComplete,() => {
          const returnTarget=flowState.phoneOtpReturn || 'patient-info';
          const destination=flowState.phoneOtpDestination;
          const completesAuth=flowState.phoneOtpCompletesAuth;
          flowState.verifiedPhone=flowState.pendingPhone || flowState.verifiedPhone;
          flowState.otpVerified=true;
          clearPhoneOtpContext();
          persistFlowState();
          const patientPhone=document.getElementById('patient-phone');
          const socialPhone=document.getElementById('social-phone');
          if(patientPhone) patientPhone.value=formatPhoneForDisplay(flowState.verifiedPhone);
          if(socialPhone) socialPhone.value=formatPhoneForDisplay(flowState.verifiedPhone);
          if(completesAuth){
            completeAuthentication(destination);
            return;
          }
          if(patientPhone){
            patientPhone.readOnly=true;
            patientPhone.setAttribute('aria-readonly','true');
          }
          const note=document.querySelector('#patient-info [data-phone-note]');
          const edit=document.querySelector('#patient-info [data-phone-edit]');
          if(note) note.textContent='ยืนยันด้วยรหัส OTP แล้ว';
          if(edit) edit.textContent='เปลี่ยนเบอร์';
          showActionToast('ยืนยันเบอร์โทรศัพท์ใหม่แล้ว','success');
          returnFromPhoneOtp(returnTarget);
        });
        return true;
      }
      submitOnce('otp',authComplete,() => {
        flowState.otpVerified=true;
        const patientPhone=document.getElementById('patient-phone');
        if(patientPhone) patientPhone.value=formatPhoneForDisplay(flowState.verifiedPhone);
        persistFlowState();
        // A phone sign-up chose its password on the sign-up page (client, 19 Sep),
        // so the code completes the account. A reset still goes on to replace
        // the password.
        if(flowState.signupPasswordChosen && !flowState.passwordResetPending){
          flowState.signupPasswordChosen=false;
          ['signup-password','signup-confirm'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
          applyAuthenticatedAccount({returning:false});
          flowState.signupDonePending=true;
          persistFlowState();
          show('consent-terms');
          return;
        }
        syncPasswordScreen();
        show('set-password');
      });
      return true;

  return false;
}

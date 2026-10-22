/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */


  /* Client, 20 Sep: consent is no longer collected on the sign-up page. The
     account is made with a phone number and a password, and the PDPA and
     telemedicine consent page we already have comes straight after the OTP. */
  function signupPasswordReady(){
    const pw=document.getElementById('signup-password');
    const confirm=document.getElementById('signup-confirm');
    if(!pw || !confirm) return true;
    // Runs at start-up too, before the password rules below exist; an empty
    // field is simply not ready.
    if(!pw.value || !confirm.value) return false;
    return passwordRuleState(pw.value).every(([,ok]) => ok) && confirm.value===pw.value;
  }

  function syncSignupPassword(){
    const pw=document.getElementById('signup-password');
    const confirm=document.getElementById('signup-confirm');
    if(!pw || !confirm) return;
    const rules=passwordRuleState(pw.value);
    rules.forEach(([name,ok]) => {
      document.querySelector('[data-signup-password-rule="'+name+'"]')?.classList.toggle('is-met',ok);
    });
    // The checklist is guidance for a password that is not there yet, not a
    // permanent part of the form: it appears only while one is being typed and
    // still falls short, and goes away again the moment it passes.
    const ruleList=document.querySelector('[data-signup-password-rules]');
    if(ruleList) ruleList.hidden=!(pw.value.length>0 && rules.some(([,ok]) => !ok));
    const mismatch=document.querySelector('[data-signup-password-match]');
    if(mismatch) mismatch.hidden=!(confirm.value.length>0 && confirm.value!==pw.value);
    syncSignupSubmit();
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_signup_98(){
  document.addEventListener('input', e => {
    if(e.target.id==='signup-password' || e.target.id==='signup-confirm') syncSignupPassword();
  });
}


  function syncSignupSubmit(){
    document.querySelectorAll('#signup [data-signup-phone]').forEach(button => {
      const ready=signupPasswordReady();
      button.disabled=!ready;
      button.setAttribute('aria-disabled',String(!ready));
    });
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_signup_submit(e, signupPhone) {
      const phone=document.getElementById('signup-phone').value.trim();
      if(!phone){ showActionToast('กรุณากรอกเบอร์โทรศัพท์','warning'); return true; }
      if(!isValidThaiMobile(phone)){ showActionToast('กรุณากรอกเบอร์มือถือ 10 หลักให้ถูกต้อง','warning'); return true; }
      if(!signupPasswordReady()){ showActionToast('ตั้งรหัสผ่านให้ครบเงื่อนไขและตรงกันทั้งสองช่อง','warning'); document.getElementById('signup-password')?.focus(); return true; }
      submitOnce('signup-phone',signupPhone,() => {
        flowState.signupPasswordChosen=true;
        flowState.accountCreated=true;
        flowState.patientInfoComplete=false;
        if(!flowState.identityVerified && !flowState.partnerIdStepDone){
          flowState.patientName='';
          flowState.profileDisplayName='';
        }
        flowState.authProvider='';
        flowState.returningIdentityValid=false;
        flowState.verifiedPhone=normalizePhone(phone);
        persistFlowState();
        const patientPhone=document.getElementById('patient-phone');
        if(patientPhone) patientPhone.value=formatPhoneForDisplay(phone);
        show('otp');
      });
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_signup_newAccount(e, newAccount) {
      flowState.returningLogin=false;
      /* With no saved intake there is no consultation to resume, so the finished
         account lands on the profile instead of question one (client, 20 Sep). */
      if(!flowState.draftReady) postAuthNext='profile';
      persistFlowState();
      show('signup');
      return true;

  return false;
}

// Called once at the original bootstrap position.
function kraneInit_signup_initialSubmit() {
syncSignupSubmit();
}

// Called once at the original bootstrap position.
function kraneInit_signup_doneDialog() {
if(signupDoneModal){
    signupDoneModal.addEventListener('click', event => {
      if(event.target===signupDoneModal || event.target.classList.contains('modal-layer__scrim')){
        closeSignupDoneModal();
        return;
      }
      if(!event.target.closest('[data-signup-done-continue]')) return;
      closeSignupDoneModal();
      show(signupDoneTarget || 'patient-info');
    });
  }
}

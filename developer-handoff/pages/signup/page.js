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

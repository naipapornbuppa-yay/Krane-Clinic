/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function syncPasswordValidity(){
    const pw=document.getElementById('new-password');
    const confirm=document.getElementById('confirm-password');
    const save=document.querySelector('[data-password-save]');
    const mismatch=document.querySelector('[data-password-match]');
    if(!pw || !confirm || !save) return;
    const value=pw.value;
    const states=passwordRuleState(value);
    states.forEach(([name,ok]) => {
      const row=document.querySelector('[data-password-rule="'+name+'"]');
      if(row) row.classList.toggle('is-met',ok);
    });
    const strong=states.every(([,ok]) => ok);
    const matched=confirm.value.length>0 && confirm.value===value;
    if(mismatch) mismatch.hidden=!(confirm.value.length>0 && !matched);
    save.disabled=!(strong && matched);
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_set_password_531(){
  document.addEventListener('input', e => {
    if(e.target.id==='new-password' || e.target.id==='confirm-password') syncPasswordValidity();
  });
}


// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_set_password_submit(e, passwordSave) {
      const pw=document.getElementById('new-password');
      const confirm=document.getElementById('confirm-password');
      const value=pw?.value || '';
      if(!passwordRuleState(value).every(([,ok]) => ok)){
        showActionToast('รหัสผ่านต้องยาวอย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข','warning');
        pw?.focus();
        return true;
      }
      if(confirm?.value!==value){
        showActionToast('รหัสผ่านทั้งสองช่องยังไม่ตรงกัน','warning');
        confirm?.focus();
        return true;
      }
      submitOnce('set-password',passwordSave,() => {
        const reset=Boolean(flowState.passwordResetPending);
        flowState.passwordSet=true;
        flowState.passwordResetPending=false;
        persistFlowState();
        if(pw) pw.value='';
        if(confirm) confirm.value='';
        syncPasswordValidity();
        applyAuthenticatedAccount({returning:reset || Boolean(flowState.returningLogin)});
        if(reset){
          showActionToast('ตั้งรหัสผ่านใหม่แล้ว','success');
          show(nextAfterAuthentication());
          return;
        }
        flowState.signupDonePending=true;
        persistFlowState();
        show('consent-terms');
      });
      return true;

  return false;
}

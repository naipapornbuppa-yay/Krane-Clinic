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


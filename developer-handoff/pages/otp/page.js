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


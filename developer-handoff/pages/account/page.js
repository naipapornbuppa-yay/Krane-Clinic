/* pages/account/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_account_documentType(e, tog) {
        const input=document.getElementById('account-document');
        const passport=tog.dataset.accountDoc==='passport';
        input.dataset[tog.dataset.accountDoc==='passport'?'idValue':'passportValue']=input.value;
        input.value=input.dataset[passport?'passportValue':'idValue']||'';
        input.inputMode=passport?'text':'numeric';
        input.maxLength=passport?32:17;
        input.placeholder=passport?'เช่น AB1234567':'0-0000-00000-00-0';
        input.toggleAttribute('data-national-id',!passport);
        document.querySelector('label[for="account-document"]').textContent=passport?'เลขหนังสือเดินทาง':'เลขบัตรประชาชน';
        syncFloatingFieldState(input.closest('.float-field'));

  return false;
}

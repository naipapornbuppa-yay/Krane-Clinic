/* account: Owns ID/passport switching and restores the separate typed values. Shared field formatting and routing remain central. Baseline Save changes/Cancel only navigate to settings; persistent saving, required-field enforcement and an audit trail are not implemented by this prototype.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

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

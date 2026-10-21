/* identity: behavior is supplied by shared libraries. No duplicate per-page implementation.
 * Add page-owned functions here; shared/runtime.js owns ordered initialization.
 */

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_identity_owned_93(){
(function initIdentityUploads(){
    const MAX = 10 * 1024 * 1024;
    const identityContinue = document.querySelector('[data-identity-continue]');
    const syncIdentityContinue = () => {
      if(identityContinue) identityContinue.disabled = document.querySelectorAll('[data-identity-input][data-complete="true"]').length < 2;
    };
    document.querySelectorAll('[data-identity-input]').forEach(input => {
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if(!file) return;
        if(!file.type.startsWith('image/')){ showActionToast('กรุณาเลือกรูปภาพ','error'); return; }
        if(file.size > MAX){ showActionToast('รูปใหญ่เกิน 10 MB','error'); return; }
        const kind = input.dataset.identityInput;
        const card = input.previousElementSibling;
        const status = card && card.querySelector('[data-identity-status]');
        if(card) card.classList.add('is-complete');
        if(status) status.textContent = 'แนบแล้ว';
        input.dataset.complete = 'true';
        syncIdentityContinue();
        showActionToast(kind === 'selfie' ? 'บันทึกรูปเซลฟีแล้ว' : 'บันทึกบัตรประชาชนแล้ว','success');
        input.value = ''; // allow selecting the same image again in the demo
      });
    });
    syncIdentityContinue();
  })();
}

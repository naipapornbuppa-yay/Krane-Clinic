/* identity: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
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

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_identity_continue(e, identityContinue) {
      if(identityContinue.disabled) return true;
      submitOnce('identity',identityContinue,() => {
        flowState.identityVerified=true;
        persistFlowState();
        showActionToast('ยืนยันตัวตนเรียบร้อยแล้ว','success');
        // Client (17 Aug): identity is verified before the patient record is
        // taken, so this hands off to patient-info unless that is already done.
        show(flowState.patientInfoComplete ? directClinicalStartTarget() : 'patient-info');
      });
      return true;

  return false;
}

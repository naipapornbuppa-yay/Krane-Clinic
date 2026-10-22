/* referral: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_referral_close(e) {
      const modal=document.querySelector('[data-referral-modal]');
      if(modal) modal.hidden=true;
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_referral_shareAction(e, referralAction) {
      const code=document.querySelector('[data-referral-page-code]').textContent.trim();
      const url='https://krane.clinic/invite/'+encodeURIComponent(code);
      const share=referralAction.hasAttribute('data-referral-native-share');
      const action=share && navigator.share
        ? navigator.share({title:'แนะนำเพื่อนให้ Krane',text:code,url})
        : navigator.clipboard ? navigator.clipboard.writeText(share ? url : code) : Promise.reject(new Error('Clipboard unavailable'));
      action.then(()=>{if(!share || !navigator.share) showActionToast('คัดลอกแล้ว','success');})
        .catch(error=>{if(error.name!=='AbortError') showActionToast('ยังแชร์หรือคัดลอกไม่ได้ กรุณาลองอีกครั้ง','warning');});
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_referral_share(e, referralShare) {
      const code=document.querySelector('[data-referral-code]')?.textContent.trim() || '';
      const link='https://krane.clinic/invite/'+code;
      /* Clipboard access is refused in some embedded contexts, so the toast
         reports what actually happened rather than assuming it worked. */
      Promise.resolve(navigator.clipboard?.writeText(link))
        .then(() => showActionToast('คัดลอกลิงก์ชวนเพื่อนแล้ว','success'))
        .catch(() => showActionToast('คัดลอกไม่สำเร็จ ใช้โค้ด '+code+' บอกเพื่อนได้เลย','info'));
      return true;

  return false;
}

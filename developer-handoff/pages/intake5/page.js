/* intake5: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_intake5_owned_92(){
(function initPhotoUpload(){
    const input  = document.querySelector('[data-photo-input]');
    const thumbs = document.querySelector('[data-photo-thumbs]');
    if(!input || !thumbs) return;
    const MAX = 10 * 1024 * 1024;
    function addThumb(file){
      if(!file.type.startsWith('image/')) return;
      if(file.size > MAX){ showActionToast('รูปใหญ่เกิน 10 MB','error'); return; }
      const fig = document.createElement('figure');
      fig.className = 'up-thumb';
      const img = document.createElement('img');
      img.alt = file.name;
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'x';
      rm.setAttribute('aria-label','ลบรูปนี้');
      rm.textContent = '×';
      rm.addEventListener('click', () => { fig.remove(); updateSummary(); });
      fig.append(img, rm);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        img.src = String(reader.result || '');
        thumbs.appendChild(fig);
        updateSummary();
      });
      reader.readAsDataURL(file);
    }
    input.addEventListener('change', () => {
      Array.from(input.files || []).forEach(addThumb);
      input.value = '';   // allow re-selecting the same file
    });
  })();
}

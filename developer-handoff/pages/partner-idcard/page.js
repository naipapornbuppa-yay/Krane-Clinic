/* Partner ID-card preview and manual-entry actions. Demo only: no OCR service. */
function kraneInit_partner_idcard_upload(){
  // SCR-002A. The card is read for one field only: the name, which lands on the
  // next screen where it stays editable. Nothing is uploaded; the preview is a
  // local object URL and the "read" value comes from the demo fixture.
  (function partnerIdCard(){
    const input = document.querySelector('[data-idcard-input]');
    const thumbs = document.querySelector('[data-idcard-thumbs]');
    if(!input || !thumbs) return;
    const empty = thumbs.querySelector('[data-idcard-empty]');
    const readout = document.querySelector('[data-idcard-read]');
    const nameOut = document.querySelector('[data-idcard-name]');
    const CARD_NAME = 'มะลิ สุธิดา';
    input.addEventListener('change', () => {
      const file = (input.files || [])[0];
      if(!file || !file.type.startsWith('image/')) return;
      if(file.size > 10 * 1024 * 1024){ showActionToast('ไฟล์ใหญ่เกิน 10 MB','warning'); return; }
      thumbs.querySelectorAll('.up-thumb').forEach(el => el.remove());
      const fig = document.createElement('span');
      fig.className = 'up-thumb';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = 'ตัวอย่างบัตรประชาชนที่อัปโหลด';
      img.addEventListener('load', () => URL.revokeObjectURL(img.src));
      fig.appendChild(img);
      thumbs.appendChild(fig);
      if(empty) empty.hidden = true;
      if(nameOut) nameOut.textContent = CARD_NAME;
      if(readout) readout.hidden = false;
      flowState.partnerName = CARD_NAME;
      persistFlowState();
      showActionToast('อ่านชื่อจากบัตรแล้ว','success');
    });
    document.body.addEventListener('click', e => {
      const skip = e.target.closest('[data-idcard-skip]');
      const go = e.target.closest('[data-idcard-continue]');
      if(!skip && !go) return;
      if(go && !thumbs.querySelector('.up-thumb')){
        showActionToast('กรุณาถ่ายหรืออัปโหลดรูปบัตรก่อน','warning');
        return;
      }
      flowState.partnerIdStepDone = true;
      persistFlowState();
      show('partner-patient-info');
    });
  })();
}

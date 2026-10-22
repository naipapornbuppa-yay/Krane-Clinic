/* upload-rx: Owns baseline file type/4 MB validation and browser-local clinical request submission. This behavior was already injected by the original external adapter; it is not a new upload feature. No production upload backend is provided.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

/** Baseline prototype upload validation and browser-local request submission. */
function kraneInitPrescriptionUpload(api,el){
const upload=document.querySelector('#upload-rx .screen__body');if(upload){const input=el('input');input.type='file';input.accept='image/png,image/jpeg,application/pdf';input.setAttribute('aria-label','เลือกไฟล์ใบสั่งยา');input.onchange=()=>input.setCustomValidity('');upload.prepend(input);
   const submit=document.querySelector('#upload-rx .screen__footer button');submit.removeAttribute('data-go');submit.onclick=async()=>{const f=input.files[0];if(!f||f.size>4*1024*1024||!['image/png','image/jpeg','application/pdf'].includes(f.type)){input.setCustomValidity('เลือกภาพหรือ PDF ขนาดไม่เกิน 4 MB');input.reportValidity();return;}
    try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(f)});api.request({kind:'ตรวจใบสั่งยาที่อัปโหลด',note:f.name,file:data});submit.textContent='ส่งคำขอแล้ว';submit.disabled=true;}catch{submit.textContent='บันทึกไม่สำเร็จ ลองอีกครั้ง';}
   };
  }
}

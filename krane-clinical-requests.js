/* Patient requests and doctor review decisions; approval never creates an Rx. */
(()=>{
 const api=window.KraneClinical;if(!api)return;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
 function render(){
  const parent=document.querySelector(api.role==='doctor'?'#followups':'#notifications .screen__body');if(!parent)return;
  let box=parent.querySelector('[data-clinical-requests]');
  const rows=api.records('request').filter(r=>api.role==='doctor'||r.patientId===api.current().patientId);
  if(api.role!=='doctor' && !rows.length){box?.remove();return;}
  if(!box){box=el('section');box.dataset.clinicalRequests='';box.className=api.role==='doctor'?'panel stack':'card stack';box.style.cssText='padding:20px;margin:16px 0;overflow-wrap:anywhere';parent.prepend(box);}
  box.replaceChildren(el('h3','คำขอทบทวนใบสั่งยา'));
  if(!rows.length)box.append(el('p','ยังไม่มีคำขอ'));
  for(const r of rows){const card=el('div');card.className='stack';card.append(el('b',r.name+' · '+r.kind),el('p',({pending:'รอทบทวน',reviewing:'รับทบทวนแล้ว',completed:'ทบทวนเสร็จแล้ว',declined:'ส่งกลับ'}[r.status])+' · '+(r.reason||r.note||'')));
   if(r.file){const link=el('a','ดาวน์โหลดใบสั่งยา');link.href=r.file;link.download='prescription';card.append(link);}
   if(api.role==='doctor'&&r.status==='pending'){
    const reason=el('input');reason.className='input';reason.placeholder='เหตุผล / ขั้นตอนถัดไป';reason.setAttribute('aria-label','เหตุผล');reason.oninput=()=>reason.setCustomValidity('');card.append(reason);
    for(const [status,label] of [['reviewing','รับทบทวน'],['declined','ส่งกลับพร้อมเหตุผล']]){const b=el('button',label);b.className='btn btn--secondary';b.type='button';b.onclick=()=>{try{api.decide(r.id,status,reason.value)}catch(e){reason.setCustomValidity(e.message);reason.reportValidity();}};card.append(b);}
   }box.append(card);
  }
 }
 if(api.role==='patient'){
  const copy=(th,en)=>document.documentElement.lang.startsWith('en')?en:th;
  const input=document.getElementById('prescription-file');
  const submit=document.querySelector('#upload-rx .screen__footer button');
  const feedback=document.getElementById('prescription-file-feedback');
  if(input&&submit&&feedback){
   const showFeedback=(message,error=false)=>{
    if(error&&input.files[0]){input.value='';}
    feedback.textContent=message;
    feedback.hidden=!message;
    feedback.toggleAttribute('data-error',error);
   };
   const restoreUpload=()=>{input.disabled=false;submit.disabled=false;submit.hidden=false;};
   const invalidFile=(file)=>!file||file.size>4*1024*1024||!['image/png','image/jpeg','application/pdf'].includes(file.type);
   const selectionHint=()=>copy('เลือกภาพหรือ PDF ขนาดไม่เกิน 4 MB','Choose an image or PDF no larger than 4 MB.');
   function showSelection(){
    const file=input.files[0];
    if(file&&invalidFile(file)){showFeedback(selectionHint(),true);return;}
    showFeedback(file?.name||'');
   }
   input.addEventListener('change',showSelection);
   submit.dataset.clinicalRequestSubmit='';
   submit.removeAttribute('data-go');
   submit.onclick=async()=>{
    const file=input.files[0];
    if(invalidFile(file)){showFeedback(selectionHint(),true);input.focus();return;}
    const encounter=api.id();
    input.disabled=true;submit.disabled=true;
    try{
     const assetId='FILE-'+crypto.randomUUID();
     await window.KraneClinicalAssets.put(assetId,file);
     if(api.id()!==encounter)return;
     api.request({kind:'ตรวจใบสั่งยาที่อัปโหลด',note:file.name,fileName:file.name,assetId});
     submit.hidden=true;
     showFeedback(copy('ส่งใบสั่งยาให้ตรวจสอบแล้ว','Prescription submitted for review.'));
    }catch{
     if(api.id()!==encounter)return;
     restoreUpload();
     showFeedback(copy('บันทึกไม่สำเร็จ ลองอีกครั้ง','Could not save. Try again.'));
    }
   };
   document.addEventListener('krane:clinical-selected',()=>{input.value='';restoreUpload();showFeedback('');});
  }
 }
 window.addEventListener('krane:clinical-change',render);render();
})();

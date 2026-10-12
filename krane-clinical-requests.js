/* Patient requests and doctor review decisions; approval never creates an Rx. */
(()=>{
 const api=window.KraneClinical;if(!api)return;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
 function render(){
  const parent=document.querySelector(api.role==='doctor'?'#followups':'#notifications .screen__body');if(!parent)return;
  let box=parent.querySelector('[data-clinical-requests]');if(!box){box=el('section');box.dataset.clinicalRequests='';box.className=api.role==='doctor'?'panel stack':'card stack';box.style.cssText='padding:20px;margin:16px 0;overflow-wrap:anywhere';parent.prepend(box);}
  box.replaceChildren(el('h3','คำขอทบทวนใบสั่งยา'));
  const rows=api.records('request').filter(r=>api.role==='doctor'||r.patientId===api.current().patientId);
  if(!rows.length)box.append(el('p','ยังไม่มีคำขอ'));
  for(const r of rows){const card=el('div');card.className='stack';card.append(el('b',r.name+' · '+r.kind),el('p',({pending:'รอทบทวน',reviewing:'รับทบทวนแล้ว',declined:'ส่งกลับ'}[r.status])+' · '+(r.reason||r.note||'')));
   if(r.file){const link=el('a','ดาวน์โหลดใบสั่งยา');link.href=r.file;link.download='prescription';card.append(link);}
   if(api.role==='doctor'&&r.status==='pending'){
    const reason=el('input');reason.className='input';reason.placeholder='เหตุผล / ขั้นตอนถัดไป';reason.setAttribute('aria-label','เหตุผล');reason.oninput=()=>reason.setCustomValidity('');card.append(reason);
    for(const [status,label] of [['reviewing','รับทบทวน'],['declined','ส่งกลับพร้อมเหตุผล']]){const b=el('button',label);b.className='btn btn--secondary';b.type='button';b.onclick=()=>{try{api.decide(r.id,status,reason.value)}catch(e){reason.setCustomValidity(e.message);reason.reportValidity();}};card.append(b);}
   }box.append(card);
  }
 }
 if(api.role==='patient'){
  const upload=document.querySelector('#upload-rx .screen__body');if(upload){const input=el('input');input.type='file';input.accept='image/png,image/jpeg,application/pdf';input.setAttribute('aria-label','เลือกไฟล์ใบสั่งยา');input.onchange=()=>input.setCustomValidity('');upload.prepend(input);
   const submit=document.querySelector('#upload-rx .screen__footer button');submit.removeAttribute('data-go');submit.onclick=async()=>{const f=input.files[0];if(!f||f.size>4*1024*1024||!['image/png','image/jpeg','application/pdf'].includes(f.type)){input.setCustomValidity('เลือกภาพหรือ PDF ขนาดไม่เกิน 4 MB');input.reportValidity();return;}
    try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(f)});api.request({kind:'ตรวจใบสั่งยาที่อัปโหลด',note:f.name,file:data});submit.textContent='ส่งคำขอแล้ว';submit.disabled=true;}catch{submit.textContent='บันทึกไม่สำเร็จ ลองอีกครั้ง';}
   };
  }
  const refill=document.querySelector('#refill-sheet .modal-dialog');if(refill){const button=el('button','ขอให้แพทย์ทบทวนการเติมยา');button.type='button';button.className='btn btn--secondary';button.onclick=()=>{try{api.request({kind:'ทบทวนการเติมยา',note:api.current().category});button.textContent='ส่งคำขอแล้ว';button.disabled=true;}catch{button.textContent='ส่งไม่สำเร็จ ลองอีกครั้ง';}};refill.append(button);}
 }
 window.addEventListener('krane:clinical-change',render);render();
})();

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
  for(const r of rows){const card=el('div');card.className='stack';card.append(el('b',r.name+' · '+r.kind),el('p',({pending:'รอทบทวน',reviewing:'รับทบทวนแล้ว',completed:'ทบทวนเสร็จแล้ว',declined:'ส่งกลับ'}[r.status])+' · '+(r.reason||r.note||'')));
   if(r.file){const link=el('a','ดาวน์โหลดใบสั่งยา');link.href=r.file;link.download='prescription';card.append(link);}
   if(api.role==='doctor'&&r.status==='pending'){
    const reason=el('input');reason.className='input';reason.placeholder='เหตุผล / ขั้นตอนถัดไป';reason.setAttribute('aria-label','เหตุผล');reason.oninput=()=>reason.setCustomValidity('');card.append(reason);
    for(const [status,label] of [['reviewing','รับทบทวน'],['declined','ส่งกลับพร้อมเหตุผล']]){const b=el('button',label);b.className='btn btn--secondary';b.type='button';b.onclick=()=>{try{api.decide(r.id,status,reason.value)}catch(e){reason.setCustomValidity(e.message);reason.reportValidity();}};card.append(b);}
   }box.append(card);
  }
 }
 document.addEventListener('krane:clinical-selected',()=>{const upload=document.querySelector('[data-clinical-upload-submit]');if(upload){upload.disabled=false;upload.textContent='ส่งใบสั่งยาให้แพทย์ทบทวน';}const refill=document.querySelector('[data-clinical-refill-submit]');if(refill){refill.disabled=false;refill.textContent='ขอให้แพทย์ทบทวนการเติมยา';}});
 if(api.role==='patient'){
  const upload=document.querySelector('#upload-rx .screen__body');if(upload){const input=el('input');input.type='file';input.accept='image/png,image/jpeg,application/pdf';input.setAttribute('aria-label','เลือกไฟล์ใบสั่งยา');input.onchange=()=>input.setCustomValidity('');upload.prepend(input);
   const submit=document.querySelector('#upload-rx .screen__footer button');submit.dataset.clinicalUploadSubmit='';submit.removeAttribute('data-go');submit.onclick=async()=>{const f=input.files[0];if(!f||f.size>4*1024*1024||!['image/png','image/jpeg','application/pdf'].includes(f.type)){input.setCustomValidity('เลือกภาพหรือ PDF ขนาดไม่เกิน 4 MB');input.reportValidity();return;}
    const encounter=api.id();submit.disabled=true;
    try{const assetId='FILE-'+crypto.randomUUID();await window.KraneClinicalAssets.put(assetId,f);if(api.id()!==encounter)throw Error('Encounter changed');api.request({kind:'ตรวจใบสั่งยาที่อัปโหลด',note:f.name,fileName:f.name,assetId});submit.textContent='ส่งคำขอแล้ว';}catch{submit.disabled=false;submit.textContent='บันทึกไม่สำเร็จ ลองอีกครั้ง';}

   };
  }
  const refill=document.querySelector('#refill-sheet .modal-dialog');if(refill){const button=el('button','ขอให้แพทย์ทบทวนการเติมยา');button.type='button';button.dataset.clinicalRefillSubmit='';button.className='btn btn--secondary';button.onclick=()=>{try{api.request({kind:'ทบทวนการเติมยา',note:api.current().category});button.textContent='ส่งคำขอแล้ว';button.disabled=true;}catch{button.textContent='ส่งไม่สำเร็จ ลองอีกครั้ง';}};refill.append(button);}
 }
 window.addEventListener('krane:clinical-change',render);render();
})();

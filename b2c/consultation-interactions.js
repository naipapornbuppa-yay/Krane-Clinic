/* Frontend-only consultation previews. Files stay in this tab's memory: no
   fetch, upload, localStorage, IndexedDB, clinical messages or server writes. */
(() => {
  'use strict';
  const screen = document.getElementById('consult');
  const composer = screen?.querySelector('[data-chat-input]')?.parentElement;
  if (!composer) return;
  const en = () => document.documentElement.lang.startsWith('en');
  const t = (th, english) => en() ? english : th;
  const node = (tag, text, cls) => { const n=document.createElement(tag); if(text!==undefined)n.textContent=text; if(cls)n.className=cls; return n; };
  const dialog=node('dialog',undefined,'consult-demo-dialog');
  dialog.setAttribute('aria-labelledby','consult-dialog-title');
  document.body.append(dialog);
  let pending=null, objectUrl=null, opener=null;
  const files=new Map();
  const releaseUrl=()=>{if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}};
  function close(){dialog.close();}
  dialog.addEventListener('close',()=>{releaseUrl();pending=null;opener?.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  function open(title, trigger){
    releaseUrl();pending=null;opener=trigger;dialog.replaceChildren();
    const heading=node('h2',title);heading.id='consult-dialog-title';dialog.append(heading);
    const note=node('p',t('ตัวอย่างเท่านั้น ไม่ใช่ใบสั่งยาที่ลงนามหรือช่องทางส่งข้อมูลถึงแพทย์','Demo only. Not a signed prescription or a channel for sending data to a doctor.'),'consult-file-note');dialog.append(note);
  }
  function actions(extra){const row=node('div',undefined,'consult-dialog-actions');const cancel=node('button',t('ปิด','Close'),'btn btn--secondary');cancel.type='button';cancel.onclick=close;row.append(cancel);if(extra)row.append(extra);dialog.append(row);dialog.showModal();}
  function preview(file){
    if(!file.type.startsWith('image/')){dialog.append(node('p',t('ไฟล์ PDF พร้อมสำหรับตัวอย่างในแท็บนี้','PDF ready for this tab-only demo')));return;}
    objectUrl=URL.createObjectURL(file);const img=node('img');img.src=objectUrl;img.alt=t('ตัวอย่างไฟล์ที่เลือก','Selected file preview');dialog.append(img);
  }
  const attach=node('button',undefined,'consult-attach');attach.type='button';attach.dataset.consultAttach='';
  attach.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l10-10a4 4 0 0 1 5.66 5.66l-10 10a2 2 0 0 1-2.83-2.83l9.19-9.19"/></svg>';
  const updateLabels=()=>{attach.setAttribute('aria-label',t('แนบไฟล์ตัวอย่างในแท็บนี้','Attach a demo file in this tab'));};updateLabels();composer.prepend(attach);
  const hint=node('p',undefined,'consult-file-note');hint.dataset.consultLocalNote='';composer.after(hint);
  function labels(){updateLabels();hint.textContent=t('ไฟล์แนบเป็นตัวอย่างเฉพาะแท็บนี้ ไม่ได้ส่งถึงแพทย์ กรุณาใช้ไฟล์จำลอง','Attachments are tab-only previews, not sent to a doctor. Use dummy files.');screen.querySelectorAll('.consult-rx-open').forEach(b=>b.textContent=t('เปิดดูรายละเอียดใบสั่งยา','View prescription details'));}
  attach.onclick=()=>{
    open(t('แนบไฟล์ตัวอย่าง','Attach demo file'),attach);
    dialog.append(node('p',t('เลือกภาพหรือ PDF ไม่เกิน 10 MB ใช้ไฟล์จำลองเท่านั้น ไฟล์จะหายเมื่อรีเฟรชหรือเปลี่ยนเคส','Choose an image or PDF up to 10 MB. Dummy files only; cleared on refresh or case change.')));
    const input=node('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,application/pdf';input.setAttribute('aria-label',t('เลือกไฟล์ตัวอย่าง','Choose demo file'));
    const error=node('p');error.dataset.fileError='';error.setAttribute('role','status');
    const add=node('button',t('เพิ่มในแชทตัวอย่าง','Add to demo chat'),'btn btn--primary');add.type='button';add.disabled=true;
    input.onchange=()=>{pending=null;add.disabled=true;error.textContent='';const file=input.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>10*1024*1024){error.textContent=t('กรุณาเลือกภาพ JPG, PNG, WebP หรือ PDF ไม่เกิน 10 MB','Choose JPG, PNG, WebP or PDF up to 10 MB.');return;}pending=file;add.disabled=false;error.textContent=file.name;};
    add.onclick=()=>{if(!pending)return;const file=pending,id=crypto.randomUUID();files.set(id,file);const bubble=node('div',undefined,'bubble bubble--out consult-file-bubble');bubble.dataset.localFile=id;const b=node('button',file.name);b.type='button';b.onclick=()=>{open(file.name,b);preview(file);actions();};bubble.append(b,node('div',t('เฉพาะแท็บนี้ · ยังไม่ได้ส่งถึงแพทย์','This tab only · Not sent to a doctor'),'consult-file-note'));screen.querySelector('.chat-body').append(bubble);close();bubble.scrollIntoView({block:'nearest'});};
    dialog.append(input,error);actions(add);
  };
  function enhanceRx(){
    screen.querySelectorAll('.rx-card,[data-plan-card]').forEach(card=>{
      if(card.querySelector('.consult-rx-open'))return;
      const b=node('button',t('เปิดดูรายละเอียดใบสั่งยา','View prescription details'),'btn btn--secondary consult-rx-open');b.type='button';
      b.onclick=()=>{open(t('รายละเอียดใบสั่งยา · ตัวอย่าง','Prescription details · Demo'),b);const buttonLabels=new Set(Array.from(card.querySelectorAll('button'),el=>el.innerText.trim()));const details=card.innerText.split('\n').filter(line=>!buttonLabels.has(line.trim())).join('\n');dialog.append(node('div',details,'consult-rx-content'));actions();};card.append(b);
    });
  }
  const observer=new MutationObserver(enhanceRx);observer.observe(screen.querySelector('.chat-body'),{childList:true,subtree:true});enhanceRx();labels();
  new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function clearFiles(){files.clear();screen.querySelectorAll('[data-local-file]').forEach(n=>n.remove());if(dialog.open)close();releaseUrl();pending=null;}
  document.addEventListener('krane:clinical-selected',clearFiles);window.addEventListener('pagehide',clearFiles);
})();

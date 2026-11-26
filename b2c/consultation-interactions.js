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
  }
  function actions(extra){const row=node('div',undefined,'consult-dialog-actions');const cancel=node('button',t('ปิด','Close'),'btn btn--secondary');cancel.type='button';cancel.onclick=close;row.append(cancel);if(extra)row.append(extra);dialog.append(row);dialog.showModal();}
  function preview(file){
    if(!file.type.startsWith('image/')){dialog.append(node('p',t('ไฟล์ PDF พร้อมเปิดในแท็บนี้','PDF is ready in this tab')));return;}
    objectUrl=URL.createObjectURL(file);const img=node('img');img.src=objectUrl;img.alt=t('ไฟล์ที่เลือก','Selected file preview');dialog.append(img);
  }
  const attach=node('button',undefined,'consult-attach');attach.type='button';attach.dataset.consultAttach='';
  attach.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l10-10a4 4 0 0 1 5.66 5.66l-10 10a2 2 0 0 1-2.83-2.83l9.19-9.19"/></svg>';
  const updateLabels=()=>{attach.setAttribute('aria-label',t('แนบไฟล์','Attach file'));};updateLabels();composer.prepend(attach);
  attach.onclick=()=>{
    open(t('แนบไฟล์','Attach file'),attach);
    dialog.append(node('p',t('ไฟล์อยู่ในแท็บนี้ ยังไม่ได้ส่งถึงแพทย์','Files stay in this tab and are not sent to a doctor.'),'consult-attachment-note'));
    const input=node('input',undefined,'sr-only');
    input.type='file';
    input.accept='image/jpeg,image/png,image/webp,application/pdf';
    input.tabIndex=-1;
    input.setAttribute('aria-label',t('เลือกไฟล์','Choose file'));

    const picker=node('button',undefined,'upload consult-attachment-picker');
    picker.type='button';
    const uploadIcon=document.querySelector('#intake5 .upload .up-ic')?.cloneNode(true);
    if(uploadIcon)picker.append(uploadIcon);
    const fileTitle=node('span',t('เลือกไฟล์','Choose file'),'up-title');
    fileTitle.setAttribute('aria-live','polite');
    const formats=t('JPG, PNG, WebP หรือ PDF · ไม่เกิน 10 MB','JPG, PNG, WebP or PDF · up to 10 MB');
    const fileHint=node('span',formats,'up-sub');
    picker.append(fileTitle,fileHint);
    picker.onclick=()=>input.click();

    const error=node('p');
    error.dataset.fileError='';
    error.setAttribute('role','alert');
    error.hidden=true;
    const add=node('button',t('เพิ่มในแชท','Add to chat'),'btn btn--primary');
    add.type='button';
    add.disabled=true;
    input.onchange=()=>{
      pending=null;
      add.disabled=true;
      error.textContent='';
      error.hidden=true;
      fileTitle.textContent=t('เลือกไฟล์','Choose file');
      fileHint.textContent=formats;
      const file=input.files?.[0];
      if(!file)return;
      if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>10*1024*1024){
        error.textContent=t('กรุณาเลือกภาพ JPG, PNG, WebP หรือ PDF ไม่เกิน 10 MB','Choose JPG, PNG, WebP or PDF up to 10 MB.');
        error.hidden=false;
        input.value='';
        return;
      }
      pending=file;
      add.disabled=false;
      fileTitle.textContent=file.name;
      fileHint.textContent=t('เลือกไฟล์อื่น','Choose another file');
    };
    add.onclick=()=>{if(!pending)return;const file=pending,id=crypto.randomUUID();files.set(id,file);const bubble=node('div',undefined,'bubble bubble--out consult-file-bubble');bubble.dataset.localFile=id;const b=node('button',file.name);b.type='button';b.onclick=()=>{open(file.name,b);preview(file);actions();};bubble.append(b,node('div',t('เฉพาะแท็บนี้ · ยังไม่ได้ส่งถึงแพทย์','This tab only · Not sent to a doctor'),'consult-file-note'));screen.querySelector('.chat-body').append(bubble);close();bubble.scrollIntoView({block:'nearest'});};
    dialog.append(picker,input,error);actions(add);
  };
  new MutationObserver(updateLabels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function clearFiles(){files.clear();screen.querySelectorAll('[data-local-file]').forEach(n=>n.remove());if(dialog.open)close();releaseUrl();pending=null;}
  document.addEventListener('krane:clinical-selected',clearFiles);window.addEventListener('pagehide',clearFiles);
})();

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
  function labels(){updateLabels();screen.querySelectorAll('.consult-rx-open').forEach(b=>b.textContent=t('เปิดดูรายละเอียดใบสั่งยา','View prescription details'));}
  attach.onclick=()=>{
    open(t('แนบไฟล์','Attach file'),attach);
    dialog.append(node('p',t('รูปหรือ PDF ไม่เกิน 10 MB · ไฟล์อยู่ในแท็บนี้ ไม่ได้ส่งถึงแพทย์','Image or PDF, up to 10 MB. Files stay in this tab and are not sent to a doctor.')));
    const input=node('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,application/pdf';input.setAttribute('aria-label',t('เลือกไฟล์','Choose file'));
    const error=node('p');error.dataset.fileError='';error.setAttribute('role','status');
    const add=node('button',t('เพิ่มในแชท','Add to chat'),'btn btn--primary');add.type='button';add.disabled=true;
    input.onchange=()=>{pending=null;add.disabled=true;error.textContent='';const file=input.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>10*1024*1024){error.textContent=t('กรุณาเลือกภาพ JPG, PNG, WebP หรือ PDF ไม่เกิน 10 MB','Choose JPG, PNG, WebP or PDF up to 10 MB.');return;}pending=file;add.disabled=false;error.textContent=file.name;};
    add.onclick=()=>{if(!pending)return;const file=pending,id=crypto.randomUUID();files.set(id,file);const bubble=node('div',undefined,'bubble bubble--out consult-file-bubble');bubble.dataset.localFile=id;const b=node('button',file.name);b.type='button';b.onclick=()=>{open(file.name,b);preview(file);actions();};bubble.append(b,node('div',t('เฉพาะแท็บนี้ · ยังไม่ได้ส่งถึงแพทย์','This tab only · Not sent to a doctor'),'consult-file-note'));screen.querySelector('.chat-body').append(bubble);close();bubble.scrollIntoView({block:'nearest'});};
    dialog.append(input,error);actions(add);
  };
  function renderRxDetails(card){
    const rows=Array.from(card.querySelectorAll('.plan-item'));
    const content=node('div',undefined,'consult-rx-summary');
    if(!rows.length){
      const labels=new Set(Array.from(card.querySelectorAll('button'),el=>el.innerText.trim()));
      content.append(node('div',card.innerText.split('\n').filter(line=>!labels.has(line.trim())).join('\n'),'consult-rx-content'));
      return content;
    }
    const list=node('ul',undefined,'consult-rx-list');
    rows.forEach(source=>{
      const row=node('li',undefined,'consult-rx-item');
      const body=node('div',undefined,'consult-rx-description');
      const grow=source.querySelector('.grow');
      const name=grow?.firstElementChild;
      const gist=source.querySelector('.plan-item__gist');
      body.append(node('strong',name?.textContent.trim()||grow?.textContent.trim()||'', 'consult-rx-name'));
      if(gist)body.append(node('p',gist.textContent.trim(),'consult-rx-directions'));
      const meta=node('div',undefined,'consult-rx-meta');
      const price=source.querySelector('.checkout-order__price');
      const quantity=source.querySelector('.delivery-item__quantity');
      if(price)meta.append(node('span',price.textContent.trim(),'consult-rx-price'));
      if(quantity)meta.append(node('span',quantity.textContent.trim(),'consult-rx-quantity'));
      row.append(body,meta);list.append(row);
    });
    content.append(list);
    Array.from(card.children).filter(el=>!el.matches('.plan-item,button')&&!el.querySelector('.badge')).forEach(el=>{
      if(el.querySelector('button'))return;
      const text=el.innerText.trim();
      if(text)content.append(node('p',text,'consult-file-note'));
    });
    return content;
  }
  function enhanceRx(){
    screen.querySelectorAll('.rx-card,[data-plan-card]').forEach(card=>{
      if(card.querySelector('.consult-rx-open'))return;
      const b=node('button',t('เปิดดูรายละเอียดใบสั่งยา','View prescription details'),'btn btn--secondary consult-rx-open');b.type='button';
      b.onclick=()=>{open(t('รายละเอียดใบสั่งยา','Prescription details'),b);dialog.append(node('p',t('ไม่ใช่ใบสั่งยาที่ลงนาม','Not a signed prescription'),'consult-file-note'),renderRxDetails(card));actions();};card.append(b);
    });
  }
  const observer=new MutationObserver(enhanceRx);observer.observe(screen.querySelector('.chat-body'),{childList:true,subtree:true});enhanceRx();labels();
  new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function clearFiles(){files.clear();screen.querySelectorAll('[data-local-file]').forEach(n=>n.remove());if(dialog.open)close();releaseUrl();pending=null;}
  document.addEventListener('krane:clinical-selected',clearFiles);window.addEventListener('pagehide',clearFiles);
})();

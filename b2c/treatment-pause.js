/* Prototype-only program pause. Production requires an authenticated case API. */
(()=>{
 const key='krane.paused-programs.v1';
 let paused={};try{paused=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
 const isPaused=category=>Boolean(paused[category]);
 const layer=document.createElement('div');layer.className='modal-layer';layer.id='treatment-pause-modal';layer.hidden=true;layer.setAttribute('aria-hidden','true');
 layer.innerHTML=`<button class="modal-layer__scrim" type="button" data-treatment-pause-close aria-label="ปิดหน้าต่าง"></button><section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="treatment-pause-title" aria-describedby="treatment-pause-description" tabindex="-1"><h2 id="treatment-pause-title">พักโปรแกรมการรักษา?</h2><p id="treatment-pause-description">โปรแกรมนี้จะเปลี่ยนเป็นสถานะพัก และยกเลิกนัดติดตามครั้งถัดไปของโปรแกรมนี้</p><p class="hint">การพักโปรแกรมไม่ได้เปลี่ยนคำสั่งใช้ยาของแพทย์</p><p class="hint" data-treatment-pause-error hidden></p><div class="modal-dialog__actions"><button type="button" class="btn btn--danger" data-treatment-pause-confirm>ยืนยันพักโปรแกรม</button><button type="button" class="btn btn--ghost" data-treatment-pause-close>กลับไป</button></div></section>`;
 document.body.append(layer);
 let target=null,opener=null;
 function close(){layer.hidden=true;layer.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});}
 function decorate(card){
  const inactive=isPaused(card.dataset.category);card.dataset.programState=inactive?'paused':'active';
  card.closest('.treatment-folder')?.classList.toggle('is-paused',inactive);
  let label=card.querySelector('.treatment-pause-status');
  if(inactive&&!label){label=document.createElement('span');label.className='treatment-pause-status';label.textContent='พักโปรแกรมอยู่';card.querySelector('.treatment-card__title')?.append(label);}
  if(label)label.hidden=!inactive;
 }
 function attach(card,history){
  document.getElementById('treatment-pause-action')?.remove();
  const button=document.createElement('button');button.type='button';button.id='treatment-pause-action';button.className='textlink treatment-pause-action';button.textContent=isPaused(card.dataset.category)?'พักโปรแกรมอยู่':'พักโปรแกรมการรักษา';button.disabled=isPaused(card.dataset.category);history.after(button);
  button.onclick=()=>{target=card;opener=button;layer.querySelector('[data-treatment-pause-error]').hidden=true;layer.hidden=false;layer.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');layer.querySelector('.modal-dialog').focus();};
 }
 layer.addEventListener('click',event=>{
  if(event.target.closest('[data-treatment-pause-close]')){close();return;}
  if(!event.target.closest('[data-treatment-pause-confirm]')||!target)return;
  const next={...paused,[target.dataset.category]:{pausedAt:new Date().toISOString()}};
  try{localStorage.setItem(key,JSON.stringify(next));}catch{const error=layer.querySelector('[data-treatment-pause-error]');error.textContent='บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง';error.hidden=false;return;}
  paused=next;decorate(target);close();document.dispatchEvent(new CustomEvent('krane:program-paused',{detail:{category:target.dataset.category}}));
 });
 document.querySelectorAll('#profile .treatment-card').forEach(decorate);
 window.kraneTreatmentPause={isPaused,attach};
})();

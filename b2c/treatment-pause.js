/* Prototype-only program pause. Production requires an authenticated case API. */
(()=>{
 const key='krane.paused-programs.v1';
 let paused={};try{paused=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
 const isPaused=category=>Boolean(paused[category] && paused[category].state!=='active');
 const hasCancelledFollowup=category=>Boolean(paused[category]);
 const appointmentFor=category=>!isPaused(category)?paused[category]?.appointmentAt:null;
 const layer=document.createElement('div');layer.className='modal-layer';layer.id='treatment-pause-modal';layer.hidden=true;layer.setAttribute('aria-hidden','true');
 layer.innerHTML=`<button class="modal-layer__scrim" type="button" data-treatment-pause-close aria-label="ปิดหน้าต่าง"></button><section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="treatment-pause-title" aria-describedby="treatment-pause-description" tabindex="-1"><h2 id="treatment-pause-title">พักโปรแกรมการรักษา?</h2><p id="treatment-pause-description">เมื่อพักโปรแกรม นัดติดตามครั้งถัดไปจะถูกยกเลิก</p><p class="hint">การพักโปรแกรมไม่ได้เปลี่ยนคำสั่งใช้ยาของแพทย์</p><p class="hint" data-treatment-pause-error hidden></p><div class="modal-dialog__actions"><button type="button" class="btn btn--primary" data-treatment-pause-confirm>ยืนยันพักโปรแกรม</button><button type="button" class="btn btn--ghost" data-treatment-pause-close>กลับไป</button></div></section>`;
 const schedule=document.createElement('div');schedule.hidden=true;schedule.className='program-resume-schedule';
 schedule.innerHTML='<p data-resume-doctor></p><p><strong data-resume-suggested></strong></p><button type="button" class="textlink" data-resume-change>เลือกเวลาอื่น</button><div data-resume-fields hidden><label for="resume-program-date">เลือกวัน</label><input class="input" id="resume-program-date" type="date"><label for="resume-program-time">เลือกเวลา</label><select class="input" id="resume-program-time"></select></div>';
 layer.querySelector('.modal-dialog__actions').before(schedule);
 const dateInput=schedule.querySelector('input'),timeInput=schedule.querySelector('select');
 const dateKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 function updateTimes(){const slots=window.kraneProgramSchedule.slots(dateInput.value);timeInput.replaceChildren(...slots.map(time=>new Option(time,time)));updateSuggested();}
 function updateSuggested(){const valid=Boolean(timeInput.value);layer.querySelector('[data-treatment-pause-confirm]').disabled=!valid;schedule.querySelector('[data-resume-suggested]').textContent=valid?`${dateInput.value.split('-').reverse().join('/')} · ${timeInput.value}`:'ไม่มีเวลาว่างในวันที่เลือก';}
 dateInput.onchange=updateTimes;timeInput.onchange=updateSuggested;
 schedule.querySelector('[data-resume-change]').onclick=()=>{schedule.querySelector('[data-resume-fields]').hidden=false;dateInput.focus();};
 function prepareSchedule(card){const today=new Date();dateInput.min=dateKey(today);const end=new Date(today);end.setDate(end.getDate()+30);dateInput.max=dateKey(end);schedule.querySelector('[data-resume-fields]').hidden=true;schedule.querySelector('[data-resume-doctor]').textContent=card.querySelector('.followup-row strong')?.textContent||'';
 for(let day=0;day<=30;day++){const date=new Date(today);date.setDate(today.getDate()+day);dateInput.value=dateKey(date);if(window.kraneProgramSchedule.slots(dateInput.value).length)break;}updateTimes();}
 document.body.append(layer);
 let target=null,opener=null;
 window.kraneTreatmentFolders?.init();
 const originalFolders=[...document.querySelectorAll('#profile .treatment-folder')];
 function sortFolders(){const anchor=document.querySelector('#profile .care-team-note');if(!anchor)return;originalFolders.slice().sort((a,b)=>Number(a.classList.contains('is-paused'))-Number(b.classList.contains('is-paused'))).forEach(folder=>anchor.before(folder));}
 function close(){layer.hidden=true;layer.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});}
 function decorate(card){
  const inactive=isPaused(card.dataset.category);card.dataset.programState=inactive?'paused':'active';
  card.closest('.treatment-folder')?.classList.toggle('is-paused',inactive);
  let label=card.querySelector('.treatment-pause-status');
  if(inactive&&!label){label=document.createElement('span');label.className='treatment-pause-status';label.textContent='พักโปรแกรม';card.querySelector('.treatment-card__title')?.append(label);}
  if(label)label.hidden=!inactive;
  if(appointmentFor(card.dataset.category)&&!card.querySelector('[data-followup-date]')){const node=document.createElement('span');node.dataset.followupDate='';node.dataset.followupCase=card.dataset.category;node.dataset.followupOffset='0';card.querySelector('.followup-row:last-child strong')?.replaceChildren(node);}
 }
 function attach(card,history){
  document.getElementById('treatment-pause-action')?.remove();
  const button=document.createElement('button');button.type='button';button.id='treatment-pause-action';button.className='textlink treatment-pause-action';button.textContent=isPaused(card.dataset.category)?'กลับมารักษาต่อ':'พักโปรแกรมการรักษา';button.classList.toggle('is-resume',isPaused(card.dataset.category));document.querySelector('#treatment-detail > .screen__body').append(button);
  button.onclick=()=>{target=card;opener=button;const resume=isPaused(card.dataset.category);schedule.hidden=!resume;layer.querySelector('[data-treatment-pause-confirm]').disabled=false;if(resume)prepareSchedule(card);layer.querySelector('h2').textContent=resume?'กลับมารักษาต่อ?':'พักโปรแกรมการรักษา?';layer.querySelector('#treatment-pause-description').textContent=resume?'ยืนยันนัดติดตามกับแพทย์เจ้าของเคสเพื่อกลับมารักษาต่อ':'เมื่อพักโปรแกรม นัดติดตามครั้งถัดไปจะถูกยกเลิก';layer.querySelector('[data-treatment-pause-confirm]').textContent=resume?'ยืนยันนัด':'ยืนยันพักโปรแกรม';layer.querySelector('[data-treatment-pause-error]').hidden=true;layer.hidden=false;layer.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');layer.querySelector('.modal-dialog').focus();};
 }
 layer.addEventListener('click',event=>{
  if(event.target.closest('[data-treatment-pause-close]')){close();return;}
  if(!event.target.closest('[data-treatment-pause-confirm]')||!target)return;
  const category=target.dataset.category;const resume=isPaused(category);
  if(resume&&!window.kraneProgramSchedule.slots(dateInput.value).includes(timeInput.value)){updateTimes();const error=layer.querySelector('[data-treatment-pause-error]');error.textContent='กรุณาเลือกเวลานัดใหม่';error.hidden=false;return;}
  const appointmentAt=resume?new Date(dateInput.value+'T'+timeInput.value+':00').toISOString():null;
  const next={...paused,[category]:resume?{...paused[category],state:'active',resumedAt:new Date().toISOString(),appointmentAt}:{state:'paused',pausedAt:new Date().toISOString()}};
  try{localStorage.setItem(key,JSON.stringify(next));}catch{const error=layer.querySelector('[data-treatment-pause-error]');error.textContent='บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง';error.hidden=false;return;}
  paused=next;decorate(target);sortFolders();close();document.dispatchEvent(new CustomEvent('krane:program-paused',{detail:{category:target.dataset.category}}));
 });
 document.querySelectorAll('#profile .treatment-card').forEach(decorate);
 sortFolders();
 window.kraneTreatmentPause={isPaused,hasCancelledFollowup,appointmentFor,attach};
})();

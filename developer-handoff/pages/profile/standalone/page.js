function syncHomeFollowUpCta(){
    const cta=document.querySelector('#profile [data-home-cta]');
    const toast=document.querySelector('#profile [data-followup-toast]');
    if(!cta || !toast) return;
    /* Before reading the window, so a session left open overnight rolls over. */
    syncFollowUpDates();
    syncTreatmentStatus();
    syncFollowUpCaseStates();
    const candidates=[...document.querySelectorAll('#profile .followup-row [data-followup-date]')]
      .map(date => ({date,when:followUpAppointmentFor(date)}))
      .filter(item => item.when)
      .sort((a,b) => a.when-b.when);
    const next=candidates.find(item => item.when.getTime()-Date.now()>=-FOLLOWUP_GRACE_MS);
    const has=candidates.length>0;
    const remaining=next ? next.when.getTime()-Date.now() : Infinity;
    const soon=Boolean(next && remaining<=FOLLOWUP_NOTICE_MS && remaining>=-FOLLOWUP_GRACE_MS);
    /* Someone already under a doctor is not starting from "choose what is
       worrying you" (client, 23 Aug), so the big CTA stays out of their way
       whether or not the reminder is showing. */
    cta.hidden=has;
    toast.hidden=!soon;
    if(!soon) return;
    /* Copy the date from its own node. Slicing the sentence on "·" used to run
       before the i18n pass and banked the English half, which the banner then
       kept because that became its remembered source. */
    const when=toast.querySelector('[data-home-followup-when]');
    /* Client, 21 Sep: shorter. The date carries the line; the start time sits
       under it, and the countdown has moved into the pill, so neither the time
       nor the count is said twice. */
    if(when) when.textContent=formatFollowUpDate(next.when);
    const countdown=toast.querySelector('[data-home-followup-countdown]');
    const state=toast.querySelector('[data-home-followup-state]');
    const ready=remaining<=FOLLOWUP_JOIN_MS && remaining>=-FOLLOWUP_GRACE_MS;
    const thai=document.documentElement.lang!=='en';
    if(countdown) countdown.textContent=ready
      ? (thai ? 'เข้าห้องได้แล้ว' : 'Room is open')
      : (thai ? `เวลา ${formatFollowUpTime(next.when)}` : `At ${formatFollowUpTime(next.when)}`);
    // The pill is the clock while the patient is waiting, and the way in once
    // the room opens.
    const untilRoomOpens=Math.max(0,remaining-FOLLOWUP_JOIN_MS);
    if(state) state.textContent=ready
      ? (thai ? 'เข้าห้อง' : 'Join')
      : `${thai ? 'เข้าห้องใน' : 'Join in'} ${formatFollowUpPill(untilRoomOpens)}`;
    toast.disabled=!ready;
    toast.setAttribute('aria-disabled',String(!ready));
    toast.classList.toggle('is-ready',ready);
    toast.dataset.category=next.date.dataset.followupCase || '';
  }

function kraneInit_profile_320(){
  document.addEventListener('krane:program-paused',event=>{
    syncHomeFollowUpCta();
    const card=[...document.querySelectorAll('#profile .treatment-card')].find(card=>card.dataset.category===event.detail.category);
    if(card)openTreatmentDetail(card);
  });
}

function kraneInit_profile_322(){

  window.setInterval(() => {
    const active=document.querySelector('.screen.active');
    if(active && (active.id==='profile')) syncHomeFollowUpCta();
  },1000);
}

function kraneHandle_profile_treatmentOpen(e, treatmentOpen) { openTreatmentDetail(treatmentOpen); return true;
  return false;
}

function kraneHandle_profile_followUp(e, profileFollowup) { beginAssignedDoctorFlow(profileFollowup.dataset.category || selectedCategoryId); return true;
  return false;
}

function kraneHandle_profile_referral(e, profileReferral) {
      const modal=document.querySelector('[data-referral-modal]');
      if(modal) modal.hidden=false;
      return true;

  return false;
}

function kraneHandle_profile_newAppointment(e, profileNewAppointment) {
      flowState.followUpDirectToWaitroom=false;
      flowState.followUpContext=null;
      flowState.entryChannel='direct';
      persistFlowState();
      journeyActive=true;
      show('conditions');
      return true;

  return false;
}

function syncTreatmentStatus(){
    const thai=document.documentElement.lang!=='en';
    document.querySelectorAll('#profile .treatment-card').forEach(card => {
      const badge=card.querySelector('[data-treatment-status]');
      if(!badge) return;
      badge.classList.remove('badge--warn');
      badge.classList.add('badge--ok');
      badge.textContent=thai ? 'กำลังรักษา' : 'Active';
    });
  }

function openRefillSheet(){
    if(!refillSheet) return;
    const today=new Date(); today.setHours(0,0,0,0);
    const list=refillSheet.querySelector('[data-refill-cards]');
    if(list) list.replaceChildren(...[...document.querySelectorAll('#profile .treatment-card[data-category]:not([data-category="general"])')].map(source => refillCardFor(source,today)));
    refillSheet.dataset.refillGated='1';
    // "All refillable" only means something when more than one refill is open.
    const allOption=refillSheet.querySelector('[data-refill-choice="all"]');
    if(allOption) allOption.hidden=availableRefillKeys().length<2;
    refillSheet.querySelectorAll('[data-refill-choice]').forEach(el => el.setAttribute('aria-selected','false'));
    refillSheet.hidden=false;
    refillSheet.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    refillSheet.querySelector('[data-refill-choice]')?.focus();
  }

function kraneHandle_profile_followUpCase(e, followUpCaseOpen) {
      const card=document.querySelector(`#profile [data-treatment-open][data-category="${followUpCaseOpen.dataset.followupCaseOpen}"]`);
      if(card) openTreatmentDetail(card);
      return true;

  return false;
}

function kraneHandle_profile_followUpJoin(e, followUpJoin) {
      if(followUpJoin.disabled || followUpJoin.getAttribute('aria-disabled')==='true' || window.kraneTreatmentPause?.isPaused(followUpJoin.dataset.category)) return true;
      beginAssignedDoctorFlow(followUpJoin.dataset.category || selectedCategoryId);
      return true;

  return false;
}

function kraneInitProfileTreatmentFolders(){
 let outlineSequence=0;
 function outline(card,folder){
  const outlineId='folder-outline-'+(++outlineSequence);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.position='absolute';svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs><clipPath id="'+outlineId+'" clipPathUnits="userSpaceOnUse"><path/></clipPath></defs>';folder.append(svg);
  card.style.setProperty('--pocket-outline','url(#'+outlineId+')');
  const redraw=()=>{const w=card.offsetWidth,h=card.offsetHeight+14,r=22,t=Math.min(100,w*.24),y=14;
   svg.querySelector('path').setAttribute('d',`M0 ${r} Q0 0 ${r} 0 H${t-20} C${t} 0 ${t} ${y} ${t+20} ${y} H${w-r} Q${w} ${y} ${w} ${y+r} V${h-r} Q${w} ${h} ${w-r} ${h} H${r} Q0 ${h} 0 ${h-r} Z`);};
  new ResizeObserver(redraw).observe(card);redraw();
 }
 function mount(card){
  if(card.closest('.treatment-folder'))return;
  let visits;try{visits=JSON.parse(card.dataset.consultations||'null')}catch{}
  if(!Array.isArray(visits)||!visits.length){
   const count=({'weight':6,'hair-skin':4,'sexual-health':2,'general':1})[card.dataset.category]||1;
   const base={...card.dataset};
   visits=Array.from({length:count},(_,i)=>({...base,number:i+1,treatmentDate:i===count-1?base.treatmentDate:`${String(1+i*3).padStart(2,'0')}/05/2026`,treatmentRx:i===count-1?base.treatmentRx:`RX-DEMO-${card.dataset.category}-${i+1}`}));
  }
  // Records may arrive out of order; visit number is the stable chronology.
  visits=visits.map((v,i)=>({...v,number:Number(v.number)||i+1})).sort((a,b)=>a.number-b.number);
  const folder=document.createElement('div');folder.className='treatment-folder';
  const tabs=document.createElement('div');tabs.className='treatment-folder__tabs';
  tabs.setAttribute('aria-hidden','true');
  card.before(folder);folder.append(tabs,card);card.id='treatment-folder-'+card.dataset.category;
  folder.dataset.visitCount=visits.length;
  outline(card,folder);

  const depth=Math.min(visits.length,4);
  folder.style.setProperty('--folder-depth',depth);
  for(let layer=depth;layer>0;layer--){const sheet=document.createElement('i');sheet.className='treatment-folder__sheet';sheet.style.setProperty('--layer',layer);sheet.setAttribute('aria-hidden','true');folder.prepend(sheet);}
  visits.slice(0,4).forEach((visit,i)=>{const spine=document.createElement('span');spine.className='treatment-folder__spine';spine.style.setProperty('--spine',i);spine.setAttribute('aria-hidden','true');tabs.append(spine);});
  const label=document.createElement('span');label.className='treatment-folder__label';label.setAttribute('aria-hidden','true');tabs.append(label);
  function select(index){
   const visit=visits[index];
   Object.keys(card.dataset).filter(k=>k.startsWith('treatment')).forEach(k=>delete card.dataset[k]);
   Object.entries(visit).forEach(([key,value])=>{if(key.startsWith('treatment'))card.dataset[key]=value;});
   card.setAttribute('data-treatment-open','');card.dataset.consultationNumber=visit.number;card.dataset.consultations=JSON.stringify(visits);
   if(visit.doctor)card.querySelector('.followup-row strong').textContent=visit.doctor;
   if(visit.followup){const row=card.querySelector('.followup-row:last-child strong');row.textContent=visit.followup;}
  }
  card.addEventListener('treatment-record-open',()=>{ false; });
  let opening=false, replay=false;
  card.addEventListener('click',event=>{
   if(replay || !document.querySelector('#profile.active') || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   event.preventDefault();event.stopImmediatePropagation();
   if(opening)return;
   opening=true;folder.classList.add('is-opening');card.setAttribute('aria-busy','true');
   setTimeout(()=>{
    folder.classList.remove('is-opening');card.removeAttribute('aria-busy');opening=false;
    if(!document.querySelector('#profile.active'))return;
    replay=true;card.click();replay=false;
   },480);
  },true);
  folder.selectLatest=()=>select(visits.length-1);
  select(visits.length-1);
 }
 function init(){document.querySelectorAll('#profile .treatment-card').forEach(mount);}
 new MutationObserver(()=>{if(document.querySelector('#profile.active'))document.querySelectorAll('.treatment-folder').forEach(folder=>folder.selectLatest?.());}).observe(document.getElementById('profile'),{attributes:true,attributeFilter:['class']});
 window.kraneTreatmentFolders={mount,init,outline};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

}

function kraneCreateProfileProgramPresentation(isPaused,appointmentFor){
const originalFolders=[...document.querySelectorAll('#profile .treatment-folder')];
function sortFolders(){const anchor=document.querySelector('#profile .care-team-note');if(!anchor)return;originalFolders.slice().sort((a,b)=>Number(a.classList.contains('is-paused'))-Number(b.classList.contains('is-paused'))).forEach(folder=>anchor.before(folder));}
function decorate(card){
  const inactive=isPaused(card.dataset.category);card.dataset.programState=inactive?'paused':'active';
  card.closest('.treatment-folder')?.classList.toggle('is-paused',inactive);
  let label=card.querySelector('.treatment-pause-status');
  if(inactive&&!label){label=document.createElement('span');label.className='treatment-pause-status';label.textContent='พักโปรแกรม';card.querySelector('.treatment-card__title')?.append(label);}
  if(label)label.hidden=!inactive;
  if(appointmentFor(card.dataset.category)&&!card.querySelector('[data-followup-date]')){const node=document.createElement('span');node.dataset.followupDate='';node.dataset.followupCase=card.dataset.category;node.dataset.followupOffset='0';card.querySelector('.followup-row:last-child strong')?.replaceChildren(node);}
 }
return {sortFolders,decorate};
}
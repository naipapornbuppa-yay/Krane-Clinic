/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  /* Appointment urgency belongs to the countdown banner. Treatment cards keep
     describing the course itself, so an upcoming visit never changes an active
     treatment into a warning state. */
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

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_profile_320(){
  document.addEventListener('krane:program-paused',event=>{
    syncHomeFollowUpCta();
    const card=[...document.querySelectorAll('#profile .treatment-card')].find(card=>card.dataset.category===event.detail.category);
    if(card)openTreatmentDetail(card);
  });
}


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

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_profile_322(){

  window.setInterval(() => {
    const active=document.querySelector('.screen.active');
    if(active && (active.id==='profile')) syncHomeFollowUpCta();
  },1000);
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

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_profile_followUpCase(e, followUpCaseOpen) {
      const card=document.querySelector(`#profile [data-treatment-open][data-category="${followUpCaseOpen.dataset.followupCaseOpen}"]`);
      if(card) openTreatmentDetail(card);
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_profile_followUpJoin(e, followUpJoin) {
      if(followUpJoin.disabled || followUpJoin.getAttribute('aria-disabled')==='true' || window.kraneTreatmentPause?.isPaused(followUpJoin.dataset.category)) return true;
      beginAssignedDoctorFlow(followUpJoin.dataset.category || selectedCategoryId);
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_profile_treatmentOpen(e, treatmentOpen) { openTreatmentDetail(treatmentOpen); return true;
  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_profile_followUp(e, profileFollowup) { beginAssignedDoctorFlow(profileFollowup.dataset.category || selectedCategoryId); return true;
  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_profile_referral(e, profileReferral) {
      const modal=document.querySelector('[data-referral-modal]');
      if(modal) modal.hidden=false;
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
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

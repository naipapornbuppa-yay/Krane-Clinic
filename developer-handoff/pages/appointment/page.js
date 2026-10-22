/* appointment: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  function renderAppointmentSlots(){
    const scr=document.getElementById('appointment');
    const grid=scr?.querySelector('[data-appointment-slots]');
    if(!grid) return;
    const now=new Date();
    const dayIndex=Math.max(0,appointmentDayIndex());
    const thai=document.documentElement.lang==='th';
    if(appointmentSlot){
      const [hour,minute]=appointmentSlot.split(':').map(Number);
      if(appointmentSlotUnavailable(hour*60+minute,dayIndex,now)) appointmentSlot='';
    }
    const slots=[];
    let hourRow=0,lastHour=-1,hourColumn=0;
    for(let minutes=540;minutes<1440;minutes+=15){
      const unavailable=appointmentSlotUnavailable(minutes,dayIndex,now);
      if(unavailable) continue;
      const slotHour=Math.floor(minutes/60);
      if(slotHour!==lastHour){hourRow++;lastHour=slotHour;hourColumn=0;}
      hourColumn++;
      const time=appointmentTime(minutes);
      // Split the visible digits so the page translator cannot turn a bare
      // "21:00" into "21:00 น." while the canonical value stays HH:mm.
      const [hour,minute]=time.split(':');
      slots.push(`<button class="appointment-slot${unavailable ? ' is-taken' : ''}" type="button" role="radio" aria-label="${time}" aria-checked="${appointmentSlot===time}"${unavailable ? ' aria-disabled="true"' : ''} data-appointment-slot style="grid-row:${hourRow};grid-column:${hourColumn}" data-appointment-time="${time}"><span>${hour}</span>:<span>${minute}</span></button>`);
    }
    grid.innerHTML=slots.join('');
    syncAppointment();
  }

  function syncAppointment(){
    const scr=document.getElementById('appointment');
    if(!scr) return;
    const cta=scr.querySelector('[data-appointment-confirm]');
    const label=scr.querySelector('[data-appointment-cta-label]');
    if(!cta||!label) return;
    const ready=Boolean(appointmentSlot);
    cta.setAttribute('aria-disabled',String(!ready));
    cta.classList.toggle('btn--blocked',!ready);
    label.textContent = document.documentElement.lang==='th' ? 'ยืนยัน' : 'Confirm';
  }

  function syncAppointmentDays(){
    const row=document.querySelector('#appointment [data-appointment-day]')?.parentElement;
    if(!row) return;
    const thai=document.documentElement.lang==='th';
    const months=thai ? FOLLOWUP_MONTHS_TH : FOLLOWUP_MONTHS_EN;
    const days=thai ? WEEKDAYS_TH : WEEKDAYS_EN;
    row.querySelectorAll('[data-appointment-day]').forEach((chip,index) => {
      const when=new Date();
      when.setHours(0,0,0,0);
      when.setDate(when.getDate()+index);
      const name=index===0 ? (thai ? 'วันนี้' : 'Today')
        : index===1 ? (thai ? 'พรุ่งนี้' : 'Tomorrow')
        : days[when.getDay()];
      const date=`${when.getDate()} ${months[when.getMonth()]}`;
      const nameEl=chip.querySelector('.appointment-day__name');
      const dateEl=chip.querySelector('.appointment-day__date');
      if(nameEl && nameEl.textContent!==name) nameEl.textContent=name;
      if(dateEl && dateEl.textContent!==date) dateEl.textContent=date;
      chip.dataset.dayLabel=name;
    });
  }

  function resetAppointment(){
    const scr=document.getElementById('appointment');
    if(!scr) return;
    appointmentSlot='';
    const now=new Date();
    const currentMinutes=now.getHours()*60+now.getMinutes();
    // If the remaining part of today is inside the 15-minute lead time, open
    // tomorrow instead of presenting a whole day of unavailable times.
    const defaultDayIndex=currentMinutes+15>1425 ? 1 : 0;
    scr.querySelectorAll('[data-appointment-day]').forEach((day,index) =>
      day.setAttribute('aria-checked',String(index===defaultDayIndex)));
    const day=scr.querySelector('[data-appointment-day][aria-checked="true"]');
    appointmentDay=day?.dataset.dayLabel || 'วันนี้';
    renderAppointmentSlots();
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_appointment_443(){
  document.body.addEventListener('click', event => {
    const day=event.target.closest('#appointment [data-appointment-day]');
    if(day){
      if(day.getAttribute('aria-checked')==='true') return;
      day.closest('.appointment-days').querySelectorAll('[data-appointment-day]')
        .forEach(el => el.setAttribute('aria-checked', String(el===day)));
      appointmentDay=day.dataset.dayLabel || '';
      /* A slot free today may be taken tomorrow, so the time is re-chosen when
         the day changes rather than silently carried over. */
      appointmentSlot='';
      renderAppointmentSlots();
      return;
    }
    const slot=event.target.closest('#appointment [data-appointment-slot]');
    if(slot){
      if(slot.getAttribute('aria-disabled')==='true'){
        showActionToast(document.documentElement.lang==='th' ? 'เวลานี้ไม่พร้อมให้จอง' : 'This time is unavailable','warning');
        return;
      }
      slot.closest('.appointment-slots').querySelectorAll('[data-appointment-slot]')
        .forEach(el => el.setAttribute('aria-checked', String(el===slot)));
      appointmentSlot=slot.dataset.appointmentTime;
      syncAppointment();
      return;
    }
    const confirm=event.target.closest('#appointment [data-appointment-confirm]');
    if(confirm){
      if(!appointmentSlot){
        showActionToast('เลือกเวลาที่สะดวกก่อน','warning');
        return;
      }
      flowState.appointmentWhen=`${appointmentDay} ${appointmentSlot}`;
      const days=[...document.querySelectorAll('#appointment [data-appointment-day]')];
      const dayIndex=days.findIndex(day=>day.getAttribute('aria-checked')==='true');
      const scheduledAt=new Date();
      scheduledAt.setDate(scheduledAt.getDate()+Math.max(0,dayIndex));
      const [hours,minutes]=appointmentSlot.split(':').map(Number);
      scheduledAt.setHours(hours,minutes,0,0);
      flowState.appointmentAt=scheduledAt.toISOString();
      pendingQueue=null;
      if(!queuePreview) try{localStorage.removeItem(QUEUE_KEY)}catch(_){}
      persistFlowState();
      show('consultpay');
    }
  });
}

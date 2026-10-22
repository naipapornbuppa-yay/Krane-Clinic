function kraneInit_waitroom_expiredDialog() {
if(waitroomExpiredModal()){
    waitroomExpiredModal().addEventListener('click', event => {
      if(event.target.closest('[data-waitroom-retry]')){
        closeWaitroomExpiredModal();
        /* Straight back into matching: the intake answers are untouched, so
           there is nothing to re-ask. */
        pendingQueue=null;
        if(!queuePreview) try{localStorage.removeItem(QUEUE_KEY)}catch(_){}
        show('matching');
        return;
      }
      if(event.target.closest('[data-waitroom-expired-home]')){
        closeWaitroomExpiredModal();
        show('profile');
      }
    });
  }
}

function resetWaitroom(){
    const w = document.getElementById('waitroom'); if(!w) return;
    const title = w.querySelector('[data-wait-title]'), copy = w.querySelector('[data-wait-copy]'),
          timer = w.querySelector('[data-wait-timer]'), btn = w.querySelector('[data-wait-enter]'),
          btnLabel = w.querySelector('[data-wait-enter-label]'), visual = w.querySelector('[data-wait-visual]'),
          art = w.querySelector('[data-wait-art]');
    /* Two states on one screen. Waiting carries the queue position and an
       estimate; ready carries the UX-doc copy. Same three hooks either way. */
    if(!pendingQueue) pendingQueue={startedAt:Date.now(),suspended:false,outcome:flowConfig.get('wait')==='long' ? 'unavailable' : 'ready'};
    w.querySelector('[data-queue-clock]').hidden=false;
    w.querySelector('[data-wait-note]').hidden=false;
    w.dataset.queueState='waiting';
    savePendingQueue();
    const queuePos = flowState.orderState.queuePosition || 2;
    if(title) title.textContent = 'กำลังรอคิวเข้าห้องปรึกษา';
    /* The doctor is not settled at this point and can still change before the
       room opens, so naming one here promised something the queue cannot keep.
       The position is the only fact this line needs (client, 29 Sep). */
    if(copy) copy.textContent = `คุณอยู่คิวที่ ${queuePos}`;
    if(btn){ btn.hidden = true; btn.classList.remove('is-ready-pop'); }
    if(btnLabel) btnLabel.textContent = 'รอเรียกเข้าห้อง…';
    if(timer) timer.classList.remove('waitroom-entry-cta__timer--urgent');
    if(visual){
      visual.classList.add('state-view__visual--loading');
      visual.classList.remove('state-view__visual--success','is-ready');
    }
    if(art) art.setAttribute('href','#krane-state-waiting-room');
    clearInterval(waitCountdownTimer);
    let elapsedSeconds = Math.floor((Date.now()-pendingQueue.startedAt)/1000);
    const unavailable=!pendingQueue.readyAt && (pendingQueue.outcome==='unavailable' || flowConfig.get('wait')==='long');
    const paintDelay=()=>{
      const failed=unavailable && elapsedSeconds>120;
      paintElapsedTimer(w.querySelector('[data-queue-elapsed]'),elapsedSeconds);
      const booking=w.querySelector('[data-queue-book]');
      booking.hidden=!failed;
      booking.classList.toggle('btn--primary',failed);
      booking.classList.toggle('btn--ghost',!failed);
      if(failed){
        w.dataset.queueState='unavailable';
        title.textContent='ขณะนี้ยังไม่มีแพทย์พร้อมให้บริการ';
        copy.textContent='เลือกวันและเวลาที่สะดวกเพื่อนัดหมายแพทย์';
        w.querySelector('[data-queue-clock]').hidden=true;
        w.querySelector('[data-wait-note]').hidden=true;
        visual?.classList.remove('state-view__visual--loading');
        visual?.setAttribute('aria-label','ไม่พบแพทย์ที่พร้อมให้บริการ');
        art?.setAttribute('href','#krane-state-no-slots');
      }
    };
    paintDelay();
    paintElapsedTimer(timer,elapsedSeconds);
    waitCountdownTimer = setInterval(() => {
      if(!w.classList.contains('active')){ clearInterval(waitCountdownTimer); return; }
      elapsedSeconds = Math.floor((Date.now()-pendingQueue.startedAt)/1000);
      paintDelay();
      paintElapsedTimer(timer,elapsedSeconds);
    }, 1000);
    /* Mock outcomes: the doctor admits you after QUEUE_ADMIT_MS; wait=long
       becomes unavailable at the same point. Preserve the chosen outcome and
       clock on resume.

       Client, 6 Oct: this was two minutes, which is a realistic queue and an
       unwatchable demo — nobody sits through it to see what happens next. It
       is fifteen seconds: long enough to read the screen and see the clock
       move, short enough to walk someone through the journey. */
    const admissionDelay=pendingQueue.readyAt ? 0 : (queuePreview || flowConfig.get('wait')==='ready')
      ? (reduceMotion ? 400 : 4200)
      : Math.max(0,pendingQueue.startedAt+QUEUE_ADMIT_MS-Date.now());
    if(unavailable) return;
    waitTimer = setTimeout(() => {
      if(!w.classList.contains('active')) return;
      clearInterval(waitCountdownTimer);
      if(!pendingQueue.readyAt){
        pendingQueue.readyAt=(queuePreview || flowConfig.get('wait')==='ready') ? Date.now() : pendingQueue.startedAt+QUEUE_ADMIT_MS;
        savePendingQueue();
      }
      w.querySelector('[data-queue-book]').hidden=true;
      /* The room is open, so the wait clock has nothing left to count: its
         interval is cleared above and it sat there frozen on a stale number
         while the button ran the only countdown that still matters
         (client, 29 Sep). */
      w.querySelector('[data-queue-clock]').hidden=true;
      w.dataset.queueState='ready';
      if(title) title.textContent = 'ถึงคิวแล้ว!';
      if(copy) copy.textContent = `กดเข้าห้องได้เลย แพทย์${DOCTOR_NAME} พร้อมเจอคุณแล้ว`;
      if(btn){ btn.hidden = false; btn.classList.add('is-ready-pop'); }
      if(btnLabel) btnLabel.textContent = 'เข้าห้องปรึกษา';
      if(visual){
        visual.classList.remove('state-view__visual--loading');
        visual.classList.add('state-view__visual--success','is-ready');
      }
      if(art) art.setAttribute('href','#krane-state-enter-room');
      startWaitroomEntryWindow(w,timer);
    }, admissionDelay);
  }

function stopWaitroomEntryWindow(){
    clearInterval(waitEntryTimer);
    waitEntryTimer = null;
  }

function startWaitroomEntryWindow(screen,timer){
    stopWaitroomEntryWindow();
    const deadline=(pendingQueue?.readyAt || Date.now())+WAITROOM_ENTRY_WINDOW*1000;
    let remaining = Math.max(0,Math.ceil((deadline-Date.now())/1000));
    const paint = () => {
      if(!timer) return;
      const mm=String(Math.floor(remaining/60)).padStart(2,'0');
      const ss=String(remaining%60).padStart(2,'0');
      timer.textContent = `${mm}:${ss}`;
      timer.setAttribute('aria-label',document.documentElement.lang==='th'
        ? `เข้าห้องภายใน ${mm}:${ss}`
        : `Enter within ${mm}:${ss}`);
      timer.classList.toggle('waitroom-entry-cta__timer--urgent', remaining <= 60);
    };
    paint();
    if(remaining===0){
      screen.querySelector('[data-wait-enter]').hidden=true;
      openWaitroomExpiredModal();
      return;
    }
    waitEntryTimer = setInterval(() => {
      if(!screen.classList.contains('active')){ stopWaitroomEntryWindow(); return; }
      remaining = Math.max(0,Math.ceil((deadline-Date.now())/1000));
      paint();
      if(remaining === 0){
        stopWaitroomEntryWindow();
        if(timer) timer.textContent = '';
        screen.querySelector('[data-wait-enter]').hidden=true;
        openWaitroomExpiredModal();
      }
    }, 1000);
  }

function openWaitroomExpiredModal(){
    const modal = waitroomExpiredModal();
    if(!modal) return;
    fillDoctorName(modal);
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    modal.querySelector('.waitroom-expired-dialog')?.focus({preventScroll:true});
  }

function closeWaitroomExpiredModal(){
    const modal = waitroomExpiredModal();
    if(!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }
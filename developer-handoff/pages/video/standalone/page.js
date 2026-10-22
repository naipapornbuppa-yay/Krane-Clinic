function kraneHandle_video_endActiveCall(e, ec) {callActive = false;
  return false;
}

function kraneHandle_video_endCall(e, endCall) {
      e.preventDefault();
      const m=document.querySelector('[data-endcall-modal]');
      if(m){ m.hidden=false; fillDoctorName(m); return true; }

  return false;
}

function kraneHandle_video_cancelEndCall(e) {
      const m=document.querySelector('[data-endcall-modal]');
      if(m) m.hidden=true;
      return true;

  return false;
}

function kraneHandle_video_confirmEndCall(e) {
      const m=document.querySelector('[data-endcall-modal]');
      if(m) m.hidden=true;
      show('consult');
      return true;

  return false;
}

function kraneHandle_video_callControl(e, press) {
      const nowPressed = press.getAttribute('aria-pressed') !== 'true';
      press.setAttribute('aria-pressed', nowPressed);
      // re-icon to match the new state (mic <-> mic-off, speaker <-> speaker-muted)
      if(press.dataset.callIconPressed){ press.dataset.iconReady=''; if(window.krane_normalizeIcons) window.krane_normalizeIcons(); }
      // Camera toggles voice-only in place on the call screen: no separate screen to visit.
      // (dataset.cameraToggle is '' for a valueless attribute, which is falsy, so check
      // presence with "in" rather than truthiness.)
      if('cameraToggle' in press.dataset){
        const stage = press.closest('.callstage');
        const lbl = press.querySelector('[data-camera-lbl]');
        const self = stage && stage.querySelector('[data-call-self]');
        const status = stage && stage.querySelector('[data-call-status]');
        const note = stage && stage.querySelector('[data-camera-note]');
        const hint = stage && stage.querySelector('[data-call-hint]');
        press.title = nowPressed ? 'Turn camera on' : 'Turn camera off';
        if(lbl) lbl.textContent = nowPressed ? 'Cam on' : 'Cam off';
        if(self) self.hidden = nowPressed;
        if(status) status.textContent = nowPressed ? 'Voice consultation · 00:42' : 'Video consultation · 02:14';
        if(note) note.hidden = !nowPressed;
        if(hint) hint.textContent = nowPressed ? 'Turn your camera back on at any point. End hangs up.' : 'Turning your camera off keeps the call on voice. End hangs up.';
      }

  return false;
}

function syncConsultationSummaryUnread(unread){
    const fab=document.querySelector('#video .call-fab');
    const badge=fab?.querySelector('[data-consult-unread-badge]');
    if(!fab || !badge) return;
    const english=isEnglishUi();
    fab.classList.toggle('has-unread',Boolean(unread));
    badge.hidden=!unread;
    fab.setAttribute('aria-label',unread
      ? (english ? 'Open chat, 1 medicine summary from your doctor' : 'เปิดแชท มีรายการยาจากแพทย์ 1 รายการ')
      : (english ? 'Open chat' : 'เปิดแชท'));
    fab.title=unread
      ? (english ? 'Medicine summary from your doctor · open chat' : 'มีรายการยาจากแพทย์ · เปิดแชท')
      : (english ? 'Open chat · the call is still active' : 'เปิดแชท การโทรยังดำเนินต่อ');
  }

function kraneHandle_video_lifecycle_18(id){

      callActive = true; lastCall = id;
      // Every fresh call starts on camera, whatever state a previous call ended in.
      const camBtn = document.querySelector('#video [data-camera-toggle]');
      if(camBtn && camBtn.getAttribute('aria-pressed') === 'true') camBtn.click();
      scheduleConsultationSummary();

return false;
}
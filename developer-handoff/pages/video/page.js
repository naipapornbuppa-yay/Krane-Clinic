/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  // Video and chat are two views of one consultation. The doctor can send the
  // medication summary while the patient stays on video, so keep this timer
  // alive across both views and use the video chat FAB as the unread signal.
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

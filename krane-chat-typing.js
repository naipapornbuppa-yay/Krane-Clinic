(() => {
  const clinical = window.KraneClinical;
  const screen = document.getElementById('consult');
  const composer = screen?.querySelector('[data-chat-input], [data-selected-message]');
  const anchor = composer?.closest('.screen__footer, .composer');
  if (!clinical || !anchor) return;

  const {role} = clinical;
  const other = role === 'doctor' ? 'patient' : 'doctor';
  const preview = new URLSearchParams(location.search).get('chatTyping');
  const sender = Math.random().toString(36).slice(2);
  let channel;
  try { channel = new BroadcastChannel('krane.clinical.typing.v1'); } catch {}
  const active = new Map();
  const timers = new Map();
  let localCase;
  let remoteContact;
  const bar = document.createElement('div');
  bar.className = 'krane-chat-typing';
  const rows = Object.fromEntries([other, role].map(who => {
    const row = document.createElement('div');
    row.className = 'krane-chat-typing__row';
    row.dataset.typingRole = who;
    row.dataset.typingSide = who === role ? 'local' : 'remote';
    row.hidden = true;
    row.innerHTML = '<span class="krane-chat-typing__bubble" aria-hidden="true"><i></i><i></i><i></i></span>';
    bar.append(row);
    return [who, row];
  }));
  const status = document.createElement('span');
  status.className = 'krane-chat-typing__sr';
  status.setAttribute('role', 'status');
  bar.append(status);
  anchor.before(bar);

  function render() {
    const shown = [other, role].filter(who => active.get(who) || preview === who);
    for (const [who, row] of Object.entries(rows)) row.hidden = !shown.includes(who);
    const en = document.documentElement.lang === 'en';
    const labels = shown.map(who => en
      ? (who === role ? 'You are typing' : who === 'doctor' ? 'The doctor is typing' : 'The patient is typing')
      : (who === role ? 'คุณกำลังพิมพ์' : who === 'doctor' ? 'แพทย์กำลังพิมพ์' : 'ผู้รับบริการกำลังพิมพ์'));
    const label = labels.join(' · ');
    if (status.textContent !== label) status.textContent = label;
  }

  function setTyping(who, on, timeout) {
    clearTimeout(timers.get(who));
    active.set(who, on);
    if (on) timers.set(who, setTimeout(() => {
      if (who === role) clearLocal();
      else { remoteContact = null; setTyping(who, false); }
    }, timeout));
    render();
  }

  function broadcast(caseId, typing) {
    channel?.postMessage({caseId, typing, role, sender, at:Date.now()});
  }
  function clearLocal() {
    if (localCase) broadcast(localCase, false);
    localCase = null;
    setTyping(role, false);
  }
  composer.addEventListener('input', () => {
    if (!composer.value.trim()) { clearLocal(); return; }
    const id = clinical.id();
    if (localCase && localCase !== id) clearLocal();
    localCase = id;
    broadcast(id, true);
    setTyping(role, true, 1600);
  });
  screen.addEventListener('click', event => {
    if (event.target.closest('[data-chat-send]')) setTimeout(() => {
      if (!composer.value.trim()) clearLocal();
    }, 0);
  });
  composer.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) setTimeout(() => {
      if (!composer.value.trim()) clearLocal();
    }, 0);
  });
  channel?.addEventListener('message', ({data}) => {
    if (data?.caseId !== clinical.id() || data.role !== other || typeof data.sender !== 'string' ||
        typeof data.typing !== 'boolean' || !Number.isFinite(data.at) || Math.abs(Date.now() - data.at) > 2400) return;
    if (data.typing) {
      remoteContact = data.sender;
      setTyping(other, true, 2200);
    } else if (remoteContact === data.sender) {
      remoteContact = null;
      setTyping(other, false);
    }
  });
  function reset() {
    clearLocal();
    remoteContact = null;
    setTyping(other, false);
  }
  document.addEventListener('krane:clinical-selected', reset);
  document.addEventListener('krane:languagechange', render);
  window.addEventListener('hashchange', reset);
  window.addEventListener('pagehide', reset);
  render();
})();

/* Doctor core flow, from the Doctor Manual (Krane Drive, 17 Sep 2026).
   Sign in with OTP, set Available, open a patient, join the call, write SOAP notes,
   show the prescription in chat, finish, dispense from the Krane medicine list,
   create the order, and land on a completed consultation.

   Copy is written in English and translated by i18n.js (Thai is the default).
   Strings that carry a name or a number are built per language with T(). */
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  const isThai = () => !!document.querySelector('.lang__opt[data-lng="th"].is-active');
  const T = (en, th) => (isThai() ? th : en);
  const baht = n => '฿ ' + Number(n).toLocaleString('en-US');
  const clock = () => new Date().toLocaleTimeString(isThai() ? 'th-TH' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  const say = msg => { if (typeof window.toast === 'function') window.toast(msg); };
  const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // currentPatientSelection is a top-level let in the page script: shared by name,
  // not a property of window.
  const patientName = () => (typeof currentPatientSelection !== 'undefined' && currentPatientSelection.name) || 'Mali S.';

  /* ---------------------------------------------------------------- modals */
  function openModal(sel) {
    const m = $(sel); if (!m) return;
    m.hidden = false; document.body.classList.add('modal-open');
    const focus = m.querySelector('input:not([type=radio]),textarea,.btn--primary');
    if (focus) focus.focus();
  }
  function closeModal(m) {
    if (!m) return;
    m.hidden = true;
    if (!$$('.cms-modal').some(x => !x.hidden)) document.body.classList.remove('modal-open');
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-modal-close]');
    if (c) closeModal(c.closest('.cms-modal'));
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    $$('.cms-modal').filter(m => !m.hidden).forEach(closeModal);
    closeAccount();
  });

  /* ---------------------------------------------------------------- sign in (manual 3, 4) */
  const SIGNED_KEY = 'krane-doctor-signed-in';
  const auth = $('[data-doc-auth]');
  let authMethod = 'phone';
  function signedIn() { try { return sessionStorage.getItem(SIGNED_KEY) === '1'; } catch (e) { return false; } }
  function setSigned(on) { try { on ? sessionStorage.setItem(SIGNED_KEY, '1') : sessionStorage.removeItem(SIGNED_KEY); } catch (e) {} }
  function authStep(step) { $$('[data-auth-step]').forEach(p => { p.hidden = p.dataset.authStep !== step; }); }
  function setMethod(m) {
    authMethod = m;
    $$('[data-auth-method]').forEach(b => {
      const on = b.dataset.authMethod === m;
      b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on));
    });
    $$('[data-auth-panel]').forEach(p => { p.hidden = p.dataset.authPanel !== m; });
    $('[data-auth-next]').textContent = m === 'line' ? 'Continue with LINE' : 'Request OTP';
  }
  function showAuth(on) {
    if (!auth) return;
    auth.hidden = !on;
    document.body.classList.toggle('is-signed-out', on);
    if (on) { authStep('method'); const err = $('[data-auth-error]'); if (err) err.hidden = true; }
    syncGuide(on ? 'login' : currentPage());
  }
  document.addEventListener('click', e => {
    const m = e.target.closest('[data-auth-method]');
    if (m) { setMethod(m.dataset.authMethod); return; }
    if (e.target.closest('[data-auth-next]')) { authStep('otp'); $('[data-auth-otp]').focus(); return; }
    if (e.target.closest('[data-auth-back]')) { authStep('method'); return; }
    if (e.target.closest('[data-auth-resend]')) { say(T('A new code is on its way', 'ส่งรหัสใหม่แล้ว')); return; }
    if (e.target.closest('[data-auth-verify]')) {
      const code = ($('[data-auth-otp]').value || '').replace(/\D/g, '');
      const err = $('[data-auth-error]');
      if (code.length !== 6) { err.hidden = false; return; }
      err.hidden = true;
      setSigned(true); showAuth(false);
      try { history.replaceState(null, '', '#dashboard'); } catch (x) {}
      window.go('dashboard', false);
      setStatus('available');
      say(T('Signed in', 'เข้าสู่ระบบแล้ว'));
      return;
    }
    if (e.target.closest('[data-signout]')) {
      closeAccount(); setSigned(false);
      try { history.replaceState(null, '', '#login'); } catch (x) {}
      showAuth(true);
    }
  });
  const otpInput = $('[data-auth-otp]');
  if (otpInput) otpInput.addEventListener('keydown', e => { if (e.key === 'Enter') $('[data-auth-verify]').click(); });
  window.addEventListener('hashchange', () => { if (location.hash === '#login') showAuth(true); });

  /* ---------------------------------------------------------------- account menu */
  const accountMenu = $('[data-account-menu]');
  const accountToggle = $('[data-account-toggle]');
  function closeAccount() {
    if (!accountMenu) return;
    accountMenu.hidden = true; accountToggle.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-account-toggle]')) {
      const open = accountMenu.hidden;
      accountMenu.hidden = !open; accountToggle.setAttribute('aria-expanded', String(open));
      return;
    }
    if (!e.target.closest('[data-account-menu]')) closeAccount();
    else if (e.target.closest('[data-page]')) closeAccount();
  });

  /* ---------------------------------------------------------------- service status (manual 6.1) */
  let status = 'available';
  function setStatus(next) {
    status = next;
    const busy = next === 'occupied';
    $$('[data-doctor-status]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.doctorStatus === next)));
    const pill = $('[data-status-pill]');
    if (pill) pill.classList.toggle('oncall--busy', busy);
    const pillText = $('[data-status-pill-text]');
    if (pillText) pillText.textContent = busy ? 'Occupied' : 'Available';
    const note = $('[data-occupied-note]');
    if (note) note.hidden = !busy;
    const self = $('[data-self-status]');
    if (self) {
      self.className = 'badge ' + (busy ? 'badge--warn' : 'badge--done');
      self.innerHTML = '<span class="dot"></span>' + (busy ? 'Occupied' : 'Available');
      const row = self.closest('tr'); if (row) row.dataset.dfStatus = next;
    }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-doctor-status]');
    if (b) { setStatus(b.dataset.doctorStatus); say(b.dataset.doctorStatus === 'occupied' ? T('Status set to Occupied', 'ตั้งสถานะเป็นไม่ว่างแล้ว') : T('Status set to Available', 'ตั้งสถานะเป็นว่างแล้ว')); }
  });

  /* ---------------------------------------------------------------- patients and doctors search */
  function filterTable(rows, empty, test) {
    let shown = 0;
    rows.forEach(r => { const ok = test(r); r.hidden = !ok; if (ok) shown++; });
    if (empty) empty.hidden = shown > 0;
  }
  function runConsultFilter() {
    const v = k => (($('[data-cf="' + k + '"]') || {}).value || '').trim().toLowerCase();
    const q = { patient: v('patient'), doctor: v('doctor'), code: v('code'), status: v('status') };
    filterTable($$('[data-consult-rows] tr:not([data-consult-empty])'), $('[data-consult-empty]'), r => {
      const name = (r.dataset.patient || '').toLowerCase();
      return (!q.patient || name.includes(q.patient))
        && (!q.doctor || (r.dataset.doctor || '').toLowerCase() === q.doctor)
        && (!q.code || (r.dataset.code || '').toLowerCase().includes(q.code))
        && (!q.status || r.dataset.status === q.status);
    });
  }
  function runDoctorFilter() {
    const name = (($('[data-df="name"]') || {}).value || '').trim().toLowerCase();
    const st = ($('[data-df="status"]') || {}).value || '';
    filterTable($$('[data-doctor-rows] tr:not([data-doctor-empty])'), $('[data-doctor-empty]'), r =>
      (!name || r.textContent.toLowerCase().includes(name)) && (!st || r.dataset.dfStatus === st));
  }
  document.addEventListener('input', e => {
    if (e.target.closest('[data-consult-filters]')) runConsultFilter();
    if (e.target.closest('[data-doctor-filters]')) runDoctorFilter();
  });
  document.addEventListener('change', e => {
    if (e.target.closest('[data-consult-filters]')) runConsultFilter();
    if (e.target.closest('[data-doctor-filters]')) runDoctorFilter();
  });

  /* ---------------------------------------------------------------- tabs (patient record, profile) */
  function bindTabs(attr) {
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-' + attr + ']');
      if (!tab) return;
      const key = tab.dataset[attr.replace(/-([a-z])/g, (m, c) => c.toUpperCase())];
      const group = tab.closest('.tabs').parentElement;
      $$('[data-' + attr + ']', group).forEach(t => {
        const on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on));
      });
      $$('[data-' + attr + '-panel]', group).forEach(p => { p.hidden = p.getAttribute('data-' + attr + '-panel') !== key; });
      if (key === 'chat') { const u = $('[data-chat-unread]'); if (u) u.hidden = true; }
    });
  }
  bindTabs('ptab'); bindTabs('prtab');

  /* ---------------------------------------------------------------- chat on the record, links, callbacks */
  function appendBubble(thread, html, out) {
    const b = document.createElement('div');
    b.className = 'bubble ' + (out ? 'bubble--out' : 'bubble--in');
    b.innerHTML = html; thread.appendChild(b);
    thread.scrollTop = thread.scrollHeight;
    return b;
  }
  function sendFrom(input, thread) {
    const text = (input.value || '').trim(); if (!text) return;
    appendBubble(thread, esc(text), true); input.value = '';
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-record-chat-send]')) sendFrom($('[data-record-chat-input]'), $('[data-record-chat]'));
    if (e.target.closest('[data-chat-send]')) sendFrom($('[data-selected-message]'), $('#consult .chat__thread'));
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.target.matches('[data-record-chat-input]')) sendFrom(e.target, $('[data-record-chat]'));
    if (e.target.matches('[data-selected-message]')) sendFrom(e.target, $('#consult .chat__thread'));
  });

  const nowStamp = () => {
    const d = new Date();
    const months = isThai() ? ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' · ' + clock();
  };
  const doctorName = () => T('Dr. Narin Tanaka', 'คุณหมอนรินทร์ ทานากะ');
  function addLinkRow(channel) {
    const body = $('[data-link-rows]'); if (!body) return;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + nowStamp() + '</td><td>' + esc(channel) + '</td><td>' + doctorName() + '</td><td><span class="badge badge--warn">' + T('Sent', 'ส่งแล้ว') + '</span></td>';
    body.prepend(tr);
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-link-open]')) { $('[data-link-copy]').hidden = true; openModal('[data-link-modal]'); return; }
    const send = e.target.closest('[data-link-send]');
    if (send) {
      addLinkRow(send.dataset.linkSend); closeModal(send.closest('.cms-modal'));
      say(T('Link sent by ' + send.dataset.linkSend, 'ส่งลิงก์ทาง ' + send.dataset.linkSend + ' แล้ว'));
      return;
    }
    if (e.target.closest('[data-link-show]')) { $('[data-link-copy]').hidden = false; $('[data-link-value]').select(); return; }
    if (e.target.closest('[data-link-copy-btn]')) {
      const v = $('[data-link-value]').value;
      try { navigator.clipboard.writeText(v); } catch (x) {}
      addLinkRow(T('Copied link', 'คัดลอกลิงก์'));
      say(T('Link copied', 'คัดลอกลิงก์แล้ว'));
      return;
    }
    if (e.target.closest('[data-callback-open]')) { $('[data-callback-note]').value = ''; openModal('[data-callback-modal]'); return; }
    if (e.target.closest('[data-callback-save]')) {
      const note = $('[data-callback-note]').value.trim();
      if (!note) { $('[data-callback-note]').focus(); return; }
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + nowStamp() + '</td><td>' + doctorName() + '</td><td>' + esc(note) + '</td>';
      $('[data-callback-rows]').prepend(tr);
      closeModal($('[data-callback-modal]'));
      say(T('Callback saved', 'บันทึกการติดต่อกลับแล้ว'));
    }
  });

  /* ---------------------------------------------------------------- edit patient + change log (manual 6.2.3.5) */
  const FIELD_LABEL = { symptoms: ['Symptoms', 'อาการ'], allergies: ['Drug allergies', 'แพ้ยา'], conditions: ['Chronic conditions', 'โรคประจำตัว'], medication: ['Current medication', 'ยาที่ใช้อยู่'] };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-edit-patient]')) {
      $$('[data-pe]').forEach(i => { i.value = ($('[data-pf="' + i.dataset.pe + '"]') || {}).textContent || ''; });
      openModal('[data-patient-modal]'); return;
    }
    if (e.target.closest('[data-patient-save]')) {
      const log = $('[data-changelog]'); let changed = 0;
      $$('[data-pe]').forEach(i => {
        const out = $('[data-pf="' + i.dataset.pe + '"]');
        const next = i.value.trim();
        if (!out || !next || out.textContent === next) return;
        out.textContent = next; changed++;
        const li = document.createElement('li');
        li.innerHTML = '<b>' + T(FIELD_LABEL[i.dataset.pe][0], FIELD_LABEL[i.dataset.pe][1]) + '</b> ' + T('set to', 'เปลี่ยนเป็น') + ' "' + esc(next) + '"<small>' + doctorName() + ' · ' + nowStamp() + '</small>';
        log.prepend(li);
      });
      closeModal($('[data-patient-modal]'));
      say(changed ? T('Patient details saved', 'บันทึกข้อมูลผู้ป่วยแล้ว') : T('Nothing changed', 'ไม่มีการเปลี่ยนแปลง'));
    }
  });

  /* ---------------------------------------------------------------- consultation room */
  let soapTimer;
  document.addEventListener('input', e => {
    if (!e.target.matches('[data-soap]')) return;
    const st = $('[data-soap-status]');
    st.textContent = 'Saving';
    clearTimeout(soapTimer);
    soapTimer = setTimeout(() => { st.textContent = T('Saved automatically · ', 'บันทึกอัตโนมัติแล้ว · ') + clock(); }, 700);
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-rx-card-send]')) {
      const thread = $('#consult .chat__thread');
      const rows = draft.map(d => '<div class="rx-card__row"><b>' + esc(d.name) + '</b><small>' + esc(T(d.dir, d.dirTH)) + '</small></div>').join('');
      const card = appendBubble(thread,
        '<div class="rx-card"><div class="rx-card__head">' + T('Prescription (draft)', 'ใบสั่งยา (ร่าง)') + '</div>' + rows
        + '<div class="rx-card__foot">' + T('Not an order yet. Your doctor confirms it after the consultation.', 'ยังไม่ใช่คำสั่งซื้อ แพทย์จะยืนยันหลังจบการปรึกษา') + '</div></div>', true);
      card.classList.add('bubble--card');
      say(T('Prescription shown in chat', 'แสดงใบสั่งยาในแชทแล้ว'));
      return;
    }
    // Hang up (manual 6.2.3): leave the call; if it dropped, call the patient again.
    if (e.target.closest('[data-room-end]')) {
      const rejoin = $('[data-room-rejoin]'); if (rejoin) rejoin.hidden = false;
      const body = $('[data-room-notice-body]');
      if (body) body.textContent = T('You left the call. If it dropped because of a technical problem, call the patient again. Finish the consultation when you are done.',
        'คุณวางสายแล้ว หากสายหลุดจากปัญหาทางเทคนิค โทรหาผู้ป่วยอีกครั้งได้ เมื่อเรียบร้อยให้กดเสร็จสิ้นการปรึกษา');
      return;
    }
    if (e.target.closest('[data-room-rejoin]')) {
      const room = $('[data-room]'); room.dataset.roomMode = 'video';
      $('[data-room-notice]').hidden = true; e.target.closest('[data-room-rejoin]').hidden = true;
      say(T('Calling the patient again', 'กำลังโทรหาผู้ป่วยอีกครั้ง'));
      return;
    }
    if (e.target.closest('[data-finish-open]')) { openModal('[data-finish-modal]'); return; }
    if (e.target.closest('[data-finish-confirm]')) {
      const choice = ($('[name="dispense"]:checked') || {}).value || 'yes';
      closeModal($('[data-finish-modal]'));
      if (choice === 'yes') window.go('prescribe');
      else complete(false);
    }
  });

  /* ---------------------------------------------------------------- prescription (manual 6.2.3.3) */
  // From the "krane clinic product list" sheet (Krane Drive, updated 9 Sep 2026).
  const CATALOG = [
    ['FIRIDE', '147158', 'Finasteride', 'FIRIDE 1MG', 428, 'Take 1 tablet once daily', 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง'],
    ['HARIFIN', '251968', 'Finasteride', 'HARIFIN 1MG', 267, 'Take 1 tablet once daily', 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง'],
    ['PROPECIA', '286117', 'Finasteride', 'PROPECIA 1MG', 465, 'Take 1 tablet once daily', 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง'],
    ['MEGA STERZAR', '202398', 'Finasteride', 'MEGA STERZAR 1 MG', 467, 'Take 1 tablet once daily', 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง'],
    ['LOXIDIL', '221864', 'Minoxidil', 'LOXIDIL 5MG', 180, 'Take 1 tablet once daily', 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง'],
    ['RETEN FIVE', '206741', 'Minoxidil', 'RETEN FIVE 5% SOL 30ML', 330, 'Apply to the affected area on a dry scalp once daily', 'ทาเฉพาะจุดตอนผมแห้งสนิท วันละ 1 ครั้ง'],
    ['NUHAIR', '119962', 'Minoxidil', 'NUHAIR 5% SCALP LOT 60ML', 1060, 'Apply to the affected area on a dry scalp once daily', 'ทาเฉพาะจุดตอนผมแห้งสนิท วันละ 1 ครั้ง'],
    ['NUHAIR', '110515', 'Minoxidil', 'NUHAIR 3% SCALP LOT 60ML', 790, 'Apply to the affected area on a dry scalp once daily', 'ทาเฉพาะจุดตอนผมแห้งสนิท วันละ 1 ครั้ง'],
    ['CIALIS', '700312', 'Tadalafil', 'CIALIS 20MG', 3117, 'Take 1 tablet as needed, no more than once a day', 'รับประทานครั้งละ 1 เม็ด ตามต้องการ ไม่เกินวันละ 1 ครั้ง'],
    ['TALAFIL', '318516', 'Tadalafil', 'TALAFIL 20MG', 2293, 'Take 1 tablet as needed, no more than once a day', 'รับประทานครั้งละ 1 เม็ด ตามต้องการ ไม่เกินวันละ 1 ครั้ง'],
    ['SIDEGRA', '172928', 'Sildenafil', 'SIDEGRA 100MG', 228, 'Take 1 tablet as needed, no more than once a day', 'รับประทานครั้งละ 1 เม็ด ตามต้องการ ไม่เกินวันละ 1 ครั้ง'],
    ['VIAGRA', '234427', 'Sildenafil', 'VIAGRA 100MG', 2283, 'Take 1 tablet as needed, no more than once a day', 'รับประทานครั้งละ 1 เม็ด ตามต้องการ ไม่เกินวันละ 1 ครั้ง'],
    ['MOUNJARO', '346103', 'Tirzepatide', 'MOUNJARO KWIKPEN 2.5MG INJ', 16100, 'Inject 1 dose once a week', 'ฉีดครั้งละ 1 โดส อาทิตย์ละ 1 ครั้ง'],
    ['WEGOVY', '346979', 'Semaglutide', 'WEGOVY 0.25MG FLEXTOUCH', 11900, 'Inject 1 dose once a week', 'ฉีดครั้งละ 1 โดส อาทิตย์ละ 1 ครั้ง']
  ].map(r => ({ brand: r[0], sku: r[1], generic: r[2], name: r[3], price: r[4], dir: r[5], dirTH: r[6] }));

  // The draft follows the demo plan the patient app shows (Finasteride 1mg and
  // Minoxidil 5% topical, ฿ 1,040), so the three portals agree.
  const draft = [
    { key: 'draft-fin', name: 'Finasteride 1mg', generic: 'Finasteride', sku: '', price: 590, dir: '1 tablet once daily', dirTH: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง' },
    { key: 'draft-min', name: 'Minoxidil 5% topical', generic: 'Minoxidil', sku: '', price: 450, dir: 'Apply 1 mL to the scalp twice daily', dirTH: 'ทา 1 มล. ที่หนังศีรษะ วันละ 2 ครั้ง' }
  ];
  let dispensed = draft.map(d => Object.assign({ qty: 1, directions: null }, d));
  let saved = false;

  function markDirty() {
    saved = false;
    const create = $('[data-order-open]'); if (create) create.disabled = true;
    const st = $('[data-rx-save-status]'); if (st) st.textContent = 'Save the prescription before you create the order.';
  }
  function rxTotal() { return dispensed.reduce((sum, d) => sum + d.price * (d.qty || 1), 0); }
  function renderRx() {
    const draftList = $('[data-rx-draft-list]');
    if (draftList) {
      draftList.innerHTML = draft.map(d => {
        const inList = dispensed.some(x => x.key === d.key);
        return '<div class="draft-rx__row draft-rx__row--action"><span><b>' + esc(d.name) + '</b><small>' + esc(T(d.dir, d.dirTH)) + '</small></span>'
          + (inList ? '<span class="badge badge--done">' + T('In the dispensed list', 'อยู่ในรายการที่จ่ายแล้ว') + '</span>'
                    : '<button class="btn btn--secondary btn--sm" type="button" data-rx-add-draft="' + d.key + '">' + T('Add', 'เพิ่ม') + '</button>')
          + '</div>';
      }).join('');
    }
    const body = $('[data-rx-rows]');
    if (body) {
      body.innerHTML = dispensed.map((d, i) =>
        '<tr><td><div class="strong">' + esc(d.name) + '</div><div class="sub">' + esc(d.generic) + (d.sku ? ' · SKU ' + d.sku : '') + '</div></td>'
        + '<td><input class="input input--qty" type="number" min="1" value="' + (d.qty || 1) + '" data-rx-qty="' + i + '" aria-label="' + T('Quantity', 'จำนวน') + '"></td>'
        + '<td><input class="input" value="' + esc(d.directions || T(d.dir, d.dirTH)) + '" data-rx-dir="' + i + '" aria-label="' + T('Directions', 'วิธีใช้') + '"></td>'
        + '<td class="strong">' + baht(d.price * (d.qty || 1)) + '</td>'
        + '<td><button class="btn btn--ghost btn--sm" type="button" data-rx-remove="' + i + '">' + T('Remove', 'ลบ') + '</button></td></tr>').join('');
    }
    const empty = $('[data-rx-empty]'); if (empty) empty.hidden = dispensed.length > 0;
    const count = $('[data-rx-count]'); if (count) count.textContent = String(dispensed.length);
    const total = $('[data-rx-total]'); if (total) total.textContent = baht(rxTotal());
    const who = $('[data-rx-patient]'); if (who) who.textContent = patientName();
  }
  document.addEventListener('input', e => {
    const q = e.target.closest('[data-rx-qty]');
    if (q) { dispensed[+q.dataset.rxQty].qty = Math.max(1, parseInt(q.value, 10) || 1); markDirty(); renderRxTotalsOnly(); }
    const d = e.target.closest('[data-rx-dir]');
    if (d) { dispensed[+d.dataset.rxDir].directions = d.value; markDirty(); }
  });
  function renderRxTotalsOnly() {
    $$('[data-rx-rows] tr').forEach((tr, i) => { const cell = tr.children[3]; if (cell && dispensed[i]) cell.textContent = baht(dispensed[i].price * (dispensed[i].qty || 1)); });
    const total = $('[data-rx-total]'); if (total) total.textContent = baht(rxTotal());
  }
  function addDrug(item) {
    if (dispensed.some(x => (x.sku && x.sku === item.sku) || x.key === item.key)) { say(T('Already in the list', 'มีในรายการแล้ว')); return false; }
    dispensed.push(Object.assign({ qty: 1, directions: null }, item));
    markDirty(); renderRx(); return true;
  }
  document.addEventListener('click', e => {
    const addDraft = e.target.closest('[data-rx-add-draft]');
    if (addDraft) { addDrug(draft.find(d => d.key === addDraft.dataset.rxAddDraft)); return; }
    const rm = e.target.closest('[data-rx-remove]');
    if (rm) { dispensed.splice(+rm.dataset.rxRemove, 1); markDirty(); renderRx(); return; }
    if (e.target.closest('[data-rx-save]')) {
      if (!dispensed.length) { say(T('Add at least one medicine first', 'เพิ่มยาอย่างน้อย 1 รายการก่อน')); return; }
      saved = true;
      $('[data-order-open]').disabled = false;
      $('[data-rx-save-status]').textContent = T('Saved at ', 'บันทึกแล้ว ') + clock() + T('. You can create the order now.', ' สร้างคำสั่งซื้อได้เลย');
      say(T('Prescription saved', 'บันทึกใบสั่งยาแล้ว'));
      return;
    }
    if (e.target.closest('[data-rx-cancel]')) {
      dispensed = draft.map(d => Object.assign({ qty: 1, directions: null }, d)); markDirty(); renderRx();
      window.go('consult');
      say(T('Prescription discarded. The consultation is still open.', 'ยกเลิกใบสั่งยาแล้ว การปรึกษายังเปิดอยู่'));
      return;
    }
    if (e.target.closest('[data-order-open]')) {
      if (!saved) return;
      $('[data-order-lines]').innerHTML = dispensed.map(d =>
        '<div class="kv"><span class="k">' + esc(d.name) + ' × ' + (d.qty || 1) + '</span><span class="strong">' + baht(d.price * (d.qty || 1)) + '</span></div>').join('')
        + '<div class="kv order-lines__total"><span class="k">' + T('Total medicine', 'ยอดค่ายารวม') + '</span><span class="strong">' + baht(rxTotal()) + '</span></div>';
      openModal('[data-order-modal]');
      return;
    }
    if (e.target.closest('[data-order-confirm]')) { closeModal($('[data-order-modal]')); complete(true); }
  });

  /* medicine search */
  function runDrugSearch() {
    const scope = $('[data-drug-scope]').value;
    const q = ($('[data-drug-q]').value || '').trim().toLowerCase();
    const hits = CATALOG.filter(d => !q || String(d[scope]).toLowerCase().includes(q));
    const box = $('[data-drug-results]');
    box.innerHTML = hits.length
      ? hits.map(d => '<div class="drug-row"><span class="drug-row__body"><b>' + esc(d.name) + '</b><small>' + T('Brand', 'ยี่ห้อ') + ' ' + esc(d.brand) + ' · ' + T('Code', 'รหัส') + ' ' + d.sku + ' · ' + esc(d.generic) + '</small></span><span class="strong">' + baht(d.price) + '</span><button class="btn btn--secondary btn--sm" type="button" data-drug-add="' + d.sku + '">' + T('Select', 'เลือก') + '</button></div>').join('')
      : '<div class="record-empty">' + T('No medicine matches this search.', 'ไม่พบยาที่ตรงกับการค้นหา') + '</div>';
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-drug-open]')) { openModal('[data-drug-modal]'); runDrugSearch(); return; }
    if (e.target.closest('[data-drug-search]')) { runDrugSearch(); return; }
    const add = e.target.closest('[data-drug-add]');
    if (add) {
      const item = CATALOG.find(d => d.sku === add.dataset.drugAdd);
      if (addDrug(Object.assign({ key: 'sku-' + item.sku }, item))) {
        add.outerHTML = '<span class="badge badge--done">' + T('Added', 'เพิ่มแล้ว') + '</span>';
        say(T(item.name + ' added', 'เพิ่ม ' + item.name + ' แล้ว'));
      }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-drug-q]')) runDrugSearch(); });
  document.addEventListener('change', e => { if (e.target.matches('[data-drug-scope]')) runDrugSearch(); });

  /* ---------------------------------------------------------------- completion */
  function setConsultStatus(label, cls) {
    const b = $('[data-consult-status]'); if (b) { b.textContent = label; b.className = 'badge ' + cls; }
  }
  function complete(withOrder) {
    setStatus('available');
    $('[data-done-patient]').textContent = patientName();
    $('[data-done-rx]').textContent = withOrder ? 'Issued' : 'None';
    $('[data-done-order]').textContent = withOrder ? 'KR-10293' : '-';
    $('[data-done-order-status]').textContent = withOrder ? 'Waiting for the patient to pay' : 'No order';
    $('[data-done-lead]').textContent = withOrder
      ? 'The prescription is saved and the order is created. The patient reviews the price and pays in the app.'
      : 'Your notes are saved. No medicine was dispensed in this consultation.';
    setConsultStatus('Completed', 'badge--done');
    const len = $('[data-consult-length]'); if (len) len.textContent = T('14 minutes', '14 นาที');
    // The golden row in the patients list reflects the outcome.
    const row = $('[data-consult-rows] tr[data-code="CONS-2041"]');
    if (row) {
      row.dataset.status = 'completed';
      row.children[2].innerHTML = '<span class="badge badge--done"><span class="dot"></span>Completed</span>';
      row.children[5].textContent = withOrder ? 'KR-10293' : '-';
      row.children[6].innerHTML = withOrder ? '<span class="badge badge--warn">Awaiting payment</span>' : '<span class="hint">-</span>';
      row.dataset.patientState = 'completed';
    }
    if (withOrder) document.dispatchEvent(new CustomEvent('krane-doctor-order-created', { detail: { items: dispensed.slice(), total: rxTotal() } }));
    window.go('consult-done');
  }

  /* ---------------------------------------------------------------- profile (manual 6.2.1) */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-profile-save]')) {
      $('[data-profile-status]').textContent = T('Saved at ', 'บันทึกแล้ว ') + clock();
      say(T('Personal details saved', 'บันทึกข้อมูลส่วนตัวแล้ว')); return;
    }
    if (e.target.closest('[data-password-save]')) {
      const cur = $('#pw-current').value, next = $('#pw-new').value, again = $('#pw-confirm').value;
      const st = $('[data-password-status]');
      if (!cur) { st.textContent = T('Enter your current password.', 'กรอกรหัสผ่านปัจจุบัน'); return; }
      if (next.length < 8 || !/\d/.test(next)) { st.textContent = T('Use at least 8 characters with a number.', 'ใช้อย่างน้อย 8 ตัวอักษรและมีตัวเลข'); return; }
      if (next !== again) { st.textContent = T('The new passwords do not match.', 'รหัสผ่านใหม่ไม่ตรงกัน'); return; }
      ['#pw-current', '#pw-new', '#pw-confirm'].forEach(s => { $(s).value = ''; });
      st.textContent = T('Password changed at ', 'เปลี่ยนรหัสผ่านแล้ว ') + clock();
      say(T('Password changed', 'เปลี่ยนรหัสผ่านแล้ว')); return;
    }
    if (e.target.closest('[data-photo-choose]')) { $('[data-photo-input]').click(); return; }
    if (e.target.closest('[data-photo-remove]')) { setPhoto(null); say(T('Photo deleted', 'ลบรูปแล้ว')); }
  });
  function setPhoto(src) {
    const av = $('[data-photo-avatar]');
    const topAv = $('[data-user-avatar]');
    [av, topAv].forEach(el => {
      if (!el) return;
      el.style.backgroundImage = src ? 'url("' + src + '")' : '';
      el.classList.toggle('has-photo', !!src);
    });
    $('[data-photo-remove]').hidden = !src;
  }
  function readPhoto(file) {
    if (!file || !/\.(jpe?g|png)$/i.test(file.name)) { say(T('Use a .jpeg, .jpg or .png file', 'ใช้ไฟล์ .jpeg .jpg หรือ .png')); return; }
    const r = new FileReader();
    r.onload = () => { setPhoto(r.result); say(T('Photo saved', 'บันทึกรูปแล้ว')); };
    r.readAsDataURL(file);
  }
  const photoInput = $('[data-photo-input]');
  if (photoInput) photoInput.addEventListener('change', () => readPhoto(photoInput.files && photoInput.files[0]));
  const drop = $('[data-photo-drop]');
  if (drop) {
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('is-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
    drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('is-over'); readPhoto(e.dataTransfer.files[0]); });
  }

  /* ---------------------------------------------------------------- flow guide (reviewer aid) */
  const STEP_OF_PAGE = { login: 1, dashboard: 2, queue: 3, preconsult: 4, consult: 5, prescribe: 7, 'consult-done': 9 };
  const steps = $$('[data-flow-step]');
  function currentPage() { const p = $('.page.is-active'); return p ? p.id : 'dashboard'; }
  function syncGuide(page) {
    const n = STEP_OF_PAGE[page]; if (!n) return;
    steps.forEach((b, i) => { b.classList.toggle('is-current', i + 1 === n); b.classList.toggle('is-done', i + 1 < n); });
    const prog = $('[data-flow-progress]'); if (prog) prog.textContent = n + '/' + steps.length;
  }
  function goldenRow() { return $('[data-consult-rows] tr[data-code="CONS-2041"]'); }
  function selectGolden() { const r = goldenRow(); if (r && typeof window.loadSelectedPatient === 'function') window.loadSelectedPatient(r); }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-flow-toggle]')) {
      const list = $('[data-flow-list]'); list.hidden = !list.hidden;
      e.target.closest('[data-flow-toggle]').setAttribute('aria-expanded', String(!list.hidden));
      return;
    }
    const step = e.target.closest('[data-flow-step]');
    if (!step) return;
    const s = step.dataset.flowStep;
    if (s === 'login') { setSigned(false); try { history.replaceState(null, '', '#login'); } catch (x) {} showAuth(true); return; }
    if (!auth.hidden) { setSigned(true); showAuth(false); }
    if (s !== 'dashboard' && s !== 'queue') selectGolden();
    if (s === 'finish') { window.go('consult'); openModal('[data-finish-modal]'); return; }
    if (s === 'order') {
      window.go('prescribe');
      if (!saved) $('[data-rx-save]').click();
      $('[data-order-open]').click();
      return;
    }
    if (s === 'consult-done') { complete(true); return; }
    window.go(s);
  });

  /* ---------------------------------------------------------------- page hook */
  const baseGo = window.go;
  window.go = function (id, push) {
    baseGo(id, push);
    if (id === 'consult') {
      setStatus('occupied');
      setConsultStatus('In consultation', 'badge--go');
      const len = $('[data-consult-length]'); if (len) len.textContent = T('In progress', 'กำลังปรึกษา');
    }
    if (id === 'prescribe') {
      renderRx();
      const title = $('[data-selected-prescribe-title]'); if (title) title.textContent = T('Prescription · ', 'ใบสั่งยา · ') + patientName();
    }
    syncGuide(id);
  };
  document.addEventListener('click', e => { if (e.target.closest('.lang__opt')) setTimeout(() => { renderRx(); }, 0); });

  renderRx();
  setStatus('available');
  const h = location.hash.slice(1);
  showAuth(h === 'login' || (!h && !signedIn()));
  if (h && h !== 'login') setSigned(true);
})();

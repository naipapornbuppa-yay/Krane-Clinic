(function configureKraneReviewTools(global) {
  "use strict";

  const params = new URLSearchParams(global.location.search);
  /* Two versions of the same app: ?screens=1 enables the screen picker,
     no parameter is the plain patient app. The old
     with_screen_tab=1 links keep working and get rewritten to ?screens=1
     (client, 6 Oct). */
  const screensParam = params.get("screens");
  const enabled = screensParam === "1" || screensParam === "" || screensParam === "true"
    || params.get("with_screen_tab") === "1";
  const publicGroups = global.KraneReviewPublicPages || [];
  const publicPages = new Map(publicGroups.flatMap(group => group.pages.map(page => [page[0], page])));
  let selectedPublic = enabled ? publicPages.get(params.get("publicPage")) : null;
  let defaultLandingSource;

  function resetPublicPreview() {
    if (!selectedPublic) return;
    selectedPublic = null;
    const url = new URL(global.location.href);
    url.searchParams.delete("publicPage");
    global.history.replaceState(global.history.state, "", url);
    const landing = global.document.querySelector("#landing iframe");
    landing.src = defaultLandingSource;
    landing.title = "Krane B2C landing";
    global.document.querySelector("[data-review-public][aria-current]")?.removeAttribute("aria-current");
    global.document.querySelector("[data-review-public].current")?.classList.remove("current");
  }

  function syncPublicSelection(active) {
    if (!selectedPublic) return null;
    const link = global.document.querySelector('[data-review-public="' + selectedPublic[0] + '"]');
    if (!link) return null;
    link.classList.toggle("current", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
    return active ? link : null;
  }

  function renderPublicGroups(fragment, thai) {
    if (selectedPublic) {
      const landing = global.document.querySelector("#landing iframe");
      defaultLandingSource = landing.getAttribute("src");
      const destination = new URL(selectedPublic[1], global.location.href);
      destination.searchParams.set("lang", thai ? "th" : "en");
      landing.src = destination.href;
      landing.title = selectedPublic[thai ? 2 : 3];
    }
    publicGroups.forEach((group, index) => {
      const details = global.document.createElement("details");
      details.className = "rail-group";
      details.dataset.searchText = "landing website public " + group.th + " " + group.en;
      const summary = global.document.createElement("summary");
      const number = global.document.createElement("span");
      number.className = "rail-step";
      number.textContent = "W" + (index + 1);
      summary.append(number, global.document.createTextNode(thai ? group.th : group.en));
      const body = global.document.createElement("div");
      body.className = "rail-group__body";
      group.pages.forEach(([id, path, th, en]) => {
        const target = new URL(global.location.pathname, global.location.href);
        target.searchParams.set("screens", "1");
        target.searchParams.set("lang", thai ? "th" : "en");
        target.searchParams.set("publicPage", id);
        target.hash = "landing";
        const link = global.document.createElement("a");
        link.href = target.href;
        link.dataset.reviewPublic = id;
        link.dataset.searchText = id + " " + path + " " + th + " " + en;
        link.textContent = thai ? th : en;
        if (selectedPublic?.[0] === id) {
          link.classList.add("current");
          link.setAttribute("aria-current", "page");
          details.open = true;
        }
        body.append(link);
      });
      details.append(summary, body);
      fragment.append(details);
    });
  }

  /*
   * Reviewer navigation has one source of truth.
   *
   * Every implemented <section class="screen"> must appear exactly once in
   * SCREEN_DIRECTORY.  The rail, reviewer SID labels and completeness audit
   * are all generated from this registry, so adding a screen can no longer
   * silently leave the Screen Tab stale.
   */
  const SCREEN_DIRECTORY = Object.freeze([
    {
      step: "01", th: "เริ่มต้นและค้นหาบริการ", en: "Start & discover",
      screens: [
        ["landing", "SID-001", "หน้าหลัก", "Landing"],
        ["conditions", "SID-005", "เลือกบริการ", "Choose care"],
        ["articles", "SID-006", "บทความสุขภาพ", "Health articles"],
        ["article", "SID-007", "รายละเอียดบทความ", "Article detail"]
      ]
    },
    {
      step: "02", th: "บัญชีและความยินยอม", en: "Account & consent",
      screens: [
        ["signup", "SID-008", "สร้างบัญชี", "Create account"],
        ["social-confirm", "SID-009", "ยืนยันบัญชี Social", "Social account confirmation"],
        ["login", "SID-010", "เข้าสู่ระบบ", "Log in"],
        ["set-password", "SID-011A", "ตั้งรหัสผ่านใหม่", "Set a new password"],
        ["otp", "SID-011", "ยืนยันรหัส OTP", "Verify OTP"],
        ["patient-info", "SID-012", "ยืนยันข้อมูลผู้รับบริการ", "Confirm patient details"],
        ["identity", "SID-013", "ยืนยันตัวตน", "Identity verification"],
        ["consent-terms", "SID-014", "ความยินยอมและ PDPA", "Consent & PDPA"]
      ]
    },
    {
      step: "03", th: "แบบประเมินสุขภาพ", en: "Health assessment",
      screens: [
        ["intake1", "SID-015", "1 · อาการตามบริการที่เลือก", "1 · Service-specific symptoms"],
        ["intake2", "SID-016", "2 · ความรุนแรงและรูปแบบอาการ", "2 · Severity & pattern"],
        ["intake3", "SID-017", "3 · การดูแลก่อนหน้า", "3 · Previous care"],
        ["intake4", "SID-018", "4 · คัดกรองเร่งด่วน", "4 · Urgent safety"],
        ["ineligible", "SID-019", "ควรพบแพทย์ที่สถานพยาบาล", "In-person care required", "exception"],
        ["intake5", "SID-020", "5 · รูปภาพ (เฉพาะบางบริการ)", "5 · Photo (condition-specific)"],
        ["intake-concern", "SID-069", "อาการที่ต้องการปรึกษา", "Consultation concern"],
        ["intake-general", "SID-021", "ข้อมูลสุขภาพทั่วไป", "General health"]
      ]
    },
    {
      step: "04", th: "จับคู่แพทย์และนัดหมาย", en: "Match & book",
      screens: [
        ["matching", "SID-024", "กำลังจับคู่แพทย์", "Doctor matching"],
        ["appointment", "SID-026", "จองคิวแพทย์ · เลือกวันและเวลา", "Book a doctor · Choose date & time", "featured"],
        ["appointment-booked", "SID-026A", "ยืนยันนัดหมาย", "Appointment confirmed"],
        ["consultpay", "SID-027", "สรุปค่าปรึกษา", "Consultation order summary"],
        ["consultpay-gw", "SID-028", "ชำระค่าปรึกษา", "Consultation payment gateway"],
        ["consultpay-fail", "SID-029", "ชำระค่าปรึกษาไม่สำเร็จ", "Consultation payment failed", "exception"],
        ["waitroom", "SID-030", "ห้องรอพบแพทย์", "Waiting room"]
      ],
      variants: [
        { ref: "matching", action: "data-demo-nomatch", th: "กรณีไม่พบแพทย์ว่าง", en: "State · No doctor available", exception: true }
      ]
    },
    {
      step: "05", th: "ปรึกษาแพทย์และแผนการรักษา", en: "Consultation & treatment plan",
      screens: [
        ["video", "SID-031", "วิดีโอคอลกับแพทย์", "Video consultation"],
        ["consult", "SID-032", "ปรึกษาผ่านแชต", "Chat consultation"],
        ["rx-writing", "SID-033", "แพทย์กำลังเขียนใบสั่งยา", "Writing prescription"],
        ["rx-plan", "SID-034", "แผนการรักษา", "Treatment plan"]
      ]
    },
    {
      step: "06", th: "ยา การจัดส่ง และชำระเงิน", en: "Medicine, delivery & payment",
      screens: [
        ["payment", "SID-040", "สรุปรายการและชำระเงิน", "Medication checkout"],
        ["payment-items", "SID-040A", "แก้ไขรายการยา", "Edit medication items"],
        ["address", "SID-036", "รายละเอียดที่อยู่", "Delivery address"],
        ["delivery-quote", "SID-037", "คำนวณค่าจัดส่ง", "Delivery quote"],
        ["pharmacy-search", "SID-038", "ตรวจสอบสต็อกและราคา", "Pharmacy stock & price"],
        ["insurance", "SID-039", "ตรวจสอบสิทธิ์ประกัน", "Insurance eligibility", "eligibility"],
        ["insurance-result", "SID-039A", "ผลการตรวจสอบสิทธิ์", "Insurance result", "eligibility"],
        ["payment-gw", "SID-041", "ช่องทางชำระเงิน", "Payment gateway"],
        ["payment-success", "SID-042", "ชำระเงินสำเร็จ", "Payment confirmed"],
        ["pharmacypending", "SID-045", "ร้านยายืนยันรายการ", "Pharmacy confirmed"],
        ["payfail", "SID-043", "ชำระเงินไม่สำเร็จ", "Medication payment failed", "exception"]
      ],
      variants: [
        { ref: "pharmacy-search", action: "data-demo-nostock", th: "กรณีร้านยาไม่มีสินค้า", en: "State · Pharmacy declines stock", exception: true }
      ]
    },
    {
      step: "07", th: "ติดตามคำสั่งซื้อ", en: "Order tracking",
      screens: [
        ["tracking", "SID-048", "สถานะการจัดส่ง", "Delivery tracking"],
        ["order-summary", "SID-048A", "สรุปรายการและใบเสร็จ", "Order summary & receipt"]
      ]
    },
    {
      step: "08", th: "การดูแลต่อเนื่อง", en: "Ongoing care",
      screens: [
        ["feedback", "SID-049", "ให้คะแนนการรับบริการ", "Rate visit"],
        ["feedbackdone", "SID-050", "ส่งความคิดเห็นแล้ว", "Feedback submitted"],
        ["profile", "SID-051", "หน้าหลักผู้รับบริการ", "Patient home"],
        ["treatment-detail", "SID-051A", "รายละเอียดการรักษา", "Treatment detail"],
        ["my-documents", "SID-051B", "เอกสารของฉัน", "My documents"],
        ["activity", "SID-052", "กิจกรรม", "Activity"],
        ["empty-activities", "SID-053", "ยังไม่มีกิจกรรม", "No activity yet", "exception"],
        ["empty-history", "SID-055", "ยังไม่มีประวัติการรักษา", "No treatment history", "exception"],
        ["notifications", "SID-056", "การแจ้งเตือน", "Notifications"],
        ["account", "SID-057", "ข้อมูลส่วนตัว", "Personal details"],
        ["settings", "SID-058", "การตั้งค่า", "Settings"],
        ["upload-rx", "SID-060", "อัปโหลดใบสั่งยา", "Upload prescription"],
        ["referral", "SID-061", "แนะนำเพื่อน", "Refer a friend"]
      ],
      variants: [
        { action: "data-refill-open", th: "เติมยาตามแผนการรักษา", en: "Refill treatment" }
      ]
    },
    {
      step: "09", th: "เข้าผ่านพาร์ทเนอร์", en: "Partner entry",
      screens: [
        ["partner-idcard", "SID-070", "ถ่ายบัตรประชาชน", "Capture ID card"],
        ["partner-patient-info", "SID-062", "ยืนยันข้อมูลผู้รับบริการ", "Confirm patient details"],
        ["partner-insurance", "SID-063", "สิทธิ์และการชำระเงิน", "Coverage & payment", "eligibility"],
        ["partner-phr", "SID-068", "บันทึกสุขภาพ (หน้าทางเลือก)", "Health record (alternative)", "alternative"],
      ]
    },
    {
      step: "10", th: "สถานะระบบ", en: "System states",
      screens: [
        ["preloader", "SID-066", "กำลังโหลด", "Loading animation"],
        ["queue-resume", "SID-067", "กลับมาที่คิวที่ค้างอยู่", "Resume a held queue"]
      ]
    }
  ]);

  const canonicalRoutes = Object.freeze({"partner-patient-info": "patient-info", "partner-insurance": "insurance-result", "payment-gw": "consultpay-gw", "payfail": "consultpay-fail"});
  const screenIds = Object.freeze(SCREEN_DIRECTORY.reduce((map, group) => {
    group.screens.forEach(([id, sid]) => { if (!map[id]) map[id] = sid; });
    return map;
  }, {}));
  const canonicalScreenIds = Object.freeze(Object.fromEntries(Object.entries(screenIds).map(([route,sid])=>[route,screenIds[canonicalRoutes[route]] || sid])));

  function isThai() {
    const locale = params.get("lang");
    if (locale === "en" || locale === "th") return locale === "th";
    try { return global.localStorage.getItem("krane_lang") !== "en"; } catch (error) { return true; }
  }

  function renderScreenPicker(rail, screenElements) {
    if (!enabled || !rail) return [];
    const thai = isThai();
    const picker = rail.querySelector('.rail-picker');
    const trigger = picker.querySelector(':scope > summary');
    const search = picker.querySelector('.rail-picker__search');
    const results = picker.querySelector('.rail-picker__results');
    const empty = picker.querySelector('.rail-picker__empty');
    if (!thai) {
      trigger.textContent = 'Choose a screen';
      rail.setAttribute('aria-label', 'Choose a screen');
      search.placeholder = 'Search by name or SID';
      search.setAttribute('aria-label', 'Search screens');
      empty.textContent = 'No matching screens';
    }
    const fragment = global.document.createDocumentFragment();
    const registered = new Set();

    renderPublicGroups(fragment, thai);
    SCREEN_DIRECTORY.forEach((group, groupIndex) => {
      const details = global.document.createElement("details");
      details.className = "rail-group";
      details.dataset.searchText = `${group.th} ${group.en}`;
      /* One journey group open at a time, so a long inventory stays scannable.
         What changed on 5 Oct is inside a group, not this: the error and
         edge-case screens no longer sit behind a second accordion of their
         own — opening a group shows them with its default state. */
      if (groupIndex === 0 && !selectedPublic) details.open = true;
      const summary = global.document.createElement("summary");
      summary.innerHTML = `<span class="rail-step">${group.step}</span><span>${thai ? group.th : group.en}</span>`;
      const body = global.document.createElement("div");
      body.className = "rail-group__body";

      const defaultLinks = [];
      const specialLinks = [];
      if (group.start) {
        const startLink = global.document.createElement("a");
        startLink.href = group.start.href;
        startLink.textContent = thai ? group.start.th : group.start.en;
        startLink.classList.add("is-key-route");
        defaultLinks.push(startLink);
      }
      const makeScreenLink = ([id, sid, th, en, state]) => {
        /* Shared screens can be referenced by more than one clinical entry
           path, but the directory lists their implementation only once. */
        if (registered.has(id)) return null;
        registered.add(id);
        const link = global.document.createElement("a");
        link.href = `#${id}`;
        link.dataset.go = id;
        link.dataset.searchText = `${id} ${sid} ${canonicalScreenIds[id]} ${th} ${en}`;
        if (id === 'preloader') link.dataset.searchText += ' หน้าโหลด spinner carousel pre-loader';
        link.textContent = (thai ? th : en) + (canonicalRoutes[id] ? (thai ? ' · หน้าร่วม' : ' · Shared view') : '');
        link.dataset.canonicalScreen = canonicalRoutes[id] || id;
        if(group.step==='09') link.dataset.entryChannel='partner';
        else if(/^intake[1-5]$/.test(id)){link.dataset.entryChannel='direct';link.dataset.category='hair-skin';}
        if (id === "landing" && !selectedPublic) link.classList.add("current");
        if (state === "featured") link.classList.add("is-key-route");
        if (state === "exception") link.classList.add("is-exception");
        if (state === "eligibility") link.classList.add("is-eligibility");
        if (state === "alternative") link.classList.add("is-alternative");
        return link;
      };

      group.screens.forEach(entry => {
        const link = makeScreenLink(entry);
        if (!link) return;
        const state = entry[4];
        (state === "exception" || state === "eligibility" || state === "alternative" ? specialLinks : defaultLinks).push(link);
      });

      (group.variants || []).forEach(variant => {
        const link = global.document.createElement("a");
        link.href = '#';
        link.textContent = thai ? variant.th : variant.en;
        link.dataset.searchText = `${variant.th} ${variant.en} ${variant.ref || ''}`;
        if (variant.ref) link.dataset.screenRef = variant.ref;
        if (variant.action) link.setAttribute(variant.action, "");
        if (variant.exception) link.classList.add("is-exception");
        else link.classList.add("is-alternative");
        specialLinks.push(link);
      });

      /* The error and edge-case screens used to sit behind a second accordion
         inside each group, which meant half the inventory was one more click
         away. They are in the same list now, after the happy path, and the
         legend's red dot is what tells them apart. */
      [...defaultLinks, ...specialLinks].forEach(link => body.appendChild(link));

      details.append(summary, body);
      fragment.appendChild(details);
    });

    const implemented = new Set(Array.from(screenElements || [], screen => screen.id).filter(Boolean));
    const missing = Array.from(implemented).filter(id => !registered.has(id));
    const stale = Array.from(registered).filter(id => !implemented.has(id));
    {
      const details = global.document.createElement("details");
      details.className = "rail-group";
      details.innerHTML = `<summary><span class="rail-step">!</span><span>${thai ? "Modal และ Bottom sheet" : "Modals and bottom sheets"}</span></summary>`;
      const body = global.document.createElement("div");
      body.className = "rail-group__body";
      missing.forEach(id => {
        const link = global.document.createElement("a");
        link.href = `#${id}`;
        link.dataset.go = id;
        link.className = "is-exception";
        link.textContent = id;
        body.appendChild(link);
      });
      const previews=[...global.document.querySelectorAll('.modal-layer[id], dialog[id]')].map(node=>({id:node.id,node}));
      [{id:'address-delete-confirm',title:'ยืนยันลบที่อยู่',text:'ต้องการลบที่อยู่นี้ใช่ไหม?',actions:['ยกเลิก','ลบที่อยู่']},{id:'red-flag-modal',title:'คำถามคัดกรองความปลอดภัย',text:'ตัวอย่างคำถามคัดกรอง · สูงสุด 3 คำถามต่อขั้นตอน',actions:['ไม่ใช่','ใช่','ถัดไป']}].forEach(item=>{if(!previews.some(p=>p.id===item.id))previews.push(item);});
      previews.unshift(
        {id:'cookie-policy',title:thai?'นโยบายคุกกี้':'Cookie policy',documentPath:'cookies.html'},
        {id:'cookie-notice',title:thai?'ประกาศคุกกี้':'Cookie notice',selector:'[data-cookie-banner]'},
        {id:'cookie-preferences',title:thai?'ตั้งค่าคุกกี้':'Cookie settings',selector:'[data-cookie-preferences]'},
      );
      previews.forEach(item=>{
        const link=global.document.createElement('a');link.href='#';link.dataset.modalPreview=item.id;
        link.textContent=item.title || item.node.querySelector('h1,h2,h3')?.textContent.trim() || item.id;
        link.addEventListener('click',event=>{
          event.preventDefault();event.stopPropagation();
          const source=item.selector ? global.document.querySelector(item.selector) : item.node;
          if(item.selector && !source) return;
          // The rail is a design gallery: replace the previous sample, never stack it.
          global.document.querySelectorAll('.review-modal-veil').forEach(veil=>veil.remove());
          global.document.querySelectorAll('.modal-layer').forEach(layer=>{layer.hidden=true;layer.setAttribute('aria-hidden','true');layer.style.removeProperty('visibility');});
          global.document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
          global.document.body.classList.remove('modal-open');
          const isCookieNotice=item.id==='cookie-notice';
          const preview=global.document.createElement('dialog');preview.className='review-modal-preview';if(item.selector||item.documentPath)preview.classList.add('review-cookie-preview');preview.setAttribute('aria-label',link.textContent);
          if(isCookieNotice){
            preview.addEventListener('keydown',event=>{
              if(event.key==='Escape'){event.preventDefault();preview.close();}
            });
          }else{
            const close=global.document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','ปิดหน้าต่าง');close.className='review-modal-preview__close';close.onclick=()=>preview.close();preview.append(close);
          }
          
          if(source){
            const content=source.querySelector('.modal-dialog') || source;
            const clone=content.cloneNode(true);clone.hidden=false;clone.removeAttribute('open');clone.removeAttribute('id');
            if(item.selector){clone.removeAttribute('aria-labelledby');clone.removeAttribute('aria-describedby');}
            clone.querySelectorAll('.shared-modal-close,.modal-dialog__close,.krane-cookie-close').forEach(el=>el.remove());
            clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
            clone.querySelectorAll('button,input,select,textarea,a').forEach(el=>{el.removeAttribute('href');el.removeAttribute('autofocus');});
            clone.inert=true;
            clone.style.cssText+=';display:block;position:relative;transform:none;max-height:none;width:100%;margin:0;box-shadow:none';
            if(item.selector)clone.style.cssText+=';display:'+ (isCookieNotice ? 'grid' : 'block') +';inset:auto;max-width:none';
            preview.append(clone);
          }else if(item.documentPath){
            const content=global.document.createElement('div');
            content.className='review-cookie-policy__content';
            content.setAttribute('aria-busy','true');
            content.textContent=thai?'กำลังโหลดนโยบายคุกกี้…':'Loading cookie policy…';
            preview.append(content);
            global.fetch(item.documentPath).then(response=>{
              if(!response.ok) throw new Error('Cookie policy request failed');
              return response.text();
            }).then(markup=>{
              const policy=new global.DOMParser().parseFromString(markup,'text/html');
              const heading=policy.querySelector('main h1');
              const reading=policy.querySelector('main .info-reading');
              if(!heading || !reading) throw new Error('Cookie policy content missing');
              const title=global.document.createElement('h2');
              title.textContent=heading.textContent;
              reading.querySelector('[data-cookie-settings]')?.remove();
              content.lang=heading.closest('[lang]')?.lang || policy.documentElement.lang;
              content.replaceChildren(title,reading);
            }).catch(()=>{
              content.textContent=thai?'โหลดนโยบายคุกกี้ไม่สำเร็จ กรุณาปิดแล้วเปิดอีกครั้ง':'Could not load the cookie policy. Close and reopen it to retry.';
            }).finally(()=>content.removeAttribute('aria-busy'));
          }else{
            const title=global.document.createElement('h2');title.textContent=item.title;preview.append(title);
            const text=global.document.createElement('p');text.textContent=item.text;preview.append(text);
            item.actions.forEach(label=>{const button=global.document.createElement('button');button.className='btn';button.textContent=label;button.disabled=true;preview.append(button);});
          }
          if(item.documentPath){
            preview.classList.add('review-cookie-policy');
            preview.addEventListener('close',()=>{preview.remove();trigger.focus();},{once:true});
            global.document.body.append(preview);
            preview.showModal();
            return;
          }
          preview.addEventListener('close',()=>{preview.remove();trigger.focus();},{once:true});const veil=global.document.createElement('div');veil.className='review-modal-veil';if(isCookieNotice)veil.classList.add('review-modal-veil--cookie-notice');const main=global.document.querySelector('main');const bounds=main?.getBoundingClientRect();veil.style.left=Math.max(0,bounds?.left||0)+'px';veil.append(preview);global.document.body.append(veil);preview.show();veil.addEventListener('click',e=>{if(e.target===veil)preview.close();});preview.addEventListener('close',()=>veil.remove(),{once:true});
        });body.append(link);
      });
      details.appendChild(body);
      fragment.appendChild(details);
      if (missing.length || stale.length) console.warn("[Krane screen picker] registry mismatch", { missing, stale });
    }

    // Design-only toast catalogue, using the same component classes as the app.
    const toastGroup=global.document.createElement('details');
    toastGroup.className='rail-group';
    toastGroup.innerHTML='<summary><span class="rail-step">!</span><span>Toast</span></summary>';
    const toastBody=global.document.createElement('div');toastBody.className='rail-group__body';
    const toastSamples=[
      {tone:'success',icon:'circle-check',title:thai?'สำเร็จ':'Success',message:thai?'บันทึกบัตรประชาชนแล้ว':'ID card saved'},
      {tone:'info',icon:'info',title:thai?'ข้อมูล':'Information',message:thai?'กลับมาที่เคส #KR-10293 แล้ว':'Returned to case #KR-10293'},
      {tone:'warning',icon:'triangle-alert',title:thai?'แจ้งเตือน':'Warning',message:thai?'เลือกเวลาที่สะดวกก่อน':'Choose an appointment time first'},
      {tone:'warning',icon:'triangle-alert',title:thai?'ข้อผิดพลาด':'Error',message:thai?'รูปใหญ่เกิน 10 MB':'Image exceeds 10 MB'},
      {tone:'warning',icon:'triangle-alert',title:thai?'ข้อความยาว':'Long message',message:thai?'ยังค้นหาตำแหน่งบนแผนที่ไม่ได้ กรุณาลองอีกครั้งหรือเลือกจุดบนแผนที่':'Could not find the location. Try again or choose a point on the map.'}
    ];
    const toastLink=global.document.createElement('a');toastLink.href='#';toastLink.dataset.toastGallery='';toastLink.textContent=thai?'รวมรูปแบบ Toast':'Toast gallery';
    toastLink.addEventListener('click',event=>{
      event.preventDefault();
      global.document.querySelectorAll('.review-modal-veil').forEach(el=>el.remove());
      global.document.querySelectorAll('.modal-layer').forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true');});
      global.document.querySelectorAll('dialog[open]').forEach(el=>el.close());
      global.document.body.classList.remove('modal-open');
      const veil=global.document.createElement('div');veil.className='review-modal-veil';
      veil.style.left=Math.max(0,global.document.querySelector('main')?.getBoundingClientRect().left||0)+'px';
      const panel=global.document.createElement('dialog');panel.className='review-modal-preview review-toast-gallery';panel.setAttribute('aria-label','Toast');
      const close=global.document.createElement('button');close.type='button';close.className='review-modal-preview__close';close.textContent='×';close.setAttribute('aria-label',thai?'ปิดหน้าต่าง':'Close');close.onclick=()=>panel.close();panel.append(close);
      const heading=global.document.createElement('h2');heading.textContent=thai?'รวมรูปแบบ Toast':'Toast gallery';panel.append(heading);
      toastSamples.forEach(sample=>{
        const section=global.document.createElement('section');
        const label=global.document.createElement('h3');label.textContent=sample.title;section.append(label);
        const toast=global.document.createElement('div');toast.className='action-toast is-visible is-wrapping action-toast--'+sample.tone;
        const icon=global.document.createElement('span');icon.className='action-toast__icon';icon.innerHTML=global.kraneIcon?.(sample.icon,'ui-icon--sm')||'';
        const text=global.document.createElement('span');text.textContent=sample.message;toast.append(icon,text);section.append(toast);panel.append(section);
      });
      veil.append(panel);global.document.body.append(veil);panel.show();
      panel.addEventListener('close',()=>{veil.remove();trigger.focus();},{once:true});
      veil.addEventListener('click',e=>{if(e.target===veil)panel.close();});
      panel.addEventListener('keydown',e=>{if(e.key==='Escape')panel.close();});
    });
    toastBody.append(toastLink);toastGroup.append(toastBody);fragment.append(toastGroup);

    results.replaceChildren(fragment);
    const groups = Array.from(results.children);
    groups.forEach(details => {
      details.addEventListener("toggle", () => {
        if (!details.open || search.value.trim()) return;
        groups.forEach(other => {
          if (other !== details) other.open = false;
        });
      });
    });

    const normalize = text => text.normalize('NFKC').toLowerCase();
    const indexedGroups = groups.map(group => {
      const name = group.dataset.searchText || group.querySelector('summary').textContent;
      const entries = Array.from(group.querySelectorAll('a'), link => ({
        link, keywords: normalize(`${name} ${link.textContent} ${link.dataset.searchText || ''} ${link.dataset.modalPreview || ''}`)
      }));
      return { group, entries };
    });
    function filter() {
      const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
      const currentGroup = results.querySelector('a.current')?.closest('.rail-group') || groups[0];
      let anyMatches = false;
      indexedGroups.forEach(({group, entries}) => {
        let hasMatch = false;
        entries.forEach(({link, keywords}) => {
          const matches = terms.every(term => keywords.includes(term));
          link.hidden = !matches;
          hasMatch ||= matches;
        });
        group.hidden = !hasMatch;
        group.open = terms.length ? hasMatch : group === currentGroup;
        anyMatches ||= hasMatch;
      });
      empty.hidden = anyMatches;
    }
    search.addEventListener('input', filter);
    search.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown' && event.key !== 'Enter') return;
      if (event.isComposing) return;
      const first = results.querySelector('.rail-group[open]:not([hidden]) a:not([hidden])');
      if (!first) return;
      event.preventDefault();
      if (event.key === 'Enter' && search.value.trim()) first.click();
      else first.focus();
    });
    picker.addEventListener('toggle', () => {
      if (picker.open) {
        search.focus();
      } else if (search.value) {
        search.value = '';
        filter();
      }
    });
    picker.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !picker.open) return;
      event.preventDefault();
      picker.open = false;
      trigger.focus();
    });
    global.document.addEventListener('pointerdown', event => {
      if (picker.open && !picker.contains(event.target)) picker.open = false;
    });
    results.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link) return;
      if (link.getAttribute('href')?.startsWith('#')) event.preventDefault();
      picker.open = false;
      if (!link.dataset.modalPreview && !link.hasAttribute('data-toast-gallery')) trigger.focus();
    }, true);
    rail.dataset.screenCount = String(implemented.size);
    return missing;
  }

  global.document.documentElement.classList.toggle("review-tools-enabled", enabled);
  global.KraneReviewTools = Object.freeze({
    enabled, directory: SCREEN_DIRECTORY, screenIds: canonicalScreenIds, canonicalRoutes,
    renderScreenPicker, resetPublicPreview, syncPublicSelection
  });
})(window);

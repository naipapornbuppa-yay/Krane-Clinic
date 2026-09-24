(function configureKraneReviewTools(global) {
  "use strict";

  const params = new URLSearchParams(global.location.search);
  const enabled = params.get("with_screen_tab") === "1";

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
        ["onboard1", "SID-002", "แนะนำบริการ · ความเป็นส่วนตัว", "Onboarding · Private care"],
        ["onboard2", "SID-003", "แนะนำบริการ · การดูแลเฉพาะบุคคล", "Onboarding · Personal care"],
        ["onboard3", "SID-004", "แนะนำบริการ · การจัดส่ง", "Onboarding · Delivery"],
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
        ["intake-general", "SID-021", "ข้อมูลสุขภาพทั่วไป", "General health"],
        ["intake-edu", "SID-022", "ความรู้ก่อนพบแพทย์", "Education interstitial"]
      ]
    },
    {
      step: "04", th: "จับคู่แพทย์และนัดหมาย", en: "Match & book",
      screens: [
        ["nurse", "SID-023", "พยาบาลคัดกรอง", "Nurse pre-screen"],
        ["matching", "SID-024", "กำลังจับคู่แพทย์", "Doctor matching"],
        ["choosedoc", "SID-025", "เลือกแพทย์", "Choose doctor"],
        ["appointment", "SID-026", "เลือกเวลานัดหมาย", "Choose appointment time"],
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
        ["rx-plan", "SID-034", "แผนการรักษา", "Treatment plan"],
        ["prescription", "SID-035", "เอกสารใบสั่งยา", "Prescription document"]
      ]
    },
    {
      step: "06", th: "ยา การจัดส่ง และชำระเงิน", en: "Medicine, delivery & payment",
      screens: [
        ["address", "SID-036", "รายละเอียดที่อยู่", "Delivery address"],
        ["address-map", "SID-036A", "เลือกที่อยู่จากแผนที่", "Choose address on map"],
        ["delivery-quote", "SID-037", "คำนวณค่าจัดส่ง", "Delivery quote"],
        ["pharmacy-search", "SID-038", "ตรวจสอบสต็อกและราคา", "Pharmacy stock & price"],
        ["insurance", "SID-039", "ตรวจสอบสิทธิ์ประกัน", "Insurance eligibility"],
        ["insurance-result", "SID-039A", "ผลการตรวจสอบสิทธิ์", "Insurance result"],
        ["payment-items", "SID-040A", "แก้ไขรายการยา", "Edit medication items"],
        ["payment", "SID-040", "สรุปรายการและชำระเงิน", "Medication checkout"],
        ["payment-gw", "SID-041", "ช่องทางชำระเงิน", "Payment gateway"],
        ["payment-processing", "SID-041A", "กำลังตรวจสอบการชำระเงิน", "Payment processing"],
        ["payment-success", "SID-042", "ชำระเงินสำเร็จ", "Payment confirmed"],
        ["payfail", "SID-043", "ชำระเงินไม่สำเร็จ", "Medication payment failed", "exception"],
        ["pharmacypending", "SID-045", "ร้านยายืนยันรายการ", "Pharmacy confirmed"],
        ["pharmacyissue", "SID-046", "เปลี่ยนวิธีจัดส่ง", "Delivery fallback", "exception"]
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
        ["followups", "SID-051F", "การติดตามผล", "Follow-up cases"],
        ["treatment-detail", "SID-051A", "รายละเอียดการรักษา", "Treatment detail"],
        ["my-documents", "SID-051B", "เอกสารของฉัน", "My documents"],
        ["activity", "SID-052", "กิจกรรม", "Activity"],
        ["empty-activities", "SID-053", "ยังไม่มีกิจกรรม", "No activity yet", "exception"],
        ["history", "SID-054", "ประวัติการรักษา", "Treatment history"],
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
      step: "09", th: "เข้าผ่านสิทธิ์ประกัน", en: "Insurance partner entry",
      screens: [
        ["partner-idcard", "SID-070", "ถ่ายบัตรประชาชน", "Capture ID card"],
        ["partner-patient-info", "SID-062", "ยืนยันข้อมูลผู้รับบริการ", "Confirm patient details"],
        ["partner-insurance", "SID-063", "สิทธิ์และการชำระเงิน", "Coverage & payment"],
        ["partner-nurse", "SID-064", "พยาบาลคัดกรอง", "Nurse screening", "exception"],
        ["partner-nurse-session", "SID-065", "วิดีโอคัดกรองโดยพยาบาล", "Nurse video screening", "exception"],
        ["partner-phr", "SID-068", "ข้อมูลสุขภาพจากพาร์ตเนอร์", "Partner health record"],
        ["intake-concern", "SID-069", "เลือกอาการเพื่อเข้ารับบริการ", "Choose consultation concern"]
      ]
    },
    {
      step: "10", th: "สถานะระบบ", en: "System states",
      screens: [["preloader", "SID-066", "กำลังเตรียมข้อมูล", "Pre-loader overlay"]]
    }
  ]);

  const screenIds = Object.freeze(SCREEN_DIRECTORY.reduce((map, group) => {
    group.screens.forEach(([id, sid]) => { if (!map[id]) map[id] = sid; });
    return map;
  }, {}));

  function isThai() {
    if (params.get("lang") === "en") return false;
    try { return global.localStorage.getItem("krane_lang") !== "en"; } catch (error) { return true; }
  }

  function renderRail(rail, screenElements) {
    if (!rail) return [];
    rail.querySelectorAll(":scope > .rail-group").forEach(node => node.remove());
    const thai = isThai();
    const fragment = global.document.createDocumentFragment();
    const registered = new Set();

    SCREEN_DIRECTORY.forEach((group, groupIndex) => {
      const details = global.document.createElement("details");
      details.className = "rail-group";
      if (groupIndex === 0) details.open = true;
      const summary = global.document.createElement("summary");
      summary.innerHTML = `<span class="rail-step">${group.step}</span><span>${thai ? group.th : group.en}</span>`;
      const body = global.document.createElement("div");
      body.className = "rail-group__body";

      group.screens.forEach(([id, sid, th, en, state]) => {
        /* Shared screens can be referenced by more than one clinical entry
           path, but the directory lists their implementation only once. */
        if (registered.has(id)) return;
        registered.add(id);
        const link = global.document.createElement("a");
        link.dataset.go = id;
        link.textContent = thai ? th : en;
        if (id === "landing") link.classList.add("current");
        if (state === "exception") link.classList.add("is-exception");
        body.appendChild(link);
      });

      (group.variants || []).forEach(variant => {
        const link = global.document.createElement("a");
        link.textContent = thai ? variant.th : variant.en;
        if (variant.ref) link.dataset.screenRef = variant.ref;
        if (variant.action) link.setAttribute(variant.action, "");
        if (variant.exception) link.classList.add("is-exception");
        body.appendChild(link);
      });

      details.append(summary, body);
      fragment.appendChild(details);
    });

    const implemented = new Set(Array.from(screenElements || [], screen => screen.id).filter(Boolean));
    const missing = Array.from(implemented).filter(id => !registered.has(id));
    const stale = Array.from(registered).filter(id => !implemented.has(id));
    if (missing.length || stale.length) {
      const details = global.document.createElement("details");
      details.className = "rail-group";
      details.open = true;
      details.innerHTML = `<summary><span class="rail-step">!</span><span>${thai ? "ต้องจัดหมวดหมู่" : "Needs classification"}</span></summary>`;
      const body = global.document.createElement("div");
      body.className = "rail-group__body";
      missing.forEach(id => {
        const link = global.document.createElement("a");
        link.dataset.go = id;
        link.className = "is-exception";
        link.textContent = id;
        body.appendChild(link);
      });
      details.appendChild(body);
      fragment.appendChild(details);
      console.warn("[Krane Screen Tab] registry mismatch", { missing, stale });
    }

    rail.appendChild(fragment);
    rail.dataset.screenCount = String(implemented.size);
    return missing;
  }

  global.document.documentElement.classList.toggle("review-tools-enabled", enabled);
  global.KraneReviewTools = Object.freeze({ enabled, directory: SCREEN_DIRECTORY, screenIds, renderRail });
})(window);

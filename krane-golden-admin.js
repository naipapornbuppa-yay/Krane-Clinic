/* Admin CMS overlay for the client demo.
   Marks the golden order, puts every other order out of scope, and turns the manual
   status override into the one control that drives checkpoint 5.

   Language is left to i18n.js; Thai stays the default. */
(function () {
  const demo = window.KraneGoldenDemo;
  if (!demo) return;
  const f = demo.fixture;

  /* Each pattern also matches the value it produces, so repeat passes are a no-op. */
  const pairs = [
    [/Mali B\.(?:\s*\(Demo\))?/g, f.patient.name],
    [/Dr\. Narin(?:\s+Tanaka|\s+T\.)?/g, f.doctor.name]
  ];

  /* Same wording as the patient tracking badge and the admin status control, so the two
     checkpoints never describe the same stage with different Thai words. */
  const statusTH = {
    "Order received": "ชำระแล้ว",
    "Pharmacy accepted": "ร้านยารับออเดอร์",
    "Preparing": "กำลังเตรียม",
    "Dispatched": "กำลังจัดส่ง",
    "Delivered": "จัดส่งสำเร็จ"
  };
  const statusCopyTH = {
    "Order received": "ได้รับคำสั่งซื้อแล้ว รอร้านยารับออเดอร์",
    "Pharmacy accepted": "ร้านยารับออเดอร์แล้ว กำลังเตรียมยา",
    "Preparing": "ไม่มีปัญหาค้างอยู่ กำลังจัดยาตามกรอบเวลาให้บริการปกติ",
    "Dispatched": "ไรเดอร์รับสินค้าแล้ว กำลังจัดส่งให้ผู้ป่วย",
    "Delivered": "จัดส่งสำเร็จแล้ว ไม่ต้องดำเนินการเพิ่มเติม"
  };

  const goldenRow = document.querySelector('[data-order-id="' + f.order.id + '"]');
  if (goldenRow) {
    /* Scope is shown by a badge in the row, never by a coloured edge stripe:
       WORKING-RULES rule 1 and DESIGN.md 7c. */
    const orderCell = goldenRow.children[0];
    if (orderCell && !orderCell.querySelector(".golden-demo-tag")) {
      const tag = document.createElement("span");
      tag.className = "badge badge--ok golden-demo-tag";
      tag.textContent = "Golden demo";
      orderCell.appendChild(tag);
    }
  }

  document.querySelectorAll("#cases tbody tr[data-order-id]").forEach(function (row) {
    if (row !== goldenRow) {
      row.classList.add("demo-out-of-scope");
      row.setAttribute("aria-disabled", "true");
      row.title = "Not included in this prototype";
      row.querySelectorAll("button").forEach(function (button) {
        button.disabled = true;
        button.title = "Not included in this prototype";
      });
    }
  });

  const fulfilment = document.getElementById("fulfilment");
  if (fulfilment && !fulfilment.querySelector("[data-golden-order-summary]")) {
    const summary = document.createElement("div");
    summary.className = "panel stack golden-order-summary";
    summary.dataset.goldenOrderSummary = "";
    summary.innerHTML =
      /* Labels are written in Thai directly. This panel is demo-only chrome and is not in
         the i18n dictionary, so Thai literals keep it consistent with the rest of the
         Thai UI without adding keys to the shared i18n.js. */
      '<div class="between"><div><div class="panel__title">ออเดอร์สำหรับสาธิต</div><div class="hint">ข้อมูลสมมติสำหรับการนำเสนอลูกค้า</div></div><span class="badge badge--ok" data-golden-payment>' + f.order.paymentStatus + '</span></div>' +
      '<div class="grid-3">' +
      '<div class="kv"><span class="k">ผู้ป่วย</span><span class="strong">' + f.patient.name + '</span></div>' +
      '<div class="kv"><span class="k">ออเดอร์</span><span class="strong">#' + f.order.id + '</span></div>' +
      '<div class="kv"><span class="k">ยอดรวม</span><span class="strong">฿' + f.order.total.toLocaleString() + '</span></div>' +
      '</div><div class="grid-3">' +
      '<div class="kv"><span class="k">แพทย์</span><span class="strong">' + f.doctor.name + '</span></div>' +
      '<div class="kv"><span class="k">อาการ</span><span class="strong">ผมร่วง</span></div>' +
      '<div class="kv"><span class="k">สถานะการจัดส่ง</span><span class="strong" data-golden-delivery></span></div>' +
      '</div><div class="grid-3">' +
      '<div class="kv"><span class="k">ค่าปรึกษา</span><span class="strong">฿' + f.consultation.fee.toLocaleString() + '</span></div>' +
      '<div class="kv"><span class="k">ค่ายา</span><span class="strong">฿' + f.treatment.medicineFee.toLocaleString() + '</span></div>' +
      '<div class="kv"><span class="k">รายการยา</span><span class="strong">' + f.treatment.medicines.map(function (item) { return item.name; }).join(" + ") + '</span></div>' +
      '</div>' +
      '<div class="kv"><span class="k">ที่อยู่จัดส่ง</span><span class="strong">' + f.order.address + '</span></div>' +
      '<div class="page-actions"><a class="btn btn--primary btn--sm" data-golden-open-tracking target="_blank" rel="noopener">เปิดหน้าติดตามพัสดุของผู้ป่วย</a></div>';
    const firstPanel = fulfilment.querySelector(".panel");
    if (firstPanel) fulfilment.insertBefore(summary, firstPanel);
  }

  function applyState() {
    const state = demo.readState();
    const adminValue = state.fulfilmentStatus === "Order received" ? "Paid" :
      state.fulfilmentStatus === "Dispatched" ? "Out for delivery" : state.fulfilmentStatus;
    const select = document.querySelector("[data-status-select]");
    if (select && Array.from(select.options).some(function (option) { return option.value === adminValue; })) select.value = adminValue;
    if (goldenRow) {
      goldenRow.dataset.stage = adminValue;
      goldenRow.dataset.issue = statusCopyTH[state.fulfilmentStatus] || goldenRow.dataset.issue;
      const badge = goldenRow.children[3] && goldenRow.children[3].querySelector(".badge");
      if (badge) {
        badge.textContent = adminValue;
        badge.className = state.fulfilmentStatus === "Delivered" ? "badge badge--done" : "badge badge--ok";
      }
    }
    const delivery = document.querySelector("[data-golden-delivery]");
    if (delivery) delivery.textContent = statusTH[state.fulfilmentStatus] || state.fulfilmentStatus;
    const trackingLink = document.querySelector("[data-golden-open-tracking]");
    if (trackingLink) trackingLink.href = "/Krane-Clinic/b2c/krane-b2c.html?demoStatus=" + encodeURIComponent(state.fulfilmentStatus) + "#tracking";
    const steps = Array.from(document.querySelectorAll("[data-status-step]"));
    const activeIndex = steps.findIndex(function (step) { return step.dataset.statusStep === adminValue; });
    steps.forEach(function (step, index) {
      step.classList.toggle("done", activeIndex >= 0 && index < activeIndex);
      step.classList.toggle("active", index === activeIndex);
    });

    /* The golden order has no outstanding issue. Copy and colour both follow the current
       lifecycle stage so a dispatched order never still says it is being prepared. */
    const alertLine = document.querySelector("[data-fulfilment-issue]");
    if (alertLine) {
      const issueCopy = statusCopyTH[state.fulfilmentStatus];
      const positive = Boolean(issueCopy);
      alertLine.classList.toggle("alertline--ok", positive);
      alertLine.classList.toggle("alertline--warn", !positive);
      /* The copy has to move with the colour. On first paint the panel still held the
         static overdue sentence, so the golden order showed a green box saying the
         branch had not replied. */
      const copy = alertLine.querySelector("[data-fulfilment-issue-copy]");
      if (copy && issueCopy) copy.textContent = issueCopy;
      const path = alertLine.querySelector("svg path");
      if (path) {
        path.setAttribute("d", positive
          ? "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3"
          : "M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z");
      }
    }
    demo.replaceText(document.body, pairs);
  }

  /* Checkpoint 4's primary action: changes visible local state and is what checkpoint 5 reads. */
  const update = document.querySelector("[data-update-status]");
  if (update) update.addEventListener("click", function () {
    const select = document.querySelector("[data-status-select]");
    if (!select) return;
    const sharedStatus = select.value === "Paid" ? "Order received" :
      select.value === "Out for delivery" || select.value === "Rider pickup" ? "Dispatched" : select.value;
    demo.writeState({ fulfilmentStatus: sharedStatus });
  });

  function openHash() {
    const id = location.hash.slice(1);
    if (id === "fulfilment") {
      if (goldenRow) {
        const button = goldenRow.querySelector("button");
        if (button) button.click();
      }
    } else if (id) {
      const target = document.querySelector('[data-page="' + CSS.escape(id) + '"]');
      if (target) target.click();
    }
    setTimeout(applyState, 0);
  }

  window.addEventListener("hashchange", openHash);
  window.addEventListener("storage", applyState);
  window.addEventListener("krane-demo-state", applyState);
  applyState();
  window.addEventListener("load", function () { setTimeout(openHash, 60); }, { once: true });
  setTimeout(openHash, 0);
}());

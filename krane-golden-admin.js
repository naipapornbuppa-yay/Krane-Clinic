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

  /* The golden order's delivery status reads exactly what the patient's tracking
     badge reads at the same stage, so checkpoints 4 and 5 never describe one stage
     two ways. Until 14 Sep this table claimed to match the patient badge while
     saying "กำลังเตรียม" against the patient's "กำลังจัดยา". The step names in
     the status control stay operational and are not translated here. */
  const statusTH = {
    "Order received": "กำลังจัดยา",
    "Pharmacy accepted": "กำลังจัดยา",
    "Preparing": "กำลังจัดยา",
    "Rider pickup": "ไรเดอร์กำลังเข้าไปรับของ",
    "Dispatched": "กำลังจัดส่ง",
    "Delivered": "จัดส่งสำเร็จ"
  };
  const statusEN = {
    "Order received": "Preparing medicine",
    "Pharmacy accepted": "Preparing medicine",
    "Preparing": "Preparing medicine",
    "Rider pickup": "Rider on the way to collect",
    "Dispatched": "Out for delivery",
    "Delivered": "Delivered"
  };
  const statusCopyEN = {
    "Order received": "Order received. Waiting for the pharmacy to accept it.",
    "Pharmacy accepted": "The pharmacy accepted the order and is preparing the medicine.",
    "Preparing": "Nothing outstanding. The medicine is being prepared within the normal service window.",
    "Rider pickup": "The pharmacy has finished. A rider is on the way to collect.",
    "Dispatched": "The rider has collected the order and is delivering it to the patient.",
    "Delivered": "Delivered. Nothing more to do."
  };
  /* Thai is the default; English only when the viewer picked EN. */
  function thai() { return !!document.querySelector('.lang__opt[data-lng="th"].is-active'); }
  const statusCopyTH = {
    "Order received": "ได้รับคำสั่งซื้อแล้ว รอร้านยารับออเดอร์",
    "Pharmacy accepted": "ร้านยารับออเดอร์แล้ว กำลังเตรียมยา",
    "Preparing": "ไม่มีปัญหาค้างอยู่ กำลังจัดยาตามกรอบเวลาให้บริการปกติ",
    "Rider pickup": "ร้านยาจัดยาเสร็จแล้ว ไรเดอร์กำลังเข้าไปรับของ",
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
      /* Written in English and translated by i18n.js like every other label, so the
         panel follows the TH/EN switch. */
'<div class="between"><div><div class="panel__title">Demo order</div><div class="hint">Fictional data for the client presentation</div></div><span class="badge badge--ok" data-golden-payment>' + f.order.paymentStatus + '</span></div>' +
      '<div class="grid-3">' +
      '<div class="kv"><span class="k">Patient</span><span class="strong">' + f.patient.name + '</span></div>' +
      '<div class="kv"><span class="k">Order</span><span class="strong">#' + f.order.id + '</span></div>' +
      '<div class="kv"><span class="k">Order total</span><span class="strong">฿' + f.order.total.toLocaleString() + '</span></div>' +
      '</div><div class="grid-3">' +
      '<div class="kv"><span class="k">Doctor</span><span class="strong">' + f.doctor.name + '</span></div>' +
      '<div class="kv"><span class="k">Condition</span><span class="strong">Hair loss</span></div>' +
      '<div class="kv"><span class="k">Delivery status</span><span class="strong" data-golden-delivery></span></div>' +
      '</div><div class="grid-3">' +
      '<div class="kv"><span class="k">Consultation fee</span><span class="strong">฿' + f.consultation.fee.toLocaleString() + '</span></div>' +
      '<div class="kv"><span class="k">Medicine fee</span><span class="strong">฿' + f.treatment.medicineFee.toLocaleString() + '</span></div>' +
      '<div class="kv"><span class="k">Medicines</span><span class="strong">' + f.treatment.medicines.map(function (item) { return item.name; }).join(" + ") + '</span></div>' +
      '</div>' +
      '<div class="kv"><span class="k">Delivery address</span><span class="strong">The Base Park West, Room 22/418, Soi Sukhumvit 77, Phra Khanong Nuea, Watthana, Bangkok 10110</span></div>' +
      '<div class="page-actions"><a class="btn btn--primary btn--sm" data-golden-open-tracking target="_blank" rel="noopener">Open the patient\'s tracking page</a></div>';
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
      goldenRow.dataset.issue = (thai() ? statusCopyTH : statusCopyEN)[state.fulfilmentStatus] || goldenRow.dataset.issue;
      const badge = goldenRow.children[3] && goldenRow.children[3].querySelector(".badge");
      if (badge) {
        badge.textContent = adminValue;
        badge.className = state.fulfilmentStatus === "Delivered" ? "badge badge--done" : "badge badge--ok";
      }
    }
    const delivery = document.querySelector("[data-golden-delivery]");
    if (delivery) delivery.textContent = (thai() ? statusTH : statusEN)[state.fulfilmentStatus] || state.fulfilmentStatus;
    const trackingLink = document.querySelector("[data-golden-open-tracking]");
    if (trackingLink) trackingLink.href = "/b2c/krane-b2c?demoStatus=" + encodeURIComponent(state.fulfilmentStatus) + "#tracking";
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
      const issueCopy = (thai() ? statusCopyTH : statusCopyEN)[state.fulfilmentStatus];
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
    /* Rider pickup is its own shared stage now; only the admin's "Paid" and "Out
       for delivery" are spelled differently from the shared status names. */
    const sharedStatus = select.value === "Paid" ? "Order received" :
      select.value === "Out for delivery" ? "Dispatched" : select.value;
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
  document.addEventListener("click", function (event) { if (event.target.closest(".lang__opt")) setTimeout(applyState, 0); });
  applyState();
  window.addEventListener("load", function () { setTimeout(openHash, 60); }, { once: true });
  setTimeout(openHash, 0);
}());

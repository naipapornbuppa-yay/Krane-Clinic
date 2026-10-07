/* Doctor CMS overlay for the client demo.
   Marks the golden case, puts every other case out of scope, and lets "Send plan to
   patient" change shared state so the patient and admin checkpoints agree.

   Language is left to i18n.js; Thai stays the default. */
(function () {
  const demo = window.KraneGoldenDemo;
  if (!demo) return;
  const f = demo.fixture;

  /* Each pattern also matches the value it produces, so repeat passes are a no-op. */
  const pairs = [
    [/Mali B\.(?:\s*\(Demo\))?/g, f.patient.name],
    [/Dr\. Narin(?:\s+Tanaka|\s+T\.)?/g, f.doctor.name],
    [/12 Sep 2026/g, f.treatment.followUp],
    [/12 ก\.ย\. 2026/g, f.treatment.followUpTH]
  ];

  function applyFixture() {
    demo.replaceText(document.body, pairs);
    const followUp = document.querySelector("[data-golden-follow-up]");
    const thai = document.querySelector('.lang__opt[data-lng="th"].is-active');
    if (followUp) followUp.value = thai ? f.treatment.followUpTH : f.treatment.followUp;
  }

  document.querySelectorAll("[data-patient]").forEach(function (row) {
    const isGolden = row.dataset.patient === "Mali S." || row.dataset.patient === f.patient.name;
    if (isGolden) {
      row.dataset.patient = f.patient.name;
      /* Status and scope are shown by a badge only. No coloured edge stripe or left rail:
         see WORKING-RULES rule 1 and DESIGN.md 7c. */
      const label = row.querySelector(".doctor-case-row__patient b, .cell-user .strong");
      if (label && !label.querySelector(".golden-demo-tag")) {
        const tag = document.createElement("span");
        tag.className = "badge badge--ok golden-demo-tag";
        tag.textContent = "Golden demo";
        label.appendChild(tag);
      }
    } else {
      row.classList.add("demo-out-of-scope");
      row.setAttribute("aria-disabled", "true");
      row.title = "Not included in this prototype";
      row.querySelectorAll("button").forEach(function (button) {
        button.disabled = true;
        button.title = "Not included in this prototype";
      });
    }
  });

  /* Creating the order is the moment the plan reaches the patient. It must never
     create or rewind a pharmacy order on its own: fulfilment advances only after the
     patient accepts and pays. */
  document.addEventListener("krane-doctor-order-created", function () {
    demo.writeState({ consultationStatus: "Plan sent" });
    applyFixture();
    syncOrderStatus();
  });

  /* The doctor's wrap-up card stamped "Waiting for the patient to pay" when the
     order was created and then never moved, so the clinic side still said the
     patient had not paid while the admin had the same order out for delivery and
     the patient was watching the rider. The two other apps already follow the
     shared state; this one only wrote to it. Wording is taken from the admin's
     own status table so one stage never reads two ways across the demo. */
  const statusEN = {
    "Order received": "Paid · waiting for the pharmacy to accept",
    "Pharmacy accepted": "Paid · pharmacy preparing the medicine",
    "Preparing": "Paid · pharmacy preparing the medicine",
    "Rider pickup": "Paid · rider on the way to collect",
    "Dispatched": "Paid · out for delivery",
    "Delivered": "Delivered to the patient"
  };
  const statusTH = {
    "Order received": "ชำระแล้ว · รอร้านยารับออเดอร์",
    "Pharmacy accepted": "ชำระแล้ว · ร้านยากำลังจัดยา",
    "Preparing": "ชำระแล้ว · ร้านยากำลังจัดยา",
    "Rider pickup": "ชำระแล้ว · ไรเดอร์กำลังเข้าไปรับของ",
    "Dispatched": "ชำระแล้ว · กำลังจัดส่ง",
    "Delivered": "จัดส่งถึงผู้ป่วยแล้ว"
  };
  const rowBadgeEN = { "Delivered": "Delivered" };
  function isThai() {
    return !!document.querySelector('.lang__opt[data-lng="th"].is-active');
  }

  function syncOrderStatus() {
    const state = demo.readState();
    /* updatedAt is null until something actually writes the shared state. The
       fixture's own default is "Dispatched" so the tracking demo can open
       mid-flight, and reading that before anyone has paid would have the doctor
       announcing a delivery for an order the patient has not bought yet. */
    if (!state.updatedAt) return;
    const field = document.querySelector("[data-done-order-status]");
    if (field && field.textContent.trim() && field.textContent.trim() !== "No order"
        && field.textContent.trim() !== "Referral guidance sent") {
      const copy = (isThai() ? statusTH : statusEN)[state.fulfilmentStatus];
      if (copy) field.textContent = copy;
    }
    /* The same order in the case list carries "Awaiting payment" until it is paid. */
    const cell = document.querySelector('[data-consult-rows] tr[data-code="CONS-2041"]');
    const badge = cell && cell.children[6] && cell.children[6].querySelector(".badge");
    if (badge && badge.classList.contains("badge--warn")) {
      badge.className = state.fulfilmentStatus === "Delivered" ? "badge badge--done" : "badge badge--ok";
      badge.textContent = isThai()
        ? (state.fulfilmentStatus === "Delivered" ? "จัดส่งแล้ว" : "ชำระแล้ว")
        : (rowBadgeEN[state.fulfilmentStatus] || "Paid");
    }
  }

  window.addEventListener("storage", syncOrderStatus);
  window.addEventListener("krane-demo-state", syncOrderStatus);

  function openHash() {
    const id = location.hash.slice(1);
    if (!id) return;
    const golden = document.querySelector('[data-patient="' + CSS.escape(f.patient.name) + '"]');
    if (golden) golden.click();
    if (typeof window.go === "function") window.go(id, true);
    else {
      const target = document.querySelector('[data-page="' + CSS.escape(id) + '"]:not([data-patient])');
      if (target) target.click();
    }
    setTimeout(applyFixture, 0);
  }

  window.addEventListener("hashchange", openHash);
  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-lng]")) setTimeout(function () { applyFixture(); syncOrderStatus(); }, 0);
  });
  applyFixture();
  syncOrderStatus();
  window.addEventListener("load", function () {
    setTimeout(function () { openHash(); applyFixture(); syncOrderStatus(); }, 80);
  }, { once: true });
}());

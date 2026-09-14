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

  /* Sending a clinical plan must never create or rewind a pharmacy order. Operational
     fulfilment advances only after the patient accepts and pays. */
  const sendPlan = document.querySelector("#prescribe .btn--primary.btn--block");
  if (sendPlan) {
    sendPlan.addEventListener("click", function () {
      demo.writeState({ consultationStatus: "Plan sent" });
      sendPlan.textContent = "Plan sent to " + f.patient.name;
      sendPlan.disabled = true;
      const subtitle = document.querySelector("#prescribe .page-head__s");
      if (subtitle) subtitle.textContent = "Plan sent · patient can now review prices and accept";
      applyFixture();
    });
  }

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
    if (event.target.closest("[data-lng]")) setTimeout(applyFixture, 0);
  });
  applyFixture();
  window.addEventListener("load", function () {
    setTimeout(function () { openHash(); applyFixture(); }, 80);
  }, { once: true });
}());

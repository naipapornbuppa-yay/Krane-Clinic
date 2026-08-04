/* Patient app overlay for the client demo.
   Applies the golden fixture to krane-b2c.html and keeps the tracking timeline in step
   with the fulfilment status set by the admin CMS.

   Deliberately does NOT touch the language. Thai stays the default and i18n.js owns the
   swap; demo.replaceText keeps the fixture values stable across a translation pass. */
(function () {
  const demo = window.KraneGoldenDemo;
  if (!demo) return;
  const f = demo.fixture;

  /* The admin CMS deep-links here with ?demoStatus=... so checkpoint 5 opens at the
     stage the presenter just set in checkpoint 4. */
  const statusFromUrl = new URLSearchParams(location.search).get("demoStatus");
  if (demo.statuses.includes(statusFromUrl)) demo.writeState({ fulfilmentStatus: statusFromUrl });

  /* Each pattern also matches the value it produces, so repeat passes are a no-op. */
  const pairs = [
    [/Mali B\.(?:\s*\(Demo\))?/g, f.patient.name],
    [/Dr\. Narin(?:\s+Tanaka|\s+T\.)?/g, f.doctor.name],
    [/12 Sep 2026/g, f.treatment.followUp],
    [/12 ก\.ย\. 2026/g, "26 ส.ค. 2026"]
  ];

  /* i18n.js carries a Thai form of the doctor's name, which the Doctor and Admin CMS
     already render. The patient app has to match it or the same doctor reads two ways
     across the demo. Applied only in Thai; English keeps the Latin spelling. */
  const doctorTH = "คุณหมอนรินทร์ ทานากะ";
  const thaiPairs = [[/Dr\. Narin Tanaka/g, doctorTH]];

  function isThai() {
    return document.documentElement.lang === "th" || document.body.classList.contains("lang-th");
  }

  function applyFixture() {
    demo.replaceText(document.body, pairs);
    if (isThai()) demo.replaceText(document.body, thaiPairs);
    const building = document.getElementById("addrBuilding");
    const floor = document.getElementById("addrFloor");
    const line = document.getElementById("addrLine");
    const district = document.getElementById("addrDistrict");
    if (building) building.value = "เดอะ เบส พาร์ค เวสต์ ห้อง 22/418";
    if (floor) floor.value = "22";
    if (line) line.value = "ซอยสุขุมวิท 77 แขวงพระโขนงเหนือ";
    if (district) district.value = "เขตวัฒนา กรุงเทพฯ 10110";
    const paymentAddress = document.querySelector("[data-payment-address]");
    if (paymentAddress) paymentAddress.textContent = f.order.shortAddress;
    updateTracking();
  }

  /* Thai labels are set here rather than left to i18n.js, which renders the shared state
     word "Dispatched" as "จัดส่งแล้ว" and contradicts the timeline step "กำลังจัดส่ง"
     on the same screen. These match the admin status control's wording. */
  const statusTH = {
    "Order received": "ชำระแล้ว",
    "Pharmacy accepted": "ร้านยารับออเดอร์",
    "Preparing": "กำลังเตรียม",
    "Dispatched": "กำลังจัดส่ง",
    "Delivered": "จัดส่งสำเร็จ"
  };

  function updateTracking() {
    const tracking = document.getElementById("tracking");
    if (!tracking) return;
    const state = demo.readState();
    const steps = Array.from(tracking.querySelectorAll(".timeline .step"));
    const indexByStatus = {
      "Order received": 1,
      "Pharmacy accepted": 2,
      "Preparing": 3,
      "Dispatched": 5,
      "Delivered": 6
    };
    const activeIndex = indexByStatus[state.fulfilmentStatus] == null ? 3 : indexByStatus[state.fulfilmentStatus];
    steps.forEach(function (step, index) {
      step.classList.toggle("done", index < activeIndex || (state.fulfilmentStatus === "Delivered" && index <= activeIndex));
      step.classList.toggle("active", index === activeIndex && state.fulfilmentStatus !== "Delivered");
    });
    let badge = tracking.querySelector("[data-golden-tracking-status]");
    if (!badge) {
      const top = tracking.querySelector(".screen__top");
      if (!top) return;
      badge = document.createElement("span");
      badge.dataset.goldenTrackingStatus = "";
      /* Status is a badge, never a coloured edge (WORKING-RULES rule 1). */
      badge.className = "badge badge--ok";
      top.appendChild(badge);
    }
    badge.textContent = statusTH[state.fulfilmentStatus] || state.fulfilmentStatus;
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-go]");
    if (!target) return;
    if (target.dataset.go === "pharmacy-search" || target.dataset.go === "pharmacypending") {
      demo.advanceFulfilment("Order received");
    }
    if (target.dataset.go === "pharmacyaccepted") {
      demo.advanceFulfilment("Pharmacy accepted");
    }
    if (target.dataset.go === "tracking" && target.closest("#pharmacyaccepted")) {
      demo.advanceFulfilment("Preparing");
    }
    /* Screens render their content on show(), so re-apply once the new screen is in the DOM. */
    setTimeout(applyFixture, 0);
  });
  window.addEventListener("storage", updateTracking);
  window.addEventListener("krane-demo-state", updateTracking);
  window.addEventListener("hashchange", function () { setTimeout(applyFixture, 0); });

  applyFixture();
  /* i18n.js boots on DOMContentLoaded and caches node.__en at that point. Re-apply just
     after so any node it rewrote carries the fixture values too. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(applyFixture, 0); }, { once: true });
  }
  window.addEventListener("load", function () { setTimeout(applyFixture, 0); }, { once: true });
}());

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
  /* The follow-up dates are not rewritten here any more. The app generates them
     from data-followup-offset so they move with the real date, and these two
     pairs stamped a fixed calendar date back over that — which is what made the
     three-day reminder disappear a few days after the fixture was written. They
     also collapsed both treatment cards onto one date, so the case that is
     deliberately outside the reminder window stopped being demonstrable. */
  const pairs = [
    [/Mali B\.(?:\s*\(Demo\))?/g, f.patient.name],
    [/Dr\. Narin(?:\s+Tanaka|\s+T\.)?/g, f.doctor.name]
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
    /* The delivery address is not written here any more, on the checkout summary
       row any more than on the form inputs. This unconditionally overwrote
       [data-payment-address] with a fixed demo string regardless of whether an
       address had actually been confirmed, so the row read as filled while the
       checkout CTA and delivery-fee estimate correctly still read as unconfirmed
       — a patient could see a delivery address before choosing one. The app owns
       that row: syncDeliveryAddress() already renders it from the real
       addressConfirmed state. */
    updateTracking();
  }

  /* The app owns the order's stage: one table in krane-b2c.html drives the
     timeline, the header badge and the activity card together. This overlay
     used to light steps by their position in a seven-row timeline, so once the
     timeline became five rows its default "Preparing" lit "out for delivery"
     under a header that said preparing (client, 13 Sep). It now only asks the
     app to redraw when the admin CMS moves the order. */
  function updateTracking() {
    if (typeof window.kraneSyncOrderProgress === "function") window.kraneSyncOrderProgress();
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

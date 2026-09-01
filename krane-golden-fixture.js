/* Krane client-demo golden fixture.
   One frozen record shared by the patient app, the doctor CMS, and the admin CMS so the
   five demo checkpoints show identical values. Prototype data only, all names fictional.

   Language: this file never forces a language. Thai remains the default and i18n.js owns
   the swap. See replaceText() below for how fixture values survive translation. */
(function () {
  /* The follow-up used to be a fixed calendar date. The patient app only shows
     its reminder inside the three days before the appointment, so a fixed date
     meant the demo silently lost that reminder a few days after the date was
     written — mid-testing-round, with nobody told. It is one day out from
     whenever the demo is opened now, and the clinic side reads the same
     appointment, so the two never disagree. */
  const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  function relativeDate(offsetDays, thai) {
    const when = new Date();
    when.setHours(0, 0, 0, 0);
    when.setDate(when.getDate() + offsetDays);
    const months = thai ? MONTHS_TH : MONTHS_EN;
    return when.getDate() + " " + months[when.getMonth()] + " " + when.getFullYear();
  }
  const FOLLOW_UP_OFFSET_DAYS = 1;

  const fixture = Object.freeze({
    patient: Object.freeze({
      name: "Mali S. (Demo)",
      shortName: "Mali S. (Demo)",
      id: "PT-2041",
      age: 34,
      sex: "male",
      phone: "08x-xxx-2041"
    }),
    doctor: Object.freeze({
      /* One spelling everywhere. The five checkpoints must not disagree, so shortName is
         deliberately the same string as name. */
      name: "Dr. Narin Tanaka",
      shortName: "Dr. Narin Tanaka",
      licence: "12345",
      specialty: "Dermatology · Hair and scalp"
    }),
    consultation: Object.freeze({
      id: "CONS-2041",
      appointment: "26 Jul 2026 · 11:00",
      /* Canonically the condition the patient picks at intake, so all five checkpoints
         agree without rewriting fifteen strings in the doctor CMS. */
      condition: "Hair loss",
      fee: 350,
      status: "Plan sent"
    }),
    treatment: Object.freeze({
      medicines: Object.freeze([
        Object.freeze({ name: "Finasteride 1mg", dosage: "Take 1 tablet once daily", price: 590 }),
        Object.freeze({ name: "Minoxidil 5% topical", dosage: "Apply 1 mL to the scalp twice daily", price: 450 })
      ]),
      medicineFee: 1040,
      followUp: relativeDate(FOLLOW_UP_OFFSET_DAYS, false),
      followUpTH: relativeDate(FOLLOW_UP_OFFSET_DAYS, true)
    }),
    order: Object.freeze({
      id: "KR-10293",
      deliveryFee: 120,
      total: 1160,
      address: "เดอะ เบส พาร์ค เวสต์ ห้อง 22/418 ซอยสุขุมวิท 77 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพฯ 10110",
      shortAddress: "เดอะ เบส พาร์ค เวสต์ · ห้อง 22/418",
      branch: "Fascino Ari",
      paymentStatus: "Paid",
      defaultStatus: "Preparing"
    })
  });

  const storageKey = "krane-golden-demo-state-v1";
  const allowedStatuses = ["Order received", "Pharmacy accepted", "Preparing", "Dispatched", "Delivered"];

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        fulfilmentStatus: allowedStatuses.includes(saved.fulfilmentStatus) ? saved.fulfilmentStatus : fixture.order.defaultStatus,
        consultationStatus: saved.consultationStatus || fixture.consultation.status,
        updatedAt: saved.updatedAt || null
      };
    } catch (error) {
      return { fulfilmentStatus: fixture.order.defaultStatus, consultationStatus: fixture.consultation.status, updatedAt: null };
    }
  }

  function writeState(patch) {
    const next = Object.assign({}, readState(), patch, { updatedAt: new Date().toISOString() });
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch (error) {}
    window.dispatchEvent(new CustomEvent("krane-demo-state", { detail: next }));
    return next;
  }

  function advanceFulfilment(status) {
    const current = readState();
    const currentIndex = allowedStatuses.indexOf(current.fulfilmentStatus);
    const nextIndex = allowedStatuses.indexOf(status);
    if (nextIndex < 0 || nextIndex < currentIndex) return current;
    return writeState({ fulfilmentStatus: status });
  }

  /* Pairs are [RegExp, string]. They must be idempotent, because applyFixture runs again
     on load, on screen change, and after a language swap: a plain "Dr. Narin" to
     "Dr. Narin Tanaka" substitution compounds into "Dr. Narin Tanaka Tanaka" on the
     second pass. Each pattern therefore also matches its own output. */
  function applyPairs(value, pairs) {
    for (let i = 0; i < pairs.length; i += 1) {
      value = value.replace(pairs[i][0], pairs[i][1]);
    }
    return value;
  }

  /* i18n.js caches the original English of every text node on node.__en and re-derives
     nodeValue from that cache on every swap, driven by a MutationObserver. Writing only
     nodeValue therefore loses the fixture the moment the language layer runs again.
     Patching __en with the same pairs keeps the two in step: the Thai lookup then misses
     the rewritten key and swap() leaves the node untouched, so the fixture is stable and
     there is no observer ping-pong. */
  function replaceText(root, pairs) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        const parent = node.parentNode && node.parentNode.nodeName;
        return (parent === "SCRIPT" || parent === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (item) {
      const nextValue = applyPairs(item.nodeValue, pairs);
      if (nextValue !== item.nodeValue) item.nodeValue = nextValue;
      if (item.__en !== undefined) {
        const nextCache = applyPairs(item.__en, pairs);
        if (nextCache !== item.__en) item.__en = nextCache;
      }
    });
  }

  window.KRANE_GOLDEN_FIXTURE = fixture;
  window.KraneGoldenDemo = Object.freeze({
    fixture,
    statuses: allowedStatuses.slice(),
    readState,
    writeState,
    advanceFulfilment,
    replaceText,
    applyPairs,
    reset: function () {
      try { localStorage.removeItem(storageKey); } catch (error) {}
      return writeState({ fulfilmentStatus: fixture.order.defaultStatus, consultationStatus: fixture.consultation.status });
    }
  });
}());

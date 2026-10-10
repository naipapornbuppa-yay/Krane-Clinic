(() => {
  const QA_RESET_PARAM = "qaReset";
  const PROTOTYPE_SESSION_KEYS = [
    "krane-p01-flow-state-v1",
    "krane-p01-intake-draft-v1",
    "krane-p01-consent-records-v1"
  ];
  const params = new URLSearchParams(window.location.search);

  if (params.get(QA_RESET_PARAM) !== "1") return;

  PROTOTYPE_SESSION_KEYS.forEach((key) => {
    try { window.sessionStorage.removeItem(key); } catch (_) {}
  });

  params.delete(QA_RESET_PARAM);
  params.delete("demoStage");
  params.delete("demoStatus");

  const query = params.toString();
  const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}#landing`;

  try {
    window.history.replaceState(null, "", cleanUrl);
  } catch (_) {
    window.location.hash = "#landing";
  }

  window.kraneQaResetApplied = true;
})();

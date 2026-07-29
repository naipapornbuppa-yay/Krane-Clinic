(() => {
  const base = "/Krane-Clinic/";
  const key = "krane-client-review-access";
  if (sessionStorage.getItem(key) === "234") return;
  const next = location.pathname + location.search + location.hash;
  location.replace(base + "?next=" + encodeURIComponent(next));
})();

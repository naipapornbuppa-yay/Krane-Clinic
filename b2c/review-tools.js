(function configureKraneReviewTools(global) {
  "use strict";

  const params = new URLSearchParams(global.location.search);
  const enabled = params.get("with_screen_tab") === "1";

  global.document.documentElement.classList.toggle("review-tools-enabled", enabled);
  global.KraneReviewTools = Object.freeze({ enabled });
})(window);

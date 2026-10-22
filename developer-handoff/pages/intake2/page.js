/* pages/intake2/page.js: page-owned behavior; shared state and router remain central. */

// Called once at the original bootstrap position.
function kraneInit_intake2_obesityMetrics() {
document.body.addEventListener('input', event => {
    if(!event.target.closest('[data-obesity-metric]')) return;
    syncObesityBmi();
    saveIntakeDraft();
  });
}

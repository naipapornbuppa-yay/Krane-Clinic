/* intake2: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

// Called once at the original bootstrap position.
function kraneInit_intake2_obesityMetrics() {
document.body.addEventListener('input', event => {
    if(!event.target.closest('[data-obesity-metric]')) return;
    syncObesityBmi();
    saveIntakeDraft();
  });
}

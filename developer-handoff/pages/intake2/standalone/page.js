function kraneInit_intake2_obesityMetrics() {
document.body.addEventListener('input', event => {
    if(!event.target.closest('[data-obesity-metric]')) return;
    syncObesityBmi();
    saveIntakeDraft();
  });
}
(() => {
  const steps = document.querySelector('.pricing-steps');
  if (!steps || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  steps.classList.add('is-motion-ready');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    steps.classList.add('is-motion-visible');
    observer.disconnect();
  }, {threshold: 0.15});
  observer.observe(steps);
})();

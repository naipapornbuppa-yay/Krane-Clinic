/* In-page shortcuts keep the consultation route and unsaved form state intact. */
(() => {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-workspace-jump]');
    if (!button) return;
    const target = document.querySelector('#consult ' + button.dataset.workspaceJump);
    if (!target) return;
    target.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    const field = target.querySelector('input, textarea, button');
    if (field) field.focus({preventScroll: true});
    else { target.tabIndex = -1; target.focus({preventScroll: true}); }
  });
})();

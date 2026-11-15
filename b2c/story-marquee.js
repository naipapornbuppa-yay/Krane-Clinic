(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function mount(rail) {
    if (!rail || rail.hasAttribute('data-story-marquee')) return;
    const originals = [...rail.children];
    if (originals.length < 2) return;
    rail.dataset.storyMarquee = '';
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const card of originals) {
        const copy = card.cloneNode(true);
        copy.dataset.storyCopy = '';
        copy.setAttribute('aria-hidden', 'true');
        copy.tabIndex = -1;
        rail.append(copy);
      }
    }
    rail.classList.add('story-marquee');

    let visible = false;
    let pressing = false;
    let hovering = false;
    let frame = 0;
    let last = 0;
    let fraction = 0;
    const canPlay = () => visible && !pressing && !hovering && !document.hidden &&
      !reduced.matches && !rail.querySelector(':focus-visible') && !rail.matches(':focus-visible') &&
      !document.querySelector('dialog[open]');
    const sync = () => {
      if (canPlay()) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      }
    };
    function tick(now) {
      frame = 0;
      if (!canPlay()) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(48, now - last) : 0;
      last = now;
      const repeat = rail.children[originals.length];
      const period = repeat.offsetLeft - originals[0].offsetLeft;
      if (period > 0) {
        fraction += dt * 0.027;
        const pixels = Math.floor(fraction);
        fraction -= pixels;
        if (pixels) rail.scrollLeft = (rail.scrollLeft + pixels) % period;
      }
      frame = requestAnimationFrame(tick);
    }
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }).observe(rail);
    rail.addEventListener('pointerenter', event => {
      hovering = event.pointerType === 'mouse';
      sync();
    });
    rail.addEventListener('pointerleave', () => { hovering = false; sync(); });
    rail.addEventListener('pointerdown', () => { pressing = true; sync(); });
    for (const event of ['pointerup','pointercancel']) {
      window.addEventListener(event, () => { pressing = false; sync(); }, {passive:true});
    }
    rail.addEventListener('focusin', sync);
    rail.addEventListener('focusout', () => queueMicrotask(sync));
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', () => {
      if (reduced.matches) rail.scrollLeft = 0;
      sync();
    });
    const viewer = document.querySelector('.pc-story-viewer');
    if (viewer) new MutationObserver(sync).observe(viewer, {attributes:true, attributeFilter:['open']});
  }

  window.KraneStoryMarquee = { mount };
})();

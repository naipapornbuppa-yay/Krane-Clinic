/* One stationary review frame. Only its active video may play. */
(() => {
  'use strict';
  const frame = document.querySelector('#weight-program .weight-story-frame');
  if (!frame) return;
  const cards = [...frame.querySelectorAll('[data-weight-story]')];
  if (!cards.length) return;
  const videos = cards.map(card => card.querySelector('video'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, visible = false, paused = false, manualPlay = false, muted = true;
  const english = () => document.documentElement.lang.startsWith('en');
  const word = (th, en) => english() ? en : th;
  const icons = {
    play: '<path d="m8 5 11 7-11 7Z"/>', pause: '<path d="M9 5v14M15 5v14"/>',
    muted: '<path d="m11 5-6 4H2v6h3l6 4Z"/><path d="m17 9 5 6m0-6-5 6"/>',
    sound: '<path d="m11 5-6 4H2v6h3l6 4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    prev: '<path d="m14 5-7 7 7 7"/>', next: '<path d="m10 5 7 7-7 7"/>'
  };
  const icon = (button, name, label) => {
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
    button.setAttribute('aria-label', label);
  };
  const bars = document.createElement('div'); bars.className = 'weight-story-bars';
  const nav = document.createElement('div'); nav.className = 'weight-story-nav';
  nav.innerHTML = '<button type="button" data-weight-prev></button><span class="weight-story-count" aria-live="polite"></span><button type="button" data-weight-next></button>';
  const prev = nav.querySelector('[data-weight-prev]'), next = nav.querySelector('[data-weight-next]');
  cards.forEach((card, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.innerHTML = '<i></i>';
    button.addEventListener('click', () => show(i)); bars.append(button);
  });
  frame.append(bars, nav);
  const progress = () => [...bars.children].forEach((button, i) => {
    const video = videos[i];
    const value = i < active ? 100 : i === active && Number.isFinite(video.duration) && video.duration > 0 ? video.currentTime / video.duration * 100 : 0;
    button.style.setProperty('--progress', `${value}%`);
  });
  const labels = () => {
    frame.setAttribute('aria-label', word('วิดีโอประสบการณ์ผู้ใช้บริการ', 'Patient experience videos'));
    icon(prev, 'prev', word('เรื่องก่อนหน้า', 'Previous story'));
    icon(next, 'next', word('เรื่องถัดไป', 'Next story'));
    prev.disabled = active === 0; next.disabled = active === cards.length - 1;
    nav.querySelector('.weight-story-count').textContent = `${active + 1} / ${cards.length}`;
    cards.forEach((card, i) => {
      const video = videos[i], play = card.querySelector('.pc-play'), sound = card.querySelector('.pc-sound');
      icon(play, video.paused ? 'play' : 'pause', video.paused ? word('เล่นวิดีโอ', 'Play video') : word('หยุดวิดีโอ', 'Pause video'));
      icon(sound, muted ? 'muted' : 'sound', muted ? word('เปิดเสียง', 'Unmute video') : word('ปิดเสียง', 'Mute video'));
      sound.setAttribute('aria-pressed', String(!muted));
      bars.children[i].setAttribute('aria-label', word(`ดูเรื่องที่ ${i + 1}`, `Show story ${i + 1}`));
      bars.children[i].setAttribute('aria-current', String(i === active));
    });
  };
  const allowed = () => visible && !document.hidden && !document.querySelector('dialog[open]') && !paused && (!reduced.matches || manualPlay);
  const sync = () => {
    videos.forEach((video, i) => {
      if (i === active && allowed()) video.play().catch(() => { labels(); });
      else video.pause();
    });
    labels();
  };
  function show(index) {
    if (index < 0 || index >= cards.length || index === active) return;
    videos[active].pause();
    active = index;
    cards.forEach((card, i) => { card.hidden = i !== active; });
    videos[active].currentTime = 0;
    frame.dataset.activeStory = String(active);
    progress(); sync();
  }
  cards.forEach((card, i) => {
    const video = videos[i];
    video.autoplay = false; video.loop = false; video.muted = true; video.playsInline = true;
    card.hidden = i !== active;
    card.querySelector('.pc-play').addEventListener('click', () => {
      paused = !video.paused;
      manualPlay = !paused;
      sync();
    });
    card.querySelector('.pc-sound').addEventListener('click', () => {
      muted = !muted; videos.forEach(item => { item.muted = muted; }); labels();
    });
    video.addEventListener('play', () => {
      if (i !== active || !allowed()) video.pause();
      labels();
    });
    video.addEventListener('pause', labels);
    video.addEventListener('timeupdate', progress);
    video.addEventListener('ended', () => {
      if (i !== active) return;
      if (!reduced.matches && active < cards.length - 1) show(active + 1);
      else { paused = true; manualPlay = false; labels(); }
    });
  });
  prev.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  frame.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); }, { threshold: .25 }).observe(frame);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('krane:languagechange', labels);
  new MutationObserver(sync).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] });
  reduced.addEventListener('change', () => { manualPlay = false; sync(); });
  frame.dataset.activeStory = '0'; progress(); labels();
})();

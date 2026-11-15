(() => {
  const page = document.querySelector('main[data-programme]');
  if (!page) return;
  document.body.classList.add('rebody-page');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reduce.matches ? 'instant' : 'smooth';

  const title = page.querySelector('.opt-timeline h2');
  title.querySelector('br')?.after(' ');
  page.querySelector('.opt-timeline header p br').replaceWith(' ');
  const stories = page.querySelector('.opt-stories');
  stories.querySelector('.opt-section-head').remove();
  stories.setAttribute('aria-label', 'วิดีโอประสบการณ์จากผู้ใช้บริการ Krane');
  stories.querySelectorAll('.opt-story').forEach(button => {
    const title = button.querySelector('.opt-story-name');
    button.setAttribute('aria-label', 'ดูวิดีโอประสบการณ์ของ ' + title.textContent);
    const subtitle = document.createElement('small');
    subtitle.textContent = 'ผู้ใช้บริการ Krane';
    title.append(subtitle);
    const avatar = button.querySelector('img').cloneNode();
    avatar.className = 'rebody-story-avatar';
    avatar.alt = '';
    button.append(avatar);
  });
  const progress = document.createElement('div');
  progress.className = 'rebody-story-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  stories.querySelector('.opt-rail-controls').prepend(progress);
  const storyRail = stories.querySelector('[data-rail]');
  const syncStoryControls = () => {
    const max = storyRail.scrollWidth - storyRail.clientWidth;
    const position = max > 0 ? storyRail.scrollLeft / max : 0;
    progress.firstElementChild.style.transform = 'translateX(' + position * 200 + '%)';
    stories.querySelector('[data-scroll="-1"]').disabled = storyRail.scrollLeft < 2;
    stories.querySelector('[data-scroll="1"]').disabled = storyRail.scrollLeft >= max - 2;
  };
  storyRail.addEventListener('scroll', syncStoryControls, {passive:true});
  new ResizeObserver(syncStoryControls).observe(storyRail);
  syncStoryControls();
  const dialog = document.querySelector('#opt-story-dialog');
  let lastStory;
  page.addEventListener('click', event => {
    const story = event.target.closest('[data-story]');
    if (!story) return;
    lastStory = story;
    document.documentElement.classList.add('rebody-story-open');
    dialog.querySelector('video').play().catch(() => {});
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('rebody-story-open');
    lastStory?.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  page.querySelectorAll('.opt-article-rail a').forEach(link => {
    link.querySelector('span').innerHTML = 'อ่าน 4 นาที <b aria-hidden="true">→</b>';
  });
  const articleControls = document.createElement('div');
  articleControls.className = 'opt-rail-controls rebody-article-controls';
  articleControls.innerHTML = '<button type="button" data-scroll="-1" aria-label="บทความก่อนหน้า">‹</button><button type="button" data-scroll="1" aria-label="บทความถัดไป">›</button>';
  page.querySelector('.opt-article-rail').after(articleControls);
  // Native horizontal rails remain usable by touch, wheel, and the keyboard.
  page.querySelectorAll('.opt-story-rail,.opt-article-rail').forEach(rail => {
    rail.tabIndex = 0;
    rail.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.target !== rail) return;
      event.preventDefault();
      const first = rail.firstElementChild;
      const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap);
      rail.scrollBy({left:step * (event.key === 'ArrowRight' ? 1 : -1), behavior:scrollBehavior()});
    });
  });
  window.lucide?.createIcons();
})();

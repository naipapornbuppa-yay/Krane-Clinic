(() => {
  const page = document.querySelector('main[data-programme]');
  if (!page) return;
  document.body.classList.add('rebody-page');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reduce.matches ? 'instant' : 'smooth';

  page.querySelector('.opt-timeline header p br').replaceWith(' ');
  const stories = page.querySelector('.opt-stories');
  if (stories) {
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
    const storyRail = stories.querySelector('[data-rail]');
    const items = [...storyRail.children].map(card => {
      const review = window.KraneReviews.find(item => item.id === card.dataset.story);
      return {...review, attribution:[review.name, review.province].filter(Boolean).join(' · ')};
    });
    window.KraneStoryMarquee.mount(storyRail);
    storyRail.addEventListener('click', event => {
      const card = event.target.closest('[data-story]');
      if (!card) return;
      const trigger = card.hasAttribute('data-story-copy')
        ? storyRail.querySelector(`button[data-story="${card.dataset.story}"]:not([data-story-copy])`)
        : card;
      document.dispatchEvent(new CustomEvent('krane:open-review-stories', {
        detail:{items, activeId:card.dataset.story, trigger},
      }));
    });
  }

  page.querySelectorAll('.opt-article-rail a').forEach(link => {
    link.querySelector('span').innerHTML = 'อ่าน 4 นาที <b aria-hidden="true">→</b>';
  });
  const articleControls = document.createElement('div');
  articleControls.className = 'opt-rail-controls rebody-article-controls';
  articleControls.innerHTML = '<button type="button" data-scroll="-1" aria-label="บทความก่อนหน้า">‹</button><button type="button" data-scroll="1" aria-label="บทความถัดไป">›</button>';
  const articleRail = page.querySelector('.opt-article-rail');
  articleRail.dataset.carouselRail = 'บทความ หน้า';
  articleRail.after(articleControls);
  // Native horizontal rails remain usable by touch, wheel, and the keyboard.
  page.querySelectorAll('.opt-story-rail,.opt-article-rail,.opt-comparison-rail').forEach(rail => {
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

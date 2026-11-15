(() => {
  const page = document.querySelector('main[data-programme="rebody"]');
  if (!page) return;
  document.body.classList.add('rebody-page');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reduce.matches ? 'instant' : 'smooth';

  page.querySelector('.opt-timeline h2').innerHTML = 're:body<br> ไทม์ไลน์การดูแล';
  const stepImage = page.querySelector('.opt-step-copy img');
  const stepPicture = document.createElement('picture');
  const mobileStep = document.createElement('source');
  mobileStep.media = '(max-width:700px)';
  mobileStep.srcset = 'assets/programme-opt1/body-doctor.webp';
  stepImage.replaceWith(stepPicture);
  stepPicture.append(mobileStep, stepImage);

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
  page.querySelector('.opt-interview-media h2').innerHTML = '<strong>แข็ง</strong>แรงอย่างมั่นใจ<br>ดูแลอย่างเป็นส่วนตัว';

  const reviews = page.querySelector('.opt-feedback');
  reviews.innerHTML = `
    <div class="rebody-review-header"><h2>ประสบการณ์เล็ก ๆ<br>ที่ช่วยให้ตัดสินใจง่ายขึ้น</h2><div class="rebody-review-rating" aria-label="คะแนนตัวอย่าง 4.8 จาก 5"><strong>4.8<small> / 5</small></strong><span>★★★★★<small>100 การประเมิน</small></span></div></div>
    <p class="rebody-review-disclosure">ตัวอย่างสมมติสำหรับแสดงหน้าจอ · คะแนนและความคิดเห็นไม่ใช่รีวิวจากผู้รับบริการจริง</p>
    <div class="rebody-review-toolbar"><h3>ความคิดเห็น</h3><label>เรียงตาม <select data-body-sort><option value="latest">ล่าสุด</option><option value="top">คะแนนสูงสุด</option><option value="oldest">เก่าสุด</option></select></label></div>
    <div class="rebody-review-filters" aria-label="กรองตามคะแนน">${[0,5,4,3,2,1].map(score => `<button type="button" data-body-score="${score}" aria-pressed="${!score}">${score ? score + ' ★' : 'ทั้งหมด'}</button>`).join('')}</div>
    <div class="rebody-review-rail" aria-label="ความคิดเห็น เลื่อนเพื่ออ่านเพิ่มเติม" tabindex="0"></div><p class="visually-hidden" data-review-status role="status"></p>
    <div class="rebody-review-pages" aria-label="เลื่อนความคิดเห็น"></div>`;
  const sampleReviews = [
    {score:5,title:'เข้าใจแผนก่อนเริ่ม',text:'ขั้นตอนเข้าใจง่าย คุณหมออธิบายแนวทางและตอบคำถามได้ชัดเจน',name:'ก***',avatar:'ก',day:22},
    {score:5,title:'ปรึกษาได้จากที่บ้าน',text:'ปรึกษาจากที่บ้านได้สะดวก ดูรายละเอียดแผนและค่าใช้จ่ายก่อนตัดสินใจได้',name:'พ***',avatar:'พ',day:18},
    {score:4,title:'ข้อมูลชัดเจน พร้อมติดตาม',text:'ข้อมูลการรับยาอ่านเข้าใจง่าย อยากให้การแจ้งเตือนนัดติดตามเห็นชัดขึ้นอีกนิด',name:'น***',avatar:'น',day:12},
    {score:5,title:'อ่านขั้นตอนได้ง่าย',text:'หน้าตัวอย่างจัดลำดับขั้นตอนได้ชัดเจน ปุ่มกดไม่ทำให้งงง่าย',name:'Demo 04',avatar:'D',day:11}
  ];
  const reviewRail = reviews.querySelector('.rebody-review-rail');
  const reviewPages = reviews.querySelector('.rebody-review-pages');
  let score = 0;
  const syncReviewPages = () => {
    const max = Math.max(0, reviewRail.scrollWidth - reviewRail.clientWidth);
    const count = max < 2 ? 1 : Math.ceil(max / reviewRail.clientWidth) + 1;
    const active = max ? Math.round(reviewRail.scrollLeft / max * (count - 1)) : 0;
    if (reviewPages.childElementCount !== count) reviewPages.replaceChildren(...Array.from({length:count}, (_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'ความคิดเห็นชุดที่ ' + (index + 1));
      button.addEventListener('click', () => {
        const maxScroll = reviewRail.scrollWidth - reviewRail.clientWidth;
        reviewRail.scrollTo({left:count > 1 ? maxScroll * index / (count - 1) : 0, behavior:scrollBehavior()});
      });
      return button;
    }));
    Array.from(reviewPages.children).forEach((button, index) => button.setAttribute('aria-current', String(index === active)));
  };
  const renderReviews = () => {
    const sort = reviews.querySelector('[data-body-sort]').value;
    const list = sampleReviews.filter(item => !score || item.score === score).sort((a,b) => sort === 'oldest' ? a.day - b.day : sort === 'top' ? b.score - a.score || b.day - a.day : b.day - a.day);
    reviewRail.innerHTML = list.map(item => `<article class="rebody-review-card"><span class="rebody-review-stars" aria-label="${item.score} จาก 5 ดาว">${'★'.repeat(item.score)}${'☆'.repeat(5-item.score)}</span><h3>${item.title}</h3><blockquote>“${item.text}”</blockquote><small>ตัวอย่างสมมติ</small><div class="rebody-review-person"><span class="rebody-review-avatar" aria-hidden="true">${item.avatar}</span><div><strong>${item.name}</strong><time datetime="2026-10-${item.day}">${item.day} ต.ค. 2569</time></div></div></article>`).join('') || '<p class="opt-empty">ไม่มีรีวิวในคะแนนนี้</p>';
    reviewRail.scrollLeft = 0;
    reviews.querySelector('[data-review-status]').textContent = 'แสดงความคิดเห็น ' + list.length + ' รายการ';
    syncReviewPages();
  };
  reviews.querySelector('[data-body-sort]').addEventListener('change', renderReviews);
  reviews.querySelectorAll('[data-body-score]').forEach(button => button.addEventListener('click', () => {
    score = Number(button.dataset.bodyScore);
    reviews.querySelectorAll('[data-body-score]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderReviews();
  }));
  reviewRail.addEventListener('scroll', syncReviewPages, {passive:true});
  new ResizeObserver(syncReviewPages).observe(reviewRail);
  renderReviews();

  page.querySelectorAll('.opt-article-rail a').forEach(link => {
    link.querySelector('span').innerHTML = 'อ่าน 4 นาที <b aria-hidden="true">→</b>';
  });
  const articleControls = document.createElement('div');
  articleControls.className = 'opt-rail-controls rebody-article-controls';
  articleControls.innerHTML = '<button type="button" data-scroll="-1" aria-label="บทความก่อนหน้า">‹</button><button type="button" data-scroll="1" aria-label="บทความถัดไป">›</button>';
  page.querySelector('.opt-article-rail').after(articleControls);
  // Native horizontal rails remain usable by touch, wheel, and the keyboard.
  page.querySelectorAll('.opt-story-rail,.opt-article-rail,.rebody-review-rail').forEach(rail => {
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

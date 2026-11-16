(() => {
  const page = document.querySelector('main[data-programme]');
  if (!page) return;
  document.body.classList.add('programme-final');
  const key = page.dataset.programme;
  const hero = page.querySelector('.opt-hero');
  const heroMedia = {
    rebody:['rebody-hero-motion.m4v','body-hero.webp'],
    rehair:['rehair-hero-motion.mp4','hair-hero.webp'],
    reflow:['reflow-sprint-hero.mp4','reflow-sprint-hero.webp']
  };
  if (hero && heroMedia[key]) {
    const [source, poster] = heroMedia[key];
    const video = document.createElement('video');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    video.className = 'rebody-hero-video';
    video.src = 'assets/programme-opt1/' + source;
    video.poster = 'assets/programme-opt1/' + poster;
    video.muted = video.defaultMuted = video.loop = video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('aria-hidden', 'true');
    hero.prepend(video);
    let inView = !('IntersectionObserver' in window);
    const sync = () => {
      const play = inView && !document.hidden && !reduce.matches;
      hero.classList.toggle('is-motion-active', play);
      if (play) video.play().catch(() => {});
      else video.pause();
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }).observe(hero);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', sync);
    sync();
  }
  const labels = {
    rebody: ['ออนไลน์ 100%', 'แผนการรักษาเฉพาะบุคคล', 'จัดส่งแบบควบคุมอุณหภูมิ'],
    rehair: ['ออนไลน์ 100%', 'มีแพทย์ประจำตัว', 'เติมยาออนไลน์'],
    reflow: ['ปรึกษาแพทย์ 1:1', 'ซองที่ไม่ระบุชื่อสินค้า', 'เติมยาออนไลน์']
  };
  const badges = page.querySelector('.opt-hero-badges');
  badges.classList.add('programme-glass-labels');
  [...badges.children].forEach((badge, i) => {
    const icon = document.createElement('img');
    icon.src = 'assets/programme-opt1/rebody-hero-badge.svg';
    icon.alt = '';
    icon.width = icon.height = 24;
    badge.replaceChildren(icon, labels[key][i]);
  });

  page.querySelectorAll('.opt-timeline details').forEach(details => { details.name = 'care-timeline'; });
  const quotesByProgramme = {rebody: 'weight', rehair: 'hair-loss', reflow: 're-flow'};
  const reviews = window.KraneProgrammeReviews(quotesByProgramme[key]);
  if (reviews.length) {
    const section = document.createElement('section');
    section.className = 'opt-feedback opt-wrap';
    section.setAttribute('aria-labelledby', 'programme-feedback-title');
    section.innerHTML = '<header class="rebody-review-header"><h2 id="programme-feedback-title">ความคิดเห็น</h2></header><div class="rebody-review-rail" data-carousel-rail="ความคิดเห็น หน้า" tabindex="0"></div>';
    const rail = section.querySelector('.rebody-review-rail');
    for (const review of reviews) rail.append(window.KraneReviewCard(review));
    page.querySelector('.opt-interview').after(section);
  }

  const articleRail = page.querySelector('.opt-article-rail');
  const categoryByProgramme = {rebody: 'weight', rehair: 'hair', reflow: 'sexual-health'};
  const articles = (window.KraneArticleSeed || []).filter(article => article.category === categoryByProgramme[key]);
  if (articles.length) {
    articleRail.replaceChildren(...articles.map(article=>{
      const link = document.createElement('a');
      link.href = 'articles.html?article=' + encodeURIComponent(article.id);
      const img = document.createElement('img');
      window.KraneArticleImage.bind(img, article);
      img.loading = 'lazy';
      const panel = document.createElement('div');
      const category = document.createElement('small');
      category.textContent = article.categoryLabel || 'บทความสุขภาพ';
      const title = document.createElement('h3');
      title.textContent = article.title;
      const action = document.createElement('span');
      action.className = 'opt-article-action';
      action.append('อ่าน ' + (article.minutes || 4) + ' นาที');
      const arrow = document.createElement('i');
      arrow.dataset.lucide = 'arrow-right';
      arrow.setAttribute('aria-hidden', 'true');
      action.append(arrow);
      panel.append(category,title,action);
      link.append(img,panel);
      return link;
    }));
    window.lucide?.createIcons({attrs:{'stroke-width':1.65}});
  }
})();

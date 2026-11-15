(() => {
  const page = document.querySelector('main[data-programme]');
  if (!page) return;
  document.body.classList.add('programme-final');
  const key = page.dataset.programme;
  const hero = page.querySelector('.opt-hero');
  const heroMedia = {
    rebody:['rebody-hero-motion.m4v','body-hero.webp'],
    rehair:['rehair-hero-motion.mp4','hair-hero.webp'],
    reflow:['reflow-hero-motion.mp4','flow-hero.webp']
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
  const articleRail = page.querySelector('.opt-article-rail');
  const articleIds = ['library-ed-01','library-obesity-02','library-hair-loss-01','library-ed-03','library-obesity-01'];
  const articles = (window.KraneArticleSeed || []).filter(a=>articleIds.includes(a.id));
  if (articles.length) {
    articleRail.replaceChildren(...articleIds.map(id=>articles.find(a=>a.id===id)).filter(Boolean).map(article=>{
      const link = document.createElement('a');
      link.href = 'articles.html?article=' + encodeURIComponent(article.id);
      const img = document.createElement('img');
      img.src = article.image;
      img.alt = '';
      img.loading = 'lazy';
      const panel = document.createElement('div');
      const category = document.createElement('small');
      category.textContent = article.categoryLabel || 'บทความสุขภาพ';
      const title = document.createElement('h3');
      title.textContent = article.title;
      const action = document.createElement('span');
      action.textContent = 'อ่าน ' + (article.minutes || 4) + ' นาที →';
      panel.append(category,title,action);
      link.append(img,panel);
      return link;
    }));
  }
})();

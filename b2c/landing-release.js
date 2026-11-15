/* Content shared with the library and real review media. */
(() => {
  const rail=document.querySelector('.articles-row');
  if(rail && window.KraneArticleStore){
    const pictures={'library-hair-loss-01':'47474','library-hair-loss-02':'3685a','library-hair-loss-03':'6cc8a','library-hair-loss-04':'03780','library-hair-loss-05':'44179','library-obesity-01':'205e9','library-obesity-02':'cb6f7','library-obesity-03':'fd1f4','library-obesity-04':'c7aa8','library-obesity-05':'55226','library-ed-01':'34c1d','library-ed-02':'e8d07','library-ed-03':'cb867','library-ed-04':'d8f5e','library-ed-05':'7a06d'};
    const articles=KraneArticleStore.published();
    const order=Object.keys(pictures);
    articles.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):99)-(order.includes(b.id)?order.indexOf(b.id):99));
    for(const article of articles){
      const li=document.createElement('li'),a=document.createElement('a');
      a.dataset.articleId=article.id;if(pictures[article.id])a.dataset.landingImage='assets/landing-exact/'+pictures[article.id]+'.png';a.href='articles.html?article='+encodeURIComponent(article.id);
      li.append(a);rail.append(li);
    }
    window.dispatchEvent(new Event('krane-articles-changed'));
  }
  const gallery = document.querySelector('.landing-review-gallery');
  if (gallery) {
    for (const column of gallery.children) {
      const track = document.createElement('div');
      track.className = 'landing-review-track';
      const cycle = document.createElement('div');
      cycle.className = 'landing-review-cycle';
      const seen = new Set();
      for (const review of [...column.children]) {
        if (!seen.has(review.dataset.landingReview)) cycle.append(review);
        seen.add(review.dataset.landingReview);
      }
      track.append(cycle);
      for (let i = 0; i < 2; i++) {
        const copy = cycle.cloneNode(true);
        copy.dataset.copy = '';
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelectorAll('button').forEach(button => button.tabIndex = -1);
        track.append(copy);
      }
      column.replaceChildren(track);
    }
    gallery.classList.add('is-looping');
    new IntersectionObserver(([entry]) => gallery.classList.toggle('is-in-view', entry.isIntersecting)).observe(gallery);
  }
  document.querySelectorAll('.landing-stories').forEach(stories => {
    stories.addEventListener('click', event => {
      const button = event.target.closest('[data-landing-review]');
      if (!button) return;
      const items = (window.KraneReviews || []).map(item => ({...item, attribution:[item.name,item.province].filter(Boolean).join(' · ')}));
      document.dispatchEvent(new CustomEvent('krane:open-review-stories', {detail:{items,activeId:button.dataset.landingReview,trigger:button}}));
    });
    document.addEventListener('krane:languagechange', () => {
      const dots = document.querySelector('.landing-article-dots');
      if (!dots) return;
      dots.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Article pages' : 'เลือกหน้าบทความ');
    });
  });
  const articleDots = document.querySelector('.landing-article-dots');
  if (rail && articleDots) {
    let stops = [];
    const sync = () => {
      if (!stops.length) return;
      const active = stops.reduce((best, left, i) => Math.abs(left - rail.scrollLeft) < Math.abs(stops[best] - rail.scrollLeft) ? i : best, 0);
      Array.from(articleDots.children).forEach((button, i) => {
        button.classList.toggle('is-current', i === active);
        button.setAttribute('aria-current', i === active ? 'true' : 'false');
      });
    };
    const measure = () => {
      const cards = [...rail.children];
      const max = rail.scrollWidth - rail.clientWidth;
      if (cards.length < 2 || max < 2) { articleDots.hidden = true; return; }
      const origin = cards[0].offsetLeft;
      const step = cards[1].offsetLeft - origin;
      if (step < 1) return;
      const perPage = Math.max(1, Math.floor(rail.clientWidth / step));
      stops = cards.filter((_, i) => i % perPage === 0).map(card => card.offsetLeft - origin).filter(left => left < max - 2);
      stops.push(max);
      if (articleDots.childElementCount !== stops.length) {
        articleDots.replaceChildren(...stops.map((_, i) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.setAttribute('aria-label', 'บทความ หน้าที่ ' + (i + 1));
          button.addEventListener('click', () => rail.scrollTo({left:stops[i],behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}));
          return button;
        }));
      }
      articleDots.hidden = false;
      sync();
    };
    rail.addEventListener('scroll', sync, {passive:true});
    new ResizeObserver(measure).observe(rail);
    new MutationObserver(measure).observe(rail, {childList:true});
    measure();
  }
  const mobileCare = document.querySelector('.mobile-care-benefits');
  if (mobileCare) {
    const rail = mobileCare.querySelector('.mobile-care-benefits__rail');
    const previous = mobileCare.querySelector('[data-care-prev]');
    const next = mobileCare.querySelector('[data-care-next]');
    const offsets = () => Array.from(rail.children, card => card.offsetLeft - rail.firstElementChild.offsetLeft);
    const updateCareControls = () => {
      const limit = rail.scrollWidth - rail.clientWidth;
      previous.disabled = rail.scrollLeft <= 1;
      next.disabled = rail.scrollLeft >= limit - 1;
      const progress = limit > 0 ? rail.scrollLeft / limit : 0;
      mobileCare.style.setProperty('--care-progress', `${progress * 6}px`);
    };
    const move = direction => {
      const current = rail.scrollLeft;
      const stops = offsets();
      const target = direction > 0 ? stops.find(stop => stop > current + 2) : stops.reverse().find(stop => stop < current - 2);
      if (target !== undefined) rail.scrollTo({left:target, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    rail.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    rail.addEventListener('scroll', updateCareControls, {passive:true});
    new ResizeObserver(updateCareControls).observe(rail);
    updateCareControls();
  }
  const benefits = document.querySelector('.landing-benefits__rail');
  benefits?.addEventListener('keydown', event => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (event.target !== benefits || event.altKey || event.ctrlKey || event.metaKey || !keys.includes(event.key)) return;
    const max = benefits.scrollWidth - benefits.clientWidth;
    if (max < 1) return;
    const current = benefits.scrollLeft;
    const start = benefits.firstElementChild.getBoundingClientRect().left;
    const stops = Array.from(benefits.children, card => Math.min(max, card.getBoundingClientRect().left - start));
    let left = event.key === 'Home' ? 0 : max;
    if (event.key === 'ArrowRight') left = stops.find(stop => stop > current + 1) ?? max;
    if (event.key === 'ArrowLeft') left = stops.reverse().find(stop => stop < current - 1) ?? 0;
    event.preventDefault();
    benefits.scrollTo({left});
  });
  document.querySelectorAll('[data-rail-dots]').forEach(dots=>{
    const rail=dots.parentElement.querySelector(dots.dataset.railDots);
    const update=()=>{const max=rail.scrollWidth-rail.clientWidth;const count=Math.max(1,Math.ceil(rail.scrollWidth/rail.clientWidth));dots.replaceChildren();for(let i=0;i<count;i++){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','ความคิดเห็น หน้าที่ '+(i+1));b.setAttribute('aria-current',String(i===Math.round(rail.scrollLeft/Math.max(1,max)*(count-1))));b.onclick=()=>rail.scrollTo({left:count===1?0:max*i/(count-1),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});dots.append(b);}};
    new ResizeObserver(update).observe(rail);rail.addEventListener('scroll',update,{passive:true});update();
  });
})();

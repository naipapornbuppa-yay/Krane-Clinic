(() => {
  const page = document.querySelector('main[data-programme="rebody"]');
  if (!page) return;

  const timeline = page.querySelector('.opt-timeline-list');
  const comparisons = page.querySelector('.opt-comparison [data-rail]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reviewData = window.KraneReviews || [];
  const cards = Array.from(comparisons.children);
  cards.forEach((card, index) => {
    const review = reviewData.find(item => item.id === ['hair-pha', 'hair-03'][index]);
    if (!review) return;
    const images = card.firstElementChild;
    images.className = 'rebody-pair-images';
    Array.from(images.children).forEach((img, imageIndex) => {
      const figure = document.createElement('figure');
      const label = document.createElement('figcaption');
      label.textContent = imageIndex ? 'หลัง · ' + review.exampleMonths + ' เดือน' : 'ก่อน';
      img.alt = (imageIndex ? 'ภาพหลังของ ' : 'ภาพก่อนของ ') + review.name;
      img.decoding = 'async';
      if (review.id === 'hair-pha' && imageIndex) img.className = 'rebody-pair-composite';
      img.replaceWith(figure);
      figure.append(img, label);
    });
    const copy = document.createElement('div');
    copy.className = 'rebody-pair-copy';
    const quote = document.createElement('blockquote');
    quote.textContent = '“' + review.quote.replace(/<br\s*\/?\s*>/gi, ' ') + '”';
    const name = card.querySelector('p');
    name.textContent = [review.name, review.age + ' ปี', review.province].filter(Boolean).join(' · ');
    copy.append(quote, name);
    card.append(copy);
  });
  comparisons.className = 'rebody-marquee';
  comparisons.removeAttribute('data-rail');
  comparisons.setAttribute('role', 'region');
  comparisons.setAttribute('aria-label', 'เรื่องราวก่อนและหลัง ใช้ปุ่มลูกศรซ้ายหรือขวาเพื่อเลื่อนดู');
  comparisons.tabIndex = 0;
  const track = document.createElement('div');
  track.className = 'rebody-marquee-track';
  comparisons.replaceChildren(track);
  let marqueePaused = false;
  let marqueeVisible = !('IntersectionObserver' in window);
  const syncMarquee = () => {
    comparisons.classList.toggle('is-running', marqueeVisible && !marqueePaused && !reduce.matches && !document.hidden);
  };
  const duplicate = node => {
    const copy = node.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    return copy;
  };
  let lastWidth = 0;
  const buildMarquee = () => {
    if (!comparisons.clientWidth) return;
    lastWidth = comparisons.clientWidth;
    const set = document.createElement('div');
    set.className = 'rebody-marquee-set';
    set.append(...cards);
    track.replaceChildren(set);
    if (!reduce.matches && cards.length) {
      while (set.getBoundingClientRect().width < lastWidth) {
        cards.forEach(card => set.append(duplicate(card)));
      }
      track.style.setProperty('--marquee-duration', set.getBoundingClientRect().width / 28 + 's');
      track.append(duplicate(set));
    }
    syncMarquee();
  };
  comparisons.addEventListener('keydown', event => {
    if (event.key === ' ') { event.preventDefault(); marqueePaused = !marqueePaused; syncMarquee(); return; }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const step = (cards[0]?.getBoundingClientRect().width || 300) + parseFloat(getComputedStyle(track.firstElementChild).columnGap || 0);
    const animation = track.getAnimations()[0];
    if (animation) {
      marqueePaused = true;
      syncMarquee();
      const duration = Number(animation.effect.getTiming().duration);
      animation.currentTime = (Number(animation.currentTime) + direction * step / 28 * 1000 + duration) % duration;
    } else comparisons.scrollBy({left:direction * step, behavior:'instant'});
  });
  reduce.addEventListener('change', buildMarquee);
  document.addEventListener('visibilitychange', syncMarquee);
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { if (comparisons.clientWidth !== lastWidth) buildMarquee(); }).observe(comparisons);
  } else window.addEventListener('resize', buildMarquee);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { marqueeVisible = entry.isIntersecting; syncMarquee(); }).observe(comparisons);
  }
  buildMarquee();
  page.querySelector('.opt-price-band').style.setProperty(
    '--price-photo', 'url(assets/programme-opt1/rebody-price-banner.webp)'
  );
  const months = ['เดือนที่ 1', 'เดือนที่ 2–3', '4 เดือนขึ้นไป'];
  const descriptions = [
    'แพทย์ประจำตัวจะประเมินสุขภาพ ตั้งเป้าหมายร่วมกับคุณ และเริ่มแผนดูแลอย่างค่อยเป็นค่อยไป ช่วงแรกร่างกายกำลังปรับตัว บางคนอาจรู้สึกอิ่มเร็วขึ้นหรือคลื่นไส้เล็กน้อย ซึ่งพบได้และมักดีขึ้นเอง หากกังวล นัดปรึกษาแพทย์ประจำตัวได้เสมอ',
    'แพทย์จะติดตามผลและปรับแผนให้เหมาะกับร่างกายของคุณ พร้อมวางแผนการกินและการออกกำลังกายเฉพาะบุคคล',
    'ทบทวนผลกับแพทย์และวางแผนระยะยาว เพื่อให้ดูแลพฤติกรรมการกินและการออกกำลังกายได้อย่างต่อเนื่อง',
  ];
  timeline.querySelectorAll('details').forEach((item, index) => {
    item.name = 'rebody-care-timeline';
    item.querySelector('summary .opt-eyebrow').textContent = months[index];
    item.querySelector('.opt-step-copy p').textContent = descriptions[index];
    if (index > 0) {
      const image = document.createElement('img');
      image.src = 'assets/programme-opt1/rebody-timeline-step-' + (index + 1) + '.jpg';
      image.alt = index === 1 ? 'มื้ออาหารพร้อมปลาและผัก' : 'เสื่อออกกำลังกายและดัมเบล';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.style.objectPosition = 'center';
      item.querySelector('.opt-step-copy').append(image);
    }
  });
  const caption = document.createElement('small');
  caption.textContent = 'ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล';
  timeline.querySelector('.opt-step-copy').append(caption);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      timeline.classList.add('is-in-view');
      observer.disconnect();
    });
    observer.observe(timeline);
  }

  const hero = page.querySelector('.opt-hero');
  hero.querySelectorAll('.opt-hero-badges li').forEach(badge => {
    const icon = document.createElement('img');
    icon.src = 'assets/programme-opt1/rebody-hero-badge.svg';
    icon.alt = '';
    icon.width = 24;
    icon.height = 24;
    const wrapper = document.createElement('span');
    wrapper.className = 'rebody-hero-badge-icon';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.append(icon);
    badge.prepend(wrapper);
  });
  const video = document.createElement('video');
  video.className = 'rebody-hero-video';
  video.src = 'assets/programme-opt1/rebody-hero-motion.m4v';
  video.poster = 'assets/programme-opt1/body-hero.webp';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-hidden', 'true');
  hero.prepend(video);

  let inView = false;
  const sync = () => {
    hero.classList.toggle('is-motion-active', inView && !document.hidden && !reduce.matches);
    if (inView && !reduce.matches && !document.hidden) video.play().catch(() => {});
    else video.pause();
  };
  reduce.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }).observe(hero);
  } else {
    inView = true;
    sync();
  }
})();

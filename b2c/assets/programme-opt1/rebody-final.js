(() => {
  const page = document.querySelector('main[data-programme="rebody"]');
  if (!page) return;

  const timeline = page.querySelector('.opt-timeline-list');
  const comparisons = page.querySelector('.opt-comparison [data-rail]');
  if (comparisons.children.length === 2) {
    const repeat = comparisons.firstElementChild.cloneNode(true);
    repeat.setAttribute('aria-hidden', 'true');
    comparisons.append(repeat);
  }
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

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'rebody-hero-toggle';
  hero.append(toggle);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let userPreference;
  let inView = false;
  const sync = () => {
    const wantsPlayback = userPreference ?? !reduce.matches;
    if (inView && wantsPlayback) video.play().catch(() => {});
    else video.pause();
  };
  const updateButton = () => {
    toggle.textContent = video.paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', video.paused ? 'เล่นวิดีโอหน้าปก' : 'หยุดวิดีโอหน้าปก');
  };
  toggle.addEventListener('click', () => {
    userPreference = video.paused;
    sync();
  });
  video.addEventListener('play', updateButton);
  video.addEventListener('pause', updateButton);
  reduce.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }).observe(hero);
  } else {
    inView = true;
    sync();
  }
  updateButton();
})();

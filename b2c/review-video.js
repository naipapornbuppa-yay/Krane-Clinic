/* The owner supplied this single clip and explicitly approved its use on
   landing and programme pages. Never turn one speaker into multiple reviews. */
(() => {
  const key = new URLSearchParams(location.search).get('condition');
  document.querySelectorAll('[data-real-review]').forEach(host => {
    // Present the same service experience on the three programme pages.
    // No condition-specific result, treatment, identity or rating is inferred.
    if (host.dataset.realReview === 'programme' && !['weight', 'hair-loss', 're-flow', 'ed'].includes(key || 'weight')) return;
    host.innerHTML = `<article class="cd-review cd-review--story review-video">
      <div class="cd-review__story-media review-video__media">
        <div class="review-video__player"><video playsinline preload="none" width="540" height="960" poster="assets/reviews/confidence-real-med-poster.jpg" aria-label="วิดีโอรีวิวจากผู้ใช้บริการ" aria-describedby="review-video-note">
          <source src="assets/reviews/confidence-real-med.mp4" type="video/mp4">
          <a href="assets/reviews/confidence-real-med.mp4">เปิดวิดีโอรีวิว</a>
        </video><button type="button" class="review-video__play" aria-label="เล่นวิดีโอรีวิว"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button></div>
        <div class="review-video__controls"><span class="review-video__dot" aria-hidden="true"></span><button type="button" class="review-video__toggle" aria-label="เล่นวิดีโอรีวิว"><span aria-hidden="true">▶</span></button></div>
      </div>
      <div class="review-video__copy">
        <p class="cd-review__quote">วิดีโอประสบการณ์การปรึกษาแพทย์</p>
        <p class="cd-fine"><b>ผู้ใช้บริการ Krane</b></p>
        ${host.dataset.realReview === 'programme' ? '<p class="cd-fine review-video__context">ประสบการณ์การใช้บริการ ไม่ใช่การรับรองผลลัพธ์ของโปรแกรมนี้</p>' : ''}
        <p class="cd-fine review-video__note" id="review-video-note">ประสบการณ์เฉพาะบุคคล ผลลัพธ์และความเหมาะสมของการรักษาอาจแตกต่างกัน</p>
      </div>
    </article>`;
    host.hidden = false;
    const video = host.querySelector('video');
    const play = host.querySelector('.review-video__play');
    const toggle = host.querySelector('.review-video__toggle');
    // The poster is a still image until the visitor chooses to play. Native
    // controls are then enabled, including seek, volume and fullscreen.
    video.controls = false;
    const start = () => {
      video.controls = true;
      video.play().then(() => video.focus({preventScroll:true})).catch(() => { play.hidden = false; });
    };
    play.addEventListener('click', start);
    toggle.addEventListener('click', () => video.paused ? start() : video.pause());
    const sync = () => {
      play.hidden = !video.paused;
      toggle.firstElementChild.textContent = video.paused ? '▶' : 'Ⅱ';
      const en = document.documentElement.lang.startsWith('en');
      toggle.setAttribute('aria-label', video.paused ? (en ? 'Play video review' : 'เล่นวิดีโอรีวิว') : (en ? 'Pause video review' : 'หยุดวิดีโอรีวิว'));
    };
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('ended', sync);
    // Keep the page's floating consultation action clear of native controls.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        document.body.classList.toggle('is-review-in-view', entries.some(entry => entry.isIntersecting));
      }, {threshold:.35}).observe(video);
    }
    if (host.dataset.realReview === 'programme') {
      const section = host.closest('.cd-reviews');
      section.hidden = false;
      section.querySelector('.cd-section-head').hidden = false;
    }
  });
})();

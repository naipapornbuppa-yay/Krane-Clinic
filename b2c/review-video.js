/* The owner supplied this single clip and explicitly approved its use on
   landing and programme pages. Never turn one speaker into multiple reviews. */
(() => {
  const key = new URLSearchParams(location.search).get('condition');
  document.querySelectorAll('[data-real-review]').forEach(host => {
    // Present the same service experience on the three programme pages.
    // No condition-specific result, treatment, identity or rating is inferred.
    if (host.dataset.realReview === 'programme' && !['weight', 'hair-loss', 're-flow', 'ed'].includes(key || 'weight')) return;
    host.innerHTML = `<article class="review-video">
      <div class="review-video__copy">
        <h2>ประสบการณ์จากผู้ใช้บริการ</h2>
        <p>วิดีโอประสบการณ์การปรึกษาแพทย์</p>
        ${host.dataset.realReview === 'programme' ? '<p class="review-video__context">ประสบการณ์การใช้บริการ ไม่ใช่การรับรองผลลัพธ์ของโปรแกรมนี้</p>' : ''}
        <p class="review-video__note">ประสบการณ์เฉพาะบุคคล ผลลัพธ์และความเหมาะสมของการรักษาอาจแตกต่างกัน</p>
      </div>
      <figure class="review-video__media">
        <div class="review-video__player"><video controls playsinline preload="none" width="540" height="960" poster="assets/reviews/confidence-real-med-poster.jpg" aria-label="วิดีโอรีวิวจากผู้ใช้บริการ" aria-describedby="review-video-note">
          <source src="assets/reviews/confidence-real-med.mp4" type="video/mp4">
          <a href="assets/reviews/confidence-real-med.mp4">เปิดวิดีโอรีวิว</a>
        </video><button type="button" class="review-video__play" aria-label="เล่นวิดีโอรีวิว"><svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button></div>
        <figcaption id="review-video-note">เสียงภาษาไทย · 37 วินาที</figcaption>
      </figure>
    </article>`;
    host.hidden = false;
    const video = host.querySelector('video');
    const play = host.querySelector('.review-video__play');
    // The poster is a still image until the visitor chooses to play. Native
    // controls are then enabled, including seek, volume and fullscreen.
    video.controls = false;
    play.addEventListener('click', () => {
      video.controls = true;
      video.play().then(() => video.focus({preventScroll:true})).catch(() => { play.hidden = false; });
    });
    video.addEventListener('play', () => { play.hidden = true; });
    video.addEventListener('pause', () => { play.hidden = false; });
    video.addEventListener('ended', () => { play.hidden = false; });
    // Keep the page's floating consultation action clear of native controls.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        document.body.classList.toggle('is-review-in-view', entries.some(entry => entry.isIntersecting));
      }, {threshold:.35}).observe(video);
    }
    if (host.dataset.realReview === 'programme') {
      const section = host.closest('.cd-reviews');
      section.hidden = false;
      section.removeAttribute('aria-labelledby');
      section.setAttribute('aria-label', 'วิดีโอรีวิวจากผู้ใช้บริการ');
      section.querySelector('.cd-section-head').hidden = true;
    }
  });
})();

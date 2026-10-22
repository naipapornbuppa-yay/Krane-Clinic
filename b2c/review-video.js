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
        <div class="review-video__player"><video controls autoplay muted loop playsinline preload="metadata" width="540" height="960" poster="assets/reviews/confidence-real-med-poster.jpg" aria-label="วิดีโอรีวิวจากผู้ใช้บริการ" aria-describedby="review-video-note">
          <source src="assets/reviews/confidence-real-med.mp4" type="video/mp4">
          <a href="assets/reviews/confidence-real-med.mp4">เปิดวิดีโอรีวิว</a>
        </video></div>
      </div>
      <div class="review-video__copy">
        <p class="cd-review__quote">“ตอนนี้ก็มั่นใจขึ้นเยอะ<br>คิดว่าเรามาถูกทางแล้ว”</p>
        <p class="cd-fine"><b>ผู้ใช้บริการ Krane</b></p>
        <p class="cd-fine review-video__note" id="review-video-note">ประสบการณ์เฉพาะบุคคล ผลลัพธ์อาจแตกต่างกัน</p>
      </div>
    </article>`;
    host.hidden = false;
    const video = host.querySelector('video');
    video.controls = true;
    video.muted = true;
    video.defaultMuted = true;
    let inView = false, userPaused = false, visibilityPause = false;
    const start = () => { if(!userPaused) video.play().catch(()=>{}); };
    const pauseForVisibility = () => {
      if(!video.paused){visibilityPause=true;video.pause();}
    };
    video.addEventListener('play',()=>{userPaused=false;visibilityPause=false;});
    video.addEventListener('pause',()=>{
      if(visibilityPause){visibilityPause=false;return;}
      if(!document.hidden)userPaused=true;
    });
    video.addEventListener('loadeddata',()=>{if(inView&&!document.hidden)start();});
    const update = visible => {
      inView = visible;
      document.body.classList.toggle('is-review-in-view',visible);
      if(visible&&!document.hidden)start();else pauseForVisibility();
    };
    if('IntersectionObserver'in window){
      new IntersectionObserver(entries=>update(entries.some(entry=>entry.isIntersecting)),{threshold:.2}).observe(video);
    }else update(true);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseForVisibility();else if(inView)start();});
    if (host.dataset.realReview === 'programme') {
      const section = host.closest('.cd-reviews');
      section.hidden = false;
      section.querySelector('.cd-section-head').hidden = false;
    }
  });
})();

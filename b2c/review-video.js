/* Render only the supplied reviews belonging to this programme. */
(() => {
 const key=new URLSearchParams(location.search).get('condition')||'weight';
 const category=key==='ed'?'re-flow':key;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const visibleVideos=new Set(),visibleComparisons=new Set();
 document.querySelectorAll('[data-real-review]').forEach(host=>{
  const reviews=(window.KraneReviews||[]).filter(item=>host.dataset.realReview!=='programme'||item.category===category);if(!reviews.length)return;
  host.classList.add('review-video__collection');host.tabIndex=0;
  host.innerHTML=reviews.map((item,index)=>`<article class="cd-review cd-review--story review-video" data-review-id="${item.id}"><div class="cd-review__story-media review-video__media"><div class="review-video__player"><video controls muted loop playsinline preload="none" width="540" height="960" poster="${item.poster}" aria-label="${escape(item.caption)}" aria-describedby="review-video-note-${index}"><source src="${item.src}" type="video/mp4"><a href="${item.src}">เปิดวิดีโอรีวิว</a></video></div></div><div class="review-video__copy"><p class="cd-review__quote">${item.quote?'“'+escape(item.quote).replace(/&lt;br&gt;/g,'<br>')+'”':escape(item.caption)}</p><p class="cd-fine"><b>${escape(item.name)}</b></p><p class="cd-fine review-video__note" id="review-video-note-${index}">ประสบการณ์เฉพาะบุคคล ผลลัพธ์อาจแตกต่างกัน</p></div></article>`+(item.before&&item.after?`<article class="cd-review review-video review-video--comparison" data-review-id="${item.id}" data-review-comparison><div class="review-video__photos"><figure><img src="${item.before}" alt="" loading="lazy"><figcaption>ก่อน</figcaption></figure><figure><img src="${item.after}" alt="" loading="lazy"><figcaption>${item.exampleMonths?`หลัง ${item.exampleMonths} เดือน<small class="review-example-period">ข้อมูลตัวอย่าง</small>`:"หลัง"}</figcaption></figure></div><p class="cd-fine">${escape(item.name)}</p></article>`:'')).join('');
  host.hidden=false;
  const cards=[...host.children];
  if(cards.length>1){
   const dots=document.createElement('nav');dots.className='review-video__dots';dots.setAttribute('aria-label','เลือกวิดีโอรีวิว');
   const go=index=>host.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
   cards.forEach((card,index)=>{const item=reviews.find(item=>item.id===card.dataset.reviewId);const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',card.hasAttribute('data-review-comparison')?'ภาพก่อนและหลัง':item.caption);button.addEventListener('click',()=>go(index));dots.append(button)});host.after(dots);
   const sync=()=>{let current=0;cards.forEach((card,index)=>{if(Math.abs(card.offsetLeft-cards[0].offsetLeft-host.scrollLeft)<Math.abs(cards[current].offsetLeft-cards[0].offsetLeft-host.scrollLeft))current=index});[...dots.children].forEach((button,index)=>{button.classList.toggle('is-current',index===current);if(index===current)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current')});return current};
   host.addEventListener('scroll',sync,{passive:true});host.addEventListener('keydown',event=>{if(event.target!==host||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();go(Math.max(0,Math.min(cards.length-1,sync()+(event.key==='ArrowRight'?1:-1))))});sync();
  }
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(isIntersecting)visibleComparisons.add(target);else visibleComparisons.delete(target)});document.body.classList.toggle('is-review-in-view',visibleVideos.size+visibleComparisons.size>0)},{threshold:.3});host.querySelectorAll('[data-review-comparison]').forEach(card=>observer.observe(card))}
  host.querySelectorAll('video').forEach(video=>{
   video.muted=true;video.defaultMuted=true;let inView=false,userPaused=false,visibilityPause=false;
   const start=()=>{if(!userPaused)video.play().catch(()=>{})};
   const pause=()=>{if(!video.paused){visibilityPause=true;video.pause()}};
   video.addEventListener('play',()=>{userPaused=false;visibilityPause=false});video.addEventListener('pause',()=>{if(visibilityPause){visibilityPause=false;return}if(!document.hidden)userPaused=true});video.addEventListener('loadeddata',()=>{if(inView&&!document.hidden)start()});
   const update=visible=>{inView=visible;if(visible)visibleVideos.add(video);else visibleVideos.delete(video);document.body.classList.toggle('is-review-in-view',visibleVideos.size+visibleComparisons.size>0);if(visible&&!document.hidden)start();else pause()};
   if('IntersectionObserver'in window)new IntersectionObserver(entries=>update(entries.some(entry=>entry.isIntersecting)),{threshold:.5}).observe(video);else update(true);
   document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(inView)start()});
  });
  if(host.dataset.realReview==='programme'){const section=host.closest('.cd-reviews');section.hidden=false;section.querySelector('.cd-section-head').hidden=false}
 });
})();

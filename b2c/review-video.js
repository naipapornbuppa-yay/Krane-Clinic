/* Render only the supplied reviews belonging to this programme. */
(() => {
 const key=new URLSearchParams(location.search).get('condition')||'weight';
 const category=key==='ed'?'re-flow':key;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const visibleVideos=new Set(),visibleComparisons=new Set();
 document.querySelectorAll('[data-real-review]').forEach(host=>{
  const reviews=(window.KraneReviews||[]).filter(item=>host.dataset.realReview!=='programme'||item.category===category);if(!reviews.length)return;
  host.classList.add('review-video__collection');host.tabIndex=0;
  host.innerHTML=reviews.map((item,index)=>`<article class="cd-review cd-review--story review-video" data-review-id="${item.id}"><div class="cd-review__story-media review-video__media"><div class="review-video__player"><video controls muted loop playsinline preload="none" width="540" height="960" poster="${item.poster}" aria-label="${escape(item.caption)}" aria-describedby="review-video-note-${index}"><source src="${item.src}" type="video/mp4"><a href="${item.src}">เปิดวิดีโอรีวิว</a></video></div></div><div class="review-video__copy"><p class="cd-review__quote">${item.quote?'“'+escape(item.quote).replace(/&lt;br&gt;/g,'<br>')+'”':escape(item.caption)}</p><p class="cd-fine"><b>${escape(item.name)}</b></p><p class="cd-fine review-video__note" id="review-video-note-${index}">ประสบการณ์เฉพาะบุคคล ผลลัพธ์อาจแตกต่างกัน</p><p class="cd-fine">ชื่อและรายละเอียดผู้รีวิวบางส่วนเป็นข้อมูลตัวอย่าง</p></div></article>`+(item.before&&item.after?`<article class="cd-review review-video review-video--comparison" data-review-id="${item.id}" data-review-comparison><div class="review-video__photos"><figure><img src="${item.before}" alt="" loading="lazy"><figcaption>ก่อน</figcaption></figure><figure><img src="${item.after}" alt="" loading="lazy"><figcaption>${item.exampleMonths?`หลัง ${item.exampleMonths} เดือน<small class="review-example-period">ข้อมูลตัวอย่าง</small>`:"หลัง"}</figcaption></figure></div><p class="cd-fine">${escape(item.name)}</p></article>`:'')).join('');
  // Each person owns one card; their media rotates inside that card.
  host.querySelectorAll('[data-review-comparison]').forEach(card=>card.remove());
  host.querySelectorAll('.review-video__copy').forEach(copy=>copy.remove());
  host.hidden=false;
  const shell=document.createElement('div');shell.className='review-video__shell';host.before(shell);shell.append(host);

  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let hovered=false,touching=false,inViewport=false,lastTime=0,direction=1,position=0;
  const dialog=document.createElement('dialog');dialog.className='review-video__dialog';
  dialog.setAttribute('aria-label','วิดีโอรีวิวฉบับเต็ม');
  dialog.innerHTML='<button type="button" class="review-video__close" aria-label="ปิดวิดีโอ">×</button><video controls playsinline preload="none"></video>';
  document.body.append(dialog);const fullVideo=dialog.querySelector('video');let opener=null;
  const close=()=>dialog.close();dialog.querySelector('button').onclick=close;
  dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
  dialog.addEventListener('close',()=>{fullVideo.pause();fullVideo.removeAttribute('src');fullVideo.load();opener?.focus({preventScroll:true})});
  const openVideo=(video,card)=>{opener=card;fullVideo.src=video.querySelector('source').src;fullVideo.poster=video.poster;dialog.showModal();fullVideo.play().catch(()=>{})};
  host.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')hovered=true});host.addEventListener('pointerleave',()=>hovered=false);
  host.addEventListener('pointerdown',()=>touching=true);window.addEventListener('pointerup',()=>touching=false);window.addEventListener('pointercancel',()=>touching=false);
  host.addEventListener('scroll',()=>{position=host.scrollLeft},{passive:true});
  host.addEventListener('keydown',event=>{if(event.target===host&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();host.scrollBy({left:event.key==='ArrowRight'?320:-320,behavior:'smooth'})}});
  new IntersectionObserver(entries=>{inViewport=entries.some(e=>e.isIntersecting)},{threshold:.1}).observe(host);
  const tick=time=>{const dt=Math.min(time-lastTime,50);lastTime=time;
   if(inViewport&&!document.hidden&&!reduced.matches&&!hovered&&!touching&&!dialog.open&&!host.contains(document.activeElement)){
    const max=host.scrollWidth-host.clientWidth;if(max>0){position+=direction*dt*.025;if(position>=max){position=max;direction=-1}else if(position<=0){position=0;direction=1}host.scrollLeft=position;}
   }requestAnimationFrame(tick);
  };requestAnimationFrame(tick);
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(isIntersecting)visibleComparisons.add(target);else visibleComparisons.delete(target)});document.body.classList.toggle('is-review-in-view',visibleVideos.size+visibleComparisons.size>0)},{threshold:.3});host.querySelectorAll('[data-review-comparison]').forEach(card=>observer.observe(card))}
  host.querySelectorAll('video').forEach(video=>{
   video.muted=true;video.defaultMuted=true;video.controls=false;
   const card=video.closest('.review-video');card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','เปิดวิดีโอเต็ม: '+video.getAttribute('aria-label'));video.tabIndex=-1;
   card.addEventListener('click',()=>{if(!card.dataset.storyKind||card.dataset.storyKind==='video')openVideo(video,card)});card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!card.dataset.storyKind||card.dataset.storyKind==='video')openVideo(video,card)}});
   let inView=false,userPaused=false,visibilityPause=false;
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

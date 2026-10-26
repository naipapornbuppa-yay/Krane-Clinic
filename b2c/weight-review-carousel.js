/* Show each person's video, quote and photographs together. */
(()=>{const reduced=matchMedia('(prefers-reduced-motion:reduce)');
document.querySelectorAll('[data-interview-reviews]').forEach(section=>{
 const privateReview=Boolean(section.closest('#ed-program'));
 const slides=[...section.querySelectorAll('[data-interview-slide]')];const ids=[...new Set(slides.map(s=>s.dataset.reviewId))];
 const groups=ids.map(id=>{const own=slides.filter(s=>s.dataset.reviewId===id);return {id,video:own.find(s=>s.dataset.reviewKind==='video')?.querySelector('video'),quote:own.find(s=>s.dataset.reviewKind==='quote')?.querySelector('blockquote'),photos:own.find(s=>s.dataset.reviewKind==='comparison')?.querySelector('.weight-story-gallery__photos')};});
 section.replaceChildren();section.classList.add('story-blocks');
 const panels=document.createElement('div');panels.className='story-blocks__panels';const tabs=document.createElement('div');tabs.className='story-blocks__dots';tabs.setAttribute('aria-label','เลือกเรื่องราวผู้ใช้บริการ');let active=0,visible=false;
 const sync=()=>{groups.forEach((g,i)=>{const on=i===active;g.panel.hidden=!on;g.button.setAttribute('aria-pressed',String(on));if(g.video){if(on&&visible&&!reduced.matches)g.video.play().catch(()=>{});else g.video.pause();}});};
 groups.forEach((g,i)=>{const panel=document.createElement('div');panel.className='story-blocks__panel';panel.dataset.reviewId=g.id;if(!g.photos)panel.classList.add('story-blocks__panel--no-photos');
 if(privateReview){g.video=null;panel.classList.add('story-blocks__panel--private');}
 if(g.video){g.video.controls=true;g.video.muted=true;g.video.loop=true;g.video.playsInline=true;const media=document.createElement('div');media.className='story-blocks__video';media.append(g.video);panel.append(media);}
 if(g.quote){if(privateReview){const cite=g.quote.querySelector('cite');if(cite)cite.textContent='คุณ ต. · 35 ปี';}g.quote.className='story-blocks__quote';panel.append(g.quote);}
 if(g.photos){g.photos.className='story-blocks__photos';if(g.id==='hair-pha')g.photos.classList.add('story-blocks__photos--single-after');panel.append(g.photos);}
 const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','ดูเคสที่ '+(i+1));button.addEventListener('click',()=>{active=i;sync()});g.panel=panel;g.button=button;panels.append(panel);tabs.append(button);
 });section.append(panels);if(privateReview){const packaging=section.closest('#ed-program')?.querySelector('.care-packaging-placeholder');if(packaging)section.append(packaging);}const programme=section.closest('.program-section');const legal=programme?.querySelector('.program-section__legal');
 if(legal){const footer=document.createElement('div');footer.className='story-blocks__footer';legal.before(footer);footer.append(legal);if(groups.length>1)footer.append(tabs)}
 const mobile=matchMedia('(max-width:760px)');
 const placeDots=()=>{if(groups.length<2)return;if(mobile.matches)section.append(tabs);else programme?.querySelector('.story-blocks__footer')?.append(tabs)};
 placeDots();mobile.addEventListener('change',placeDots);
 sync();
 let timer;
 const stop=()=>clearInterval(timer);
 const start=()=>{stop();if(!window.KraneCarouselShared&&groups.length>1&&visible&&!document.hidden&&!reduced.matches)timer=setInterval(()=>{if(section.matches(':focus-within')||tabs.matches(':focus-within'))return;active=(active+1)%groups.length;sync()},10000)};
 tabs.addEventListener('click',start);reduced.addEventListener('change',start);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start()});window.addEventListener('pagehide',stop,{once:true});
 new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();start()},{threshold:.15}).observe(section);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)groups.forEach(g=>g.video?.pause());else sync()});
});})();

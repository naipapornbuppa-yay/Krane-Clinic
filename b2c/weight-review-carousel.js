/* Show each person's video, quote and photographs together. */
(()=>{const reduced=matchMedia('(prefers-reduced-motion:reduce)');
document.querySelectorAll('[data-interview-reviews]').forEach(section=>{
 const slides=[...section.querySelectorAll('[data-interview-slide]')];const ids=[...new Set(slides.map(s=>s.dataset.reviewId))];
 const groups=ids.map(id=>{const own=slides.filter(s=>s.dataset.reviewId===id);return {id,video:own.find(s=>s.dataset.reviewKind==='video')?.querySelector('video'),quote:own.find(s=>s.dataset.reviewKind==='quote')?.querySelector('blockquote'),photos:own.find(s=>s.dataset.reviewKind==='comparison')?.querySelector('.weight-story-gallery__photos')};});
 section.replaceChildren();section.classList.add('story-blocks');
 const panels=document.createElement('div');panels.className='story-blocks__panels';let active=0,visible=false;
 const sync=()=>{groups.forEach((g,i)=>{const on=i===active;g.panel.hidden=!on;if(g.video){if(on&&visible&&!reduced.matches)g.video.play().catch(()=>{});else g.video.pause();}});};
 groups.forEach((g,i)=>{const panel=document.createElement('div');panel.className='story-blocks__panel';if(!g.photos)panel.classList.add('story-blocks__panel--no-photos');
 if(g.video){g.video.controls=true;g.video.muted=true;g.video.loop=true;g.video.playsInline=true;const media=document.createElement('div');media.className='story-blocks__video';media.append(g.video);panel.append(media);}
 if(g.quote){g.quote.className='story-blocks__quote';panel.append(g.quote);}
 if(g.photos){g.photos.className='story-blocks__photos';if(g.id==='hair-pha')g.photos.classList.add('story-blocks__photos--single-after');panel.append(g.photos);}
 if(groups.length>1)g.quote?.querySelector('cite')?.remove();g.panel=panel;panels.append(panel);
 });section.append(panels);sync();
 new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync()},{threshold:.15}).observe(section);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)groups.forEach(g=>g.video?.pause());else sync()});
});})();

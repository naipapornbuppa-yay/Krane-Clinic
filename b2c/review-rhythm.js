/* Shared review rhythm: same-person faces, staggered and motion-aware. */
(()=>{
 const demoNotice=document.createElement('p');demoNotice.textContent='เว็บไซต์สาธิต · อายุ จังหวัด ระยะเวลา คะแนน และภาพ AI บางส่วนเป็นข้อมูลสมมติ ไม่ใช่ผลการรักษาที่รับรอง';demoNotice.style.cssText='margin:24px auto;padding:12px 24px;max-width:1100px;text-align:center;font-size:12px;line-height:1.6;color:#596477';const footer=document.querySelector('[data-site-footer]');if(footer)footer.before(demoNotice);else document.body.append(demoNotice);
 const data=window.KraneReviews||[],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const attribution=item=>[item.category==='re-flow'?'คุณ '+(item.name||'').replace(/^คุณ\s*/,'').slice(0,1)+'.':item.name,item.age?`${item.age} ปี`:'อายุ —',item.province||'จังหวัด —'].filter(Boolean).join(' · ');
 // The landing wall has its own composition; programme review cards keep their rhythm below.
 const landing=document.querySelector('#reviews.reviews'),collage=landing?.querySelector('.review-collage');
 if(collage&&data.length){
  const sourceCards=new Map();
  collage.querySelectorAll('figure[data-review-id]').forEach(card=>{if(!sourceCards.has(card.dataset.reviewId))sourceCards.set(card.dataset.reviewId,card)});
  const items=data.filter(item=>sourceCards.has(item.id));
  if(items.length){
   landing.dataset.verticalGallery='true';
   const copy=landing.querySelector('.reviews__copy'),wall=document.createDocumentFragment(),cards=[],tracks=[];
   const namesEn={'weight-02':'May','weight-04':'Ploy','weight-05':'Fon','hair-pha':'Pha','hair-03':'Pang','confidence-real-med':'T.'};
   let active=Math.min(1,items.length-1),paused=false,inView=false,hovered=false,focused=false,touching=false;
   const open=(item,trigger)=>document.dispatchEvent(new CustomEvent('krane:open-review-stories',{detail:{items:items.map(review=>({...review,attribution:attribution(review)})),activeId:item.id,trigger}}));
   const makeCard=(item,clone=false)=>{
    const card=sourceCards.get(item.id).cloneNode(true),video=card.querySelector('video');
    card.className='review-vertical-card';card.dataset.startFace='video';card.dataset.storyKind='video';
    card.removeAttribute('aria-hidden');card.setAttribute('role','button');card.tabIndex=-1;
    if(clone){card.dataset.loopClone='true';card.setAttribute('aria-hidden','true')}
    video.controls=false;video.tabIndex=-1;video.muted=true;video.defaultMuted=true;
    const name=document.createElement('figcaption');name.className='review-vertical-name';
    const play=document.createElement('span');play.className='review-vertical-play';play.setAttribute('aria-hidden','true');play.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 5 11 7-11 7z"/></svg>';
    card.append(name,play);
    card.addEventListener('click',()=>open(item,clone?watch:card));
    card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open(item,card)}});
    cards.push({card,video,item,clone,visible:false});return card;
   };
   for(let column=0;column<3;column++){
    const rail=document.createElement('div');rail.className='review-vertical-rail';
    const track=document.createElement('div');track.className='review-vertical-track';track.style.setProperty('--review-column',column);
    const originals=document.createElement('div');originals.className='review-vertical-set';
    const selected=items.filter((_,i)=>i%3===column);selected.forEach(item=>originals.append(makeCard(item)));
    track.append(originals);
    // Repeated previews are pointer-playable but never repeated in the keyboard or screen-reader order.
    for(let repeat=0;repeat<2;repeat++){const set=document.createElement('div');set.className='review-vertical-set';set.setAttribute('aria-hidden','true');selected.forEach(item=>set.append(makeCard(item,true)));track.append(set)}
    rail.append(track);wall.append(rail);tracks.push(track);
   }
   collage.replaceChildren(wall);
   const excerpts=document.createElement('div');excerpts.className='review-vertical-excerpts';
   items.forEach((item,i)=>{const panel=document.createElement('div');panel.className='review-vertical-excerpt';panel.id='review-excerpt-'+item.id;panel.hidden=i!==active;panel.innerHTML=`<blockquote>${item.quote?'“'+esc(item.quote).replace(/&lt;br&gt;/g,'<br>')+'”':esc(item.caption)}</blockquote><cite>${esc(attribution(item))}</cite>`;excerpts.append(panel)});
   const controls=document.createElement('div');controls.className='review-vertical-controls';
   const previous=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span'),watch=document.createElement('button'),motion=document.createElement('button');
   previous.type=next.type=watch.type=motion.type='button';previous.className=next.className='review-vertical-arrow';
   previous.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>';
   next.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg>';
   count.className='review-vertical-count';count.setAttribute('aria-live','polite');watch.className='review-vertical-watch';motion.className='review-vertical-motion';
   controls.append(previous,count,next,watch,motion);copy.append(excerpts,controls);
   const render=()=>{
    const en=document.documentElement.lang==='en';
    collage.setAttribute('aria-label',en?'Member review videos':'วิดีโอรีวิวจากสมาชิก');
    previous.setAttribute('aria-label',en?'Previous review':'รีวิวก่อนหน้า');next.setAttribute('aria-label',en?'Next review':'รีวิวถัดไป');
    watch.textContent=en?'Watch video':'ดูวิดีโอ';watch.setAttribute('aria-controls','review-excerpt-'+items[active].id);
    motion.hidden=reduced.matches;motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?(en?'Resume gallery motion':'เริ่มการเคลื่อนไหวแกลเลอรี'):(en?'Pause gallery motion':'หยุดการเคลื่อนไหวแกลเลอรี'));
    motion.innerHTML=paused?'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
    count.textContent=(active+1)+' / '+items.length;
    cards.forEach(({card,video,item})=>{card.setAttribute('aria-label',en?'Watch review: '+namesEn[item.id]:'ดูรีวิว: '+(item.category==='re-flow'?'คุณ ต.':item.name));card.querySelector('figcaption').textContent=en?namesEn[item.id]:(item.category==='re-flow'?'คุณ ต.':item.name);video.setAttribute('aria-label',en?'Review video: '+namesEn[item.id]:item.caption)});
   };
   const sync=()=>{
    const dialogOpen=document.documentElement.classList.contains('pc-story-is-open');
    const running=inView&&!document.hidden&&!reduced.matches&&!paused&&!hovered&&!focused&&!touching&&!dialogOpen;
    landing.dataset.galleryRunning=String(running);landing.dataset.galleryPaused=String(paused);
    tracks.forEach(track=>track.style.animationPlayState=running?'running':'paused');
    cards.forEach(state=>{const canPlay=state.visible&&inView&&!document.hidden&&!reduced.matches&&!paused&&!dialogOpen;if(canPlay){state.video.play().catch(()=>{})}else state.video.pause()});
   };
   const select=direction=>{active=(active+direction+items.length)%items.length;[...excerpts.children].forEach((panel,i)=>panel.hidden=i!==active);render()};
   previous.addEventListener('click',()=>select(-1));next.addEventListener('click',()=>select(1));watch.addEventListener('click',()=>open(items[active],watch));
   motion.addEventListener('click',()=>{paused=!paused;render();sync()});
   collage.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;sync()}});collage.addEventListener('pointerleave',()=>{hovered=false;sync()});
   collage.addEventListener('pointerdown',()=>{touching=true;sync()});window.addEventListener('pointerup',()=>{touching=false;sync()});window.addEventListener('pointercancel',()=>{touching=false;sync()});
   collage.addEventListener('focusin',()=>{focused=true;sync()});collage.addEventListener('focusout',()=>{focused=collage.contains(document.activeElement);queueMicrotask(()=>{focused=collage.contains(document.activeElement);sync()})});
   new IntersectionObserver(entries=>{inView=entries.some(entry=>entry.isIntersecting);sync()},{threshold:.05}).observe(collage);
   const visibility=new IntersectionObserver(entries=>{entries.forEach(entry=>{const state=cards.find(value=>value.card===entry.target);state.visible=entry.isIntersecting;state.card.tabIndex=!state.clone&&(reduced.matches||entry.intersectionRatio>.97)?0:-1});sync()},{threshold:[0,.05,.98],root:collage});cards.forEach(state=>visibility.observe(state.card));
   // Prevent the shared media initializer or story-viewer resume from bypassing an explicit pause.
   cards.forEach(state=>state.video.addEventListener('play',()=>{if(paused||reduced.matches||!inView||!state.visible||document.hidden||document.documentElement.classList.contains('pc-story-is-open'))state.video.pause()}));
   const measure=()=>tracks.forEach(track=>{const first=track.children[0],second=track.children[1];track.style.setProperty('--review-loop-height',(second.offsetTop-first.offsetTop)+'px')});
   new ResizeObserver(measure).observe(collage);measure();
   reduced.addEventListener('change',()=>{render();sync();cards.forEach(state=>{if(!state.clone&&reduced.matches)state.card.tabIndex=0})});
   document.addEventListener('visibilitychange',sync);document.addEventListener('krane:languagechange',render);
   new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
   render();sync();
  }
 }
 document.querySelectorAll('.weight-story-gallery__video-copy,.review-video__copy').forEach(e=>e.remove());
 document.querySelectorAll('.weight-story-gallery__quote-slide[data-review-id],.story-blocks__panel[data-review-id]').forEach(slide=>{const item=data.find(i=>i.id===slide.dataset.reviewId);if(!item)return;const cite=slide.querySelector('cite');if(cite)cite.textContent=attribution(item)});
 document.querySelectorAll('.weight-story-gallery__photos figcaption,.review-video__photos figcaption,.review-video--comparison>.cd-fine').forEach(e=>e.remove());
 // Group each person's initial video, quotation and matching photos together.
 document.querySelectorAll('.review-marquee__set').forEach(set=>{
  [...set.children].forEach(card=>{const item=data.find(i=>i.id===card.dataset.reviewId);if(!item)return;card.dataset.startFace='video';let last=card;
   ['quote'].forEach(kind=>{if(kind==='quote'&&!(item.quote||item.caption)||kind==='comparison'&&!(item.before&&item.after))return;const copy=card.cloneNode(true);copy.dataset.startFace=kind;last.after(copy);last=copy});
  });
 });
 // Alternate available video and quotation cards; keep each card fixed.
 document.querySelectorAll('.review-video__collection,.review-marquee__set').forEach(host=>{
  const videos=[...host.children].filter(c=>c.dataset.startFace==='video'),quotes=[...host.children].filter(c=>c.dataset.startFace==='quote');
  while(videos.length||quotes.length){if(videos.length)host.append(videos.shift());if(quotes.length)host.append(quotes.shift())}
 });
 // Existing programme galleries already rotate within their own frame.
 const cards=[...document.querySelectorAll('.review-video[data-review-id],.review-marquee__set figure[data-review-id]')];
 const tones={weight:'#be7d61','hair-loss':'#7ea99e','re-flow':'#1c3e56'};
 const states=[];
 cards.forEach((card,index)=>{
  const item=data.find(i=>i.id===card.dataset.reviewId),video=card.querySelector('video');if(!item||!video)return;
  video.controls=false;
  if(card.closest('.review-marquee')){
   card.tabIndex=card.closest('[aria-hidden=true]')?-1:0;
   const open=event=>{if(card.dataset.storyKind!=='video'||event.target.closest('.review-rhythm-selector'))return;event.preventDefault();event.stopImmediatePropagation();
    document.dispatchEvent(new CustomEvent('krane:open-review-stories',{detail:{items:data.map(review=>({...review,attribution:attribution(review)})),activeId:item.id,trigger:card}}));
   };card.addEventListener('click',open,true);card.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))open(event)},true);
  }
  card.classList.add('review-rhythm-card');card.style.setProperty('--review-tone',tones[item.category]||'#395aa4');
  const faces=['video'];
  if(item.quote||item.caption){const face=document.createElement('div');face.className='review-rhythm-face review-rhythm-quote';face.dataset.face='quote';if(!item.quote)face.classList.add('review-rhythm-summary');face.innerHTML=`<blockquote><p>${item.quote?'“'+esc(item.quote).replace(/&lt;br&gt;/g,'<br>')+'”':esc(item.caption)}</p><cite>${esc(attribution(item))}</cite></blockquote>`;card.append(face);faces.push('quote')}
  // Prefer video / quotation / comparison across neighbouring people.
  const desired=card.dataset.startFace||'video';let active=faces.includes(desired)?faces.indexOf(desired):index%faces.length;
  let visible=false,elapsed=0;const interval=7000+(index%3)*1200;
  const show=()=>{const kind=faces[active];card.dataset.storyKind=kind;card.querySelectorAll('[data-face]').forEach(f=>f.hidden=f.dataset.face!==kind);video.style.visibility=kind==='video'?'visible':'hidden';if(kind!=='video'||!visible||document.hidden)video.pause();else if(!reduced.matches)video.play().catch(()=>{});if(card.classList.contains('review-video')){card.setAttribute('role',kind==='video'?'button':'group');card.setAttribute('aria-label',kind==='video'?'เปิดวิดีโอเต็ม: '+item.name:kind==='quote'?'คำพูดของ '+item.name:'ภาพก่อนและหลังของ '+item.name)}};
  // Keep hidden faces silent even when an existing visibility observer tries to play.
  video.addEventListener('play',()=>{if(card.dataset.storyKind!=='video')video.pause()});
  new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);show()},{threshold:.15}).observe(card);
  show();
 });
 // One quiet note per review section, rather than repeated copy over videos.
 document.querySelectorAll('.cd-reviews,#reviews.reviews').forEach(section=>{if(section.querySelector('.review-rhythm-note'))return;const p=document.createElement('p');p.className='review-rhythm-note';p.textContent='ประสบการณ์เฉพาะบุคคล ผลลัพธ์อาจแตกต่างกัน';(section.dataset.verticalGallery?section.querySelector('.reviews__copy'):section).append(p)});
})();

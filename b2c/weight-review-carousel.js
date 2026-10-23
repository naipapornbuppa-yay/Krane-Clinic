/* Each speaker stays together: quotation, video, then supplied photo pair. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 document.querySelectorAll('[data-interview-reviews]').forEach(section=>{
  const viewport=section.querySelector('[data-interview-viewport]'),slides=[...section.querySelectorAll('[data-interview-slide]')],dots=[...section.querySelectorAll('[data-interview-go]')];
  if(!slides.length)return;
  const track=slides[0].parentElement;
  const ordered=[];const ids=[...new Set(slides.map(s=>s.dataset.reviewId))];
  ids.forEach(id=>['video','quote','comparison'].forEach(kind=>ordered.push(...slides.filter(s=>s.dataset.reviewId===id&&s.dataset.reviewKind===kind))));
  slides.splice(0,slides.length,...ordered);slides.forEach(slide=>track.append(slide));
  const paused=new WeakSet(),internalPause=new WeakSet();
  const copy=slide=>{const node=slide.cloneNode(true);node.removeAttribute('data-interview-slide');node.setAttribute('data-interview-clone','');node.setAttribute('aria-hidden','true');node.inert=true;node.querySelectorAll('video').forEach(v=>{v.removeAttribute('controls');v.preload='none'});return node};
  track.prepend(copy(slides.at(-1)));track.append(copy(slides[0]));
  let active=0,visible=false,moving=false,scrollTimer=0,autoTimer=0,autoPaused=false;
  const autoButton=document.createElement('button');autoButton.type='button';autoButton.className='weight-story-gallery__auto';section.querySelector('.weight-testimonials__controls').append(autoButton);
  const syncAuto=()=>{const en=document.documentElement.lang==='en';autoButton.textContent=autoPaused?'▶':'Ⅱ';autoButton.setAttribute('aria-label',autoPaused?(en?'Resume automatic slides':'เล่นสไลด์อัตโนมัติ'):(en?'Pause automatic slides':'หยุดสไลด์อัตโนมัติ'));autoButton.setAttribute('aria-pressed',String(autoPaused))};
  const schedule=()=>{clearTimeout(autoTimer);if(!visible||document.hidden||reduced.matches||autoPaused||(section.matches(':focus-within')||section.matches(':hover')))return;const slide=slides[active];if(slide.querySelector('video'))return;autoTimer=setTimeout(()=>go(active+1),slide.classList.contains('weight-story-gallery__quote-slide')?6000:7000)};
  autoButton.addEventListener('click',()=>{autoPaused=!autoPaused;syncAuto();schedule()});syncAuto();
  section.addEventListener('pointerenter',()=>clearTimeout(autoTimer));section.addEventListener('pointerleave',schedule);
  section.addEventListener('focusin',()=>clearTimeout(autoTimer));section.addEventListener('focusout',()=>setTimeout(schedule,0));
  const jump=left=>viewport.scrollTo({left,behavior:'instant'});
  const pauseVideo=v=>{if(!v.paused){internalPause.add(v);v.pause()}};
  const playVideo=()=>slides.forEach((slide,i)=>slide.querySelectorAll('video').forEach(v=>{if(visible&&i===active&&!document.hidden&&!reduced.matches&&!paused.has(v))v.play().catch(()=>{});else pauseVideo(v)}));
  const select=index=>{active=(index+slides.length)%slides.length;section.dataset.interviewActive=active;slides.forEach((slide,i)=>{slide.setAttribute('aria-hidden',String(i!==active));slide.inert=i!==active});dots.forEach((dot,i)=>{dot.classList.toggle('is-current',i===active);if(i===active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')});playVideo();schedule()};
  const go=index=>{if(moving||index===active)return;const physical=index<0?0:index>=slides.length?slides.length+1:index+1;moving=true;select(index);viewport.scrollTo({left:physical*viewport.clientWidth,behavior:reduced.matches?'instant':'smooth'})};
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
  section.querySelector('[data-interview-prev]').addEventListener('click',()=>go(active-1));section.querySelector('[data-interview-next]').addEventListener('click',()=>go(active+1));
  viewport.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const physical=Math.round(viewport.scrollLeft/viewport.clientWidth);select(physical-1);if(physical===0||physical===slides.length+1)jump((active+1)*viewport.clientWidth);moving=false},160)},{passive:true});
  viewport.addEventListener('keydown',event=>{if(event.target!==viewport)return;const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(step){event.preventDefault();go(active+step)}});
  slides.forEach(slide=>slide.querySelectorAll('video').forEach(v=>{
   v.loop=false;v.removeAttribute('loop');v.addEventListener('ended',()=>{if(visible&&!autoPaused&&!reduced.matches&&!document.hidden)go(active+1)});
   v.addEventListener('pause',()=>{if(v.ended)return;if(internalPause.has(v)){internalPause.delete(v);return}paused.add(v)});v.addEventListener('play',()=>paused.delete(v));
   const toggle=()=>{if(v.paused){paused.delete(v);v.play().catch(()=>{})}else{paused.add(v);v.pause()}};
   const button=document.createElement('button');button.type='button';button.className='weight-story-gallery__play-toggle';const icon=document.createElement('span');icon.setAttribute('aria-hidden','true');button.append(icon);slide.append(button);
   const syncPlayback=()=>{const en=document.documentElement.lang==='en';button.setAttribute('aria-label',v.paused?(en?'Play video':'เล่นวิดีโอ'):(en?'Pause video':'หยุดวิดีโอ'));icon.textContent=v.paused?'▶':'Ⅱ'};
   button.addEventListener('click',toggle);v.addEventListener('play',syncPlayback);v.addEventListener('pause',syncPlayback);syncPlayback();new MutationObserver(syncPlayback).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
   let touched=0;const transport=e=>e.clientY>=v.getBoundingClientRect().bottom-54;
   v.addEventListener('pointerup',e=>{if(e.pointerType!=='touch'||transport(e))return;e.preventDefault();touched=Date.now();toggle()},{capture:true});
   v.addEventListener('click',e=>{if(Date.now()-touched<700){e.preventDefault();return}if(transport(e))return;e.preventDefault();toggle()});
   v.addEventListener('keydown',e=>{if(e.target!==v||![' ','k','K'].includes(e.key))return;e.preventDefault();toggle()});
   v.addEventListener('volumechange',()=>{if(!v.muted&&v.volume>0)document.querySelectorAll('video').forEach(other=>{if(other!==v)other.muted=true})});
  }));
  const syncLabels=()=>{const en=document.documentElement.lang==='en';dots.forEach((dot,i)=>{if(!dot.dataset.storyLabelTh)dot.dataset.storyLabelTh='สื่อรีวิว '+(i+1)+' จาก '+slides.length;dot.setAttribute('aria-label',en?'Review media '+(i+1)+' of '+slides.length:dot.dataset.storyLabelTh)});section.querySelectorAll('.weight-story-gallery__photos img').forEach((img,i)=>{if(!img.dataset.storyAltTh)img.dataset.storyAltTh=img.alt;img.alt=en?(i%2?'After':'Before')+' photo':img.dataset.storyAltTh})};syncLabels();new MutationObserver(syncLabels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // Advance only visible galleries; respect reduced motion and an explicit pause.
  new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);playVideo();schedule()},{threshold:.15}).observe(section);
  document.addEventListener('visibilitychange',()=>{playVideo();schedule()});reduced.addEventListener('change',()=>{playVideo();schedule()});
  window.addEventListener('resize',()=>{moving=false;jump((active+1)*viewport.clientWidth)},{passive:true});select(0);jump(viewport.clientWidth);
 });
})();

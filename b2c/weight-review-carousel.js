/* Each speaker stays together: video, supplied photo pair, then their story. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 document.querySelectorAll('[data-interview-reviews]').forEach(section=>{
  const viewport=section.querySelector('[data-interview-viewport]'),slides=[...section.querySelectorAll('[data-interview-slide]')],dots=[...section.querySelectorAll('[data-interview-go]')];
  if(!slides.length)return;
  const track=slides[0].parentElement,paused=new WeakSet(),internalPause=new WeakSet();
  const copy=slide=>{const node=slide.cloneNode(true);node.removeAttribute('data-interview-slide');node.setAttribute('data-interview-clone','');node.setAttribute('aria-hidden','true');node.inert=true;node.querySelectorAll('video').forEach(v=>{v.removeAttribute('controls');v.preload='none'});return node};
  track.prepend(copy(slides.at(-1)));track.append(copy(slides[0]));
  let active=0,visible=false,moving=false,scrollTimer=0;
  const jump=left=>viewport.scrollTo({left,behavior:'instant'});
  const pauseVideo=v=>{if(!v.paused){internalPause.add(v);v.pause()}};
  const playVideo=()=>slides.forEach((slide,i)=>slide.querySelectorAll('video').forEach(v=>{if(visible&&i===active&&!document.hidden&&!reduced.matches&&!paused.has(v))v.play().catch(()=>{});else pauseVideo(v)}));
  const select=index=>{active=(index+slides.length)%slides.length;section.dataset.interviewActive=active;slides.forEach((slide,i)=>{slide.setAttribute('aria-hidden',String(i!==active));slide.inert=i!==active});dots.forEach((dot,i)=>{dot.classList.toggle('is-current',i===active);if(i===active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')});playVideo()};
  const go=index=>{if(moving||index===active)return;const physical=index<0?0:index>=slides.length?slides.length+1:index+1;moving=true;select(index);viewport.scrollTo({left:physical*viewport.clientWidth,behavior:reduced.matches?'instant':'smooth'})};
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
  section.querySelector('[data-interview-prev]').addEventListener('click',()=>go(active-1));section.querySelector('[data-interview-next]').addEventListener('click',()=>go(active+1));
  viewport.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const physical=Math.round(viewport.scrollLeft/viewport.clientWidth);select(physical-1);if(physical===0||physical===slides.length+1)jump((active+1)*viewport.clientWidth);moving=false},160)},{passive:true});
  viewport.addEventListener('keydown',event=>{if(event.target!==viewport)return;const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(step){event.preventDefault();go(active+step)}});
  slides.forEach(slide=>slide.querySelectorAll('video').forEach(v=>{
   v.addEventListener('pause',()=>{if(internalPause.has(v)){internalPause.delete(v);return}paused.add(v)});v.addEventListener('play',()=>paused.delete(v));
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
  const syncLabels=()=>{const en=document.documentElement.lang==='en';dots.forEach((dot,i)=>{if(!dot.dataset.storyLabelTh)dot.dataset.storyLabelTh=dot.getAttribute('aria-label');dot.setAttribute('aria-label',en?'Review media '+(i+1)+' of '+slides.length:dot.dataset.storyLabelTh)});section.querySelectorAll('.weight-story-gallery__photos img').forEach((img,i)=>{if(!img.dataset.storyAltTh)img.dataset.storyAltTh=img.alt;img.alt=en?(i%2?'After':'Before')+' photo':img.dataset.storyAltTh})};syncLabels();new MutationObserver(syncLabels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // Manual paging gives people time to read the quote and compare both photos.
  new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);playVideo()},{threshold:.15}).observe(section);
  document.addEventListener('visibilitychange',playVideo);reduced.addEventListener('change',playVideo);
  window.addEventListener('resize',()=>{moving=false;jump((active+1)*viewport.clientWidth)},{passive:true});select(0);jump(viewport.clientWidth);
 });
})();

/* Shared programme quote gallery. Real reviews use their own card controls. */
(()=>{
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  document.querySelectorAll('[data-interview-reviews]').forEach(section=>{
    const viewport=section.querySelector('[data-interview-viewport]'),slides=[...section.querySelectorAll('[data-interview-slide]')],dots=[...section.querySelectorAll('[data-interview-go]')],video=section.querySelector('video'),pause=section.querySelector('[data-interview-pause]');
    const track=slides[0].parentElement;
    // Boundary copies allow the next slide to enter from the same direction.
    const copy=slide=>{const node=slide.cloneNode(true);node.removeAttribute('data-interview-slide');node.setAttribute('data-interview-clone','');node.setAttribute('aria-hidden','true');node.inert=true;node.querySelectorAll('video').forEach(v=>{v.removeAttribute('autoplay');v.preload='none';});return node;};
    track.prepend(copy(slides[slides.length-1]));track.append(copy(slides[0]));
    let moving=false;
    const jump=left=>viewport.scrollTo({left,behavior:'instant'});
    let active=0,timer=0,scrollTimer=0,visible=false,stopped=reduced.matches,dragging=false;
    const clear=()=>clearTimeout(timer);
    const playVideo=()=>{if(!video)return;if(visible&&active===0&&!stopped&&!document.hidden)video.play().catch(()=>{});else video.pause();};
    const schedule=()=>{clear();if(slides.length>1&&visible&&!stopped&&!document.hidden&&!dragging&&!section.contains(document.activeElement))timer=setTimeout(()=>go(active+1),active===0?10000:6000);};
    const select=index=>{active=(index+slides.length)%slides.length;section.dataset.interviewActive=active;slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',String(i!==active)));dots.forEach((dot,i)=>{dot.classList.toggle('is-current',i===active);if(i===active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});playVideo();};
    const go=index=>{if(moving||index===active)return;const physical=index<0?0:index>=slides.length?slides.length+1:index+1;moving=true;select(index);viewport.scrollTo({left:physical*viewport.clientWidth,behavior:reduced.matches?'instant':'smooth'});schedule();};
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
    section.querySelector('[data-interview-prev]').addEventListener('click',()=>go(active-1));
    section.querySelector('[data-interview-next]').addEventListener('click',()=>go(active+1));
    const updatePause=()=>{pause.querySelector('span').textContent=stopped?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(stopped));pause.setAttribute('aria-label',stopped?'เริ่มสลับอัตโนมัติ':'หยุดสลับอัตโนมัติ');};
    pause.addEventListener('click',()=>{stopped=!stopped;updatePause();playVideo();schedule();});updatePause();
    viewport.addEventListener('scroll',()=>{clear();clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const physical=Math.round(viewport.scrollLeft/viewport.clientWidth);select(physical-1);if(physical===0||physical===slides.length+1)jump((active+1)*viewport.clientWidth);moving=false;schedule();},160);},{passive:true});
    viewport.addEventListener('pointerdown',()=>{dragging=true;clear();},{passive:true});
    const release=()=>{dragging=false;schedule();};viewport.addEventListener('pointerup',release,{passive:true});viewport.addEventListener('pointercancel',release,{passive:true});
    viewport.addEventListener('keydown',event=>{if(event.target!==viewport)return;const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(step){event.preventDefault();go(active+step);}});
    section.addEventListener('focusin',clear);section.addEventListener('focusout',()=>setTimeout(schedule,0));
    new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);playVideo();schedule();},{threshold:.15}).observe(section);
    document.addEventListener('visibilitychange',()=>{playVideo();schedule();});
    reduced.addEventListener('change',()=>{stopped=reduced.matches;updatePause();playVideo();schedule();});
    window.addEventListener('resize',()=>{moving=false;jump((active+1)*viewport.clientWidth);},{passive:true});
    select(0);jump(viewport.clientWidth);
  });
})();

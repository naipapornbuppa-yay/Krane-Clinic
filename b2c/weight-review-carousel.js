/* Interview first, then paired comparison images. Stock footage is labelled as a mockup. */
(()=>{
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  document.querySelectorAll('[data-interview-reviews]').forEach(section=>{
    const viewport=section.querySelector('[data-interview-viewport]'),slides=[...section.querySelectorAll('[data-interview-slide]')],dots=[...section.querySelectorAll('[data-interview-go]')],video=section.querySelector('video'),pause=section.querySelector('[data-interview-pause]');
    let active=0,timer=0,scrollTimer=0,visible=false,stopped=reduced.matches,dragging=false;
    const clear=()=>clearTimeout(timer);
    const playVideo=()=>{if(visible&&active===0&&!stopped&&!document.hidden)video.play().catch(()=>{});else video.pause();};
    const schedule=()=>{clear();if(visible&&!stopped&&!document.hidden&&!dragging&&!section.contains(document.activeElement))timer=setTimeout(()=>go(active+1),active===0?10000:6000);};
    const select=index=>{active=(index+slides.length)%slides.length;section.dataset.interviewActive=active;slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',String(i!==active)));dots.forEach((dot,i)=>{dot.classList.toggle('is-current',i===active);if(i===active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});playVideo();};
    const go=index=>{select(index);viewport.scrollTo({left:slides[active].offsetLeft,behavior:reduced.matches?'instant':'smooth'});schedule();};
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
    section.querySelector('[data-interview-prev]').addEventListener('click',()=>go(active-1));
    section.querySelector('[data-interview-next]').addEventListener('click',()=>go(active+1));
    const updatePause=()=>{pause.textContent=stopped?'เล่นสลับ':'หยุดสลับ';pause.setAttribute('aria-pressed',String(stopped));pause.setAttribute('aria-label',stopped?'เริ่มสลับอัตโนมัติ':'หยุดสลับอัตโนมัติ');};
    pause.addEventListener('click',()=>{stopped=!stopped;updatePause();playVideo();schedule();});updatePause();
    viewport.addEventListener('scroll',()=>{clear();clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{select(Math.round(viewport.scrollLeft/viewport.clientWidth));schedule();},160);},{passive:true});
    viewport.addEventListener('pointerdown',()=>{dragging=true;clear();},{passive:true});
    const release=()=>{dragging=false;schedule();};viewport.addEventListener('pointerup',release,{passive:true});viewport.addEventListener('pointercancel',release,{passive:true});
    viewport.addEventListener('keydown',event=>{if(event.target!==viewport)return;const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(step){event.preventDefault();go(active+step);}});
    section.addEventListener('focusin',clear);section.addEventListener('focusout',()=>setTimeout(schedule,0));
    new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);playVideo();schedule();},{threshold:.15}).observe(section);
    document.addEventListener('visibilitychange',()=>{playVideo();schedule();});
    reduced.addEventListener('change',()=>{stopped=reduced.matches;updatePause();playVideo();schedule();});
    window.addEventListener('resize',()=>viewport.scrollTo({left:slides[active].offsetLeft,behavior:'instant'}),{passive:true});
    select(0);
  });
})();

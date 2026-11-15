/* Shared dot controls and ten-second playback policy. Existing adapters own slides. */
window.KraneCarouselShared=true;
addEventListener('DOMContentLoaded',()=>{
 const selector='.expert-dots,.articles-carousel__dots,.story-blocks__dots,.campaign-carousel__dots,.weight-testimonials__dots,.weight-results__dots,.cd-review__dots,.figma-how__indicators,.landing-article-dots,.programme-comments__dots';
 const current='.is-current,.is-active,.is-on,[aria-current=true],[aria-current=page],[aria-current=step],[aria-pressed=true],[aria-selected=true]';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),states=new Map();
 function scan(){document.querySelectorAll(selector).forEach(nav=>{
  if(states.has(nav)||!nav.querySelector('button'))return;
  nav.classList.add('carousel-dots');
  if(nav.closest('.program-section,.campaign-carousel'))nav.classList.add('carousel-dots--inverse');
  const host=nav.closest('.program-section,.experts,.articles-section,[data-review-carousel],.campaign-carousel,#how')||nav.parentElement;
  const state={host,last:performance.now()};states.set(nav,state);
  nav.addEventListener('click',e=>{if(e.isTrusted)state.last=performance.now()});
  nav.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=[...nav.querySelectorAll('button')];let index=buttons.indexOf(document.activeElement);if(index<0)return;e.preventDefault();index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();buttons[index].click();state.last=performance.now()});
 });}
 const rails = new WeakSet();
 function mountRails() {
  document.querySelectorAll('[data-carousel-rail]').forEach(rail => {
   if (rails.has(rail)) return;
   rails.add(rail);
   const nav=document.createElement('nav');
   nav.className='carousel-dots carousel-dots--rail';
   nav.setAttribute('aria-label',rail.dataset.carouselRail);
   rail.after(nav);
   let stops=[];
   const sync=()=>{
    const active=stops.reduce((best,left,i)=>Math.abs(left-rail.scrollLeft)<Math.abs(stops[best]-rail.scrollLeft)?i:best,0);
    [...nav.children].forEach((button,i)=>button.setAttribute('aria-current',i===active?'page':'false'));
   };
   const measure=()=>{
    const cards=[...rail.children],max=rail.scrollWidth-rail.clientWidth;
    if(cards.length<2||max<2){nav.hidden=true;return;}
    const first=cards[0].getBoundingClientRect().left;
    const step=cards[1].getBoundingClientRect().left-first;
    if(step<1){nav.hidden=true;return;}
    const count=Math.max(1,Math.floor((rail.clientWidth+step-cards[0].offsetWidth)/step));
    stops=cards.filter((_,i)=>i%count===0).map(card=>card.getBoundingClientRect().left-first).filter(left=>left<max-2);
    stops.push(max);
    nav.hidden=stops.length<2;
    if(nav.childElementCount!==stops.length) nav.replaceChildren(...stops.map((_,i)=>{
     const button=document.createElement('button');
     button.type='button';
     button.setAttribute('aria-label',rail.dataset.carouselRail+' '+(i+1));
     button.addEventListener('click',()=>rail.scrollTo({left:stops[i],behavior:reduced.matches?'auto':'smooth'}));
     return button;
    }));
    sync();
   };
   nav.addEventListener('keydown',event=>{
    const buttons=[...nav.children],i=buttons.indexOf(document.activeElement);
    if(i<0||!stops.length||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    event.preventDefault();
    buttons[next].focus();
    buttons[next].click();
   });
   rail.addEventListener('scroll',sync,{passive:true});
   new ResizeObserver(measure).observe(rail);
   new MutationObserver(measure).observe(rail,{childList:true});
   measure();
  });
 }
 mountRails();
 scan();const mutation=new MutationObserver(scan);mutation.observe(document.body,{childList:true,subtree:true});
 const timer=setInterval(()=>{const now=performance.now();states.forEach((state,nav)=>{
  const rect=state.host.getBoundingClientRect(),buttons=[...nav.querySelectorAll('button')];
  const paused=state.host.querySelector('[data-review-pause][aria-pressed=true]');
  if(document.hidden||reduced.matches||rect.bottom<=0||rect.top>=innerHeight||!nav.getClientRects().length||state.host.matches(':hover,:focus-within')||paused){state.last=now;return;}
  if(buttons.length<2||now-state.last<10000)return;
  const index=buttons.findIndex(b=>b.matches(current));
  buttons[(index+1)%buttons.length].click();state.last=now;
 })},250);
 addEventListener('pagehide',()=>{clearInterval(timer);mutation.disconnect()},{once:true});
});

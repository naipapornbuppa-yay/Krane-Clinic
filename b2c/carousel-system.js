/* Shared dot controls and ten-second playback policy. Existing adapters own slides. */
window.KraneCarouselShared=true;
addEventListener('DOMContentLoaded',()=>{
 const selector='.expert-dots,.articles-carousel__dots,.story-blocks__dots,.campaign-carousel__dots,.weight-testimonials__dots,.weight-results__dots,.cd-review__dots,.figma-how__indicators';
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
 scan();const mutation=new MutationObserver(scan);mutation.observe(document.body,{childList:true,subtree:true});
 const timer=setInterval(()=>{const now=performance.now();states.forEach((state,nav)=>{
  const rect=state.host.getBoundingClientRect(),buttons=[...nav.querySelectorAll('button')];
  const paused=state.host.querySelector('[data-review-pause][aria-pressed=true]');
  if(document.hidden||reduced.matches||rect.bottom<=0||rect.top>=innerHeight||!nav.getClientRects().length||state.host.matches(':hover,:focus-within')||paused){state.last=now;return;}
  if(buttons.length<2||now-state.last<10000)return;
  const index=buttons.findIndex(b=>b.matches('.is-current,.is-active,.is-on,[aria-current=true],[aria-pressed=true]'));
  buttons[(index+1)%buttons.length].click();state.last=now;
 })},250);
 addEventListener('pagehide',()=>{clearInterval(timer);mutation.disconnect()},{once:true});
});

/* Reveal programme cards once, as they enter the viewport. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches||!('IntersectionObserver' in window)||!Element.prototype.animate)return;
 const running=new Set();
 const observer=new IntersectionObserver(entries=>{
  let order=0;
  entries.forEach(({target,isIntersecting})=>{
   if(!isIntersecting)return;
   observer.unobserve(target);
   if(reduced.matches)return;
   const animation=target.animate([
    {opacity:0,translate:'0 28px'},
    {opacity:1,translate:'0 -3px',offset:.8},
    {opacity:1,translate:'0 0'}
   ],{duration:650,delay:Math.min(order++,3)*130,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
   running.add(animation);animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
  });
 },{threshold:.12,rootMargin:'0px 0px -24px 0px'});
 document.querySelectorAll('.program-section .weight-quick,.program-section .story-blocks__video,.program-section .story-blocks__quote,.program-section .story-blocks__photos').forEach(card=>observer.observe(card));
 reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();running.forEach(animation=>animation.cancel())}});
})();

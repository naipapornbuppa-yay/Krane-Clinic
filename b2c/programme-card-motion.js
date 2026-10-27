/* Original, finite motion studies: staged imagery and ordered editorial reveals.
   No content is hidden in CSS: no JS, reduced motion and data saving stay complete. */
(()=>{
 'use strict';
 if(!('IntersectionObserver' in window)||!Element.prototype.animate)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),items=new Map();
 const quiet=()=>reduced.matches||navigator.connection?.saveData;
 function complete(item){item.animation?.cancel();item.animation=null;item.done=true;item.el.dataset.motionState='complete';observer.unobserve(item.el)}
 function sync(item){
  if(quiet()){complete(item);return}
  if(item.done)return;
  if(!item.visible||document.hidden){if(item.animation){item.animation.pause();item.el.dataset.motionState='paused'}return}
  if(!item.animation){
   const animation=item.el.animate(item.frames,{duration:700,delay:item.delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'none'});
   animation.id='krane-'+item.kind;item.animation=animation;
   animation.finished.then(()=>{item.done=true;item.el.dataset.motionState='complete';item.animation=null;observer.unobserve(item.el)}).catch(()=>{});
  }else item.animation.play();
  item.el.dataset.motionState='running';
 }
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const item=items.get(entry.target);item.visible=entry.isIntersecting;sync(item)}),{threshold:.08});
 function add(selector,kind,frames,stagger=80){document.querySelectorAll(selector).forEach((el,i)=>{const item={el,kind,frames,delay:Math.min(i,2)*stagger,visible:false,done:false,animation:null};items.set(el,item);el.dataset.motionKind=kind;el.dataset.motionState='ready';observer.observe(el);if(quiet())complete(item)})}
 const rise=[{opacity:.45,translate:'0 22px'},{opacity:1,translate:'0 0'}];
 add('.hero__intro-copy h1,.hero__intro-copy .hero__lead','hero-copy',rise);
 add('#services .banner-swap__image--product','hero-product',[{translate:'0 24px',rotate:'-3deg',scale:'1.025'},{translate:'0 0',rotate:'0deg',scale:'1'}],110);
 add('.programme-chapter .pc-head h2','chapter',rise,0);
 add('.pc-weight .pc-video','weight-story',[{opacity:.6,translate:'0 22px',scale:'.985'},{opacity:1,translate:'0 0',scale:'1'}]);
 add('.pc-hair [data-hair-motion] .pc-checkin>div','hair-record',[{translate:'0 18px',scale:'1.025'},{translate:'0 0',scale:'1'}],140);
 add('.pc-ed .pc-phone','private-consult',[{translate:'0 26px',rotate:'-2deg'},{translate:'0 0',rotate:'0deg'}],0);
 add('.pc-ed .pc-package-photo','private-delivery',[{translate:'0 24px',rotate:'7deg',scale:'.98'},{translate:'0 0',rotate:'0deg',scale:'1'}],0);
 const update=()=>items.forEach(sync);
 reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);
 window.addEventListener('pagehide',()=>{observer.disconnect();items.forEach(complete)},{once:true});
})();

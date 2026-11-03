/* Prerecorded media starts silent. User volume and pause choices remain theirs. */
(()=>{
 const prepared=new WeakMap();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const excluded=video=>video.srcObject||video.hasAttribute('data-feature-film');
 const ready=new IntersectionObserver(entries=>entries.forEach(({target:video,isIntersecting})=>{
  const state=prepared.get(video);
  if(!state||!isIntersecting||excluded(video)||reduced.matches)return;
  ready.unobserve(video);
  if(state.started)return;
  state.started=true;
  video.play().catch(()=>{});
 }),{threshold:.05});
 function setup(video){
  if(prepared.has(video)||excluded(video))return;
  const state={started:!video.paused};
  prepared.set(video,state);
  const wasAutoplay=video.autoplay;
  video.defaultMuted=true;video.muted=true;video.playsInline=true;
  video.setAttribute('muted','');video.setAttribute('playsinline','');
  video.autoplay=!reduced.matches;
  if(reduced.matches){
   video.removeAttribute('autoplay');
   if(wasAutoplay&&!video.paused)video.pause();
  }
  // A manual play/pause consumes the one-time default start as well. Never
  // restart it on a later intersection or when motion preferences change.
  const consume=()=>{state.started=true;ready.unobserve(video)};
  video.addEventListener('play',consume);
  video.addEventListener('pause',consume);
  if(!state.started)ready.observe(video);
 }
 reduced.addEventListener('change',()=>{
  document.querySelectorAll('video').forEach(video=>{
   const state=prepared.get(video);
   if(!state||excluded(video))return;
   if(reduced.matches){
    video.autoplay=false;
    video.removeAttribute('autoplay');
    if(!video.paused){state.started=true;ready.unobserve(video);video.pause()}
   }else if(!state.started){
    video.autoplay=true;
    ready.observe(video);
   }
  });
 });
 function scan(root){if(root.matches?.('video'))setup(root);root.querySelectorAll?.('video').forEach(setup)}
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(scan))).observe(document.documentElement,{childList:true,subtree:true});
 scan(document);
})();

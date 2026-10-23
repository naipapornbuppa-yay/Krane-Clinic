/* Prerecorded media starts silent. User volume and pause choices remain theirs. */
(()=>{
 const prepared=new WeakSet();
 const ready=new IntersectionObserver(entries=>entries.forEach(({target:video,isIntersecting})=>{
  if(!isIntersecting||video.srcObject)return;
  ready.unobserve(video);
  video.play().catch(()=>{});
 }),{threshold:.05});
 function setup(video){
  if(prepared.has(video)||video.srcObject)return;
  prepared.add(video);
  video.defaultMuted=true;video.muted=true;video.autoplay=true;video.playsInline=true;
  video.setAttribute('muted','');video.setAttribute('autoplay','');video.setAttribute('playsinline','');
  ready.observe(video);
 }
 function scan(root){if(root.matches?.('video'))setup(root);root.querySelectorAll?.('video').forEach(setup)}
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(scan))).observe(document.documentElement,{childList:true,subtree:true});
 scan(document);
})();

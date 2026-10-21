/* preloader: behavior is supplied by shared libraries. No duplicate per-page implementation.
 * Add page-owned functions here; shared/runtime.js owns ordered initialization.
 */

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_preloader_owned_228(){
if(craneImage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const craneFrames=Array.from({length:5},(_,i)=>`assets/state-editorial-v5-ink/loading-info-frames-v1/frame-0${i+1}.png?v=20261010-shared-views-v272`);
    Promise.all(craneFrames.map(src=>new Promise(resolve=>{
      const frame=new Image();frame.onload=()=>resolve(src);frame.onerror=()=>resolve(null);frame.src=src;
    }))).then(frames=>{
      const ready=frames.filter(Boolean);if(ready.length<2)return;
      let craneFrame=0;
      setInterval(()=>{
        if(document.hidden || !document.getElementById('preloader')?.classList.contains('active'))return;
        craneFrame=(craneFrame+1)%ready.length;craneImage.src=ready[craneFrame];
      },360);
    });
  }
}

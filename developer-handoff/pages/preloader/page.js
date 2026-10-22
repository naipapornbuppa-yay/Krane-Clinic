/* preloader: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
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

/** Activation/event branch; called in its original order by shared/lib/navigation.js. */
function kraneHandle_preloader_lifecycle_17(){

      preloaderTimer=setTimeout(() => {
        if(document.getElementById('preloader')?.classList.contains('active')) replaceCurrent('landing');
      },reduceMotion ? 350 : 1800);

return false;
}

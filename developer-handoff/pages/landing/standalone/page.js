function kraneInit_landing_678(){
  updateFeatToast((document.querySelector('.screen.active') || {}).id || 'landing');
}

function resetLandingViewport(){
    const frame=document.querySelector('#landing iframe');
    if(!frame) return;
    const sendReset=() => {
      try{ frame.contentWindow?.postMessage({krane:'landingTop'},'*'); }catch(error){}
    };
    if(frame.dataset.topResetBound!=='true'){
      frame.dataset.topResetBound='true';
      frame.addEventListener('load',sendReset);
    }
    window.requestAnimationFrame(sendReset);
  }
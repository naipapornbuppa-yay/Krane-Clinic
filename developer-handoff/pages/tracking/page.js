/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function openCsatModal(target,{replace=false,preview=false}={}){
    csatTarget = target || 'tracking';
    csatReplaces = replace;
    if(!csatModal || (flowState.csatDone && !preview)){ leaveCsat(); return; }
    csatModal.hidden = false;
    csatModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    csatModal.querySelector('.csat-dialog')?.focus({preventScroll:true});
  }

  function startTrackingDemoWalk(){
    stopTrackingDemoWalk();
    if(reduceMotion || flowState.orderState.justPaidTracking || flowState.orderState.paidAt) return;
    const demo=window.KraneGoldenDemo;
    if(!demo || flowState.orderDelivered) return;
    if(new URLSearchParams(location.search).get('demoStatus')) return;
    const walk=['Rider pickup','Dispatched'];
    const step=() => {
      if(!document.getElementById('tracking')?.classList.contains('active')) return;
      const now=demo.readState().fulfilmentStatus;
      const next=walk[walk.indexOf(now)+1] ?? (walk.includes(now) ? null : walk[0]);
      if(!next) return;
      demo.advanceFulfilment(next);
      syncTrackingDelivery();
      trackingDemoTimer=window.setTimeout(step,TRACKING_DEMO_STEP_MS);
    };
    trackingDemoTimer=window.setTimeout(step,TRACKING_DEMO_STEP_MS);
  }

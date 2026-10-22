/* tracking: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

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

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_tracking_riderLocate(e, riderLocate) {
      showActionToast('ตำแหน่งไรเดอร์แบบเรียลไทม์เปิดดูได้ในแอปของผู้ให้บริการขนส่ง','info');
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_tracking_confirmDelivery(e) {
      flowState.orderDelivered=true;
      persistFlowState();
      if(!IS_DEMO_EMBED) window.KraneGoldenDemo?.advanceFulfilment('Delivered');
      syncTrackingDelivery();
      showActionToast('ยืนยันการรับยาแล้ว','success');
      /* The review asks about the whole thing — the advice, the app and the
         call — so it belongs after the medicine has actually arrived, not at
         the moment the card is charged (client, 20 Aug). */
      openCsatModal('tracking');
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_tracking_demoStatus(e, mockDelivery) {
      seedClinicalDemoStage('tracking');
      flowState.orderState.deliveryMethod=mockDelivery.dataset.mockDelivery;
      flowState.orderState.fulfillmentMode='delivery';
      flowState.orderState.justPaidTracking=true;
      flowState.orderDelivered=mockDelivery.dataset.mockStatus==='Delivered';
      flowState.csatDone=false;
      window.kraneDemoStatus=mockDelivery.dataset.mockStatus;
      window.KraneGoldenDemo?.writeState({fulfilmentStatus:mockDelivery.dataset.mockStatus});
      persistFlowState();

  return false;
}

/** Activation/event branch; called in its original order by shared/lib/navigation.js. */
function kraneHandle_tracking_lifecycle_7(){

      requestAnimationFrame(()=>{if(document.querySelector('#tracking.active'))openCsatModal('tracking');});

return false;
}

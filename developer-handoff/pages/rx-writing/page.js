/* rx-writing: Owns count-up display, transition timer, exit/re-entry cleanup and next-view guard.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

/** Route lifecycle, including cleanup on exit/re-entry. Invoked at the original router position. */
function kraneRoute_rx_writing_4(id){
clearTimeout(rxTimer);
    clearInterval(rxCountdownTimer);
    if(id==='rx-writing'){
      const rxScr=document.getElementById('rx-writing');
      const rxTimerEl=rxScr?.querySelector('[data-rx-timer]');
      let rxElapsedSeconds=0;
      paintElapsedTimer(rxTimerEl,rxElapsedSeconds);
      rxCountdownTimer=setInterval(() => {
        if(!rxScr?.classList.contains('active')){ clearInterval(rxCountdownTimer); return; }
        rxElapsedSeconds+=1;
        paintElapsedTimer(rxTimerEl,rxElapsedSeconds);
      },1000);
      rxTimer=setTimeout(() => {
        if(!rxScr?.classList.contains('active')) return;
        clearInterval(rxCountdownTimer);
        if(document.getElementById('rx-writing')?.classList.contains('active')){
          refreshMedicationCheckout();
          /* Client, 1 Sep: hand over to the plan, not to checkout. This used to
             drop the patient into payment without ever showing what the doctor
             had written or asking them to agree to it. */
          replaceCurrent('rx-plan');
        }
      },reduceMotion ? 500 : 3400);
    }
}

/* matching: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  /* These routes still go through matching (New, 31 Aug: "while matching doctor
     if system flag no doctor is available it will automatically force user to
     schedule appointment"). Skipping straight to the booking screen showed the
     time picker but never the moment that sends you there, which is the half
     that has never been user-tested. doctorAvailable=false makes the matching
     screen fail on its timer and hand over to #appointment. */
  function directClinicalStartTarget(){
    doctorAvailable = !needsAppointment();
    return 'matching';
  }

  /* Client, 6 Oct: nurse screening had two screens of its own that duplicated
     the doctor consultation — if it comes back it reuses #matching and the
     consultation screens rather than a second pair. */
  function partnerClinicalStartTarget(){
    doctorAvailable=true;
    return 'matching';
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_matching_demoNoMatch(e, noMatch) {
      if(noMatch.closest('.rail')){
        seedClinicalDemoStage('matching');
        history=seededHistory('matching');
      }
      doctorAvailable = false;
      show('matching',!noMatch.closest('.rail'));
      return true;

  return false;
}

/** Route lifecycle, including cleanup on exit/re-entry. Invoked at the original router position. */
function kraneRoute_matching_1(id){
clearTimeout(matchTimer);
    clearInterval(matchCountdownTimer);
    const mScr = document.getElementById('matching');
    if(id === 'matching' && mScr){
      const countdown=mScr.querySelector('[data-matching-countdown]');
      let elapsedSeconds=0;
      const syncMatchingTimer=() => {
        paintElapsedTimer(countdown,elapsedSeconds);
        if(countdown) countdown.setAttribute('aria-label',document.documentElement.lang==='th'
          ? `ผ่านไป ${elapsedSeconds} วินาที`
          : `${elapsedSeconds} seconds elapsed`);
      };
      syncMatchingTimer();
      matchCountdownTimer=setInterval(() => {
        if(!mScr.classList.contains('active')){
          clearInterval(matchCountdownTimer);
          return;
        }
        elapsedSeconds+=1;
        syncMatchingTimer();
        if(elapsedSeconds>=10) clearInterval(matchCountdownTimer);
      },1000);
      // Available? YES -> apply the consultation balance gate. Fully covered partner
      // consultations enter the waiting room; self-pay or any excess opens checkout.
      // NO -> availability page to pick a slot, where the same gate runs on continue.
      matchTimer = setTimeout(() => {
        if(!mScr.classList.contains('active')) return;
        /* Item 4 (04/08 deck): the cost is always announced on SCR-008 after
           matching, including when insurance covers it and the balance is 0.
           consultationHandoffTarget() skipped straight to the waiting room in
           that case, which is what hid the fee summary. */
        /* needsAppointment() is re-read here rather than trusted from the
           doctorAvailable set at route entry, so a deep link straight to
           #matching fails to match for sexual health too. */
        replaceCurrent(doctorAvailable && !needsAppointment() ? 'consultpay' : 'appointment');
      }, 10000);
    }
}

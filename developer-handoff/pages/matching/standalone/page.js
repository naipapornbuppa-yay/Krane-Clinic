function directClinicalStartTarget(){
    doctorAvailable = !needsAppointment();
    return 'matching';
  }

function partnerClinicalStartTarget(){
    doctorAvailable=true;
    return 'matching';
  }

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
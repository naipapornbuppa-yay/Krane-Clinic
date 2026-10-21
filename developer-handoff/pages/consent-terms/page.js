/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  /* PDPA and telemedicine consent read as one continuous page. Reaching the end
     marks both records read and ticks all three choices. Marketing remains
     optional: after the initial auto-tick, the patient can untick it freely. */
  function unlockConsentBundleAfterDelay(box,force=false){
    if(consentRead.pdpa && consentRead.telemedicine && consentChecked.pdpa && consentChecked.telemedicine) return;
    // Keep a brief, visible pause at the end before confirming both records.
    // The fallback monitor runs every 300ms, so retain the first pending action
    // instead of restarting it on every tick.
    if(consentAutoCheckTimer) return;
    consentAutoCheckTimer = window.setTimeout(() => {
      consentAutoCheckTimer = 0;
      const stillAtEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 12;
      if((!force && !stillAtEnd) || !document.getElementById('consent-terms')?.classList.contains('active')) return;
      // Never show a contradictory "checked but disabled" consent state. The
      // route guard normally keeps an unverified session out of this screen;
      // this is a final defence for delayed restores and embedded webviews.
      if(!consentIdentityVerified()){
        syncConsentContinue();
        return;
      }
      markConsentRead('pdpa');
      markConsentRead('telemedicine');
      consentChecked.pdpa = true;
      consentChecked.telemedicine = true;
      consentChecked.marketing = true;
      flowState.consentChecked = Object.assign({},consentChecked);
      persistFlowState();
      renderConsentReadState('pdpa');
      renderConsentReadState('telemedicine');
      renderConsentReadState('marketing');
      syncConsentContinue();
      const cue=document.querySelector('[data-consent-scroll-cue]');
      if(cue) cue.hidden=true;
    },320);
  }

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_consent_terms_owned_79(){
document.querySelectorAll('[data-consent-scroll]').forEach(box => {
    if(box.dataset.consentScroll === 'all'){
      const pdpa = consentDocuments.pdpa, tele = consentDocuments.telemedicine;
      box.innerHTML =
        '<div class="consent-doc__section-head"><strong>'+pdpa.label+'</strong><div class="hint">'+pdpa.description+'</div></div>'+pdpa.body+
        '<hr class="consent-doc__divider">'+
        '<div class="consent-doc__section-head"><strong>'+tele.label+'</strong><div class="hint">'+tele.description+'</div></div>'+tele.body;
    } else {
      const doc = consentDocuments[box.dataset.consentScroll];
      if(doc) box.innerHTML = doc.body;
    }
  });
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_consent_terms_owned_81(){
if(consentPageScroll){
    if(consentAutoScroll) consentAutoScroll.addEventListener('click',() => {
      // This explicit action must never leave the patient looking at disabled
      // choices after the page has visibly reached the end. Snap first, then
      // complete the same read state synchronously across Safari/webviews.
      consentPageScroll.scrollTop=consentPageScroll.scrollHeight;
      if(consentAutoCheckTimer){
        window.clearTimeout(consentAutoCheckTimer);
        consentAutoCheckTimer=0;
      }
      if(!consentIdentityVerified()){
        syncConsentContinue();
        return;
      }
      markConsentRead('pdpa');
      markConsentRead('telemedicine');
      consentChecked.pdpa = true;
      consentChecked.telemedicine = true;
      consentChecked.marketing = true;
      flowState.consentChecked = Object.assign({},consentChecked);
      persistFlowState();
      renderConsentReadState('pdpa');
      renderConsentReadState('telemedicine');
      renderConsentReadState('marketing');
      syncConsentContinue();
      const cue=document.querySelector('[data-consent-scroll-cue]');
      if(cue) cue.hidden=true;
    });
    consentPageScroll.addEventListener('scroll',() => checkConsentScrollEnd(consentPageScroll),{passive:true});
    // Re-check when the page gains a real height, i.e. when this screen is shown.
    if(window.ResizeObserver) new ResizeObserver(() => checkConsentScrollEnd(consentPageScroll)).observe(consentPageScroll);
    const consentEnd=consentPageScroll.querySelector('[data-consent-end]');
    if(window.IntersectionObserver && consentEnd){
      new IntersectionObserver(entries => {
        if(entries.some(entry => entry.isIntersecting)) checkConsentScrollEnd(consentPageScroll);
      },{root:consentPageScroll,threshold:.8}).observe(consentEnd);
    }
    // Some partner in-app webviews throttle scroll events and do not expose
    // IntersectionObserver. A lightweight monitor keeps the end-of-page action
    // reliable there without changing the visible flow.
    window.setInterval(() => {
      if(document.getElementById('consent-terms')?.classList.contains('active')){
        checkConsentScrollEnd(consentPageScroll);
      }
    },300);
  }
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_consent_terms_owned_82(){
consentChecks.forEach(input => input.addEventListener('change',() => {
    consentChecked[input.dataset.consentType] = input.checked;
    flowState.consentChecked = Object.assign({},consentChecked);
    persistFlowState();
    syncConsentContinue();
  }));
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_consent_terms_owned_83(){
consentChecks.forEach(input => renderConsentReadState(input.dataset.consentType));
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_consent_terms_owned_85(){
if(consentChecked.pdpa && consentChecked.telemedicine){
    const cue=document.querySelector('[data-consent-scroll-cue]');
    if(cue) cue.hidden=true;
  }
}

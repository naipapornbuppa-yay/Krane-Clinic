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

function kraneInit_consent_terms_owned_82(){
consentChecks.forEach(input => input.addEventListener('change',() => {
    consentChecked[input.dataset.consentType] = input.checked;
    flowState.consentChecked = Object.assign({},consentChecked);
    persistFlowState();
    syncConsentContinue();
  }));
}

function kraneInit_consent_terms_owned_83(){
consentChecks.forEach(input => renderConsentReadState(input.dataset.consentType));
}

function kraneInit_consent_terms_initialContinue() {
syncConsentContinue();
}

function kraneInit_consent_terms_owned_85(){
if(consentChecked.pdpa && consentChecked.telemedicine){
    const cue=document.querySelector('[data-consent-scroll-cue]');
    if(cue) cue.hidden=true;
  }
}

function kraneHandle_consent_terms_submit(e, consentSubmit) {
      if(!consentIdentityVerified()){
        showActionToast('กรุณาเข้าสู่ระบบและยืนยันรหัส OTP ก่อนให้ความยินยอม','warning');
        return true;
      }
      if(consentSubmit.disabled) return true;
      submitOnce('consent',consentSubmit,() => {
        const acceptedAt=new Date().toISOString();
        const records=requiredConsentChecks.map(input => ({
          type:input.dataset.consentType,
          version:consentDocuments[input.dataset.consentType].version,
          required:true,
          granted:true,
          acceptedAt
        }));
        records.push({
          type:'marketing',
          version:'marketing-v1',
          required:false,
          granted:Boolean(consentChecked.marketing),
          recordedAt:acceptedAt,
          acceptedAt:consentChecked.marketing ? acceptedAt : null
        });
        flowState.marketingConsent={
          version:'marketing-v1',
          granted:Boolean(consentChecked.marketing),
          recordedAt:acceptedAt
        };
        const consentSource=flowState.entryChannel==='partner' ? 'partner' : 'direct';
        saveConsentRecords(consentSource,records);
        if(consentSource==='partner') flowState.partnerConsentComplete=true;
        else {
          flowState.consentsComplete=true;
          // Consent starts a fresh pre-doctor confirmation cycle. Keep the
          // saved values, but require the patient to review and submit them.
          if(flowState.draftReady) flowState.patientInfoComplete=false;
        }
        // Personal details must be reviewed immediately after consent, including
        // for returning patients. Only after that confirmation may the route open
        // general health or continue toward doctor matching.
        const consentNext = consentSource==='partner'
          ? 'partner-idcard'
          : (!flowState.draftReady
              ? nextAfterAuthentication()
              : 'patient-info');
        flowState.lastRequiredScreen=consentNext;
        const showSignupDone = consentSource==='direct' && Boolean(flowState.signupDonePending);
        if(showSignupDone) flowState.signupDonePending=false;
        persistFlowState();
        showActionToast('บันทึกความยินยอมแล้ว','success');
        if(showSignupDone) openSignupDoneModal(consentNext);
        else show(consentNext);
      });
      return true;

  return false;
}

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

function kraneHandle_consent_terms_lifecycle_9(){

      // Client (16 Aug): every visit requires a fresh scroll-through, never a
      // continue button that's already enabled from a previous pass.
      consentRead.pdpa = false; consentRead.telemedicine = false;
      consentChecked.pdpa = false; consentChecked.telemedicine = false; consentChecked.marketing = false;
      flowState.consentRead = Object.assign({},consentRead);
      flowState.consentChecked = Object.assign({},consentChecked);
      persistFlowState();
      consentChecks.forEach(input => renderConsentReadState(input.dataset.consentType));
      syncConsentContinue();
      const cue=document.querySelector('[data-consent-scroll-cue]');
      if(cue) cue.hidden=false;
      const scrollBox=document.querySelector('[data-consent-page-scroll]');
      if(scrollBox) scrollBox.scrollTop=0;

return false;
}
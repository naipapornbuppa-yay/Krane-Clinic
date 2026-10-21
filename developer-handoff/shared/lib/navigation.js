/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function guardActiveCase(target){
    if(!hasActiveCase || !['concern','conditions'].includes(target)) return false;
    openActiveCaseModal();
    return true;
  }

  function syncThemeColor(id){
    const meta=document.querySelector('meta[name="theme-color"]');
    const color=id==='landing' ? THEME_COLOR_LANDING : THEME_COLOR_APP;
    if(meta) meta.setAttribute('content',color);
    /* Keep the root canvas light because iOS uses it behind the translucent
       bottom toolbar. The landing-only body gradient and safe-area overlay
       keep the notch blue without tinting the browser controls below. */
    document.documentElement.dataset.landingCanvas=String(id==='landing');
    document.documentElement.style.backgroundColor=THEME_COLOR_APP;
    document.body.style.backgroundColor=THEME_COLOR_APP;
  }


  function seededHistory(id){
    const path=[];
    const visited=new Set();
    let current=id;
    while(current && !visited.has(current)){
      visited.add(current);
      path.unshift(current);
      const skipped=skipBackFrom(current);
      const partnerParent=current==='intake-concern' && flowState.entryChannel==='partner'
        ? (flowState.partnerPaymentMethod==='insurance' ? 'partner-insurance' : 'partner-patient-info')
        : null;
      const healthParent=current==='intake-general'
        ? (flowState.entryChannel==='partner' ? 'intake-concern' : 'patient-info')
        : null;
      const signupParent=current==='signup' && flowState.entryChannel==='direct'
        ? (intakeStepOrder().slice(-1)[0] || 'intake1')
        : null;
      /* The direct route has no ID step any more, so Back from the patient
         record returns to consent rather than to a screen it skipped. */
      const patientInfoParent=current==='patient-info' && !identityRequired() ? 'consent-terms' : null;
      /* seededHistory only runs for an entry with no real trail — a deep link
         or a landing care card. Those all start at the landing page, which is
         where the concern was picked, so Back returns there rather than to a
         condition list the patient never saw. Walking home CTA -> conditions
         -> intake1 in-app records real history and never reaches this. */
      const intakeStartParent=current==='intake1' && flowState.entryChannel!=='partner' ? 'landing' : null;
      const waitroomParent=current==='waitroom' && flowState.entryChannel==='direct'
        ? 'intake-general'
        : null;
      current = skipped !== null ? skipped : (partnerParent || healthParent || signupParent || patientInfoParent || intakeStartParent || waitroomParent || directEntryParent[current]);
    }
    return path[0] === 'landing' ? path : ['landing', ...path];
  }

  function requiredRouteFor(target){
    if(intakeSkipped(target)){
      const forward = skipForwardFrom(target);
      // Deep link into a screen this route never asks: the questionnaire is
      // already done, so resolve to whatever follows it.
      if(!forward) return flowState.entryChannel==='partner' ? 'intake-concern' : 'signup';
      target = forward;
    }
    if(target==='intake-concern' && !sharedConcernRequired()) return 'intake1';
    /* Consent is recorded against a verified account. A direct hash or a
       restored browser tab must never expose the end state with all choices
       ticked while the CTA is still disabled because OTP has not happened. */
    if(target==='consent-terms'){
      if(!flowState.accountCreated) return 'signup';
      if(!flowState.otpVerified) return 'otp';
      if(!flowState.passwordSet && !flowState.returningIdentityValid) return 'set-password';
      if(flowState.entryChannel==='partner' && !flowState.partnerPhoneVerified) return 'partner-patient-info';
    }
    if(flowState.entryChannel==='partner' && INTAKE_DRAFT_SCREENS.includes(target)){
      if(!flowState.partnerConsentComplete) return 'consent-terms';
      if(!flowState.partnerInfoComplete || !flowState.partnerPaymentChosen) return 'partner-patient-info';
      if(flowState.partnerPaymentMethod==='insurance' && !flowState.coverage?.policyId) return 'partner-insurance';
    }
    if(PARTNER_SCREENS.includes(target)){
      if(!flowState.partnerConsentComplete) return 'consent-terms';
      if(target!=='partner-idcard' && !flowState.partnerIdStepDone) return 'partner-idcard';
      if(!['partner-idcard','partner-patient-info'].includes(target) && !flowState.partnerInfoComplete) return 'partner-patient-info';
      if(['partner-insurance','partner-phr'].includes(target) && !flowState.partnerPaymentChosen) return 'partner-patient-info';
      if(target==='partner-phr' && !flowState.partnerConcernComplete) return 'intake-concern';
      if(target==='partner-phr' && !flowState.partnerHealthComplete) return 'intake-general';
    }
    if(flowState.entryChannel==='partner' && DIRECT_PRE_DOCTOR_GATE_TARGETS.has(target)
       && (!flowState.partnerReviewComplete || !flowState.partnerReviewConfirmedAt)){
      return requiredRouteFor('partner-phr');
    }
    if(target==='intake-general' && flowState.entryChannel==='direct'){
      if(!flowState.draftReady) return 'intake1';
      if(!flowState.accountCreated) return 'signup';
      if(!flowState.otpVerified) return 'otp';
      if(!flowState.passwordSet && !flowState.returningIdentityValid) return 'set-password';
      if(!flowState.consentsComplete) return 'consent-terms';
      if(!flowState.patientInfoComplete) return 'patient-info';
      // The fee no longer gates this page — it now comes before payment.
    }
    /* Sign-up used to be reachable only after an intake, so "create an account"
       on the log-in page bounced to question one with a warning (client, 20 Sep).
       An account is its own errand; the care screens stay gated by
       REQUIRED_CARE_TARGETS below, which still asks for the intake first. */
    if(target==='set-password' && !flowState.otpVerified && !flowState.passwordResetPending) return 'login';
    if(target==='otp' && !flowState.accountCreated && !flowState.partnerPhoneOtpPending && !flowState.phoneOtpPending) return 'signup';
    if(target==='identity'){
      // Asked for on a route that no longer has this step: send them on.
      if(!identityRequired()) return flowState.patientInfoComplete ? directClinicalStartTarget() : 'patient-info';
      if(!flowState.draftReady) return 'intake1';
      if(!flowState.accountCreated) return 'signup';
      if(!flowState.otpVerified) return 'otp';
      if(!flowState.passwordSet && !flowState.returningIdentityValid) return 'set-password';
      if(!flowState.consentsComplete) return 'consent-terms';
    }
    if(target==='patient-info'){
      if(!flowState.draftReady) return 'intake1';
      if(!flowState.accountCreated) return 'signup';
      if(!flowState.otpVerified) return 'otp';
      if(!flowState.passwordSet && !flowState.returningIdentityValid) return 'set-password';
      if(!flowState.consentsComplete) return 'consent-terms';
      if(identityRequired() && !flowState.identityVerified && !flowState.returningIdentityValid) return 'identity';
    }
    // Insurance details are shared by profile setup and partner entry. Both
    // contexts open this identity check before the ordinary clinical guard.
    if(target==='insurance' && ['profile','partner'].includes(insuranceEntry)) return target;
    /* The last step of the sign-up chain stands in for the whole chain —
       reaching it means everything before it was done. That used to be
       identity; on the direct route it is now the patient record. */
    const signupChainDone = signedIn() || flowState.returningIdentityValid ||
      (identityRequired() ? flowState.identityVerified : flowState.patientInfoComplete);
    if(REQUIRED_CARE_TARGETS.has(target) && !signupChainDone){
      if(!flowState.draftReady) return 'intake1';
      if(!flowState.accountCreated) return 'signup';
      if(!flowState.otpVerified) return 'otp';
      if(!flowState.passwordSet && !flowState.returningIdentityValid) return 'set-password';
      if(!flowState.consentsComplete) return 'consent-terms';
      if(!flowState.patientInfoComplete) return 'patient-info';
      return 'identity';
    }
    if(flowState.entryChannel==='direct' && DIRECT_PRE_DOCTOR_GATE_TARGETS.has(target) && !flowState.directGeneralHealthComplete){
      return 'intake-general';
    }
    return target;
  }

  function normalizeScreenTarget(target){
    if(target==='intake1' && isGeneralPath()) return 'intake-concern';
    if(target==='intake-edu') return 'intake-general';
    if(target==='followups') return 'profile';
    if(target==='history') return 'activity';
    if(target==='prescription') return 'my-documents';
    if(target==='choosedoc') return 'matching';
    if(target==='address-detail') return 'payment';
    if(target==='payment-processing') return 'payment-success';
    // `concern` was removed when the landing treatment selector became the entry
    // point, but prerequisite guards can still return that legacy route. Resolve
    // it before toggling `.active`; otherwise every real screen is hidden and the
    // stage becomes completely blank. Unknown stale routes fall back to landing
    // for the same reason.
    if(target==='concern'){
      setSelectedCategory('general');
      return 'intake-concern';
    }
    // Keep legacy partner bookmarks working while routing each old page name to
    // the matching step in the now-separated clinical intake.
    if(target==='partner-concern') return 'intake-concern';
    if(target==='partner-intake') return 'intake-general';
    return document.getElementById(target) ? target : 'landing';
  }

  function show(id, push=true){
    if(id==='feedback'){
      if(flowConfig.get('screens')==='1')seedClinicalDemoStage('tracking');
      show('tracking',push);
      requestAnimationFrame(()=>openCsatModal('tracking',{preview:flowConfig.get('screens')==='1'}));
      return;
    }
    const leavingScreen=document.querySelector('.screen.active')?.id;
    // The landing treatment dropdown replaces the old broad-category page.
    // Legacy "new consultation" links now start the general intake directly.
    id=normalizeScreenTarget(id);
    if(id==='waitroom' && flowState.appointmentWhen && (!flowState.appointmentAt || Date.parse(flowState.appointmentAt)>Date.now())) id='appointment-booked';
    if(!queueDismissOnce && pendingQueue?.suspended && ['landing','intake1','conditions','matching','waitroom'].includes(id)) id='queue-resume';
    queueDismissOnce=false;
    const requested=id;
    id=normalizeScreenTarget(requiredRouteFor(id));
    if(['video','consult'].includes(id) && pendingQueue){ pendingQueue=null; if(!queuePreview) try{localStorage.removeItem(QUEUE_KEY)}catch(_){} }
    if(requested==='consent-terms' && ['signup','login','otp','set-password'].includes(id)) postAuthNext='consent-terms';
    if(id!==requested){
      history=seededHistory(id);
      push=false;
      window.requestAnimationFrame(() => showActionToast('กรุณาทำขั้นตอนที่จำเป็นให้ครบก่อน','warning'));
    }
    /* A QA/shared link may enter the safety screen directly. It still needs the
       selected service's authored questions, not the generic base markup. */
    if(INTAKE_ONE_QUESTION_SCREENS.includes(id)) renderIntakeQuestions();
    if(INTAKE_ONE_QUESTION_SCREENS.includes(id)) setupIntakeQuestionPages(id);
    if(!IS_DEMO_EMBED && ['waitroom','appointment-booked'].includes(id) && flowState.draftReady && !flowState.sharedEncounterId){
      try {
        const answers=[...document.querySelectorAll('[id^="intake"] input,[id^="intake"] select,[id^="intake"] textarea')].filter(el=>el.type!=='file' && !['password','hidden','button','submit'].includes(el.type) && (!['checkbox','radio'].includes(el.type)||el.checked) && el.value).map(el=>({label:el.closest('label')?.textContent.trim()||document.querySelector('label[for="'+CSS.escape(el.id)+'"]')?.textContent.trim()||el.name||el.id||'คำตอบ',value:el.value}));
        const c=window.KraneClinical.create({name:flowState.partnerName||flowState.patientName||flowState.profileDisplayName||'ผู้ป่วยสาธิต',category:selectedCategoryId,condition:selectedConditionId,answers,channel:flowState.entryChannel,health:flowState.entryChannel==='partner'?flowState.partnerHealth:null,concern:flowState.partnerConcern||'',consent:flowState.consentsComplete||flowState.partnerConsentComplete,appointmentAt:flowState.appointmentAt||null});flowState.sharedEncounterId=c.id;persistFlowState();
      } catch { showActionToast('บันทึกเคสไม่ได้ กรุณาลองอีกครั้ง','warning'); }
    }
    if(id==='payment-success' && flowState.orderState.clinicalPrescription){try{window.KraneClinical.patch({orderStatus:'paid'});}catch{showActionToast('ส่งสถานะการชำระเงินไม่ได้ กรุณาลองอีกครั้ง','warning');}}
    if(id==='articles') window.kraneArticleMock?.renderFeed();
    if(id==='article') window.kraneArticleMock?.renderDetail();
    ensureAppBarLockup(id);
    if(id==='intake-general') window.setTimeout(() => syncFrequencySliders(),0);
    if(id==='tracking' || id==='activity' || id==='order-summary') syncTrackingDelivery();
    if(id==='tracking' && orderFulfilmentStatus()==='Delivered' && !flowState.csatDone){
      requestAnimationFrame(()=>{if(document.querySelector('#tracking.active'))openCsatModal('tracking');});
    }
    if(id==='tracking') startTrackingDemoWalk(); else stopTrackingDemoWalk();
    if(id==='notifications') syncDeliveryNotification();
    if(id==='my-documents') refreshMyDocuments();
    if(INTAKE_DRAFT_SCREENS.includes(id)) syncIntakeDropdownContinue(id);
    if(id==='partner-patient-info' || (['intake-concern','intake-general'].includes(id) && flowState.entryChannel==='partner')) restorePartnerFields();
    if(id==='intake-general') syncGeneralHealthContext();
    if(id==='partner-insurance') syncPartnerPolicySummary();
    if(id==='partner-phr') syncPartnerReview();
    // Decide whether the care stepper applies, based on where the user came from.
    const prevId = (document.querySelector('.screen.active') || {}).id;
    // Arriving at the picker fresh shows categories only; step two is a tap away.
    if(id==='conditions' && prevId!=='conditions'){
      conditionListRevealed=false;
      renderConditionList();
    }
    if(PARTNER_SCREENS.includes(id) || (id==='consent-terms' && flowState.entryChannel==='partner')){
      // Partner access runs its own sequence and skips stage 1, so the five-step
      // B2C care stepper would mis-number it. Keep it off until the flow rejoins
      // the shared clinical path at #matching.
      journeyActive = false;
    } else if(JOURNEY_INTAKE.includes(id)){
      journeyActive = true;                       // answering อาการ etc. starts the journey
    } else if(JOURNEY_AUTH.includes(id)){
      // keep the journey on only if we arrived from an intake or auth screen;
      // entering Log in cold (nav, followup care, home) turns it off
      if(!JOURNEY_INTAKE.includes(prevId) && !JOURNEY_AUTH.includes(prevId)) journeyActive = false;
    }
    const loginIntakeNotice=document.querySelector('[data-login-intake-notice]');
    if(loginIntakeNotice && id==='login'){
      // A saved intake draft plus a clinical destination means this login was
      // opened from the assessment, not from the ordinary landing/profile nav.
      // Keep the message contextual so a cold login never implies treatment has
      // already started.
      loginIntakeNotice.hidden=!(flowState.draftReady && postAuthNext!=='profile');
    }
    // A completed assessment is transient context, not page content. Show it
    // once as a toast after the sign-up screen becomes active, above its CTA.
    const shouldShowSignupIntakeToast=id==='signup'
      && prevId!=='signup'
      && flowState.draftReady
      && postAuthNext!=='profile';
    /* Direct entry always restores the progress UI, even if this tab previously
       opened a partner link. Partner entry keeps it hidden on shared screens too. */
    const refillCheckout=flowState.orderState && flowState.orderState.checkoutOrigin==='refill';
    document.querySelectorAll('.care-journey').forEach(cj => {
      const ownerScreen=cj.closest('.screen');
      const coldAuth=ownerScreen && JOURNEY_AUTH.includes(ownerScreen.id) && !journeyActive;
      const refillDetour=refillCheckout
        && ownerScreen
        && (ownerScreen.id==='intake-general' || ownerScreen.id==='payment');
      const followUpDetour=flowState.followUpDirectToWaitroom
        && ownerScreen
        && ownerScreen.id==='intake-general';
      cj.hidden=(flowState.entryChannel==='partner' && ownerScreen.id!=='intake-general') || coldAuth || refillDetour || followUpDetour;
    });
    syncCareJourneyFill(id);
    if(id==='patient-info') syncPatientInfoPrefill();
    screens.forEach(s => s.classList.toggle('active', s.id === id));
    const activeScreen=document.getElementById(id);
    if(id==='landing') resetLandingViewport();
    if(window.kraneSyncSelects) window.kraneSyncSelects(activeScreen);
    syncFloatingFieldStates(activeScreen);
    window.requestAnimationFrame(() => syncFloatingFieldStates(activeScreen));
    document.dispatchEvent(new CustomEvent('krane:screenchange',{detail:{id,screen:activeScreen}}));
    syncPatientDateFields();
    if(id === 'otp') prepareFreshOtpChallenge();
    placeActionToast();
    if(shouldShowSignupIntakeToast){
      window.requestAnimationFrame(() => showActionToast('ทำแบบประเมินเรียบร้อยแล้ว','success'));
    }
    railLinks.forEach(a => a.classList.toggle('current', a.dataset.go === id));
    try { window.history.replaceState(null,'','#'+id); } catch(error) {}
    syncRailPath(id);
    if(push && history[history.length - 1] !== id) history.push(id);
    syncConsultationCoverageLabels();
    if(id==='consultpay') syncConsultationCheckoutMode();
    if(id==='consultpay' || id==='consultpay-gw' || id==='consultpay-fail') syncConsultationPaymentAmount();
    const scr = document.getElementById(id);
    const body = document.querySelector('#'+id+' .screen__body');
    if(body) body.scrollTop = 0;
    // Screens scroll inside `.screen__body`; the document should never carry a
    // route's scroll position. Some desktop browsers restore the root scroll
    // after a hash change, which clips the app bar and lets the stepper appear
    // to overlap the question on the next screen.
    const rootScroller=document.scrollingElement;
    if(rootScroller) rootScroller.scrollTop=0;
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    // hims-style screen enter: re-run the staggered rise-in on every visit
    if(scr && !reduceMotion){
      scr.classList.remove('is-entering');
      void scr.offsetWidth;   // reflow so the CSS animation restarts
      scr.classList.add('is-entering');
      clearTimeout(enterTimer);
      enterTimer = setTimeout(() => scr.classList.remove('is-entering'), 1600);
    }
    if(id === 'consent-terms'){
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
    }
    if(id === 'patient-info'){
      // Direct Krane visitors self-pay by default. Keep an explicit insurance
      // choice if the patient already made one; partner entry uses its own state.
      if(flowState.entryChannel==='direct' && !flowState.paymentPreference){
        flowState.paymentPreference='self-pay';
        persistFlowState();
      }
      document.querySelectorAll('#patient-info [data-patient-payment-choice-value]').forEach(option => {
        option.setAttribute('aria-selected',String(option.dataset.patientPaymentChoiceValue===flowState.paymentPreference));
      });
    }
    if(id === 'conditions') renderConditionList();
    if(JOURNEY_INTAKE.includes(id) || JOURNEY_AUTH.includes(id)){
      flowState.lastRequiredScreen=id;
      persistFlowState();
    }
    applyInsuranceVisibility();
    if(id === 'insurance'){
      const isProfile = insuranceEntry === 'profile';
      const isPartner = insuranceEntry === 'partner';
      const isSetup = isProfile || isPartner;
      document.getElementById('insurance')?.setAttribute('data-insurance-context',isSetup ? 'setup' : 'checkout');
      const order = document.querySelector('#insurance [data-insurance-order]');
      const setupTitle = document.querySelector('#insurance [data-insurance-setup-title]');
      const profileHint = document.querySelector('#insurance [data-insurance-profile-hint]');
      const orderActions = document.querySelectorAll('#insurance [data-insurance-order-action]');
      const confirmBtn = document.querySelector('#insurance [data-insurance-confirm]');
      if(order) order.hidden = isSetup;
      if(setupTitle) setupTitle.hidden = !isSetup;
      if(profileHint) profileHint.hidden = !isSetup;
      orderActions.forEach(btn => { btn.hidden = isSetup; });
      if(confirmBtn) confirmBtn.textContent = isProfile ? 'บันทึกข้อมูลประกัน' : 'ตรวจสอบสิทธิ์';
    }
    if(id === 'matching' || id === 'intake1' || id === 'intake-concern' || id === 'intake-general') updateSelectedCare();
    syncThemeColor(id);
    if(id==='address') syncFieldClearButtons();
    if(id === 'profile') isAuthenticated = true;
    // An active case starts when the patient actually has one: a treatment plan accepted
    // or an order placed. Merely opening the profile is not a case, so a first-time user
    // is never blocked by the "you already have a case" guard.
    if(['address','delivery-quote','pharmacy-search','pharmacypending','payment-items','payment','payment-processing','payment-success','tracking','order-summary'].includes(id)) hasActiveCase = true;
    if(id==='address'){
      const recipientEditor=document.querySelector('[data-address-recipient-editor]');
      if(recipientEditor) recipientEditor.hidden=false;
      // Restore the editor draft once. Delayed hydration must not erase typing.
      syncDeliveryAddress({hydrateForm:true});
      /* The manual fields are the address; an edit has to arrive with them
         filled in, the same way the map screen used to get them. */
      hydrateAddressMapSearch();
      syncAddressLabelChips();
      if(!addressFormIntent) addressPageMode='list';
      addressFormIntent=false;
      setAddressPageMode(addressPageMode);

    }
    if(id==='consultpay'){ applyCoverageFlag(); syncConsultationAppointmentSummary(); }
    if(id==='plan') syncDeclinedMedicines();
    /* What is on the form is a still of the pin — the pannable map is the
       current-location dialog — so there is nothing here to bind panning to. */
    if(id==='address'){ renderAddressPinPreview(); }
    fillDoctorName();
    if(id==='profile') syncHomeFollowUpCta();
    if(id==='appointment'){ syncAppointmentDays(); resetAppointment(); }
    if(id==='appointment-booked'){
      const when=document.querySelector('#appointment-booked [data-appointment-when]');
      if(when) when.textContent=flowState.appointmentWhen || '';
    }
    /* Client, 22 Sep: this used to raise a toast on arrival saying the fee is
       settled with the medicine. The notice above the pay button says the same
       thing and stays on the page, so the toast was the second of two. Removed;
       the footer notice carries it. */
    if(id==='delivery-quote'){
      clearTimeout(deliveryQuoteTimer);
      clearInterval(deliveryQuoteCountdownTimer);
      /* SCR-013B confirms the delivery method and shows only an estimate. The
         next SCR-014 owns pharmacy acceptance, stock and final pricing. Keeping
         those responsibilities separate prevents checkout opening too early. */
      const quoteScreen=document.getElementById('delivery-quote');
      const title=quoteScreen?.querySelector('[data-delivery-quote-title]');
      const copy=quoteScreen?.querySelector('[data-delivery-quote-copy]');
      if(!hasFulfillableItems()){
        replaceCurrent('payment');
        return;
      }
      invalidateFulfillmentQuote();
      persistFlowState();
      /* One state, not two (client, 23 Aug): title, one line, counter — the
         same shape as every other loading screen. The old version changed its
         own heading halfway through, which read as two pages in five seconds. */
      quoteScreen.dataset.quoteState='estimating';
      const pickup=flowState.orderState.fulfillmentMode==='pickup';
      if(title) title.textContent=pickup ? 'กำลังค้นหาสาขารับยา' : 'กำลังคำนวณค่าจัดส่ง';
      if(copy) copy.textContent=pickup ? 'ตรวจสอบสาขาใกล้คุณและเวลารับยา' : 'ตรวจสอบพื้นที่จัดส่งและค่าจัดส่งโดยประมาณ';
      const quoteCountdown=quoteScreen.querySelector('[data-delivery-quote-timer]');
      let quoteElapsedSeconds=0;
      paintElapsedTimer(quoteCountdown,quoteElapsedSeconds);
      clearInterval(deliveryQuoteCountdownTimer);
      deliveryQuoteCountdownTimer=setInterval(() => {
        quoteElapsedSeconds+=1;
        paintElapsedTimer(quoteCountdown,quoteElapsedSeconds);
        if(quoteElapsedSeconds>=DELIVERY_QUOTE_SECONDS) clearInterval(deliveryQuoteCountdownTimer);
      },1000);
      deliveryQuoteTimer=setTimeout(() => {
        clearInterval(deliveryQuoteCountdownTimer);
        if(!quoteScreen?.classList.contains('active')) return;
        const sameDay=!pickup && flowState.orderState.deliveryMethod==='same-day';
        const estimate=sameDay ? calculatedSameDayDeliveryFee() : 0;
        quoteScreen.dataset.quoteState='estimated';
        /* The quote is the last thing checkout was waiting on, so it is banked
           here and the patient is put back where they were — on the delivery
           section they just filled in. */
        flowState.orderState.deliveryQuoteStatus='accepted';
        flowState.orderState.deliveryQuoteAmount=pickup ? 0 : estimate;
        ensurePaymentDeadline();
        persistFlowState();
        refreshMedicationCheckout();
        focusCheckoutDelivery=true;
        replaceCurrent('payment');
      }, reduceMotion ? 600 : DELIVERY_QUOTE_SECONDS*1000);
    }
    if(id==='payment-items') syncOrderCheckout();
    if(id==='payment'){
      syncDeliveryAddress();
      refreshMedicationCheckout();
      if(focusCheckoutDelivery){
        focusCheckoutDelivery=false;
        /* Coming back from the quote, the answer the patient is looking for is
           the address they just entered, not the top of the page. Measured off
           the rendered rects rather than offsetTop, which still reads the
           mid-transition offset while the screen is sliding in. */
        setTimeout(() => {
          const row=document.querySelector('#payment [data-payment-address-row]');
          const body=document.querySelector('#payment .screen__body');
          if(!row || !body) return;
          /* Scroll to the section, not the row, so the "การจัดส่ง" label above
             it stays on screen and the row still reads as part of something. */
          const block=row.closest('.stack-2') || row;
          const top=body.scrollTop + (block.getBoundingClientRect().top - body.getBoundingClientRect().top) - 12;
          body.scrollTo({top:Math.max(0,top), behavior:reduceMotion ? 'auto' : 'smooth'});
          row.classList.add('is-just-set');
          setTimeout(() => row.classList.remove('is-just-set'), 1800);
        }, reduceMotion ? 0 : 260);
      }
    }
    if(id==='payment' || id==='payment-gw') startPaymentDeadlineTimer();
    else stopPaymentDeadlineTimer();
    if(['payfail','payment-processing','payment-success','pharmacypending','tracking','order-summary'].includes(id)) syncPaymentOutcome();
    if(['payment-processing','payment-success','tracking','order-summary'].includes(id)) syncPostPaymentPanels();
    /* Pharmacy verification, acceptance/reservation and preparation all run
       before payment. Keep SCR-016D visible so the patient can understand that
       their clinical documents are now available, then let the CTA open tracking. */
    clearTimeout(paymentSuccessTimer);
    clearTimeout(preloaderTimer);
    if(id==='preloader' && !window.KraneReviewTools?.enabled){
      preloaderTimer=setTimeout(() => {
        if(document.getElementById('preloader')?.classList.contains('active')) replaceCurrent('landing');
      },reduceMotion ? 350 : 1800);
    }
    clearTimeout(connectTimer);
    // F13: entering a call marks it active; the chat screen then shows the return bar
    if(id === 'video'){
      callActive = true; lastCall = id;
      // Every fresh call starts on camera, whatever state a previous call ended in.
      const camBtn = document.querySelector('#video [data-camera-toggle]');
      if(camBtn && camBtn.getAttribute('aria-pressed') === 'true') camBtn.click();
      scheduleConsultationSummary();
    }
    if(id === 'consult'){
      const pill = document.querySelector('#consult [data-live-pill]');
      if(pill){ pill.hidden = !callActive; pill.dataset.go = lastCall; }
      syncConsultationSummaryUnread(false);
      const plan=document.querySelector('#consult [data-plan-card]');
      /* The plan has to arrive in front of the patient: the doctor types, then
         the list appears. When it was revealed while the patient was still on
         video, opening the chat replays that moment once instead of showing a
         list that was already sitting there (client, 19 Aug). */
      if(plan?.dataset.shown && plan.dataset.seenInChat){
        const typing=document.querySelector('#consult [data-typing]');
        const status=document.querySelector('#consult [data-rx-bar]');
        if(typing) typing.style.display='none';
        if(status) status.style.display='none';
        plan.removeAttribute('data-wait-hidden');
      }else{
        if(plan?.dataset.shown){
          delete plan.dataset.shown;
          plan.classList.remove('reveal-in');
          plan.setAttribute('data-wait-hidden','');
          const typing=document.querySelector('#consult [data-typing]');
          const status=document.querySelector('#consult [data-rx-bar]');
          if(typing) typing.style.display='';
          if(status) status.style.display='';
        }
        if(plan) plan.dataset.seenInChat='1';
        scheduleConsultationSummary();
      }
    }
    // UT-18: loading states show elapsed time. A count-up clock communicates
    // that work is progressing without promising a completion time we cannot guarantee.
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
    // Pharmacy and stock confirmation happens before bank payment. A decline
    // reroutes automatically; after three branches checkout offers postal fulfilment.
    clearTimeout(phTimer); clearTimeout(phFailTimer); clearTimeout(phStageTimer); clearInterval(phCountdownTimer);
    const pScr = document.getElementById('pharmacy-search');
    if(id === 'pharmacy-search' && pScr){
      const thai=document.documentElement.lang==='th';
      const heading = pScr.querySelector('[data-ph-heading] .h1');
      const hint = pScr.querySelector('[data-ph-heading] .muted');
      const graphic = pScr.querySelector('[data-ph-graphic]');
      const phCountdown = pScr.querySelector('[data-ph-countdown]');
      if(graphic){
        graphic.classList.remove('state-view__visual--danger');
        graphic.classList.add('state-view__visual--loading');
      }
      /* Two named stages on one clock: finding a pharmacy, then the pharmacist
         checking the order (client, 19 Aug). A retry re-enters at stage one. */
      const phHeadings = thai
        ? ['กำลังค้นหาร้านยาใกล้คุณ','กำลังตรวจสอบร้านยาอื่น','กำลังตรวจสอบร้านยาอื่น']
        : ['Finding a pharmacy near you','Checking another pharmacy','Checking another pharmacy'];
      if(heading) heading.textContent = phHeadings[Math.min(pharmacyRetryCount, 2)];
      if(hint) hint.textContent = pharmacyRetryCount
        ? (thai ? 'ร้านก่อนหน้านี้มีสินค้าไม่ครบ กำลังหาร้านใหม่ก่อนเปิดการชำระเงิน' : 'The previous pharmacy did not have every item. Checking another branch before payment.')
        : (thai ? 'ส่งรายการให้ร้านยาที่ใกล้ที่สุดก่อนเปิดการชำระเงิน' : 'Sending the order to the nearest pharmacy before payment opens.');
      if(!pharmacyRetryCount){
        phStageTimer=setTimeout(() => {
          if(!pScr.classList.contains('active')) return;
          if(heading) heading.textContent = thai ? 'เภสัชกรกำลังตรวจสอบรายการ' : 'Pharmacist checking your order';
          if(hint) hint.textContent = thai
            ? 'ตรวจใบสั่งยา สต็อก และราคาสุทธิก่อนชำระเงิน'
            : 'Checking the prescription, stock and final price before payment.';
        }, reduceMotion ? 600 : 4200);
      }
      let phElapsedSeconds=0;
      paintElapsedTimer(phCountdown,phElapsedSeconds);
      phCountdownTimer=setInterval(() => {
        if(!pScr.classList.contains('active')){ clearInterval(phCountdownTimer); return; }
        phElapsedSeconds+=1;
        paintElapsedTimer(phCountdown,phElapsedSeconds);
      },1000);
      phTimer = setTimeout(() => {
        if(!pScr.classList.contains('active')) return;
        if(pharmacyForceDecline){
          pharmacyForceDecline = false; // one-shot demo trigger
          // Failed state: shown automatically, no action required from the patient.
          if(heading) heading.textContent = thai ? 'กำลังตรวจสอบร้านยาอื่น' : 'Checking another pharmacy';
          if(hint) hint.textContent = thai ? 'ร้านก่อนหน้านี้มีสินค้าไม่ครบ กำลังหาร้านใหม่ก่อนเปิดการชำระเงิน' : 'The previous pharmacy did not have every item. Checking another branch before payment.';
          if(graphic){
            graphic.classList.remove('state-view__visual--loading');
            graphic.classList.add('state-view__visual--danger');
          }
          phFailTimer = setTimeout(() => {
            if(!pScr.classList.contains('active')) return;
            pharmacyRetryCount += 1;
            if(pharmacyRetryCount >= 3){
              /* Client, 5 Oct: this used to be a screen of its own that said
                 no branch could deliver today and offered one button, which
                 was the button the patient had already pressed on checkout.
                 The checkout says it instead: same-day and priority come off
                 the list, the order falls back to standard post, and a toast
                 says why. Nothing else about the page changes. */
              deliveryMethod = 'postal';
              flowState.orderState.deliveryMethod='postal';
              flowState.orderState.fulfillmentMode='delivery';
              flowState.orderState.sameDayUnavailable=true;
              flowState.orderState.deliveryQuoteStatus='accepted';
              flowState.orderState.deliveryQuoteAmount=0;
              flowState.orderState.stockLocked=true;
              flowState.orderState.pharmacyAccepted=true;
              flowState.orderState.pharmacyPrepared=false;
              flowState.orderState.paymentExpiresAt=Date.now()+PAYMENT_WINDOW_MS;
              persistFlowState();
              pharmacyRetryCount = 0;
              pharmacyForceDecline = false;
              refreshMedicationCheckout();
              replaceCurrent('payment');
              showActionToast('ไม่มีร้านที่ส่งได้ภายในวัน เปลี่ยนเป็นจัดส่งมาตรฐาน 1 ถึง 3 วัน ไม่มีค่าใช้จ่ายเพิ่ม','warning');
              return;
            }
            show('pharmacy-search', false);
          }, 1400);
          return;
        }
        pharmacyRetryCount = 0;
        if(window.KraneGoldenDemo) window.KraneGoldenDemo.advanceFulfilment('Pharmacy accepted');
        const lockedDeliveryFee=flowState.orderState.fulfillmentMode==='pickup' ? 0 : (flowState.orderState.deliveryMethod==='same-day' ? calculatedSameDayDeliveryFee() : 0);
        flowState.orderState.deliveryQuoteStatus='accepted';
        flowState.orderState.deliveryQuoteAmount=lockedDeliveryFee;
        flowState.orderState.stockLocked=true;
        flowState.orderState.pharmacyAccepted=true;
        flowState.orderState.pharmacyPrepared=false;
        flowState.orderState.paymentExpiresAt=Date.now()+PAYMENT_WINDOW_MS;
        persistFlowState();
        /* Stock recheck is a pre-payment detour, not fulfilment. Return to the
           same checkout with the refreshed quote; no payment or tracking state
           is created here. */
        replaceCurrent('payment');
        showActionToast('ร้านยายืนยันสต็อกและอัปเดตยอดแล้ว','success');
      }, 10000);
    }
    // waiting room: the patient cannot enter until the doctor admits them (client v3)
    clearInterval(prepCountdownTimer);
    /* Legacy/direct links may still open this transition screen. It is only a
       stock-confirmation handoff before payment and must never create a paid or
       dispatched order. */
    clearTimeout(phPreparedTimer);
    if(id === 'pharmacypending'){
      const scr=document.getElementById('pharmacypending');
      const thai=document.documentElement.lang==='th';
      const prepEl=scr.querySelector('[data-prep-countdown]');
      const title=scr.querySelector('[data-prep-title]');
      const copy=scr.querySelector('[data-prep-copy]');
      const badge=scr.querySelector('[data-prep-badge]');
      scr.dataset.prepStage='confirmed';
      if(title) title.textContent=thai ? 'ร้านยายืนยันสต็อกแล้ว' : 'Pharmacy stock confirmed';
      if(copy) copy.textContent=thai ? 'อัปเดตสต็อกและยอดเรียบร้อย กำลังกลับไปหน้าชำระเงิน' : 'Stock and total updated. Returning to checkout.';
      if(prepEl) prepEl.textContent='';
      if(badge) badge.setAttribute('data-lucide','package-check');
      window.lucide?.createIcons({attrs:{'stroke-width':1.8}});
      phPreparedTimer=setTimeout(() => {
        if(!scr.classList.contains('active')) return;
        replaceCurrent('payment');
      }, reduceMotion ? 300 : 900);
    }
    clearTimeout(waitTimer);
    if(id === 'waitroom') resetWaitroom();
    else { stopWaitroomEntryWindow(); closeWaitroomExpiredModal(); }
    // Leaving the live consultation cancels pending demo messages. Switching
    // between video and chat does not, because it is still the same session.
    if(!['consult','video'].includes(id)){
      clearTimeout(typingTimer);
      typingTimer=null;
      syncConsultationSummaryUnread(false);
    }
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
    updateFeatToast(id);
  }

  // deep link: open a screen directly via URL hash (e.g. prototype.html#concern)
  function applyHash(){
    const [rawId,hashQuery=''] = location.hash.slice(1).split('?');
    // Preserve old bookmarks after removing obsolete patient-facing screens.
    const legacyRoutes = {'prescription':'my-documents','choosedoc':'matching','payment-processing':'payment-success','concern':'conditions','summary':'signup','intake-ins':'signup','insurance-policy':'insurance','reduce-order':'payment','partner-concern':'intake-concern','partner-intake':'intake-general','intake-edu':'intake-general','followups':'profile','history':'activity','nurse':'matching'};
    /* The manual address form is an edit action, not a public destination.
       Reloaded/shared hashes return to the review screen; only its explicit
       “แก้ไขที่อยู่” text link opens the form in the current session. */
    const id = rawId==='address-detail' ? 'payment' : rawId==='address-map' ? 'address' : (legacyRoutes[rawId] || rawId);
    const hashParams = new URLSearchParams(hashQuery);
    const freshRequested=!freshDeepLinkConsumed && (hashParams.get('fresh')==='1' || flowConfig.get('fresh')==='1');
    if(freshRequested) freshDeepLinkConsumed=true;
    if(id && document.getElementById(id)){
      /* A public "start care" link is a new-user testing journey. Reset the
         prior participant's session-scoped onboarding flags before routing so
         an OTP completed earlier in the same tab cannot silently skip account
         creation and expose doctor matching. Internal app navigation omits
         fresh=1, so a genuinely signed-in patient's active journey is kept. */
      if(id==='intake1' && freshRequested){
        /* Client, 25 Sep: a patient who is already signed in and starts another
           intake must not be asked to register again. Every "start care" link
           on the landing and the condition pages carries fresh=1, and this
           reset was clearing the sign-in with the journey — so a patient who
           had just logged in reached the end of the questionnaire and was sent
           to "create an account". The case the reset is for is a half-finished
           sign-up left in the tab by someone else, not a completed one: the
           account survives, the journey does not. */
        const keepAccount=signedIn();
        const account=keepAccount ? {
          patientName:flowState.patientName,
          verifiedPhone:flowState.verifiedPhone,
          authProvider:flowState.authProvider,
          profileDisplayName:flowState.profileDisplayName,
          profilePictureUrl:flowState.profilePictureUrl,
          lineProfilePictureUrl:flowState.lineProfilePictureUrl
        } : null;
        resetRequiredFlow();
        isAuthenticated=keepAccount;
        journeyActive=false;
        postAuthNext='intake1';
        history=['landing'];
        if(keepAccount){
          Object.assign(flowState,account);
          applyAuthenticatedAccount({returning:true});
        }
      }
      // A partner link represents an authenticated handoff. Start at the same
      // consent page as the reference journey, with a clean patient case.
      if(id==='consent-terms' && freshRequested
         && (hashParams.get('entry') || flowConfig.get('entry'))==='partner'){
        resetRequiredFlow();
        pendingQueue=null;
        if(!queuePreview) try{localStorage.removeItem(QUEUE_KEY)}catch(_){}
        flowState.entryChannel='partner';
        seedClinicalDemoStage('consent-terms');
        history=['landing'];
      }
      /* A fresh tracking link represents the order immediately after payment,
         not the final state left behind by a previous QA run in this tab. */
      if(id==='tracking' && freshRequested){
        flowState.orderDelivered=false;
      flowState.csatDone=false;
      flowState.csatDeliveryPrompted=false;
      flowState.deliveryNotified=false;
        window.KraneGoldenDemo?.writeState({fulfilmentStatus:'Preparing'});
        persistFlowState();
      }
      // Hash deep links can arrive from a standalone condition-detail page in
      // the same browser that previously used a Partner flow. Resolve the entry
      // channel before seeding history or showing the screen; show() uses it to
      // decide whether the direct-care progress bar is visible.
      const entry = hashParams.get('entry');
      if(entry==='direct' || entry==='partner'){
        flowState.entryChannel=entry;
        persistFlowState();
      }
      if(guardActiveCase(id)){
        history=['landing'];
        show('landing',false);
        return;
      }
      if(id === 'login') postAuthNext = 'profile';
      const category = hashParams.get('category');
      if(category && setSelectedCategory(category)){
        renderConditionList();
      }
      if(window.kraneDemoStage===id || window.kraneDemoStatus) seedClinicalDemoStage(id);
      history=seededHistory(id); show(id, false);
    }
  }

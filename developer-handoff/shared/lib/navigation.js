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
    if(id==='payment-success' && flowState.orderState.clinicalPrescription){ if (kraneHandle_payment_success_lifecycle_6()) return; }
    if(id==='articles') window.kraneArticleMock?.renderFeed();
    if(id==='article') window.kraneArticleMock?.renderDetail();
    ensureAppBarLockup(id);
    kraneGeneralHealthArrival(id);
    if(id==='tracking' || id==='activity' || id==='order-summary') syncTrackingDelivery();
    if(id==='tracking' && orderFulfilmentStatus()==='Delivered' && !flowState.csatDone){ if (kraneHandle_tracking_lifecycle_7()) return; }
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
    if(id==='conditions' && prevId!=='conditions'){ if (kraneHandle_conditions_lifecycle_8()) return; }
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
    kraneRoute_login_5(id);
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
    kraneSignupArrivalToast(shouldShowSignupIntakeToast);
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
    if(id === 'consent-terms'){ if (kraneHandle_consent_terms_lifecycle_9()) return; }
    if(id === 'patient-info'){ if (kraneHandle_patient_info_lifecycle_10()) return; }
    if(id === 'conditions') renderConditionList();
    if(JOURNEY_INTAKE.includes(id) || JOURNEY_AUTH.includes(id)){
      flowState.lastRequiredScreen=id;
      persistFlowState();
    }
    applyInsuranceVisibility();
    if(id === 'insurance'){ if (kraneHandle_insurance_lifecycle_11()) return; }
    if(id === 'matching' || id === 'intake1' || id === 'intake-concern' || id === 'intake-general') updateSelectedCare();
    syncThemeColor(id);
    if(id==='address') syncFieldClearButtons();
    if(id === 'profile') isAuthenticated = true;
    // An active case starts when the patient actually has one: a treatment plan accepted
    // or an order placed. Merely opening the profile is not a case, so a first-time user
    // is never blocked by the "you already have a case" guard.
    if(['address','delivery-quote','pharmacy-search','pharmacypending','payment-items','payment','payment-processing','payment-success','tracking','order-summary'].includes(id)) hasActiveCase = true;
    if(id==='address'){ if (kraneHandle_address_lifecycle_12()) return; }
    if(id==='consultpay'){ applyCoverageFlag(); syncConsultationAppointmentSummary(); }
    if(id==='plan') syncDeclinedMedicines();
    /* What is on the form is a still of the pin — the pannable map is the
       current-location dialog — so there is nothing here to bind panning to. */
    if(id==='address'){ if (kraneHandle_address_lifecycle_13()) return; }
    fillDoctorName();
    if(id==='profile') syncHomeFollowUpCta();
    if(id==='appointment'){ syncAppointmentDays(); resetAppointment(); }
    if(id==='appointment-booked'){ if (kraneHandle_appointment_booked_lifecycle_14()) return; }
    /* Client, 22 Sep: this used to raise a toast on arrival saying the fee is
       settled with the medicine. The notice above the pay button says the same
       thing and stays on the page, so the toast was the second of two. Removed;
       the footer notice carries it. */
    if(id==='delivery-quote'){ if (kraneHandle_delivery_quote_lifecycle_15()) return; }
    if(id==='payment-items') syncOrderCheckout();
    if(id==='payment'){ if (kraneHandle_payment_lifecycle_16()) return; }
    if(id==='payment' || id==='payment-gw') startPaymentDeadlineTimer();
    else stopPaymentDeadlineTimer();
    if(['payfail','payment-processing','payment-success','pharmacypending','tracking','order-summary'].includes(id)) syncPaymentOutcome();
    if(['payment-processing','payment-success','tracking','order-summary'].includes(id)) syncPostPaymentPanels();
    /* Pharmacy verification, acceptance/reservation and preparation all run
       before payment. Keep SCR-016D visible so the patient can understand that
       their clinical documents are now available, then let the CTA open tracking. */
    clearTimeout(paymentSuccessTimer);
    clearTimeout(preloaderTimer);
    if(id==='preloader' && !window.KraneReviewTools?.enabled){ if (kraneHandle_preloader_lifecycle_17()) return; }
    clearTimeout(connectTimer);
    // F13: entering a call marks it active; the chat screen then shows the return bar
    if(id === 'video'){ if (kraneHandle_video_lifecycle_18(id)) return; }
    if(id === 'consult'){ if (kraneHandle_consult_lifecycle_19()) return; }
    // UT-18: loading states show elapsed time. A count-up clock communicates
    // that work is progressing without promising a completion time we cannot guarantee.
    kraneRoute_matching_1(id);
    // Pharmacy and stock confirmation happens before bank payment. A decline
    // reroutes automatically; after three branches checkout offers postal fulfilment.
    kraneRoute_pharmacy_search_2(id);
    // waiting room: the patient cannot enter until the doctor admits them (client v3)
    kraneRoute_pharmacypending_3(id);
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
    kraneRoute_rx_writing_4(id);
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

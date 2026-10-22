
  // Keep every primary action outside the scrolling content region. Some legacy
  // prototype sections close their body after the footer; normalising that DOM
  // once gives every screen the same fixed-header / scrolling-body / fixed-CTA shell.
  document.querySelectorAll('.screen').forEach(screen => {
    const body=screen.querySelector(':scope > .screen__body');
    const footer=body && body.querySelector(':scope > .screen__footer');
    if(footer) screen.appendChild(footer);
  });
  const screens = [...document.querySelectorAll('.screen')];
  // Stable reviewer-facing IDs are separate from the product SCR inventory.
  // One SID identifies a canonical view; legacy route shells may provide different
  // contexts to the same component without creating another screen identity.
  const reviewScreenIds=window.KraneReviewTools.screenIds;
  const prototypeRail = document.querySelector('#prototype-rail');
  window.KraneReviewTools.renderRail(prototypeRail, screens);
  screens.forEach(screen => {
    const reviewId=reviewScreenIds[screen.id];
    if(reviewId) screen.dataset.reviewScreenId=reviewId;
  });
  const railLinks = [...document.querySelectorAll('.rail a[data-go]')];
  const railToggle = prototypeRail?.querySelector('.rail-toggle');
  const railCollapseStorageKey = 'krane-prototype-rail-collapsed';
/* isEnglishUi: shared/lib/ui.js */

/* setPrototypeRailCollapsed: shared/lib/ui.js */

  try{ setPrototypeRailCollapsed(window.localStorage.getItem(railCollapseStorageKey) === '1', false); }catch(error){ setPrototypeRailCollapsed(false, false); }
  railToggle?.addEventListener('click', () => setPrototypeRailCollapsed(!document.body.classList.contains('rail-is-collapsed')));
  document.querySelectorAll('.rail a[data-go],.rail a[data-screen-ref]').forEach(link => {
    if(link.querySelector('.rail-screen-id')) return;
    const screenId=link.dataset.go || link.dataset.screenRef;
    const reviewId=reviewScreenIds[screenId];
    if(!screenId || !reviewId) return;
    const idLabel=document.createElement('span');
    idLabel.className='rail-screen-id';
    idLabel.textContent=`${reviewId} · #${screenId}`;
    const stateLabel=link.querySelector('.rail-state');
    if(stateLabel) link.insertBefore(idLabel,stateLabel);
    else link.appendChild(idLabel);
  });
  let history = ['landing'];
  let selectedCategoryId = 'hair-skin';
/* isGeneralPath: shared/lib/ui.js */

/* sharedConcernRequired: shared/lib/ui.js */


  let selectedConditionId = 'hair-loss';
  let isAuthenticated = false;
  // The auth screens (login, signup, OTP, patient info) belong to the intake
  // journey only when the patient reached them from it. A returning user who
  // opens Log in from the nav or from "ดูแลต่อเนื่อง" has not answered อาการ yet,
  // so the 5-step care stepper must NOT show อาการ as done for them.
  let journeyActive = false;
  const JOURNEY_INTAKE = ['concern','conditions','intake1','intake2','intake3','intake4','intake5','intake-concern','intake-general'];
  const JOURNEY_AUTH = ['signup','login','social-confirm','otp','consent-terms','patient-info','identity'];
  // The public walkthrough starts clean. Existing-case protection is enabled only
  // after the demo enters the returning-patient profile state.
  let hasActiveCase = false;
  let postAuthNext = 'intake1';
  let patientInfoNext = 'matching';
  // Doctor matching outcome. true -> a doctor is matched and the consultation
  // balance gate decides whether checkout is needed; false -> no doctor can be
  // matched now, so #appointment is shown to book a time instead.
  // Set per route by directClinicalStartTarget(): sexual health always fails to
  // match, everything else always succeeds.
  let doctorAvailable = true;
  let actionToastTimer;
  const actionToast = document.createElement('div');
  actionToast.className = 'action-toast';
  actionToast.setAttribute('role', 'status');
/* placeActionToast: shared/lib/ui.js */

  placeActionToast();
/* showActionToast: shared/lib/ui.js */

  const activeCaseModal = document.getElementById('active-case-modal');
  let activeCaseReturnFocus = null;
/* openActiveCaseModal: shared/lib/ui.js */

/* closeActiveCaseModal: shared/lib/ui.js */

/* guardActiveCase: shared/lib/navigation.js */

  activeCaseModal.querySelectorAll('[data-active-case-close]').forEach(button => button.addEventListener('click',() => closeActiveCaseModal(true)));
  activeCaseModal.querySelector('[data-active-case-resume]').addEventListener('click',() => {
    isAuthenticated = true;
    closeActiveCaseModal(false);
    history = ['landing','activity'];
    show('activity',false);
    showActionToast('กลับมาที่เคส #KR-10293 แล้ว','info');
  });
  activeCaseModal.addEventListener('keydown',event => {
    if(event.key === 'Escape'){ event.preventDefault(); closeActiveCaseModal(true); return; }
    if(event.key !== 'Tab') return;
    const focusable=[...activeCaseModal.querySelectorAll('button:not([disabled])')];
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus()}
    if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus()}
  });
  const FLOW_STATE_KEY = 'krane-p01-flow-state-v1';
  const AUTH_PROFILE_KEY = 'krane-auth-profile-v1';
  const DRAFT_KEY = 'krane-p01-intake-draft-v2';
  const CONSENT_RECORD_KEY = 'krane-p01-consent-records-v1';
  const FOLLOWUP_RECORD_KEY = 'krane-p01-followup-record-v1';
  const QUEUE_KEY='krane-pending-consultation-v1';
  const queuePreview=new URLSearchParams(location.search).has('demoStage');
  let queueDismissOnce=false;
  let pendingQueue=queuePreview ? null : readLocalJson(QUEUE_KEY);
  if(!pendingQueue?.startedAt) pendingQueue=null;
  if(pendingQueue?.session){
    Object.entries(pendingQueue.session).forEach(([key,value]) => {
      if([FLOW_STATE_KEY,DRAFT_KEY,CONSENT_RECORD_KEY].includes(key)) writeSessionJson(key,value);
    });
  }

  const MALI_SAVED_ADDRESS = {
    recipientFirstName:'มะลิ',
    recipientLastName:'สุธิดา',
    recipientName:'มะลิ สุธิดา',
    recipientPhone:'081-234-5678',
    building:'เดอะ เบส พาร์ค เวสต์, ห้อง 22/418',
    floor:'22',
    line:'ซอยสุขุมวิท 77',
    subdistrict:'แขวงพระโขนงเหนือ',
    districtName:'เขตวัฒนา',
    province:'กรุงเทพมหานคร',
    postcode:'10110',
    district:'แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
    note:'',
    km:'3.2'
  };
  const flowState = Object.assign({
    draftReady:false,
    accountCreated:false,
    otpVerified:false,
    passwordSet:false,
    passwordResetPending:false,
    signupDonePending:false,
    patientInfoComplete:false,
    identityVerified:false,
    returningIdentityValid:false,
    consentsComplete:false,
    verifiedPhone:'',
    phoneOtpPending:false,
    pendingPhone:'',
    phoneOtpReturn:'',
    phoneOtpDestination:'',
    phoneOtpCompletesAuth:false,
    returningLogin:false,
    lastRequiredScreen:'concern',
    patientName:'',
    authProvider:'',
    profileDisplayName:'',
    profilePictureUrl:'',
    lineProfilePictureUrl:'',
    paymentPreference:'self-pay',
    consentRead:{pdpa:false,telemedicine:false},
    consentChecked:{pdpa:false,telemedicine:false,marketing:false},
    entryChannel:'direct',
    consultationPaymentTiming:'after',
    consultationFeeAcknowledged:false,
    consultationPaid:false,
    directGeneralHealthComplete:false,
    followUpDirectToWaitroom:false,
    followUpContext:null,
    paymentResolution:'',
    documentsUnlocked:false,
    coverage:{provider:'',policyId:'',consultationCredit:0,medicineCredit:0},
    orderState:{
      checkoutOrigin:'consultation',
      quantities:{cough:2,loratadine:1,paracetamol:2,naproxen:1},
      deliveryMethod:'same-day',
      fulfillmentMode:'delivery',
      address:{},
      addressConfirmed:false,
      deliveryQuoteStatus:'pending',
      deliveryQuoteAmount:null,
      addOns:{wellness:false,pillcase:false,pouch:false},
      addonQuantities:{wellness:0,pillcase:0,pouch:0},
      promoCode:'',
      promoAmount:0,
      paymentMethod:'qr',
      amountDue:558,
      stockLocked:false,
      pharmacyAccepted:false,
      pharmacyPrepared:false,
      paymentExpiresAt:null,
      paidAmount:null,
      paidMethod:'',
      paidDeliveryMethod:''
    },
    partnerConsentComplete:false,
    partnerIdStepDone:false,
    partnerInfoComplete:false,
    partnerPaymentChosen:false,
    partnerHealthComplete:false,
    partnerConcernComplete:false,partnerConcern:'',partnerConcernDuration:'',partnerConcernRelief:'',
    partnerReviewComplete:false,partnerReviewConfirmedAt:'',
    partnerNurseComplete:false,
    partnerPhone:'',
    partnerPhoneVerified:false,
    partnerInfoContinueAfterOtp:false,partnerPhoneOtpPending:false,
    partnerPendingPhone:'',
    partnerName:'',
    partnerIdentityDob:'',
    partnerPaymentMethod:'',
    partnerConsultationBalanceDue:null,
    partnerMedicineCredit:0,
    partnerHealth:{conditions:'ไม่มี',medications:'ไม่มี',allergies:'ไม่มี',lifestyle:'ไม่',sex:'',dob:'',height:'',weight:''},
    partnerScreening:{urgent:'',accurate:'',remote:''}
  }, readSessionJson(FLOW_STATE_KEY));
  flowState.partnerHealth=Object.assign(
    {conditions:'ไม่มี',medications:'ไม่มี',allergies:'ไม่มี',lifestyle:'ไม่',sex:'',dob:'',height:'',weight:''},
    flowState.partnerHealth || {}
  );
  flowState.partnerScreening=Object.assign(
    {urgent:'',accurate:'',remote:''},
    flowState.partnerScreening || {}
  );
  flowState.coverage=Object.assign(
    {provider:'',policyId:'',consultationCredit:0,medicineCredit:0},
    flowState.coverage || {}
  );
  flowState.orderState=Object.assign(
    {checkoutOrigin:'consultation',quantities:{cough:2,loratadine:1,paracetamol:2,naproxen:1},deliveryMethod:'same-day',fulfillmentMode:'delivery',address:{},addressConfirmed:false,deliveryQuoteStatus:'pending',deliveryQuoteAmount:null,addOns:{wellness:false,pillcase:false,pouch:false},addonQuantities:{wellness:0,pillcase:0,pouch:0},promoCode:'',promoAmount:0,paymentMethod:'qr',amountDue:558,stockLocked:false,pharmacyAccepted:false,pharmacyPrepared:false,paymentExpiresAt:null,paidAmount:null,paidMethod:'',paidDeliveryMethod:''},
    flowState.orderState || {}
  );
  flowState.orderState.address=Object.assign(
    {},
    flowState.orderState.address || {}
  );
  flowState.orderState.quantities=Object.assign(
    {cough:2,loratadine:1,paracetamol:2,naproxen:1},
    flowState.orderState.quantities || {}
  );
  flowState.orderState.addOns=Object.assign(
    {wellness:false,pillcase:false,pouch:false},
    flowState.orderState.addOns || {}
  );
  flowState.orderState.addonQuantities=Object.assign(
    {wellness:0,pillcase:0,pouch:0},
    flowState.orderState.addonQuantities || {}
  );
  /* Optional retail products are opt-in for each order. An older prototype
     migrated a previous session's selected card into the next checkout, which
     made an add-on look preselected. Clear that stale state once; selections
     made with this version still survive an ordinary refresh of the same order. */
  const ADDON_UI_VERSION='optional-addons-opt-in-v2';
  if(flowState.orderState.addonUiVersion!==ADDON_UI_VERSION){
    Object.keys(flowState.orderState.addOns).forEach(key => {
      flowState.orderState.addOns[key]=false;
      flowState.orderState.addonQuantities[key]=0;
    });
    flowState.orderState.addonUiVersion=ADDON_UI_VERSION;
    try { sessionStorage.setItem(FLOW_STATE_KEY,JSON.stringify(flowState)); } catch(error) {}
  }
  const flowConfig=new URLSearchParams(window.location.search);
  if(flowConfig.get('entry')==='partner') flowState.entryChannel='partner';
  if(flowConfig.get('entry')==='direct') flowState.entryChannel='direct';
  if(flowConfig.get('consult_payment')==='before') flowState.consultationPaymentTiming='before';
  if(flowConfig.get('consult_payment')==='after') flowState.consultationPaymentTiming='after';
  /* The golden Mali S. QA path starts with a saved delivery address. Address editing
     remains an explicit detour from checkout and never interrupts plan acceptance. */
  /* Checkout now starts WITHOUT a delivery address so the auto-fill on #address
     is visibly driven by pin selection. The saved Mali S. address is still
     reachable: ?address=saved (or localStorage kraneDemoSavedAddress) restores
     the pre-filled state for demoing a returning patient. */
  const wantSavedAddress = /(?:\?|&)address=saved\b/.test(location.search)
    || (()=>{ try{ return localStorage.getItem('kraneDemoSavedAddress')==='1' }catch(e){ return false } })();
  if(wantSavedAddress){
    // An explicit returning-patient QA route must win even when this tab has
    // already passed an older checkout migration.
    flowState.orderState.address=Object.assign({},MALI_SAVED_ADDRESS);
    flowState.orderState.addressConfirmed=true;
    flowState.orderState.deliveryQuoteStatus='pending';
    flowState.orderState.deliveryQuoteAmount=null;
    flowState.orderState.stockLocked=false;
    flowState.orderState.pharmacyAccepted=false;
    flowState.orderState.pharmacyPrepared=false;
    flowState.orderState.checkoutFlowVersion='pharmacy-precheckout-v4';
  } else if(flowState.orderState.checkoutFlowVersion!=='pharmacy-precheckout-v4'){
    flowState.orderState.deliveryQuoteStatus='pending';
    flowState.orderState.deliveryQuoteAmount=null;
    flowState.orderState.stockLocked=false;
    flowState.orderState.pharmacyAccepted=false;
    flowState.orderState.pharmacyPrepared=false;
    flowState.orderState.paymentExpiresAt=null;
    flowState.orderState.checkoutFlowVersion='pharmacy-precheckout-v4';
  }
/* readSessionJson: shared/lib/ui.js */

/* writeSessionJson: shared/lib/ui.js */

/* readLocalJson: shared/lib/ui.js */

/* writeLocalJson: shared/lib/ui.js */

  /* The landing runs this app inside the how-it-works phone with ?demoStage=,
     and that copy seeds a signed-in journey so the screens have something to
     show. Same origin means the same session storage, so those seeds were
     landing in the visitor's own session and the landing then greeted them by
     name. A demo copy keeps its state in memory and writes nothing. */
  const IS_DEMO_EMBED = (() => {
    try{
      const params=new URLSearchParams(location.search);
      return Boolean(params.get('demoStage') || params.get('demoStatus'));
    }catch(_){ return false; }
  })();
  /* The showcase phone crops this app at the frame's screen opening, so a
     surface that runs its content to the last pixel of the viewport gets
     sliced mid-line by the bezel. The demo copy marks itself so the stylesheet
     can keep a home-indicator sized band clear at the bottom. */
  if(IS_DEMO_EMBED) document.documentElement.classList.add('is-demo-embed');
/* persistFlowState: shared/lib/ui.js */

/* resetRequiredFlow: shared/lib/ui.js */


  const consentDocuments = {
    pdpa:{
      label:'PDPA',
      version:'pdpa-v1',
      title:'รายละเอียดการใช้ข้อมูลส่วนบุคคลและข้อมูลสุขภาพ',
      description:'กรุณาอ่านจนจบก่อนกลับไปเลือกให้ความยินยอม',
      body:'<section><h3>1. ข้อมูลที่ Krane ใช้</h3><p>ข้อมูลระบุตัวผู้รับบริการและข้อมูลติดต่อ หัวข้อที่ปรึกษา คำตอบแบบประเมิน ประวัติสุขภาพ โรคประจำตัว ยาและอาหารเสริม การแพ้ยา รวมถึงรูปภาพหรือเอกสารที่คุณแนบ</p></section><section><h3>2. วัตถุประสงค์</h3><p>ใช้เพื่อยืนยันตัวตน จัดทำเวชระเบียน ส่งข้อมูลให้แพทย์ที่รับผิดชอบประเมินความเหมาะสม ให้คำปรึกษา ออกแผนการดูแล และประสานการรับยาตามใบสั่งแพทย์เมื่อเกี่ยวข้อง</p></section><section><h3>3. ผู้ที่เข้าถึงข้อมูล</h3><p>เฉพาะบุคลากรทางการแพทย์และผู้ให้บริการที่จำเป็นต่อเคส ตามบทบาทและขอบเขตที่ได้รับอนุญาต</p></section><section><h3>4. การจัดเก็บและความปลอดภัย</h3><p>ข้อมูลจะถูกเก็บตามกฎหมายและมาตรฐานเวชระเบียน พร้อมการควบคุมการเข้าถึง การเข้ารหัส และบันทึกการใช้งาน</p></section><section><h3>5. สิทธิ์ของคุณ</h3><p>คุณมีสิทธิ์ขอเข้าถึง แก้ไข คัดค้าน จำกัดการใช้ ถอนความยินยอม หรือขอลบข้อมูลเมื่อกฎหมายอนุญาต</p></section><section><h3>6. การติดต่อ</h3><p>หากมีคำถามเกี่ยวกับข้อมูลส่วนบุคคลหรือการใช้สิทธิ์ โปรดติดต่อ support@krane.clinic</p></section>'
    },
    telemedicine:{
      label:'ความยินยอมการแพทย์ทางไกล',
      version:'telemedicine-v1',
      title:'รายละเอียดบริการการแพทย์ทางไกล',
      description:'กรุณาอ่านขอบเขตและข้อจำกัดจนจบก่อนกลับไปเลือกให้ความยินยอม',
      body:'<section><h3>1. รูปแบบบริการ</h3><p>การปรึกษาเกิดผ่านระบบออนไลน์ด้วยวิดีโอ เสียง หรือข้อความตามบริการที่เปิดใช้งาน แพทย์จะใช้ข้อมูลที่คุณให้เพื่อประเมินความเหมาะสม</p></section><section><h3>2. ข้อจำกัด</h3><p>การปรึกษาทางไกลอาจไม่สามารถทดแทนการตรวจร่างกาย การตรวจแล็บ หรือการดูแลฉุกเฉินได้ทุกกรณี</p></section><section><h3>3. เหตุขัดข้องทางเทคนิค</h3><p>หากการเชื่อมต่อมีปัญหา ทีมดูแลอาจติดต่อกลับหรือเปลี่ยนช่องทางตามความเหมาะสม โดยไม่รับประกันว่าทุกบริการจะจบผ่านช่องทางอื่นได้</p></section><section><h3>4. เหตุเร่งด่วน</h3><p>บริการนี้ไม่ใช่บริการฉุกเฉิน หากมีอาการรุนแรงหรือเสี่ยงอันตราย กรุณาติดต่อบริการฉุกเฉินหรือไปโรงพยาบาลใกล้ที่สุด</p></section><section><h3>5. การตัดสินใจทางคลินิก</h3><p>แพทย์อาจแนะนำให้พบแพทย์ด้วยตนเองหรือขอข้อมูลเพิ่มเติมก่อนให้แผนการรักษา</p></section><section><h3>6. การยืนยัน</h3><p>การเลือกยินยอมหมายถึงคุณเข้าใจรูปแบบ ข้อจำกัด และความเสี่ยงของบริการการแพทย์ทางไกล</p></section>'
    }
  };
  const partnerConsentVersions = {
    pdpa:consentDocuments.pdpa.version,
    telemedicine:consentDocuments.telemedicine.version
  };
/* consentLedger: shared/lib/intake.js */

/* saveConsentRecords: shared/lib/intake.js */

/* hasCurrentConsent: shared/lib/intake.js */

  // Consent is version-aware. A phone-number edit never clears a still-current
  // consent record, so changing the number repeats OTP without reopening PDPA.
  if(flowState.consentsComplete && !hasCurrentConsent('direct') && !hasCurrentConsent('partner')) flowState.consentsComplete=false;
  if(flowState.partnerConsentComplete && !hasCurrentConsent('partner')) flowState.partnerConsentComplete=false;
  persistFlowState();
  const consentRead = Object.assign({pdpa:false,telemedicine:false},flowState.consentRead || {});
  const consentChecked = Object.assign({pdpa:false,telemedicine:false,marketing:false},flowState.consentChecked || {});
  const consentChecks = [...document.querySelectorAll('[data-consent-checkbox]')];
  const requiredConsentChecks = consentChecks.filter(input => input.dataset.consentRequired !== 'false');
  const consentContinue = document.querySelector('[data-consent-continue]');
  const consentAutoScroll = document.querySelector('[data-consent-auto-scroll]');
  let consentAutoCheckTimer = 0;
/* consentIdentityVerified: shared/lib/intake.js */

/* signupPasswordReady: pages/signup/page.js */

/* syncSignupPassword: pages/signup/page.js */

kraneInit_signup_98();

/* syncSignupSubmit: pages/signup/page.js */

  kraneInit_signup_initialSubmit();
/* renderConsentReadState: shared/lib/intake.js */

/* markConsentRead: shared/lib/intake.js */

/* unlockConsentBundleAfterDelay: pages/consent-terms/page.js */

/* checkConsentScrollEnd: shared/lib/intake.js */

  kraneInit_consent_terms_owned_79();
  const consentPageScroll=document.querySelector('[data-consent-page-scroll]');
  kraneInit_consent_terms_owned_81();
/* syncConsentContinue: shared/lib/intake.js */

  kraneInit_consent_terms_owned_82();
  kraneInit_consent_terms_owned_83();
  kraneInit_consent_terms_initialContinue();
  kraneInit_consent_terms_owned_85();

  // Full labels are read by screen readers and shown for the current step.
  // Short labels keep all five visible at once in a phone frame, so the patient can
  // always see the whole service: what they are doing now, when they meet the doctor,
  // and that it ends with medicine delivered to their home.
  // Numbered to match the real screen order: the patient answers first and registers
  // once there is something to save, so "หัวข้อปรึกษา" is step 1 and the account plus
  // health record is step 2. If the client wants ข้อมูลผู้รับบริการ back at step 1,
  // swap the first two entries here and move patient-info ahead of concern.
  /* Five underlying stages, shown as three grouped segments: intake+account
     (1+2), consultation fee through the doctor visit (3+4), and fulfilment
     (5) stand alone. Grouping only changes what's drawn here; every screen
     still maps to its own specific stage below. */
  /* Client (17 Aug): the three steps are named for what the patient actually
     does — answer the questionnaire, see the doctor, pay. */
  const careJourneyLabels = ['แบบประเมิน','ปรึกษาแพทย์','ยาและชำระเงิน'];
  const careJourneyShort  = ['แบบประเมิน','ปรึกษาแพทย์','ยาและชำระเงิน'];
  /* Screens map to three patient-facing stages. The header is a step indicator,
     not a loading meter: completed and current stages render as full segments,
     while future stages stay neutral. */
  const careJourneyStageOrder = {
    1: ['concern','conditions','intake1','intake2','intake3','intake4','intake5','intake-concern',
        'signup','login','social-confirm','otp','consent-terms','identity','patient-info','insurance-result'],
    2: ['intake-general','matching','appointment','consultpay','consultpay-gw','consultpay-fail',
        'waitroom','consult','video','rx-writing','rx-plan','appointment-booked'],
    /* Tracking is not a step of the journey: by then it is finished and paid,
       and the stepper sat above the delivery saying the patient was still in
       the middle of something (client, 10 Sep). It is last in this list, so
       dropping it leaves every other screen's position unchanged. */
    3: ['address','delivery-quote','pharmacy-search','pharmacypending',
        'payment','payment-gw','payment-processing','payfail','payment-success']
  };
  const careJourneyScreens = Object.entries(careJourneyStageOrder)
    .reduce((acc,[stage,ids]) => { ids.forEach(id => { acc[id]=Number(stage); }); return acc; },{});
/* intakeQuestionFraction: shared/lib/intake.js */

  /* Measured against the steps a patient actually walks, not against every
     screen in the stage: the gateway, retry and error screens are the same
     step as the one they belong to, so counting them would make the bar crawl
     and then jump. Each inner list is one step; the first id in it is the one
     it is named for. */
  const careJourneyMilestones={
    1:[['concern','conditions'],['intake1'],['intake2'],['intake3'],['intake4'],
       ['intake5','intake-concern'],['signup','login','social-confirm','otp'],
       ['consent-terms'],['identity','patient-info','insurance-result']],
    2:[['intake-general'],['matching'],['appointment','appointment-booked'],
       ['consultpay','consultpay-gw','consultpay-fail'],['waitroom'],
       ['consult','video'],['rx-writing','rx-plan']],
    3:[['address'],['delivery-quote'],['pharmacy-search','pharmacypending'],
       ['payment','payment-gw','payfail'],['payment-processing'],['payment-success']]
  };
/* careJourneyFill: shared/lib/ui.js */

/* syncCareJourneyFill: shared/lib/ui.js */

/* careJourneyMarkup: shared/lib/ui.js */

  Object.entries(careJourneyScreens).forEach(([id,current]) => {
    const screen=document.getElementById(id);
    const top=screen && screen.querySelector('.screen__top');
    if(!top) return;
    // Order on every screen: back bar (top) -> main 5-step stepper -> sub bar.
    // The stepper is always inserted right under the back/title bar.
    top.insertAdjacentHTML('afterend', careJourneyMarkup(current));
    // The second thin bar is gone. It measured sub-steps while the stepper above
    // measured stages, and both rendered as "1 / 5" a few pixels apart. The
    // current stage's segment now fills as the sub-steps complete, so one
    // control carries both facts. Strip the old bar and its duplicate count.
    const progress = top.querySelector('.progress');
    if(progress){
      const track = progress.closest('.grow') || progress;
      track.remove();
      const count = top.querySelector('.hint');
      if(count) count.remove();
    }
    // The consultation-fee screens used to override the step name and its
    // next-preview here, because the generic stage names ("Doctor" / "Order")
    // did not describe them. Stage 2 is now literally ปรึกษาแพทย์ and stage 3
    // ชำระเงิน, so the override would only restate what the stepper says.
  });
  // Photo upload on the intake photo step: real file picker, live thumbnails,
  // remove with the × button. Demo only, nothing leaves the browser.
  kraneInit_intake5_owned_92();

  // Identity documents stay on-device in this prototype.  Each card is a real
  // label for its file input, so desktop opens a file picker and mobile can
  // open the front camera for the selfie capture.
  kraneInit_identity_owned_93();
/* baht: shared/lib/ui.js */

  const PAYMENT_METHOD_LABELS={qr:'QR Code',card:'บัตรเครดิต / เดบิต',bank:'โมบายล์แบงกิ้ง',covered:'Covered by benefit'};
  let appliedPromo = flowState.orderState.promoAmount
    ? {code:flowState.orderState.promoCode,amount:Number(flowState.orderState.promoAmount)}
    : null;
  let paymentDue = 558;
  let paymentCredit = 0;
  let paymentConsultationDiscount = 0;
/* currentMedicationDue: shared/lib/ui.js */

/* syncPaymentFooterSavings: pages/payment/page.js */

/* syncMedicationFailureAmount: pages/payfail/page.js */

  const validPromoCodes = { WELCOME100: { amount:100, label:'ลด ฿ 100 สำหรับคำสั่งซื้อแรก' } };
/* enforceCheckoutSequence: pages/payment/page.js */

  enforceCheckoutSequence();
/* syncOrderCheckout: pages/payment/page.js */

/* deliveryAddressSummary: shared/lib/address.js */

/* splitRecipientName: shared/lib/ui.js */

/* recipientNameParts: shared/lib/ui.js */

  const ADDRESS_FIELD_KEYS={addrBuilding:'building',addrFloor:'floor',addrLine:'line',addrDistrict:'district',addrNote:'note'};
/* writeDeliveryAddressDraft: shared/lib/intake.js */

/* readDeliveryAddressDraft: shared/lib/intake.js */

/* hasClearableFieldValue: shared/lib/ui.js */

/* syncFieldClearButtons: pages/address/page.js */

/* setupClearableFields: pages/address/page.js */

  window.addEventListener('pageshow',syncFieldClearButtons);
/* clearDeliveryAddressForm: pages/address/page.js */


  kraneInit_address_clearAll();
/* recipientFields: pages/address/page.js */

/* clearRecipientFields: shared/lib/ui.js */

  kraneInit_address_owned_104();
/* deliveryAddressDraft: shared/lib/intake.js */

/* persistAddressEditorDraft: shared/lib/intake.js */

kraneInit_address_155();

/* syncDeliveryAddress: pages/address/page.js */

  /* Address search is a true hierarchy, not four unrelated dropdowns. Each
     choice filters the next level; changing an upstream value clears every
     dependent answer so an impossible address can never be submitted. */
  const ADDRESS_MAP_GEOGRAPHY={
    'กรุงเทพมหานคร':{
      'คลองเตย':{'คลองเตย':['10110'],'คลองตัน':['10110'],'พระโขนง':['10110']},
      'วัฒนา':{'คลองเตยเหนือ':['10110'],'คลองตันเหนือ':['10110'],'พระโขนงเหนือ':['10110']},
      'บางรัก':{'บางรัก':['10500'],'สีลม':['10500'],'สุริยวงศ์':['10500'],'สี่พระยา':['10500']}
    },
    'นนทบุรี':{
      'เมืองนนทบุรี':{'บางกระสอ':['11000'],'ตลาดขวัญ':['11000'],'สวนใหญ่':['11000']},
      'ปากเกร็ด':{'ปากเกร็ด':['11120'],'บางพูด':['11120'],'บ้านใหม่':['11120']}
    },
    'สมุทรปราการ':{
      'เมืองสมุทรปราการ':{'ปากน้ำ':['10270'],'บางเมือง':['10270'],'สำโรงเหนือ':['10270']},
      'บางพลี':{'บางพลีใหญ่':['10540'],'บางแก้ว':['10540'],'ราชาเทวะ':['10540']}
    }
  };
  const ADDRESS_MAP_CASCADE_IDS=['addressMapProvince','addressMapDistrict','addressMapSubdistrict','addressMapPostcode'];
/* replaceAddressMapOptions: shared/lib/address.js */

/* syncAddressMapCascade: pages/address/page.js */

/* hydrateAddressMapSearch: pages/address/page.js */

  kraneInit_address_cascade();
  let manualMapRequest=0;
/* syncMapFromAddressFields: shared/lib/address.js */

/* resizeAddressMapQuery: pages/address/page.js */

  kraneInit_address_resize();
/* persistAddressSearchDraft: pages/address/page.js */

kraneInit_address_168();

/* commitManualAddress: pages/address/page.js */

kraneInit_address_170();

/* readAddressInputs: pages/address/page.js */

/* syncAddressEditorReadiness: pages/address/page.js */

kraneInit_address_173();

  let addressRecipientEditing=false;
/* clearFieldError: shared/lib/ui.js */

/* setFieldError: shared/lib/ui.js */

  /* A location picked from the map or from "use my current location" often
     comes back with holes: the geocoder has no house number, or names a
     district that is not one of the options we offer. Telling the patient to
     "complete the address" from the screen they are already on is a dead end,
     so the gaps are named here and the form is opened on them instead
     (client, 29 Sep). */
  const ADDRESS_GAP_FIELDS=[
    {key:'building', field:'addressMapQuery',      label:'บ้านเลขที่ อาคาร หรือชื่อสถานที่'},
    {key:'line',     field:'addressMapQuery',      label:'ซอยหรือถนน'},
    {key:'province', field:'addressMapProvince',   label:'จังหวัด'},
    {key:'districtName', field:'addressMapDistrict', label:'เขตหรืออำเภอ'},
    {key:'subdistrict',  field:'addressMapSubdistrict', label:'แขวงหรือตำบล'},
    {key:'postcode', field:'addressMapPostcode',   label:'รหัสไปรษณีย์'}
  ];
/* addressLocationGaps: shared/lib/address.js */

/* openAddressFormForGaps: pages/address/page.js */

/* saveDeliveryAddress: pages/address/page.js */

/* addressBookKey: shared/lib/address.js */

/* addressBookName: shared/lib/address.js */

/* addressBookFullLine: shared/lib/address.js */

/* addressBookRecipientLine: shared/lib/address.js */

/* escapeAddressText: shared/lib/address.js */

/* addressBookStorageKey: shared/lib/address.js */

/* persistAddressBook: shared/lib/address.js */

/* savedAddresses: shared/lib/address.js */

/* rememberDeliveryAddress: shared/lib/address.js */

/* lastUsedAddressIndex: shared/lib/address.js */

  /* Selecting in the list is selecting, not navigating: the radio moves, the
     footer confirms. Opening the form is what "แก้ไข" is for. */
  let addressListSelected=-1;
/* renderAddressList: shared/lib/address.js */

/* selectListAddress: shared/lib/address.js */

/* confirmDeleteSavedAddress: shared/lib/address.js */

/* deleteSavedAddress: shared/lib/address.js */

/* confirmListAddress: pages/payment/page.js */

  /* Client, 30 Sep: arriving here from checkout is the ordinary delivery
     address page, whether or not one has been saved before. "เพิ่มที่อยู่ใหม่"
     is the state reached from the address book's own button, so only that
     sets it. */
  let addressPageMode=['new','editor'].includes(flowState.addressDraftMode) ? flowState.addressDraftMode : 'list';
  /* Client, 5 Oct: opening the address page lands on the addresses, every
     time. Three things open the form instead, and they say so — adding one,
     editing one, and coming back from the map with a pin. Anything else, from
     checkout to a restored session that was left mid-form, gets the list. */
  let addressFormIntent=false;
  let addressEditingSavedIndex=-1;
/* setAddressPageMode: pages/address/page.js */

/* useSavedAddress: pages/address/page.js */

/* editSavedAddress: shared/lib/address.js */


  /* บ้าน and ที่ทำงาน are what nearly every saved address is called, so they
     are two taps rather than two words typed. อื่นๆ opens the field for the
     rest. */
  /* อื่นๆ stays open on an empty field — it was just tapped to type in, and
     deriving it from the value alone closed it again on the same keystroke. */
  let addressLabelCustom=false;
/* syncAddressLabelChips: pages/address/page.js */

kraneInit_address_205();

kraneInit_address_206();

/* startNewAddress: pages/address/page.js */

kraneInit_address_208();

/* tomorrowLabel: shared/lib/ui.js */

/* deliveryOutcomeLabel: shared/lib/orders.js */

/* syncCertificateIdentity: shared/lib/ui.js */

/* refreshMyDocuments: pages/my-documents/page.js */

  kraneInit_my_documents_owned_124();
  kraneInit_my_documents_owned_125();
/* syncPaymentOutcome: pages/payment-success/page.js */

/* setPaymentContext: shared/lib/orders.js */


  // F08: scalable category -> condition model. Add categories/conditions here without changing the layout.
  const consultationCatalog = [
    {
      id:'hair-skin',
      programTitle:'Hair restoration programme',
      title:'Hair loss & scalp',
      description:'Hair thinning, shedding and scalp concerns.',
      icon:'hair',
      status:'Launch',
      next:'conditions',
      conditions:[
        { id:'hair-loss', title:'Hair loss', titleTh:'ผมร่วงและผมบาง', description:'Thinning, receding hairline, shedding or scalp concerns.', descriptionTh:'ผมบาง แนวผมร่น ผมร่วง หรือปัญหาหนังศีรษะ', status:'Launch', next:'intake1' }
      ]
    },
    {
      id:'skin',
      title:'Skin & acne',
      description:'Acne, irritation and other skin concerns.',
      icon:'skin',
      status:'Launch',
      next:'conditions',
      conditions:[
        { id:'acne', title:'Acne & breakouts', titleTh:'สิวและรอยสิว', description:'Blackheads, inflamed acne, cysts or acne marks.', descriptionTh:'สิวอุดตัน สิวอักเสบ สิวซีสต์ หรือรอยสิว', status:'Launch', next:'intake1' },
        { id:'skin-rash', title:'Rash or skin irritation', titleTh:'ผื่นหรือการระคายเคืองผิว', description:'Itching, redness, flaking or a new skin change.', descriptionTh:'อาการคัน แดง ลอก หรือผิวเปลี่ยนแปลงผิดปกติ', status:'Launch', next:'intake1' }
      ]
    },
    {
      id:'weight',
      programTitle:'Weight loss programme',
      title:'Weight care & metabolism',
      description:'Weight goals, metabolic health and doctor-led treatment options.',
      icon:'weight',
      status:'Launch',
      next:'conditions',
      conditions:[
        { id:'weight-management', title:'Weight care assessment', titleTh:'ประเมินการดูแลน้ำหนัก', description:'Review weight goals, health history and suitability for available care options.', descriptionTh:'ทบทวนเป้าหมายน้ำหนัก ประวัติสุขภาพ และความเหมาะสมของตัวเลือกการดูแล', status:'Launch', next:'intake1' }
      ]
    },
    {
      id:'sexual-health',
      programTitle:"Men's sexual wellness programme",
      title:'Sexual health',
      description:'ED, performance concerns and related men\'s health questions.',
      icon:'heart',
      status:'Launch',
      next:'conditions',
      conditions:[
        { id:'ed', title:'Erectile dysfunction', titleTh:'ภาวะหย่อนสมรรถภาพ', description:'Difficulty getting or maintaining an erection.', descriptionTh:'แข็งตัวได้ยากหรือไม่สามารถคงการแข็งตัวได้', status:'Launch', next:'intake1' },
        { id:'early-ejaculation', title:'Premature ejaculation', titleTh:'การหลั่งเร็ว', description:'Ejaculating sooner than you or your partner would like.', descriptionTh:'หลั่งเร็วกว่าที่คุณหรือคู่ต้องการ', status:'Launch', next:'intake1' },
        { id:'sexual-general', title:'Other sexual health concern', titleTh:'ข้อกังวลด้านสุขภาพทางเพศอื่น ๆ', description:'Low desire, performance concerns or another private question.', descriptionTh:'ความต้องการลดลง ความกังวลเรื่องสมรรถภาพ หรือเรื่องส่วนตัวอื่น ๆ', status:'Launch', next:'intake1' }
      ]
    },
    {
      id:'sleep-stress',
      title:'Sleep & stress',
      description:'Sleep quality, stress, energy and daily functioning.',
      icon:'moon',
      status:'Launch',
      next:'conditions',
      conditions:[
        { id:'sleep', title:'Sleep support', titleTh:'ปัญหาการนอน', description:'Trouble falling asleep, staying asleep or waking rested.', descriptionTh:'หลับยาก หลับไม่ต่อเนื่อง หรือตื่นมาแล้วยังไม่สดชื่น', status:'Launch', next:'intake1' },
        { id:'stress', title:'Stress or anxiety support', titleTh:'ความเครียดหรือความกังวล', description:'Ongoing stress, worry or difficulty unwinding.', descriptionTh:'เครียดหรือกังวลต่อเนื่อง และผ่อนคลายได้ยาก', status:'Launch', next:'intake1' }
      ]
    },
    {
      id:'hormone',
      title:'Hormones & TRT',
      description:'Energy, hormone symptoms and doctor-led TRT assessment.',
      icon:'hormone',
      status:'Launch',
      next:'conditions',
      conditions:[
        { id:'hormone-assessment', title:'Hormone & TRT assessment', titleTh:'ประเมินฮอร์โมนและ TRT', description:'Review symptoms, health history, medicines and relevant lab results before considering treatment.', descriptionTh:'ทบทวนอาการ ประวัติสุขภาพ ยาที่ใช้ และผลตรวจที่เกี่ยวข้องก่อนพิจารณาการรักษา', status:'Launch', next:'intake1' }
      ]
    },
    {
      id:'general',
      programTitle:'General health consultation',
      title:'Common symptoms such as a cold, sore throat, or runny nose / Not sure',
      description:'Not sure where to start? Talk to a doctor without choosing a disease path.',
      icon:'chat',
      status:'General',
      next:'intake1',
      general:true,
      conditions:[]
    }
  ];
/* iconSvg: shared/lib/ui.js */


  /* Client, 20 Sep: the treatment page offers the three conditions Krane
     actually treats today, the same three the landing sells, plus a general
     consultation. The rest of the catalogue stays here for the condition
     pages and for the day they open. */
  const LIVE_CATEGORY_IDS = ['hair-skin','weight','sexual-health'];
/* liveCategories: shared/lib/ui.js */

/* renderConsultationCatalog: shared/lib/clinical.js */

/* selectedCategory: shared/lib/intake.js */


  let renderedIntakeContext = '';
  const categoryAliases = {
    hair:'hair-skin',
    'hair-skin':'hair-skin',
    skin:'skin',
    weight:'weight',
    sexual:'sexual-health',
    'sexual-health':'sexual-health',
    sleep:'sleep-stress',
    'sleep-stress':'sleep-stress',
    general:'general'
  };
/* setSelectedCategory: shared/lib/intake.js */

/* categoryNeedsPhotos: shared/lib/intake.js */

/* intakeDropdown: shared/lib/intake.js */

/* intakeDurationControl: shared/lib/intake.js */

/* intakeChoiceQuestion: shared/lib/intake.js */

  const intakeTemplates = kraneCreateIntakeTemplates();

  const intakeBaseMarkup = {};
  /* Specialty care keeps one clinical question per page. General consultation
     is intentionally compact: its concern, description and duration belong on
     one screen, and the shared health profile is one complete form just like
     the insurance journey. Client, 6 Oct: the three-page version of the
     general intake is dropped for good — the check that still asked for it
     went with it. */
  const INTAKE_ONE_QUESTION_SCREENS = ['intake1','intake2','intake3','intake4'];
  /* Client, 17 Sep: "Why we ask" on every question read as nagging. It stays
     only where the patient must be told something (the emergency check) or the
     question is very personal (body measurements, and how a sexual-health
     concern affects daily life). The privacy line stays wherever it was. */
  const INTAKE_GUIDANCE = {
    intake2:[{
      question:0,
      copy:'This helps the doctor understand how much the concern affects your daily life.',
      explain:category => category==='sexual-health',
      privacy:true
    }],
    intake3:[{
      question:0,
      privacy:true
    }]
  };
/* addIntakeQuestionGuidance: shared/lib/intake.js */

/* intakeQuestionPageState: shared/lib/intake.js */

/* intakeQuestionIsSingleChoice: shared/lib/intake.js */

/* redFlagSource: shared/lib/ui.js */

/* openRedFlagSheet: pages/ineligible/page.js */

/* activateIntakeQuestionPage: shared/lib/intake.js */

/* ensureAppBarLockup: shared/lib/ui.js */

/* setupIntakeQuestionPages: shared/lib/intake.js */

/* focusMissingIntakeAnswer: shared/lib/intake.js */

/* advanceIntakeQuestionPage: shared/lib/intake.js */

/* retreatIntakeQuestionPage: shared/lib/intake.js */

/* intakeRequirementState: pages/intake1/page.js */

/* syncIntakeDropdownContinue: shared/lib/intake.js */

/* composeDistrict: shared/lib/address.js */

  const SIM_PLACES = [
    { title:'เดอะ เบส พาร์ค เวสต์ ห้อง 22/418', aliases:'the base park west', building:'เดอะ เบส พาร์ค เวสต์ ห้อง 22/418', floor:'22', line:'ซอยสุขุมวิท 77',
      subdistrict:'แขวงพระโขนงเหนือ', districtName:'เขตวัฒนา', province:'กรุงเทพมหานคร', postcode:'10110' },
    { title:'ไอดีโอ สุขุมวิท 93, ห้อง 8/12', aliases:'ideo ideomobi ideo mobi sukhumvit', building:'ไอดีโอ สุขุมวิท 93, ห้อง 8/12', floor:'8', line:'ถนนสุขุมวิท',
      subdistrict:'แขวงบางจาก', districtName:'เขตพระโขนง', province:'กรุงเทพมหานคร', postcode:'10260' },
    { title:'โนเบิล รีวอลฟ์ รัชดา, ห้อง 15/7', aliases:'noble revolve ratchada', building:'โนเบิล รีวอลฟ์ รัชดา, ห้อง 15/7', floor:'15', line:'ถนนรัชดาภิเษก',
      subdistrict:'แขวงห้วยขวาง', districtName:'เขตห้วยขวาง', province:'กรุงเทพมหานคร', postcode:'10310' },
    { title:'ริทึ่ม เอกมัย, ห้อง 6/22', aliases:'rhythm ekkamai', building:'ริทึ่ม เอกมัย, ห้อง 6/22', floor:'6', line:'ซอยเอกมัย 12',
      subdistrict:'แขวงคลองตันเหนือ', districtName:'เขตวัฒนา', province:'กรุงเทพมหานคร', postcode:'10110' },
    { title:'ลุมพินี เพลส พระราม 4, ห้อง 11/3', aliases:'lumpini place rama 4', building:'ลุมพินี เพลส พระราม 4, ห้อง 11/3', floor:'11', line:'ถนนพระราม 4',
      subdistrict:'แขวงคลองเตย', districtName:'เขตคลองเตย', province:'กรุงเทพมหานคร', postcode:'10110' }
  ];
  kraneInit_address_places();
  const simState = { x:0, y:0, z:1, place:SIM_PLACES[0], picked:false };
/* simReverseGeocode: shared/lib/address.js */

/* simApplyTransform: shared/lib/ui.js */

/* simUpdateReadout: shared/lib/ui.js */

/* simBindPan: shared/lib/ui.js */

  const addressPicker=document.getElementById('address-picker');
  let addressPickerPlace=null, addressPickerSnapshot=null, addressPickerSession=0;
/* addressPickerStatus: shared/lib/address.js */

/* closeAddressPicker: shared/lib/address.js */

/* openAddressPicker: shared/lib/address.js */

  kraneInit_address_owned_139();
/* confirmAddressPicker: shared/lib/address.js */

/* simLocate: shared/lib/ui.js */

  /* ======================================================================
     REAL ADDRESSES — OpenStreetMap
     Search and reverse geocoding go to Nominatim; the picker draws OSM raster
     tiles directly. Both are free and need no key. Both are also best effort:
     when the network is unavailable the sample list and the CSS street grid
     still drive the same applyAddress() contract, so the walkthrough never
     dead-ends offline.
     ====================================================================== */
  const OSM_ENDPOINT='https://nominatim.openstreetmap.org';
  const OSM_TILES='https://tile.openstreetmap.org';
/* partsFromDisplayName: shared/lib/ui.js */

/* placeFromOsm: shared/lib/address.js */

/* osmFetch: shared/lib/address.js */

/* osmSearch: shared/lib/address.js */

/* osmReverse: shared/lib/address.js */


  /* ---- Slippy map, hand-rolled ---- */
  const OSM_TILE_SIZE=256;
  const osmView={lat:13.7308,lon:100.5698,zoom:16,ready:false,failed:false};
  let osmReverseToken=0, osmReverseTimer=0;
  const osmLonToX=(lon,z) => (lon+180)/360*Math.pow(2,z);
  const osmLatToY=(lat,z) => {
    const rad=lat*Math.PI/180;
    return (1-Math.log(Math.tan(rad)+1/Math.cos(rad))/Math.PI)/2*Math.pow(2,z);
  };
  const osmXToLon=(x,z) => x/Math.pow(2,z)*360-180;
  const osmYToLat=(y,z) => {
    const n=Math.PI-2*Math.PI*y/Math.pow(2,z);
    return 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)));
  };
/* renderOsmTiles: shared/lib/address.js */

/* renderAddressPinPreview: shared/lib/address.js */


  // Hidden screens and resized browser panels need tiles for their actual width.
  let addressPreviewFrame=0;
  const addressPreviewObserver=new ResizeObserver(() => {
    cancelAnimationFrame(addressPreviewFrame);
    addressPreviewFrame=requestAnimationFrame(renderAddressPinPreview);
  });
  kraneInit_address_owned_151();
/* osmDisable: shared/lib/address.js */

/* scheduleOsmReverse: shared/lib/address.js */

/* osmSetView: shared/lib/address.js */

/* osmBindPan: shared/lib/address.js */

/* setupAddressMap: shared/lib/address.js */

/* osmZoomBy: shared/lib/address.js */

/* addressSuggestionsFor: shared/lib/address.js */

  let addressSuggestions=[];
/* activeAddressSearch: shared/lib/address.js */

/* renderAddressSuggestions: shared/lib/address.js */

/* closeAddressSuggestions: shared/lib/address.js */

  /* Local samples answer the first keystroke instantly; the real geocoder
     replaces them a beat later. Typing "The Line" used to return nothing at
     all, because the sample list is Thai only (client, 18 Aug). */
  let addressSearchTimer=0, addressSearchToken=0;
/* scheduleAddressSearch: shared/lib/address.js */

/* setupAddressSearch: shared/lib/address.js */

/* bindAddressSearch: pages/address/page.js */

/* applyAddress: pages/address/page.js */

/* syncComposedDistrict: pages/address/page.js */


  /* The UX copy doc writes the doctor as "แพทย์ __". Bind it to one value
     rather than shipping the underscores. Production replaces DOCTOR_NAME with
     the matched doctor from the booking response; every [data-doctor-name] slot
     picks it up. */
  /* ==================== PENDING DECISIONS ====================
     Each of these is BUILT but OFF. Flip the flag to turn it on; nothing else
     needs editing. Set from the URL for a quick look, e.g. ?coverage=on
     ------------------------------------------------------------------- */
  const KRANE_FLAGS = (() => {
    const q = new URLSearchParams(location.search);
    return {
      // Q1: show the consultation fee struck through to 0 with a coverage line.
      // Answer "coverage on, partner only" -> set coverageLine to true.
      coverageLine: q.get('coverage') === 'on' ? true : false,
      // Q1b: does coverage apply to everyone, or only the partner entry?
      coverageAllEntries: false,
    };
  })();

  const DOCTOR_NAME = 'นรินทร์';
/* fillDoctorName: shared/lib/clinical.js */

  /* The home banner follows the patient's actual situation (client, 23 Aug):
     someone with a booked follow-up is offered that, not "start a consultation".
     The date is read off the treatment card rather than written twice, so the
     two can never disagree, and each banner keeps its own translation because
     both are in the markup. */
  /* Only worth saying when the appointment is close (client, 1 Sep). A date
     eleven days out is not news, and a permanent banner for it is noise. */
  const FOLLOWUP_NOTICE_MS = 24 * 60 * 60 * 1000;
  const FOLLOWUP_JOIN_MS = 10 * 60 * 1000;
  const FOLLOWUP_GRACE_MS = 90 * 60 * 1000;
  /* The seeded follow-ups were fixed calendar dates, so the three-day reminder
     would stop appearing four days after they were written and the demo link
     would quietly lose the feature part-way through a testing round (client,
     1 Sep). They are offsets from today now: one inside the window so the
     reminder always has something to show, one outside so the hidden case is
     still demonstrable.

     The date is written in whichever language is on rather than left to the
     i18n pass, because that pass matches whole strings from a fixed table and
     a date that moves every day can never be in one. */
  const FOLLOWUP_MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const FOLLOWUP_MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const followUpAppointments=new Map();
  const followUpDemoState=new URLSearchParams(location.search).get('demoFollowup');
/* followUpAppointmentFor: shared/lib/clinical.js */

/* formatFollowUpDate: shared/lib/ui.js */

/* formatFollowUpTime: shared/lib/ui.js */

/* syncConsultationAppointmentSummary: pages/consultpay/page.js */

/* syncFollowUpDates: shared/lib/ui.js */

  /* Rewrite on the language toggle. Watching the lang attribute keeps this out
     of i18n.js, and cannot loop: the swap changes text, never that attribute.
     The reminder is re-synced too — it holds a copy of the date, so on its own
     it kept whichever language was showing when the screen was opened. */
  if(window.MutationObserver){
    new MutationObserver(() => { syncFollowUpDates(); syncHomeFollowUpCta(); syncAppointmentDays(); renderAppointmentSlots(); syncConsultationAppointmentSummary(); })
      .observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
/* syncTreatmentStatus: pages/profile/page.js */

/* formatFollowUpCountdown: shared/lib/ui.js */

/* formatFollowUpPill: shared/lib/ui.js */

/* followUpNodeForCase: shared/lib/ui.js */

/* syncFollowUpCaseStates: shared/lib/ui.js */

kraneInit_profile_320();

/* syncHomeFollowUpCta: pages/profile/page.js */

kraneInit_profile_322();

/* beginAssignedDoctorFlow: pages/intake-general/page.js */

/* setTreatmentDetailTab: pages/treatment-detail/page.js */

/* openTreatmentDetail: pages/treatment-detail/page.js */

/* applyCoverageFlag: pages/consultpay/page.js */

/* syncDeclinedMedicines: shared/lib/ui.js */

kraneInit_address_328();

kraneInit_address_329();

/* renderIntakeQuestions: shared/lib/intake.js */


  /* The landing is an embedded frame, so the status-bar strip is painted by
     THIS document, not by the banner inside it. Keep the browser chrome on the
     banner blue while that screen is up and on the app tone everywhere else. */
  const THEME_COLOR_APP='#F7F7F7';
  const THEME_COLOR_LANDING='#5871B5';
/* syncThemeColor: shared/lib/navigation.js */

/* resetLandingViewport: pages/landing/page.js */


  /* Step two of the picker. It stays empty until a category is tapped: it used
     to render the previously selected category's conditions on arrival, which
     read as a stray greyed row under the grid (client, 18 Aug). */
  let conditionListRevealed = false;
/* renderConditionList: pages/intake1/page.js */


  let focusCheckoutDelivery=false;
  let phStageTimer, phPreparedTimer, prepCountdownTimer, connectTimer, matchTimer, matchCountdownTimer, enterTimer, waitTimer, waitCountdownTimer, typingTimer, rxTimer, rxCountdownTimer, preloaderTimer, paymentSuccessTimer, deliveryQuoteTimer, deliveryQuoteCountdownTimer, phTimer, phFailTimer, phCountdownTimer;
  // The quote screen holds for exactly as long as its counter says it will.
  const DELIVERY_QUOTE_SECONDS = 5;
  // Pharmacy matching: how many nearby branches have already failed to confirm this
  // order. Resets on a successful match; capped at 3 before falling back to standard
  // delivery instead of continuing to search (same-day SLA is already broken by then).
  let pharmacyRetryCount = 0;
  // Demo/QA trigger: force the next pharmacy-search attempt to decline, so the retry
  // flow can be shown without waiting for a real out-of-stock branch. One-shot.
  let pharmacyForceDecline = false;
  let deliveryMethod = flowState.orderState.deliveryMethod || 'same-day';
  let callActive = false, lastCall = 'video';
/* syncConsultationSummaryUnread: pages/video/page.js */

/* revealConsultationSummary: pages/consult/page.js */

/* scheduleConsultationSummary: pages/consult/page.js */

  // The phone number is the channel for OTP, appointment reminders, prescription
  // notices and delivery updates, so it has to be a real Thai mobile before we
  // send anything to it. Without this, free text ("rrrr") was accepted at signup
  // and copied straight into the patient's verified-contact field.
  /* International dialling code picker. Thailand is the default and the only
     code the Thai formatting applies to; pick anything else and the number is
     left exactly as typed, because 0xx-xxx-xxxx is a Thai shape. The menu is
     built once, on first open, so the list does not sit in the DOM of every
     screen that has a phone field. */
  const PHONE_COUNTRIES=[
    ['TH','ไทย','66','\u{1F1F9}\u{1F1ED}'],['SG','สิงคโปร์','65','\u{1F1F8}\u{1F1EC}'],['MY','มาเลเซีย','60','\u{1F1F2}\u{1F1FE}'],
    ['LA','ลาว','856','\u{1F1F1}\u{1F1E6}'],['KH','กัมพูชา','855','\u{1F1F0}\u{1F1ED}'],['MM','เมียนมา','95','\u{1F1F2}\u{1F1F2}'],
    ['VN','เวียดนาม','84','\u{1F1FB}\u{1F1F3}'],['ID','อินโดนีเซีย','62','\u{1F1EE}\u{1F1E9}'],['PH','ฟิลิปปินส์','63','\u{1F1F5}\u{1F1ED}'],
    ['BN','บรูไน','673','\u{1F1E7}\u{1F1F3}'],['CN','จีน','86','\u{1F1E8}\u{1F1F3}'],['HK','ฮ่องกง','852','\u{1F1ED}\u{1F1F0}'],
    ['TW','ไต้หวัน','886','\u{1F1F9}\u{1F1FC}'],['JP','ญี่ปุ่น','81','\u{1F1EF}\u{1F1F5}'],['KR','เกาหลีใต้','82','\u{1F1F0}\u{1F1F7}'],
    ['IN','อินเดีย','91','\u{1F1EE}\u{1F1F3}'],['BD','บังกลาเทศ','880','\u{1F1E7}\u{1F1E9}'],['PK','ปากีสถาน','92','\u{1F1F5}\u{1F1F0}'],
    ['LK','ศรีลังกา','94','\u{1F1F1}\u{1F1F0}'],['NP','เนปาล','977','\u{1F1F3}\u{1F1F5}'],['AU','ออสเตรเลีย','61','\u{1F1E6}\u{1F1FA}'],
    ['NZ','นิวซีแลนด์','64','\u{1F1F3}\u{1F1FF}'],['US','สหรัฐอเมริกา','1','\u{1F1FA}\u{1F1F8}'],['CA','แคนาดา','1','\u{1F1E8}\u{1F1E6}'],
    ['GB','สหราชอาณาจักร','44','\u{1F1EC}\u{1F1E7}'],['IE','ไอร์แลนด์','353','\u{1F1EE}\u{1F1EA}'],['FR','ฝรั่งเศส','33','\u{1F1EB}\u{1F1F7}'],
    ['DE','เยอรมนี','49','\u{1F1E9}\u{1F1EA}'],['NL','เนเธอร์แลนด์','31','\u{1F1F3}\u{1F1F1}'],['BE','เบลเยียม','32','\u{1F1E7}\u{1F1EA}'],
    ['CH','สวิตเซอร์แลนด์','41','\u{1F1E8}\u{1F1ED}'],['AT','ออสเตรีย','43','\u{1F1E6}\u{1F1F9}'],['IT','อิตาลี','39','\u{1F1EE}\u{1F1F9}'],
    ['ES','สเปน','34','\u{1F1EA}\u{1F1F8}'],['PT','โปรตุเกส','351','\u{1F1F5}\u{1F1F9}'],['SE','สวีเดน','46','\u{1F1F8}\u{1F1EA}'],
    ['NO','นอร์เวย์','47','\u{1F1F3}\u{1F1F4}'],['DK','เดนมาร์ก','45','\u{1F1E9}\u{1F1F0}'],['FI','ฟินแลนด์','358','\u{1F1EB}\u{1F1EE}'],
    ['PL','โปแลนด์','48','\u{1F1F5}\u{1F1F1}'],['CZ','เช็กเกีย','420','\u{1F1E8}\u{1F1FF}'],['RU','รัสเซีย','7','\u{1F1F7}\u{1F1FA}'],
    ['TR','ตุรกี','90','\u{1F1F9}\u{1F1F7}'],['AE','สหรัฐอาหรับเอมิเรตส์','971','\u{1F1E6}\u{1F1EA}'],['SA','ซาอุดีอาระเบีย','966','\u{1F1F8}\u{1F1E6}'],
    ['QA','กาตาร์','974','\u{1F1F6}\u{1F1E6}'],['KW','คูเวต','965','\u{1F1F0}\u{1F1FC}'],['BH','บาห์เรน','973','\u{1F1E7}\u{1F1ED}'],
    ['OM','โอมาน','968','\u{1F1F4}\u{1F1F2}'],['IL','อิสราเอล','972','\u{1F1EE}\u{1F1F1}'],['EG','อียิปต์','20','\u{1F1EA}\u{1F1EC}'],
    ['ZA','แอฟริกาใต้','27','\u{1F1FF}\u{1F1E6}'],['NG','ไนจีเรีย','234','\u{1F1F3}\u{1F1EC}'],['KE','เคนยา','254','\u{1F1F0}\u{1F1EA}'],
    ['BR','บราซิล','55','\u{1F1E7}\u{1F1F7}'],['AR','อาร์เจนตินา','54','\u{1F1E6}\u{1F1F7}'],['CL','ชิลี','56','\u{1F1E8}\u{1F1F1}'],
    ['MX','เม็กซิโก','52','\u{1F1F2}\u{1F1FD}'],['CO','โคลอมเบีย','57','\u{1F1E8}\u{1F1F4}'],['PE','เปรู','51','\u{1F1F5}\u{1F1EA}']
  ];
/* phoneFieldDial: shared/lib/identity.js */

/* buildPhoneCountryMenu: shared/lib/identity.js */

/* closePhoneCountryMenus: shared/lib/identity.js */

  document.addEventListener('click',event => {
    const trigger=event.target.closest('[data-phone-country-trigger]');
    if(trigger){
      const field=trigger.closest('[data-phone-field]');
      buildPhoneCountryMenu(field);
      const menu=field.querySelector('[data-phone-country-menu]');
      const opening=menu.hidden;
      closePhoneCountryMenus(field);
      menu.hidden=!opening;
      trigger.setAttribute('aria-expanded',String(opening));
      if(opening){
        const search=menu.querySelector('[data-phone-country-search]');
        search.value='';
        menu.querySelectorAll('.phone-field__option').forEach(o => { o.closest('li').hidden=false; });
        requestAnimationFrame(() => search.focus());
      }
      return;
    }
    const option=event.target.closest('[data-phone-country]');
    if(option){
      const field=option.closest('[data-phone-field]');
      field.querySelector('[data-phone-flag]').textContent=option.dataset.phoneFlag;
      field.querySelector('[data-phone-dial]').textContent='+'+option.dataset.phoneDial;
      field.querySelector('[data-phone-country-menu]').hidden=true;
      field.querySelector('[data-phone-country-trigger]').setAttribute('aria-expanded','false');
      const input=field.querySelector('.phone-field__input');
      if(input){
        /* 0xx-xxx-xxxx is a Thai shape, so the local formatting comes off with
           the Thai code and the number is left as the patient typed it. */
        input.dataset.dialCode=option.dataset.phoneDial;
        input.value=formatDialledNumber(input.value,option.dataset.phoneDial);
        input.focus();
      }
      return;
    }
    if(!event.target.closest('[data-phone-country-menu]')) closePhoneCountryMenus(null);
  });
/* formatDialledNumber: shared/lib/ui.js */

  document.addEventListener('input',event => {
    const phone=event.target.closest('.phone-field__input');
    if(phone){
      const field=phone.closest('[data-phone-field]');
      const dial=phone.dataset.dialCode || phoneFieldDial(field);
      // Keep the caret at the end while typing rather than jumping to the start.
      const atEnd=phone.selectionStart===phone.value.length;
      phone.value=formatDialledNumber(phone.value,dial);
      if(atEnd) phone.setSelectionRange(phone.value.length,phone.value.length);
      return;
    }
    /* Client, 6 Oct: the national ID groups itself as you type, the way the
       phone number does. Its placeholder has always shown the shape; the
       field just never held it. */
    const nationalId=event.target.closest('[data-national-id]');
    if(nationalId){
      const atEnd=nationalId.selectionStart===nationalId.value.length;
      nationalId.value=formatNationalId(nationalId.value);
      if(atEnd) nationalId.setSelectionRange(nationalId.value.length,nationalId.value.length);
      return;
    }
    const standalonePhone=event.target.matches('input[type="tel"]') ? event.target : null;
    if(standalonePhone){
      const atEnd=standalonePhone.selectionStart===standalonePhone.value.length;
      standalonePhone.value=formatPhoneForDisplay(standalonePhone.value);
      if(atEnd) standalonePhone.setSelectionRange(standalonePhone.value.length,standalonePhone.value.length);
      return;
    }
    const search=event.target.closest('[data-phone-country-search]');
    if(!search) return;
    const q=search.value.trim().toLowerCase();
    search.closest('[data-phone-country-menu]').querySelectorAll('.phone-field__option').forEach(option => {
      const hay=(option.dataset.phoneName+' '+option.dataset.phoneCountry+' +'+option.dataset.phoneDial).toLowerCase();
      option.closest('li').hidden=Boolean(q) && !hay.includes(q);
    });
  });
  document.addEventListener('keydown',event => {
    if(event.key!=='Escape') return;
    if(!event.target.closest('[data-phone-field]')) return;
    closePhoneCountryMenus(null);
  });
/* normalizePhone: shared/lib/identity.js */

/* formatNationalId: shared/lib/ui.js */

/* formatThaiPhone: shared/lib/identity.js */

/* formatPhoneForDisplay: shared/lib/identity.js */

  document.querySelectorAll('input[type="tel"]:not(.phone-field__input)').forEach(input => {
    input.value=formatPhoneForDisplay(input.value);
  });
/* isValidThaiMobile: shared/lib/ui.js */

/* clearPhoneOtpContext: shared/lib/identity.js */

/* completePartnerPatientInfo: shared/lib/intake.js */

/* returnFromPhoneOtp: pages/otp/page.js */

/* prepareFreshOtpChallenge: pages/otp/page.js */

/* renderOtpCells: pages/otp/page.js */

kraneInit_otp_366();

/* syncPartnerScreening: shared/lib/intake.js */

/* setPartnerHistoryChoice: shared/lib/intake.js */

/* setDirectHistoryChoice: shared/lib/ui.js */

/* syncPartnerHistoryFields: shared/lib/intake.js */

/* partnerHistoryValue: shared/lib/intake.js */

/* directHistoryValue: shared/lib/ui.js */

/* partnerNameValue: shared/lib/intake.js */

  kraneInit_partner_patient_info_nameInput();
/* restorePartnerName: shared/lib/intake.js */

/* restorePartnerFields: shared/lib/intake.js */

/* syncGeneralHealthContext: pages/intake-general/page.js */

/* syncPartnerReview: shared/lib/intake.js */

/* seedPartnerStage: shared/lib/intake.js */

/* seedClinicalDemoStage: shared/lib/clinical.js */

  // Unlock a verified phone field, then require a fresh OTP for the new number.
  (function initPhoneEdit(){
    document.addEventListener('click', function(e){
      const btn = e.target.closest('[data-phone-edit]');
      const lockedInput = e.target.closest('[data-phone-input][readonly]');
      if(!btn && !lockedInput) return;
      const trigger = btn || lockedInput;
      const screen = trigger.closest('.screen');
      const input = screen && screen.querySelector('[data-phone-input]');
      const note = screen && screen.querySelector('[data-phone-note]');
      const editButton = btn || (screen && screen.querySelector('[data-phone-edit]'));
      if(!input) return;
      if(input.readOnly){
        input.readOnly = false;
        input.removeAttribute('aria-readonly');
        // Tapping the field itself should behave like an ordinary editable
        // phone field. Keep the verified value visible and select it so the
        // next keystroke replaces it; changing the value still requires OTP.
        input.focus();
        try{ input.setSelectionRange(0,input.value.length); }catch(_error){}
        if(screen && screen.id==='partner-patient-info'){
          flowState.partnerPhoneVerified=false;
          persistFlowState();
        }
        if(note) note.textContent = 'กรอกเบอร์ใหม่ แล้วยืนยันด้วยรหัส OTP';
        if(editButton) editButton.textContent = 'ยืนยันด้วย OTP';
        return;
      }
      // An already-editable input is normal text-entry interaction. Only the
      // adjacent action button should submit the new number for OTP.
      if(!btn) return;
      if(!isValidThaiMobile(input.value)){
        showActionToast('กรุณากรอกเบอร์มือถือ 10 หลักให้ถูกต้อง','warning');
        input.focus();
        return;
      }
      if(screen && screen.id==='partner-patient-info'){
        if(flowState.partnerPhoneVerified && flowState.partnerPhone && normalizePhone(input.value)===normalizePhone(flowState.partnerPhone)){
          flowState.partnerPhoneVerified=true;
          input.readOnly=true;
          input.setAttribute('aria-readonly','true');
          if(note) note.textContent='ยืนยันด้วยรหัส OTP แล้ว';
          btn.textContent='เปลี่ยนเบอร์';
          persistFlowState();
          return;
        }
        flowState.partnerPendingPhone=normalizePhone(input.value);
        flowState.partnerPhoneVerified=false;
        flowState.partnerPhoneOtpPending=true;
        persistFlowState();
        show('otp');
        return;
      }
      if(normalizePhone(input.value)===normalizePhone(flowState.verifiedPhone)){
        input.readOnly=true;
        input.setAttribute('aria-readonly','true');
        if(note) note.textContent='ยืนยันด้วยรหัส OTP แล้ว';
        btn.textContent='เปลี่ยนเบอร์';
        return;
      }
      flowState.pendingPhone=normalizePhone(input.value);
      flowState.phoneOtpPending=true;
      flowState.phoneOtpReturn='patient-info';
      flowState.phoneOtpDestination='';
      flowState.phoneOtpCompletesAuth=false;
      persistFlowState();
      show('otp');
    });
  })();
  // 'checkout' (default): an order exists, entitlement is checked against its total.
  // 'profile': opened from patient-info to save a policy on file, no order yet.
  let insuranceEntry = 'checkout';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* syncRailPath: shared/lib/ui.js */

/* replaceCurrent: shared/lib/ui.js */

  // A screen opened from the prototype rail or a URL hash has no browser trail.
  // Seed it with the same parent path as the real flow, so Back never jumps to
  // an unrelated default page. Normal in-flow navigation still uses the actual
  // screens the person visited.
  const directEntryParent = Object.freeze({
    concern:'landing', conditions:'landing', articles:'landing', article:'articles',
    intake1:'conditions', intake2:'intake1', intake3:'intake2', intake4:'intake3',
    intake5:'intake4', 'intake-concern':'intake5', 'intake-general':'intake-concern',
    ineligible:'intake4',
    signup:'intake-general', login:'landing', 'social-confirm':'signup',
    otp:'signup', 'consent-terms':'landing', identity:'consent-terms', 'patient-info':'identity', 'insurance-result':'insurance',
    matching:'patient-info', appointment:'matching', 'appointment-booked':'appointment',
    consultpay:'matching', 'consultpay-gw':'consultpay', 'consultpay-fail':'consultpay-gw', waitroom:'consultpay', consult:'waitroom',
    video:'consult', 'rx-writing':'consult', 'rx-plan':'consult',
    address:'payment', 'delivery-quote':'payment', 'pharmacy-search':'payment',
    pharmacypending:'pharmacy-search', payment:'pharmacypending',
    'payment-gw':'payment', 'payment-processing':'payment-gw', 'payment-success':'payment-gw', insurance:'payment',
    payfail:'payment-gw',
    tracking:'payment-success', 'order-summary':'tracking', feedback:'consult', feedbackdone:'feedback',
    profile:'landing', 'treatment-detail':'profile', 'my-documents':'profile', activity:'profile', notifications:'profile',
    account:'settings', settings:'profile', 'empty-activities':'activity', 'empty-history':'activity',
    'upload-rx':'profile', referral:'profile', preloader:'landing',
    // Partner access reuses the same consent screen as direct entry. Nurse
    // screening is a separate exception case, not the happy path.
    'partner-idcard':'consent-terms',
    'partner-patient-info':'partner-idcard',
    'partner-insurance':'partner-patient-info',
    'partner-phr':'intake-general'
  });
  // Partner ids, kept in one place so the B2C journey arrays never have to know
  // about them and the care stepper does not try to number partner screens.
  const PARTNER_SCREENS = ['partner-idcard','partner-patient-info','partner-insurance',
    'partner-phr'];
  const CONSULTATION_FEE_BAHT = 350;
/* directNextAfterPatientInfo: pages/intake-general/page.js */

  /* Client, 31 Aug: sexual health has no doctor to match on the spot, so that
     route books a time instead of queueing. Everything else still matches. */
  const APPOINTMENT_ONLY = new Set(['sexual-health','ed','early-ejaculation','sexual-general']);
/* needsAppointment: shared/lib/clinical.js */

/* directClinicalStartTarget: pages/matching/page.js */

/* partnerClinicalStartTarget: pages/matching/page.js */

/* consultationBalanceDue: shared/lib/clinical.js */

/* firstConsultationDiscount: shared/lib/clinical.js */

/* partnerMedicineCoverageCredit: shared/lib/intake.js */

  const MEDICINE_PRICES={cough:85,loratadine:94,paracetamol:20,naproxen:134};
  const ADDON_PRICES={wellness:290,pillcase:190,pouch:250};
/* importClinicalPrescription: shared/lib/orders.js */

kraneInit_payment_400();

  if(flowState.orderState.clinicalPrescription)importClinicalPrescription(flowState.orderState.clinicalPrescription);
/* resetOptionalAddOns: shared/lib/ui.js */

/* medicineSubtotal: shared/lib/ui.js */

/* hasMedicines: shared/lib/ui.js */

/* selectedAddOnTotal: shared/lib/ui.js */

/* hasFulfillableItems: shared/lib/ui.js */

/* invalidateFulfillmentQuote: shared/lib/ui.js */

  const PAYMENT_WINDOW_MS=60*60*1000;
  let paymentDeadlineTimer=null;
/* ensurePaymentDeadline: shared/lib/orders.js */

/* paymentDeadlineExpired: shared/lib/orders.js */

/* formatPaymentCountdown: shared/lib/orders.js */

/* renderPaymentDeadline: shared/lib/orders.js */

/* startPaymentDeadlineTimer: shared/lib/orders.js */

/* stopPaymentDeadlineTimer: shared/lib/orders.js */

/* calculatedSameDayDeliveryFee: shared/lib/orders.js */

/* deliveryFeeFor: shared/lib/orders.js */

/* lockShownDeliveryQuote: shared/lib/orders.js */

/* startInlineDeliveryQuote: shared/lib/orders.js */

/* checkoutActionState: shared/lib/orders.js */

  /* Client, 1 Sep: refilling is not a screen of its own any more. The patient
     already knows what they take, so the only question left is which prescription
     — a bottom sheet asks that and hands the answer to the same checkout every
     other order goes through. Picking IS the answer (house rule 1): the tap
     closes the sheet, there is no second confirm.
     Clinic, 28 Aug: only a prescription that has not expired can be refilled,
     and never more than the doctor approved — so an expired one is taken out of
     play here rather than relying on the markup being kept in step by hand, and
     two prescriptions that share a medicine take the larger allowance, not the
     sum of the two. */
  const REFILL_PRESCRIPTIONS={
    'hair-skin':{quantities:{loratadine:1,paracetamol:2}},
    weight:{quantities:{cough:2,loratadine:1}},
    'sexual-health':{quantities:{naproxen:1}}
  };
  const refillSheet=document.getElementById('refill-sheet');
  /* Each treatment card says when its refill opens ("เติมยาได้ 19 ก.ย. 2026"),
     but the sheet only checked whether the prescription had expired, so it
     offered every refill at once while the cards said two of them were not due
     yet (client, 17 Sep). The sheet reads the date from the card, so the two
     can never disagree. */
  const REFILL_THAI_MONTHS={'ม.ค.':0,'ก.พ.':1,'มี.ค.':2,'เม.ย.':3,'พ.ค.':4,'มิ.ย.':5,'ก.ค.':6,'ส.ค.':7,'ก.ย.':8,'ต.ค.':9,'พ.ย.':10,'ธ.ค.':11};
/* treatmentRefillOpensOn: shared/lib/ui.js */

/* availableRefillKeys: shared/lib/ui.js */

  // Expiry used to live on the menu rows; the cards are built, so it lives here.
  const REFILL_EXPIRES={weight:'2026-12-12','hair-skin':'2027-01-08','sexual-health':'2027-02-04'};
/* refillCardFor: shared/lib/ui.js */

/* openRefillSheet: pages/profile/page.js */

/* closeRefillSheet: shared/lib/ui.js */

/* startRefill: pages/payment/page.js */

  kraneInit_treatment_detail_refill();

  /* Booking requires a day and time before enabling the shared Confirm action. */
  let appointmentDay='วันนี้', appointmentSlot='';
  // 09:00–24:00 is a 15-minute service window: the last bookable start is 23:45.
  // Render available starts chronologically in one shared grid.
  const appointmentTime = minutes => `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
  const appointmentDayIndex = () => [...document.querySelectorAll('#appointment [data-appointment-day]')]
    .findIndex(day => day.getAttribute('aria-checked')==='true');
/* appointmentSlotUnavailable: shared/lib/clinical.js */

  window.kraneProgramSchedule={slots(date){
    const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const selected=new Date(date+'T00:00:00'),dayIndex=Math.round((selected-today)/86400000);
    if(!Number.isFinite(dayIndex)||dayIndex<0||dayIndex>30)return [];
    const values=[];for(let minutes=540;minutes<1440;minutes+=15){if(!appointmentSlotUnavailable(minutes,dayIndex,now))values.push(appointmentTime(minutes));}return values;
  }};
/* renderAppointmentSlots: pages/appointment/page.js */

/* syncAppointment: pages/appointment/page.js */

  /* Client, 1 Sep: the day row read "วันนี้ 31 ส.ค." two days after that date.
     The day chips were fixed dates in the markup, so "today" was only ever
     right on the day they were written — the same trap as the follow-up dates.
     They are offsets from today now, named and dated in the current language. */
  const WEEKDAYS_TH = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const WEEKDAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
/* syncAppointmentDays: pages/appointment/page.js */

/* resetAppointment: pages/appointment/page.js */

kraneInit_appointment_443();

/* checkoutIsReady: shared/lib/orders.js */

  /* Pressing the blocked pay button points at the thing that is blocking it:
     scroll it into view, outline it red, say so once (client, 23 Aug). Naming
     the blocker on the button was not enough — the patient still had to go
     find it. One map, so a new precondition only needs a line here. */
  const CHECKOUT_BLOCKERS={
    'address-required':['[data-payment-address-row]','กรุณาเลือกที่อยู่จัดส่งก่อน'],
    'pickup-branch-required':['[data-open-branch]','กรุณาเลือกร้านยาที่จะไปรับยาก่อน'],
    'delivery-method-required':['[data-fulfillment-panel="delivery"]','กรุณาเลือกวิธีจัดส่งก่อน'],
    'payment-method-required':['[data-open-methods]','กรุณาเลือกวิธีชำระเงินก่อน']
  };
  let checkoutBlockerTimer=null;
/* flagCheckoutBlocker: pages/payment/page.js */

/* syncCheckoutReadiness: pages/payment/page.js */

/* refreshMedicationCheckout: pages/payment/page.js */

/* setMedicationCheckoutContext: shared/lib/orders.js */

/* syncConsultationCoverageLabels: shared/lib/clinical.js */

/* consultationHandoffTarget: shared/lib/clinical.js */

  /* EC-011: a consultation must not be asked condition-specific questions that
     do not belong to its concern. #intake3 is the "what have you tried for this
     concern" set, and intakeTemplates only defines it for skin, sexual and
     sleep. hair and general have no intake3 of their own, so both previously
     fell through to the authored base markup and rendered another concern's
     question set. Both now skip it. General consultation has authored symptom
     and detail screens, so it follows SCR-DIR-02 then SCR-DIR-02A before safety.

     Specialty intake3 skipping is derived from template coverage, while the
     deliberately shorter general route is explicit. Both stay in routing so
     they survive the innerHTML round-trip renderIntakeQuestions performs (the
     same round-trip that previously broke the custom selects). */
  const INTAKE_CONCERN_SPECIFIC = ['intake3'];
  /* General consultation has no disease-specific questionnaire: its concern
     and onset live on the single compact #intake1 page, matching the insurance
     intake pattern. Every later clinical question screen is skipped and the
     patient rejoins the normal authentication and consultation flow. */
  const GENERAL_COMPACT_SKIPPED_SCREENS = ['intake2','intake3','intake4','intake5'];
  const INTAKE_CATEGORY_KEY = { 'hair-skin':'hair', skin:'skin', weight:'weight', 'sexual-health':'sexual', 'sleep-stress':'sleep', hormone:'hormone' };
/* intakeConcernKey: shared/lib/intake.js */

/* intakeSkipped: pages/intake4/page.js */

/* intakeStepOrder: shared/lib/intake.js */

/* finishDirectF02: shared/lib/ui.js */

/* skipForwardFrom: shared/lib/ui.js */

/* skipBackFrom: shared/lib/ui.js */

/* seededHistory: shared/lib/navigation.js */

/* selectedOptionTitles: shared/lib/ui.js */

/* updateSelectedCare: shared/lib/ui.js */

  const INTAKE_DRAFT_SCREENS = ['intake1','intake2','intake3','intake4','intake5','intake-concern','intake-general'];
  /* A follow-up is not a blank intake. This static prototype has no clinical
     API, so the last completed case is represented by a durable local snapshot
     instead of the ordinary session-only draft. In production this object is
     the shape returned by the authenticated patient-record endpoint; keeping
     it separate here prevents an unfinished new intake from overwriting the
     previously confirmed record. */
  const DEFAULT_FOLLOWUP_RECORDS = {
    'sleep-stress':{
      category:'sleep-stress',
      selectedConditionId:'sleep',
      sourceConsultationAt:'26 ส.ค. 2026',
      concern:'หลับยาก ตื่นกลางดึก และมีความเครียดช่วงก่อนนอน',
      currentMedicines:'Melatonin 5 mg · วันละ 1 เม็ด',
      fields:{
        'intake-duration':'8',
        'intake-sleep-hours':'4-6h',
        'intake-treatment-result':'better',
        'intake-sex':'female',
        'intake-dob':'1994-03-12',
        'intake-height':'165',
        'intake-weight':'58',
        'intake-smoking':'0',
        'intake-alcohol':'1'
      },
      durationUnit:'สัปดาห์',
      optionLabels:{
        intake1:['หลับยาก ใช้เวลานานกว่าจะหลับ','ตื่นกลางดึกแล้วหลับต่อยาก'],
        intake2:['ง่วงหรือเพลียระหว่างวัน','กังวลหรือคิดวนไม่หยุด','ใช้โทรศัพท์หรือจอก่อนนอน'],
        intake3:['เมลาโทนิน'],
        intake4:['None of these apply']
      },
      history:{conditions:'ไม่มี',medications:'Melatonin 5 mg · วันละ 1 เม็ด',allergies:'ไม่มี'}
    },
    'hair-skin':{
      category:'hair-skin',
      selectedConditionId:'hair-loss',
      sourceConsultationAt:'30 มิ.ย. 2026',
      concern:'ผมบางบริเวณกลางศีรษะและแนวไรผม',
      currentMedicines:'Loratadine 10 mg · Paracetamol 500 mg',
      fields:{
        'intake-duration':'6',
        'intake-treatment-result':'helped',
        'intake-treatment-details':'ใช้ยาตามแผนเดิม อาการคงที่ ไม่มีผลข้างเคียงใหม่',
        'intake-sex':'male',
        'intake-dob':'1990-06-18',
        'intake-height':'175',
        'intake-weight':'70',
        'intake-smoking':'0',
        'intake-alcohol':'1'
      },
      durationUnit:'month',
      optionLabels:{
        intake1:['Crown or top of the scalp','Temples or receding hairline'],
        intake2:['Moderate','Gradual thinning'],
        intake3:['Medicine prescribed by a doctor'],
        intake4:['None of these apply']
      },
      history:{conditions:'ไม่มี',medications:'Loratadine 10 mg · Paracetamol 500 mg',allergies:'ไม่มี'}
    },
    general:{
      category:'general',
      selectedConditionId:'',
      sourceConsultationAt:'26 ส.ค. 2026',
      concern:'นอนไม่หลับ ตื่นกลางดึก และมีความเครียดช่วงก่อนนอน',
      currentMedicines:'Melatonin 5 mg · วันละ 1 เม็ด',
      fields:{
        'general-description':'นอนไม่หลับ ตื่นกลางดึก และมีความเครียดช่วงก่อนนอน',
        'intake-duration':'8',
        'intake-sex':'female',
        'intake-dob':'1994-03-12',
        'intake-height':'165',
        'intake-weight':'58',
        'intake-smoking':'0',
        'intake-alcohol':'1'
      },
      durationUnit:'week',
      optionLabels:{
        intake1:['Moderate','It comes and goes','None of these apply']
      },
      history:{conditions:'ไม่มี',medications:'Melatonin 5 mg · วันละ 1 เม็ด',allergies:'ไม่มี'}
    }
  };
/* cloneFollowUpRecord: shared/lib/ui.js */

/* followUpRecordFor: shared/lib/ui.js */

/* optionLabel: shared/lib/ui.js */

/* applyFollowUpOptionLabels: shared/lib/ui.js */

/* applyFollowUpHistory: shared/lib/ui.js */

/* hydrateFollowUpRecord: pages/intake1/page.js */

/* updateFollowUpPrefillCard: pages/intake-general/page.js */

/* captureFollowUpRecord: pages/intake1/page.js */

/* syncObesityBmi: shared/lib/intake.js */

  kraneInit_intake2_obesityMetrics();
/* saveIntakeDraft: pages/intake-concern/page.js */

/* restoreIntakeDraft: pages/intake-concern/page.js */

  document.body.addEventListener('input',event => {
    const intakeScreen = event.target.closest(INTAKE_DRAFT_SCREENS.map(id => `#${id}`).join(','));
    if(!intakeScreen) return;
    saveIntakeDraft();
    /* Text inputs and textareas emit `input` while the patient is typing. Keep
       the shared CTA state live instead of waiting for a blur/change event. */
    syncIntakeDropdownContinue(intakeScreen);
  });
  document.body.addEventListener('change',event => {
    const intakeScreen = event.target.closest(INTAKE_DRAFT_SCREENS.map(id => `#${id}`).join(','));
    if(intakeScreen){
      saveIntakeDraft();
      syncIntakeDropdownContinue(intakeScreen);
    }
  });
/* syncPartnerPolicySummary: shared/lib/intake.js */

  kraneInit_partner_insurance_owned_220();

  const REQUIRED_CARE_TARGETS = new Set([
    'matching','appointment','appointment-booked','consultpay','consultpay-gw','consultpay-fail','waitroom',
    'consult','video','rx-writing','rx-plan','address','delivery-quote','pharmacy-search',
    'pharmacypending','payment-items','payment','payment-gw','payment-processing','payment-success','insurance','insurance-result','payfail',
    'tracking','order-summary','feedback','feedbackdone','upload-rx'
  ]);
  /* Everything from doctor matching onwards now sits after the health page,
     so all of it waits on that page rather than only the waiting room. */
  const DIRECT_PRE_DOCTOR_GATE_TARGETS = new Set(['matching','appointment',
    'consultpay','consultpay-gw','consultpay-fail','waitroom','consult','video','rx-writing','rx-plan']);
/* identityRequired: shared/lib/ui.js */

/* requiredRouteFor: shared/lib/navigation.js */

/* normalizeScreenTarget: shared/lib/navigation.js */

/* syncFloatingFieldState: shared/lib/ui.js */

/* syncFloatingFieldStates: shared/lib/ui.js */

  document.addEventListener('input',event => syncFloatingFieldState(event.target.closest?.('.float-field')));
  document.addEventListener('change',event => syncFloatingFieldState(event.target.closest?.('.float-field')));
  document.addEventListener('focusout',event => syncFloatingFieldState(event.target.closest?.('.float-field')));
/* show: shared/lib/navigation.js */

/* syncConsultationPaymentAmount: shared/lib/orders.js */

/* syncConsultationCheckoutMode: pages/consultpay/page.js */

  kraneInit_consultpay_owned_226();
  // A single img swaps preloaded frames. The old SVG <use> clone could paint
  // several CSS-animated layers at once in some browsers.
  const craneImage=document.querySelector('[data-loader="paper-crane"] .ks-paper-crane-live');
  kraneInit_preloader_owned_228();
/* paintElapsedTimer: shared/lib/ui.js */

/* savePendingQueue: shared/lib/clinical.js */

  kraneInit_queue_resume_queueActions();
  window.addEventListener('pagehide',()=>{if(pendingQueue){pendingQueue.suspended=true;savePendingQueue()}});
/* resetWaitroom: pages/waitroom/page.js */

  /* The doctor is held for five minutes once the room opens (client, 20 Aug).
     The number on its own does not say what it is counting, so the readout
     carries a label; when it runs out the slot is gone and the modal offers the
     only thing left worth doing. */
  const WAITROOM_ENTRY_WINDOW = 5 * 60;
  /* How long the queue runs before the doctor opens the room. */
  const QUEUE_ADMIT_MS = 15000;
  let waitEntryTimer = null;
/* stopWaitroomEntryWindow: shared/lib/ui.js */

/* startWaitroomEntryWindow: shared/lib/ui.js */

  /* Looked up on use, not captured at parse time: show() calls the close side of
     this on every screen change, including ones that run before this line
     would have executed. */
  const waitroomExpiredModal = () => document.getElementById('waitroom-expired-modal');
/* openWaitroomExpiredModal: shared/lib/ui.js */

/* closeWaitroomExpiredModal: shared/lib/ui.js */

  kraneInit_waitroom_expiredDialog();
  // Consume a fresh launch once. The query stays in the URL while the patient
  // moves through later hashes, so reading it on every hashchange would reset
  // a real order each time they revisited tracking.
  let freshDeepLinkConsumed=false;
/* applyHash: shared/lib/navigation.js */

  window.addEventListener('hashchange', applyHash);
  // landing iframe asks the app to navigate (avoids target=_parent, which can be blocked in previews)
  window.addEventListener('message', e => {
    const messageTarget=e.data?.to ? normalizeScreenTarget(e.data.to) : '';
    if(e.data && e.data.krane === 'nav' && messageTarget && document.getElementById(messageTarget)){
      if(guardActiveCase(messageTarget)){
        try{ if(e.source && e.source.postMessage) e.source.postMessage({krane:'navAck'}, '*'); }catch(x){}
        return;
      }
      if(e.data.category && setSelectedCategory(e.data.category)){
        renderConditionList();
      }
      if(e.data.entryChannel==='partner'){
        flowState.entryChannel='partner';
        flowState.partnerPhoneVerified=true;
        persistFlowState();
      } else {
        // Every ordinary landing navigation is a Krane-direct entry. Resetting
        // this explicitly prevents a prior partner session hiding Direct progress.
        flowState.entryChannel='direct';
        persistFlowState();
      }
      if(messageTarget === 'login') postAuthNext = 'profile';
      show(messageTarget);
      // ack so the landing knows the app handled it (otherwise it self-navigates)
      try{ if(e.source && e.source.postMessage) e.source.postMessage({krane:'navAck'}, '*'); }catch(x){}
    }
  });
  let authNext = 'identity';
  let socialCompletesAuth = false;
  const submissionLocks = new Set();
/* submitOnce: shared/lib/ui.js */

/* signedIn: shared/lib/ui.js */

/* restoreAuthenticatedAccount: shared/lib/identity.js */

/* patientNameValue: shared/lib/ui.js */

/* syncPatientInfoPrefill: shared/lib/ui.js */

/* nextAfterAuthentication: shared/lib/identity.js */

/* applyAuthenticatedAccount: shared/lib/identity.js */

  /* ---- Password set-up ----------------------------------------------------
     The rules are checked as the field is typed rather than on submit, so the
     patient is not told what was wrong only after pressing the button. The
     screen is shared by first sign-up and password reset; only the wording and
     what happens on save differ. */
  const PASSWORD_RULES={
    length:value => value.length>=8,
    letter:value => /[A-Za-z]/.test(value),
    number:value => /\d/.test(value),
    symbol:value => /[^A-Za-z0-9]/.test(value)
  };
/* passwordRuleState: shared/lib/identity.js */

/* syncPasswordScreen: shared/lib/identity.js */

/* syncPasswordValidity: pages/set-password/page.js */

kraneInit_set_password_531();

/* syncFrequencySlider: shared/lib/ui.js */

/* syncFrequencySliders: shared/lib/ui.js */

  document.addEventListener('input', e => { if(e.target.matches?.('[data-frequency-slider]')) syncFrequencySlider(e.target); });
  syncFrequencySliders();
  document.body.addEventListener('click', e => {
    const toggle=e.target.closest('[data-password-toggle]');
    if(!toggle) return;
    const field=document.getElementById(toggle.dataset.passwordToggle);
    if(!field) return;
    const showing=field.type==='text';
    field.type=showing ? 'password' : 'text';
    toggle.setAttribute('aria-label',showing ? 'แสดงรหัสผ่าน' : 'ซ่อนรหัสผ่าน');
    toggle.classList.toggle('is-showing',!showing);
    toggle.setAttribute('aria-pressed',String(!showing));
    toggle.innerHTML=window.kraneIcon(showing ? 'eye' : 'eye-off','ui-icon');
  });
kraneInit_payment_537();

/* completeAuthentication: shared/lib/identity.js */

  // navigation
  document.body.addEventListener('click', e => {
    const treatmentTab=e.target.closest('[data-treatment-tab]');
    if(treatmentTab){ if (kraneHandle_treatment_detail_tab(e, treatmentTab)) return; }
    const followUpCaseOpen=e.target.closest('[data-followup-case-open]');
    if(followUpCaseOpen){ if (kraneHandle_profile_followUpCase(e, followUpCaseOpen)) return; }
    const followUpJoin=e.target.closest('[data-followup-join]');
    if(followUpJoin){ if (kraneHandle_profile_followUpJoin(e, followUpJoin)) return; }
    const treatmentOpen=e.target.closest('[data-treatment-open]');
    if(treatmentOpen){ if (kraneHandle_profile_treatmentOpen(e, treatmentOpen)) return; }
    const followUpEditSymptoms=e.target.closest('[data-followup-edit-symptoms]');
    if(followUpEditSymptoms){ if (kraneHandle_treatment_detail_editSymptoms(e, followUpEditSymptoms)) return; }
    const profileFollowup=e.target.closest('[data-profile-followup]');
    if(profileFollowup){ if (kraneHandle_profile_followUp(e, profileFollowup)) return; }
    /* "Consult now" duplicated the two appointment actions beside it and the
       button at the bottom of every treatment card. The slot carries the
       referral instead, which had nowhere to live (client, 10 Sep). */
    const profileReferral=e.target.closest('[data-profile-referral]');
    if(profileReferral){ if (kraneHandle_profile_referral(e, profileReferral)) return; }
    if(e.target.closest('[data-referral-close]')){ if (kraneHandle_referral_close(e)) return; }
    const referralAction=e.target.closest('[data-referral-native-share],[data-referral-copy-code]');
    if(referralAction){ if (kraneHandle_referral_shareAction(e, referralAction)) return; }
    const referralShare=e.target.closest('[data-referral-share]');
    if(referralShare){ if (kraneHandle_referral_share(e, referralShare)) return; }
    const profileNewAppointment=e.target.closest('[data-profile-new-appointment]');
    if(profileNewAppointment){ if (kraneHandle_profile_newAppointment(e, profileNewAppointment)) return; }
    /* The continue button this served lived on #rx-writing, a waiting screen,
       and was enabled in the same tick that auto-advanced away from it. The
       plan screen carries that step now and refreshMedicationCheckout() runs
       when the writing state finishes, so nothing is left to do here. */
    // The insurance intake/claim screen is shared by two contexts: opened from patient
    // profile setup (no order yet, just save the policy) or from checkout (an order is
    // being paid). Detect which one from where the click came from.
    const goInsurance = e.target.closest('[data-go="insurance"]');
    if(goInsurance){ if (kraneHandle_insurance_entry(e, goInsurance)) return; }
    // Demo: force the "no doctor available" outcome, then run the match animation
    // so the flow shows match -> available-time fallback -> pay.
    const noMatch = e.target.closest('[data-demo-nomatch]');
    if(noMatch){ if (kraneHandle_matching_demoNoMatch(e, noMatch)) return; }
    // Demo: force the next pharmacy match to decline (out of stock), so the retry loop
    // and the standard-delivery fallback after 3 tries can be shown on demand.
    const noStock = e.target.closest('[data-demo-nostock]');
    if(noStock){ if (kraneHandle_pharmacy_search_demoNoStock(e, noStock)) return; }
    // OAuth demo: each provider returns to a visible confirmation step before entering the app.
    const social = e.target.closest('[data-social]');
    if(social){ if (kraneHandle_social_confirm_provider(e, social)) return; }
    const authContinue = e.target.closest('[data-auth-continue]');
    if(authContinue){ if (kraneHandle_social_confirm_continue(e, authContinue)) return; }
    const signupPhone = e.target.closest('[data-signup-phone]');
    if(signupPhone){ if (kraneHandle_signup_submit(e, signupPhone)) return; }
    /* A returning patient signs in with the password they set, so there is no
       second SMS on the ordinary path. The code is only asked for again when
       the password has to be replaced (client, 12 Sep). */
    const loginSubmit = e.target.closest('[data-login-submit]');
    if(loginSubmit){ if (kraneHandle_login_submit(e, loginSubmit)) return; }
    const loginForgot = e.target.closest('[data-login-forgot]');
    if(loginForgot){ if (kraneHandle_login_forgot(e, loginForgot)) return; }
    const authComplete = e.target.closest('[data-auth-complete]');
    if(authComplete){ if (kraneHandle_otp_submit(e, authComplete)) return; }
    const passwordSave = e.target.closest('[data-password-save]');
    if(passwordSave){ if (kraneHandle_set_password_submit(e, passwordSave)) return; }
    const partnerInfoContinue=e.target.closest('[data-partner-info-continue]');
    if(partnerInfoContinue){ if (kraneHandle_partner_patient_info_continue(e, partnerInfoContinue)) return; }
    const partnerPayment=e.target.closest('[data-partner-payment]');
    if(partnerPayment){ if (kraneHandle_partner_insurance_paymentChoice(e, partnerPayment)) return; }
    const intakeDurationStep=e.target.closest('[data-intake-duration-step]');
    if(intakeDurationStep){ if (kraneHandle_intake_durationStep(e, intakeDurationStep)) return; }
    const intakeDurationUnit=e.target.closest('[data-intake-duration-unit]');
    if(intakeDurationUnit){ if (kraneHandle_intake_durationUnit(e, intakeDurationUnit)) return; }
    const partnerHistoryChoice=e.target.closest('[data-partner-history-choice]');
    if(partnerHistoryChoice){ if (kraneHandle_intake_general_partnerHistory(e, partnerHistoryChoice)) return; }
    /* Obesity screening (client, 13 Sep): seven yes/no rows, each its own
       radiogroup. A "yes" is never a dead end here — the doctor's SOP has the
       doctor read these before deciding, and two of the seven are looking for
       another cause of the weight rather than a contraindication. */
    const obesityRiskChoice=e.target.closest('[data-obesity-risk-choice]');
    if(obesityRiskChoice){ if (kraneHandle_intake3_obesityRisk(e, obesityRiskChoice)) return; }
    const directHistoryChoice=e.target.closest('[data-direct-history-choice]');
    if(directHistoryChoice){ if (kraneHandle_intake_directHistory(e, directHistoryChoice)) return; }
    const partnerScreeningOption=e.target.closest('[data-partner-screening-value]');
    if(partnerScreeningOption){ if (kraneHandle_intake_general_screening(e, partnerScreeningOption)) return; }
    const partnerComplete = e.target.closest('[data-partner-complete]');
    if(partnerComplete){ if (kraneHandle_partner_phr_complete(e, partnerComplete)) return; }
    const patientInfoContinue = e.target.closest('[data-patient-info-continue]');
    if(patientInfoContinue){ if (kraneHandle_patient_info_continue(e, patientInfoContinue)) return; }
    const identityContinue = e.target.closest('[data-identity-continue]');
    if(identityContinue){ if (kraneHandle_identity_continue(e, identityContinue)) return; }
    const consentSubmit = e.target.closest('[data-consent-continue]');
    if(consentSubmit){ if (kraneHandle_consent_terms_submit(e, consentSubmit)) return; }
    const newAccount = e.target.closest('[data-new-account]');
    if(newAccount){ if (kraneHandle_signup_newAccount(e, newAccount)) return; }
    // category card: set the chosen category (so the conditions screen knows what to show)
    // BEFORE the generic navigation handler runs below.
    const catCard = e.target.closest('[data-category-card]');
    if(catCard){ if (kraneHandle_conditions_category(e, catCard)) return; }
    const conditionCard = e.target.closest('[data-condition-card]');
    if(conditionCard) { if (kraneHandle_conditions_condition(e, conditionCard)) return; }
    const postAuthSetter = e.target.closest('[data-post-auth]');
    if(postAuthSetter) postAuthNext = postAuthSetter.dataset.postAuth;
    const authRequired = e.target.closest('[data-requires-auth]');
    if(authRequired){
      postAuthNext = authRequired.dataset.requiresAuth || 'intake1';
      show(signedIn() ? postAuthNext : 'signup');
      return;
    }
    // address suggestion: tap to fill the structured fields + recalc distance-based same-day fee
    const fillItem = e.target.closest('.ac-item[data-fill]');
    if(fillItem){ if (kraneHandle_address_fillSuggestion(e, fillItem)) return; }
    // F13: End hangs up (the chat return-bar disappears); Chat keeps the call running
    const ec = e.target.closest('[data-endcall]');
    if(ec) { if (kraneHandle_video_endActiveCall(e, ec)) return; }
    // ---- declined medicines: put one back ----
    const restore=e.target.closest('[data-restore-item]');
    if(restore){ if (kraneHandle_rx_plan_restoreMedicine(e, restore)) return; }
    // ---- accept the medicine list, which ends the consultation ----
    if(e.target.closest('[data-accept-plan]')){ if (kraneHandle_rx_plan_acceptPlan(e)) return; }
    if(e.target.closest('[data-acceptplan-cancel]')){ if (kraneHandle_rx_plan_cancelPlan(e)) return; }
    if(e.target.closest('[data-acceptplan-confirm]')){ if (kraneHandle_rx_plan_confirmPlan(e)) return; }
    // ---- end-call confirmation (item 7) ----
    const endCall=e.target.closest('[data-endcall]');
    if(endCall){ if (kraneHandle_video_endCall(e, endCall)) return; }
    if(e.target.closest('[data-endcall-cancel]')){ if (kraneHandle_video_cancelEndCall(e)) return; }
    if(e.target.closest('[data-endcall-confirm]')){ if (kraneHandle_video_confirmEndCall(e)) return; }
    // ---- map picker (in-app only, never navigates out) ----
    const simZoom=e.target.closest('[data-sim-zoom]');
    if(simZoom){ if (kraneHandle_address_zoom(e, simZoom)) return; }
    if(e.target.closest('[data-address-picker-open]')){ if (kraneHandle_address_openPicker(e)) return; }
    if(e.target.closest('[data-address-picker-close]')){ if (kraneHandle_address_closePicker(e)) return; }
    if(e.target.closest('[data-sim-locate]')){ if (kraneHandle_address_locate(e)) return; }
    if(e.target.closest('[data-address-map-confirm]')){ if (kraneHandle_address_confirmMap(e)) return; }
    const addressSave=e.target.closest('[data-address-save]');
    if(addressSave){ if (kraneHandle_address_save(e, addressSave)) return; }
    const fulfillmentModeChoice=e.target.closest('[data-fulfillment-mode-option]');
    if(fulfillmentModeChoice){ if (kraneHandle_payment_fulfillment(e, fulfillmentModeChoice)) return; }
    const deliveryChoice=e.target.closest('[data-delivery-value]');
    if(deliveryChoice){ if (kraneHandle_payment_delivery(e, deliveryChoice)) return; }
    /* The basket row carries its own remove, so an add-on can be dropped where
       it is listed instead of hunting for its card in the rail below. Adding it
       back is still the card, which is where the price and description live. */
    /* The filter narrows the one feed. It runs before the [data-go] handler so a
       filter press never also opens the card underneath it. */
    const activityFilter=e.target.closest('[data-activity-filter]');
    if(activityFilter){ if (kraneHandle_activity_filter(e, activityFilter)) return; }
    /* There is no dispatch map behind the prototype, so the button says where
       the live position actually lives rather than opening an empty frame. */
    const riderLocate=e.target.closest('[data-rider-locate]');
    if(riderLocate){ if (kraneHandle_tracking_riderLocate(e, riderLocate)) return; }
    const addOnEdit=e.target.closest('[data-addon-edit]');
    if(addOnEdit){ if (kraneHandle_payment_editAddon(e, addOnEdit)) return; }
    const addOnRemove=e.target.closest('[data-addon-remove]');
    if(addOnRemove){ if (kraneHandle_payment_removeAddon(e, addOnRemove)) return; }
    const addOnChoice=e.target.closest('[data-addon-option]');
    if(addOnChoice){ if (kraneHandle_payment_addAddon(e, addOnChoice)) return; }
    // F16 (client 5 Jul): reduce-only quantity stepper; the prescription is the ceiling
    const qbtn = e.target.closest('[data-qty-minus],[data-qty-plus]');
    if(qbtn && !qbtn.disabled){ if (kraneHandle_orders_quantity(e, qbtn)) return; }
    const insuranceConfirm = e.target.closest('[data-insurance-confirm]');
    if(insuranceConfirm){ if (kraneHandle_insurance_confirm(e, insuranceConfirm)) return; }
    const chatSend = e.target.closest('[data-chat-send]');
    if(chatSend){ if (kraneHandle_consult_sendChat(e, chatSend)) return; }
    const markRead = e.target.closest('[data-mark-read]');
    if(markRead){ if (kraneHandle_notifications_markRead(e, markRead)) return; }
    const bank = e.target.closest('[data-bank-select]');
    if(bank){ if (kraneHandle_orders_selectBank(e, bank)) return; }
    const demoAction = e.target.closest('[data-demo-action]');
    if(demoAction){
      if(demoAction.closest('#otp')) prepareFreshOtpChallenge();
      showActionToast(demoAction.dataset.demoAction || 'เรียบร้อยแล้ว');
      return;
    }
    const directIntakeComplete=e.target.closest('[data-direct-intake-complete]');
    if(directIntakeComplete){ if (kraneHandle_intake_directComplete(e, directIntakeComplete)) return; }
    const csatGo = e.target.closest('[data-csat-go]');
    if(csatGo){ if (kraneHandle_clinical_csatOpen(e, csatGo)) return; }
    if(e.target.closest('[data-delivery-confirm]')){ if (kraneHandle_tracking_confirmDelivery(e)) return; }
    if(e.target.closest('[data-address-recipient-edit]')) { if (kraneHandle_address_recipientEdit(e)) return; }
    const mockDelivery=e.target.closest('[data-mock-status]');
    if(mockDelivery){ if (kraneHandle_tracking_demoStatus(e, mockDelivery)) return; }
    const paidTracking=e.target.closest('[data-payment-success-cta][data-go="tracking"]');
    if(paidTracking){ if (kraneHandle_payment_success_tracking(e, paidTracking)) return; }
    const go = e.target.closest('[data-go]');
    if(go){
      const intakeQuestionScreen=go.closest('.screen');
      if(intakeQuestionScreen && INTAKE_ONE_QUESTION_SCREENS.includes(intakeQuestionScreen.id) && advanceIntakeQuestionPage(intakeQuestionScreen)) return;
      if(go.dataset.go === 'matching') doctorAvailable=true;
      /* Logging in with a saved intake resumes it; without one the account
         itself is the destination, wherever the log-in link was tapped. */
      if(go.dataset.go === 'login' && (go.closest('.rail') || !flowState.draftReady)) postAuthNext = 'profile';
      if(guardActiveCase(go.dataset.go)) return;
      // Any link may name the concern it is about, not just the prototype rail:
      // re-consulting from a treatment card must not re-ask which condition.
      if(go.dataset.category) setSelectedCategory(go.dataset.category);
      if(go.closest('.rail')){
        if(go.dataset.entryChannel){
          flowState.entryChannel=go.dataset.entryChannel;
          persistFlowState();
        }
        seedPartnerStage(go.dataset.go);
        seedClinicalDemoStage(go.dataset.go);
        history = seededHistory(go.dataset.go);
        show(go.dataset.go, false);
        return;
      }
      // safety routing: if a red-flag condition (data-flag) is selected on this screen,
      // send the patient to the "not eligible / needs in-person care" screen instead.
      const scr = go.closest('.screen');
      if(scr && INTAKE_DRAFT_SCREENS.includes(scr.id) && go.getAttribute('aria-disabled') === 'true'){
        const state = syncIntakeDropdownContinue(scr);
        showActionToast(state?.message || go.dataset.missingMessage || 'กรุณาตอบคำถามที่จำเป็นก่อนดำเนินการต่อ','warning');
        if(state?.target){
          const customTrigger = state.target.matches?.('select') && state.target.parentElement?.querySelector('.custom-select__trigger');
          const focusTarget = customTrigger || state.target;
          focusTarget.scrollIntoView({behavior:reduceMotion ? 'auto' : 'smooth',block:'center'});
          window.setTimeout(() => focusTarget.focus?.(),reduceMotion ? 0 : 220);
        }
        return;
      }
      if(go.dataset.flagGo && scr && scr.querySelector('.option[data-flag][aria-selected="true"]')){
        show(go.dataset.flagGo); return;
      }
      if(go.dataset.go==='intake4' && (scr?.id==='intake3' || scr?.id==='ineligible') && intakeConcernKey()==='weight' && flowState.entryChannel!=='partner'){
        if(scr.id==='ineligible') show('intake3');
        openObesityRiskModal();
        return;
      }
      // The next question screen may be skipped with nothing behind it — the
      // single-page general route. That is the end of the questionnaire.
      if(go.dataset.go && intakeSkipped(go.dataset.go) && !skipForwardFrom(go.dataset.go)){
        if(flowState.entryChannel==='partner') show('intake-concern');
        else finishDirectF02();
        return;
      }
      if(go.dataset.go === 'intake5' && !categoryNeedsPhotos()){
        if(flowState.entryChannel==='partner') show('intake-concern');
        else finishDirectF02();
        return;
      }
      if(go.dataset.go === 'consultpay'){
        show(consultationHandoffTarget());
        return;
      }
      if(go.dataset.go === 'payment' && !go.hasAttribute('data-keep-payment-total')) setMedicationCheckoutContext();
      show(go.dataset.go);
      return;
    }
    const back = e.target.closest('[data-back]');
    if(back){
      const backScreen=back.closest('.screen');
      if(backScreen && retreatIntakeQuestionPage(backScreen)) return;
      /* The form is a step inside the address page, so back leaves the form
         rather than the page — unless there is no list to go back to. */
      if(backScreen?.id==='address' && addressPageMode!=='list' && savedAddresses().length){ if (kraneHandle_address_lifecycle_20()) return; }
      if(backScreen?.id==='otp' && flowState.partnerPhoneOtpPending){ if (kraneHandle_otp_lifecycle_21()) return; }
      if(backScreen?.id==='otp' && flowState.phoneOtpPending){ if (kraneHandle_otp_lifecycle_22()) return; }
      if(history.length > 1){ history.pop(); show(history[history.length-1], false); }
      else {
        // opened directly (rail/deep link): send back somewhere sensible, never a dead button
        const scr3 = back.closest('.screen');
        const entry = ['signup','login'];
        show(entry.includes(scr3 && scr3.id) ? 'landing' : 'profile');
      }
      return;
    }
    // selectable options: toggle within their group (the parent .stack/.row)
    const opt = e.target.closest('.option[data-select]');
    if(opt){
      const group = opt.parentElement;
      [...group.querySelectorAll('.option[data-select]')].forEach(o => o.setAttribute('aria-selected', o===opt));
      saveIntakeDraft();
      const optScreen = opt.closest('.screen');
      syncIntakeDropdownContinue(optScreen);
      const question = opt.closest('[data-intake-question]');
      if(optScreen && question && !question.hidden && intakeQuestionIsSingleChoice(question)){
        // Brief hold so the choice is seen registering before the page turns.
        window.setTimeout(() => {
          if(!optScreen.classList.contains('active')) return;
          if(advanceIntakeQuestionPage(optScreen)) return;
          optScreen.querySelector('.screen__footer .btn--primary[data-go]')?.click();
        }, reduceMotion ? 0 : 200);
      }
    }
    // multi-select options (checkbox style): toggle independently, with "None of the above" mutual exclusion
    const multi = e.target.closest('.option[data-multi]');
    if(multi){
      const group = multi.parentElement;
      const on = multi.getAttribute('aria-selected') !== 'true';
      multi.setAttribute('aria-selected', on);
      if(multi.hasAttribute('data-none') && on){
        [...group.querySelectorAll('.option[data-multi]:not([data-none])')].forEach(o => o.setAttribute('aria-selected','false'));
      } else if(on){
        const none = group.querySelector('.option[data-multi][data-none]');
        if(none) none.setAttribute('aria-selected','false');
      }
      saveIntakeDraft();
      syncIntakeDropdownContinue(multi.closest('.screen'));
    }
    // segmented toggles (ID/passport, article filters): single-select within parent group
    /* Open issued PDFs directly; the treatment record contains medicine details. */
    const docOpen = e.target.closest('[data-doc-open]');
    if(docOpen){ if (kraneHandle_my_documents_open(e, docOpen)) return; }
    const tog = e.target.closest('[data-toggle]');
    if(tog){
      [...tog.parentElement.querySelectorAll('[data-toggle]')].forEach(o => o.setAttribute('aria-selected', o===tog));
      if(tog.dataset.accountDoc){ if (kraneHandle_account_documentType(e, tog)) return; }
      if(tog.dataset.insuranceDoc){ if (kraneHandle_insurance_documentType(e, tog)) return; }
      saveIntakeDraft();
      // documents screen: the toggle swaps the prescription / certificate blocks
      if(tog.dataset.docTab){ if (kraneHandle_my_documents_tab(e, tog)) return; }
    }
    // independent press toggles (call controls: mute / cam / speaker)
    const press = e.target.closest('[data-press]');
    if(press){ if (kraneHandle_video_callControl(e, press)) return; }
    // rating stars: fill up to the clicked star within its group
    const star = e.target.closest('.rating[data-rate] .star');
    if(star){
      const stars = [...star.parentElement.querySelectorAll('.star')];
      const idx = stars.indexOf(star);
      stars.forEach((s,i) => s.classList.toggle('on', i <= idx));
    }
  });

  // ── Feature + User Story annotation strips (prototype chrome only) ──
  const featureMap = {
    'landing':          { id:'KRANE-F01', name:'Landing Page', stories:['US-F01.1: New patient sees clear, premium landing with service types and CTA','US-F01.3: Returning patient sees Log In option to skip to dashboard','US-F01.4: Trust signals ("Real doctors. Discreet delivery.") visible before CTA'] },
    'concern':          { id:'KRANE-F08', name:'Care Category Selection', stories:['US-F08.3: Patient sees broad categories first before disease / condition choices','US-F08.4: General consultation is a top-level path for concerns that do not fit a disease'] },
    'conditions':       { id:'KRANE-F08', name:'Condition Selection', stories:['US-F08.1: Patient selects the specific condition after choosing a category','US-F08.2: Selection gates the doctor pool to relevant specialists only','Prototype note: categories and conditions render from consultationCatalog'] },
    'articles':         { id:'KRANE-F37', name:'Health Articles & Education (Patient)', stories:['US-F37.1: Read articles, medicine info, condition guides (educational framing)','US-F37.2: Author/attribution header + links/tags for navigation','US-F37.3: Only Published items from the CMS (F30) are shown'] },
    'article':          { id:'KRANE-F37', name:'Health Article, Read View', stories:['US-F37.1: Educational content with clear author and review date','US-F37.2: Tags link to related topics'] },
    'insurance':        { id:'KRANE-F35', name:'Insurance Demand-Side Intake & Claim', stories:['Enter ID/passport, DOB, policy number','Choose "Check entitlement" or "Pay myself"','Edit copay vs credit-limit split','Claim connects to back-office claim system'] },
    'intake1':          { id:'KRANE-F02', name:'Direct Intake, SCR-DIR-02 Symptoms & Duration', stories:['Every Direct service, including General consultation, starts its clinical intake here','Questions adapt to the selected service'] },
    'intake2':          { id:'KRANE-F02', name:'Direct Intake, SCR-DIR-02A Detail', stories:['Captures severity and concern-specific pattern before safety screening'] },
    'intake3':          { id:'KRANE-F02', name:'Direct Intake, SCR-DIR-02B Previous Care (conditional)', stories:['Prior treatment appears only when the selected service has an authored question set'] },
    'intake4':          { id:'KRANE-F02', name:'Direct Intake, SCR-DIR-02C Urgent Safety', stories:['Warning signs are screened before online care continues','Ineligible patients route to in-person care'] },
    'intake5':          { id:'KRANE-F02', name:'Direct Intake, SCR-DIR-02D Photo (optional)', stories:['Photo upload appears only where an image materially helps assessment','Completing or skipping saves F02 and continues to F03'] },
    'intake-concern':   { id:'KRANE-F04', name:'Partner Entry, SCR-002 Concern Details', stories:['Locked Partner entry records free-form symptoms, duration and attempted relief','Direct entry never uses this compact Partner screen'] },
    'intake-general':   { id:'KRANE-F04 + KRANE-F05', name:'Shared UI, Partner SCR-003 / Direct SCR-DIR-02E', stories:['Partner keeps its approved compact-health order unchanged','Direct confirms or updates general health after fee handling and immediately before the waiting room','The same health fields are reused without sharing route logic'] },
    'activity':         { id:'KRANE-F05', name:'Activity Tab, Active Orders + Past Treatments', stories:['Active delivery orders remain separate for tracking','Completed consultation and order events are merged into one treatment episode','Tapping a past treatment opens its diagnosis and previous prescription when available'] },
    'pharmacy-search':  { id:'KRANE-F20 + KRANE-F21', name:'Pre-payment Pharmacist Review & Routing', stories:['The signed prescription and order are reviewed before payment opens','A licensed pharmacist verifies the prescription, locks stock and confirms the final price','A declined branch reroutes automatically; repeated declines offer postal fulfilment before payment'] },
    'ineligible':       { id:'KRANE-F04', name:'Health Intake, Not Eligible (edge state)', stories:['US-F04.7: Ineligible patients are clearly told to seek in-person care','US-F04.8: Option to review answers or return home'] },
    'signup':           { id:'KRANE-F03', name:'Create Account', stories:['A new patient creates an account with the phone number already carried into OTP','OTP verifies the account but never skips patient information, identity, or current consent','The completed intake draft remains available throughout authentication'] },
    'login':            { id:'KRANE-F03', name:'Log In, Returning User', stories:['A returning patient verifies the phone number with OTP','A still-valid identity may skip repeat identity verification','Current PDPA and telemedicine consent remains mandatory before matching'] },
    'social-confirm':   { id:'KRANE-F03', name:'Social Login Callback, Confirm Account', stories:['Client 14 Jul: LINE / Google login returns to a clear confirmation screen before continuing','Patient reviews the verified identity and contact details shared by the provider','New-patient and returning-patient routes continue to the correct next step'] },
    'matching':         { id:'KRANE-F09 + KRANE-F11', name:'Doctor Matching (Auto-match default)', stories:['US-F09.1: Auto-match assigns an available licensed doctor without a redundant introduction screen','US-F11.1: The patient sees one waiting state while a doctor is assigned','If no doctor is immediately available, the system offers the next suitable appointment without sending the patient to an error page'] },
    'consultpay':       { id:'KRANE-F39 + KRANE-F09', name:'Consultation Fee Payment', stories:['US-F39.1: Discount / coupon code can be entered at checkout','Prototype assumption: Payment 1 is consultation fee only and is required before entering the waiting room','Prototype assumption: medicine and delivery remain a separate payment after prescription acceptance'] },
    'waitroom':         { id:'KRANE-F14', name:'Waiting Room, Doctor Joins First', stories:['US-F14.4: Doctor joins first before patient enters the consultation room','Client v3: the patient cannot enter a blank room; the Enter button unlocks only when the doctor admits them','Patient sees current status, estimated next step, and what to prepare while waiting'] },
    'consult':          { id:'KRANE-F13', name:'Consultation Screen (Patient), Chat Tab', stories:['US-F13.1: Chat + video tabs freely switchable during session','US-F13.2: Patient sees doctor name, photo, and licence number in session','US-F13.3: Patient can view intake form summary in the same view','US-F13.4: Session stays open until doctor closes it and sends the treatment plan','Prototype assumption: consultation fee is already paid before this screen'] },
    'video':            { id:'KRANE-F13', name:'Consultation Screen, Call (camera toggles voice-only in place)', stories:['US-F13.1: Chat + video tabs freely switchable without disruption','US-F13.6: Patient can navigate to payment and back without dropping the call'] },
    'rx-writing':       { id:'KRANE-F15', name:'Doctor Writing Prescription (status)', stories:['Client 6 Jul: prescribing can take a while; the patient sees a status screen before the treatment plan','US-F15.2: the patient is notified (LINE first) the moment the plan is ready','Patient can leave this screen without losing their place'] },
    'plan':             { id:'KRANE-F16', name:'Treatment Plan View (Acceptance)', stories:['US-F16.1: Structured summary: medicine, dosage, plain-language explanation, medicine price','US-F16.2: Patient can accept (→ medication payment) or message doctor to request changes','US-F16.3: Patient cannot edit the prescription directly (clinical model, not e-commerce)','US-F16.4: Shows next follow-up date when available, refills allowed, request-more eligibility, and prescription expiry','US-F16.5: "Refill" is the single consistent term'] },
    'address':          { id:'KRANE-F18', name:'Delivery Address, Search / Missing Address', stories:['US-F18.8: Patient searches condo, building, landmark or address, or pins location on a map','US-F18.9: Same-day delivery is disabled until a valid address exists'] },
    'payment':          { id:'KRANE-F18', name:'Medication Payment, Hosted Gateway', stories:['US-F18.10: Payment appears as a familiar third-party hosted KBank-style gateway','US-F18.5: Medicine and delivery costs shown separately; total summarised','Prototype assumption: this is Payment 2 after the consultation and prescription acceptance'] },
    'payfail':          { id:'KRANE-F18', name:'Medication Payment, Failed (edge state)', stories:['US-F18.6: Patient can retry or choose a different payment method','US-F18.7: Treatment plan is preserved; no data lost on failure'] },
    'pharmacypending':  { id:'KRANE-F21', name:'Pre-payment Pharmacy Preparation (SCR-017)', stories:['The pharmacy prepares the reserved medicine before checkout','The prepared order is ready to dispatch immediately after payment'] },
    'refund':           { id:'KRANE-F21', name:'Fulfilment, Refund Confirmed', stories:['US-F21.6: Refund confirmation: amount, card, and reference shown clearly','US-F21.7: Consultation fee is separate and unaffected by a medication refund'] },
    'tracking':         { id:'KRANE-F21', name:'Dispatch & Order Tracking (SCR-048)', stories:['Payment success releases documents and opens tracking directly','Real-time status preserves the completed pharmacy checks and continues with rider pickup through delivery','Admin status updates are reflected in patient tracking'] },
    'feedback':         { id:'none', name:'Post-Consultation Feedback (not in Phase 1 feature scope)', stories:['Proposed: consultation satisfaction rating for care quality','Note: no KRANE-F## assigned, flag for next feature list update'] },
    'feedbackdone':     { id:'none', name:'Post-Consultation Feedback, Thanks state', stories:[] },
    'profile':          { id:'KRANE-F05', name:'Patient Profile (4-Tab), Tab 1: Profile', stories:['US-F05.1: Active consultation/condition shown with Refill button','US-F05.8: Multiple orders are grouped as needing action, active, and past','US-F05.5: Bottom nav includes Profile as a permanent tab'] },
    'my-documents':     { id:'KRANE-F05', name:'My Documents', stories:['All prescriptions, medical certificates and receipts are searchable in one place','Documents are sorted by date with newest first by default','Receipts remain linked from the paid step in order tracking'] },
    'notifications':    { id:'KRANE-F05 + KRANE-F12', name:'Patient Profile, Tab 3: Notifications + Appointment Alerts', stories:['US-F05.6: All platform alerts shown in the Notifications tab','US-F12.1: Booking confirmation, time-change, and cancellation notifications','US-F12.2: Reminder X hours before appointment (configurable)'] },
    'settings':         { id:'KRANE-F05', name:'Patient Profile, Tab 4: Settings', stories:['US-F05.7: Account, payment methods, notification prefs, help, log out'] },
    'account':          { id:'KRANE-F05', name:'Personal Details, Editable + Audit Trail', stories:['Client v3: name, phone, email, and card are editable and cannot be empty','Client v3: every edit is stored with a timestamp (audit trail)'] },
    'empty-activities': { id:'KRANE-F34', name:'Empty State, No Active Orders', stories:['US-F34.1: Graceful empty state for no orders / no consultation history','US-F34.2: CTA to start a consultation shown in empty state'] },
    'empty-history':    { id:'KRANE-F34', name:'Empty State, No Past Treatments', stories:['US-F34.1: Graceful empty state before any completed treatment, diagnosis or prescription exists'] },
  };

  // Feature tag = one floating toast on top, updated on navigation (not inside the page card)
  const featToast = document.createElement('div');
  featToast.id = 'featToast';
  featToast.className = 'feat-strip';
  document.body.appendChild(featToast);
/* updateFeatToast: shared/lib/ui.js */

/* drawQR: shared/lib/ui.js */

/* resetGatewayAttempt: shared/lib/ui.js */

/* activateGatewayMethod: shared/lib/ui.js */

  document.querySelectorAll('svg[data-qr]').forEach(drawQR);
kraneInit_payment_gw_550();

kraneInit_consultpay_551();

  document.body.addEventListener('click',event => {
    if(event.target.closest('[data-consult-payment-submit]')){ if (kraneHandle_consultpay_gw_submit(event)) return; }
    if(event.target.closest('[data-consult-payment-retry]')){ if (kraneHandle_consultpay_fail_retry(event)) return; }
    if(event.target.closest('[data-consult-payment-alternate]')){ if (kraneHandle_consultpay_fail_alternate(event)) return; }
  });

  // Grab-style checkout: the method and promo rows resolve here, then the bank
  // gateway opens on the chosen method (mirrors the consultpay -> consultpay-gw hop).
  const paymentItemSheet = document.getElementById('payment-item-sheet');
  let paymentItemDraft = null;
  let paymentItemReturnFocus = null;
/* syncPaymentItemDraft: shared/lib/intake.js */

/* openPaymentItemSheet: shared/lib/orders.js */

/* closePaymentItemSheet: shared/lib/orders.js */

/* commitPaymentItemQuantity: shared/lib/orders.js */

  kraneInit_payment_itemSheet();
  const postpayHelpSheet=document.getElementById('postpay-help-sheet');
  let postpayHelpReturnFocus=null;
/* openPostpayHelp: shared/lib/ui.js */

/* closePostpayHelp: shared/lib/ui.js */

  document.body.addEventListener('click',event => {
    const help=event.target.closest('[data-postpay-help]');
    if(help){ openPostpayHelp(help); return; }
    if(event.target.closest('[data-postpay-help-close]')){ closePostpayHelp(); return; }
    if(event.target.closest('[data-postpay-chat]')){
      closePostpayHelp();
      showActionToast('เชื่อมต่อทีมดูแล Krane แล้ว ทีมงานจะตอบกลับภายในประมาณ 2 นาที','success');
      return;
    }
    if(event.target.closest('[data-postpay-help-topic]')){
      closePostpayHelp();
      showActionToast('ส่งหัวข้อให้ทีมดูแลแล้ว เราจะติดต่อกลับโดยเร็วที่สุด','success');
      return;
    }
  });
  postpayHelpSheet?.addEventListener('keydown',event => { if(event.key==='Escape') closePostpayHelp(); });
  let paymentMethod = flowState.orderState.paymentMethod || 'qr';
  const paymentMethodNames = { qr:'QR / PromptPay', card:'\u0e1a\u0e31\u0e15\u0e23\u0e40\u0e04\u0e23\u0e14\u0e34\u0e15 / \u0e40\u0e14\u0e1a\u0e34\u0e15', bank:'\u0e42\u0e21\u0e1a\u0e32\u0e22\u0e25\u0e4c\u0e41\u0e1a\u0e07\u0e01\u0e34\u0e49\u0e07' };
  const paymentMethodModal = document.getElementById('payment-method-modal');
  let pendingPaymentMethod = paymentMethod;
/* syncPaymentMethodOptions: shared/lib/orders.js */

  /* The branch list, on the same sheet the payment method uses. Picking IS the
     answer (house rule 1): the tap writes the branch onto the pickup row and
     closes the sheet, with no second confirm. The choice rides on the order so
     the tracking screen and the receipt can name the branch the patient chose
     rather than a fixed one. */
  const pickupBranchModal = document.getElementById('pickup-branch-modal');
/* pickupLocationKey: shared/lib/ui.js */

/* pickupLocationConfirmed: shared/lib/ui.js */

/* pickupBranchForCurrentLocation: shared/lib/ui.js */

/* syncPickupBranch: shared/lib/ui.js */

/* openPickupBranchModal: shared/lib/ui.js */

/* closePickupBranchModal: shared/lib/ui.js */

kraneInit_address_579();

  kraneInit_address_pickupEscape();
/* openPaymentMethodModal: shared/lib/orders.js */

/* closePaymentMethodModal: shared/lib/orders.js */

  kraneInit_payment_owned_273();
  // Promo code: pick a listed offer or type one in. The list stays short and honest,
  // matching validPromoCodes, so the entry never dead-ends on "still nothing happens".
  const promoModal = document.getElementById('promo-modal');
  let pendingPromoCode = null;
/* openPromoModal: shared/lib/orders.js */

/* closePromoModal: shared/lib/orders.js */

/* renderPromo: pages/payment/page.js */

/* applyPromoCode: shared/lib/orders.js */

  kraneInit_payment_promo();
  kraneInit_payment_owned_277();
  /* An expired quote rechecks pharmacy stock, then returns to this checkout.
     Payment is still an explicit later action by the patient. */
  document.body.addEventListener('click',event => {
    if(event.target.closest('[data-payment-deadline-retry]')){ if (kraneHandle_payment_deadlineRetry(event)) return; }
    if(event.target.closest('[data-payment-submit]')){ if (kraneHandle_payment_gw_submit(event)) return; }
    if(event.target.closest('[data-payment-retry]')){ if (kraneHandle_payfail_retry(event)) return; }
    if(event.target.closest('[data-payment-alternate-method]')){ if (kraneHandle_payfail_alternate(event)) return; }
  });


  // The patient already saw and entered every answer. Persist the completed draft
  // for the doctor, then continue to account creation without a duplicate review page.
  document.body.addEventListener('click', e => {
    const intakeComplete=e.target.closest('[data-intake-complete]');
    if(!intakeComplete) return;
    const intakeQuestionScreen=intakeComplete.closest('.screen');
    if(intakeQuestionScreen && INTAKE_ONE_QUESTION_SCREENS.includes(intakeQuestionScreen.id) && advanceIntakeQuestionPage(intakeQuestionScreen)) return;
    if(intakeComplete.closest('#intake-concern')){ if (kraneHandle_intake_concern_submit(e, intakeComplete)) return; }
    if(intakeComplete.closest('#intake-general')){ if (kraneHandle_intake_general_submit(e, intakeComplete)) return; }
    completeSharedHealthIntake(false);
  });
/* completeSharedHealthIntake: pages/intake-general/page.js */


  /* CSAT is asked once per order, at the moment it is paid for. Skipping is
     allowed — a rating nobody wants to give is worse than no rating — and
     either way the flow carries on to the same place. */
  const csatModal = document.getElementById('csat-modal');
  // Reuse the existing four-part feedback form as the delivery review sheet.
  const csatGroups=['waiting','av','doctor','overall'];
  const csatRows=csatModal.querySelector('.csat-dialog__rows');
  document.getElementById('feedback').content.querySelectorAll('.rating-row').forEach((source,index)=>{
    const row=source.cloneNode(true);
    row.querySelector('[data-rate]').setAttribute('data-csat-'+csatGroups[index],'');
    row.querySelectorAll('.star').forEach(button=>{button.classList.remove('on');button.type='button';});
    csatRows.append(row);
  });

  let csatTarget = 'tracking';
  let csatReplaces = false;
/* leaveCsat: shared/lib/clinical.js */

/* openCsatModal: pages/tracking/page.js */

/* revealDeliveryNotification: shared/lib/orders.js */

/* syncDeliveryNotification: shared/lib/orders.js */

/* closeCsatModal: shared/lib/clinical.js */

/* csatScore: shared/lib/clinical.js */

  if(csatModal){
    csatModal.addEventListener('click', event => {
      /* Closeable now (client, 20 Aug): the order is already complete, so the
         review is a request, not a gate. It is not marked done, so it can be
         asked again on the next delivery. */
      if(event.target.closest('[data-csat-close]')){
        flowState.csatDeliveryPrompted=true;
        closeCsatModal();
        revealDeliveryNotification();
        leaveCsat();
        return;
      }
      const submit=event.target.closest('[data-csat-submit]');
      if(!submit) return;
      // Submission needs all four ratings; dismissal remains optional.
      const missing=csatGroups.filter(group => !csatScore(group));
      if(missing.length){
        showActionToast('กรุณาให้คะแนนให้ครบทั้ง 4 ข้อ','warning');
        return;
      }
      flowState.csat={
        waiting:csatScore('waiting'),
        av:csatScore('av'),
        overall:csatScore('overall'),
        doctor:csatScore('doctor'),
        note:document.getElementById('csat-note')?.value.trim() || ''
      };
      showActionToast('ขอบคุณสำหรับคะแนน','success');
      flowState.csatDone=true;
      syncDeliveryNotification();
      persistFlowState();
      closeCsatModal();
      show('feedbackdone');
    });
  }
/* goldenOrderSnapshot: shared/lib/orders.js */

  /* One order, one stage. The timeline, the header badge, the activity card and
     the arrival card all read it from here, so none of them can disagree with
     another, and nothing moves it on a timer (client, 13 Sep). The stage is the
     admin CMS's fulfilment status; on the patient's side only confirming receipt
     advances it. Steps before the active one are done, the active one runs, and
     everything after it waits. */
  const ORDER_STAGES={
    'Order received':   {active:'prepared',label:'กำลังจัดยา',tone:'progress',note:'กำลังจัดยา'},
    'Pharmacy accepted':{active:'prepared',label:'กำลังจัดยา',tone:'progress',note:'กำลังจัดยา'},
    'Preparing':        {active:'prepared',label:'กำลังจัดยา',tone:'progress',note:'กำลังจัดยา'},
    'Rider pickup':     {active:'out',label:'กำลังจัดส่ง',tone:'active',note:'กำลังจัดส่ง'},
    'Dispatched':       {active:'out',label:'กำลังจัดส่ง',tone:'active',note:'กำลังจัดส่ง'},
    'Delivered':        {active:null,label:'จัดส่งสำเร็จ',tone:'done',note:'จัดส่งสำเร็จแล้ว'}
  };
/* orderChargeSummary: shared/lib/orders.js */

  const POSTPAY_THUMBNAIL_LIMIT=5;
/* setPostpayText: shared/lib/ui.js */

/* setPostpayHidden: shared/lib/ui.js */

/* selectedOrderSnapshotItems: shared/lib/orders.js */

/* createPostpayThumbnail: shared/lib/ui.js */

/* createPostpayThumbnailOverflow: pages/order-summary/page.js */

/* renderPostpaySnapshotThumbnails: shared/lib/ui.js */

/* syncPostPaymentPanels: shared/lib/orders.js */

  const ORDER_STEP_ORDER=['paid','prepared','dispatch','out','delivered'];
/* orderFulfilmentStatus: shared/lib/orders.js */

  /* Client, 15 Sep: the order sat on "Preparing" and never moved, so the rest
     of its life could not be reached — not the rider, not the confirm button on
     the Delivered step, and not the review that follows confirming. The same
     problem the follow-up countdown had: a demo frozen short of the part worth
     seeing. While tracking is open the order walks itself to the rider and then
     out for delivery, and stops there: arriving is the courier's to announce,
     but "ได้รับของแล้ว" is the patient's to press, so the last step waits for
     them. ?demoStatus= still pins any stage directly. */
  const TRACKING_DEMO_STEP_MS=9000;
  let trackingDemoTimer=0;
/* stopTrackingDemoWalk: shared/lib/clinical.js */

/* startTrackingDemoWalk: pages/tracking/page.js */

/* syncTrackingDelivery: shared/lib/orders.js */

  window.kraneSyncOrderProgress=syncTrackingDelivery;
/* syncTrackingDetails: shared/lib/clinical.js */

/* clockStamp: shared/lib/ui.js */

/* deliveryArrivalWindow: shared/lib/orders.js */

  const signupDoneModal = document.getElementById('signup-done-modal');
  let signupDoneTarget = '';
  let signupDoneReturnFocus = null;
  /* The message has to name the step the button really leads to. A sign-up that
     began inside an intake goes back to the questions, one started from the
     log-in page goes to the account (client, 20 Sep). */
  const SIGNUP_DONE_DESCRIPTION = {
    'patient-info':'ขั้นตอนต่อไป กรอกข้อมูลผู้รับบริการ',
    'profile':'ขั้นตอนต่อไป เริ่มใช้งานบัญชี',
    'consent-terms':'ขั้นตอนต่อไป ยืนยันความยินยอมและการรักษาทางไกล'
  };
/* signupDoneDescription: shared/lib/ui.js */

/* openSignupDoneModal: shared/lib/ui.js */

/* closeSignupDoneModal: shared/lib/ui.js */

  kraneInit_signup_doneDialog();

  const obesityRiskModal = document.getElementById('obesity-risk-modal');
/* obesityRiskFlagged: shared/lib/intake.js */

/* syncObesityRiskWarning: shared/lib/intake.js */

  let obesityRiskStep=0;
/* renderObesityRiskStep: shared/lib/intake.js */

/* openObesityRiskModal: shared/lib/intake.js */

/* closeObesityRiskModal: shared/lib/intake.js */

  kraneInit_intake3_owned_300();
  const healthHistoryModal = document.getElementById('health-history-modal');
/* openHealthHistoryModal: shared/lib/ui.js */

/* closeHealthHistoryModal: shared/lib/ui.js */

  kraneInit_intake_general_owned_302();
kraneInit_partner_idcard_upload();

/* applyInsuranceVisibility: shared/lib/ui.js */


  // Ticking QR expiry. On the medication gateway an expired active QR becomes the
  // recoverable payment-failure state; the saved plan and checkout remain intact.
  setInterval(() => {
    document.querySelectorAll('[data-qr-countdown]').forEach(el => {
      const gateway=el.closest('.screen');
      const pane=el.closest('[data-gw-pane="qr"]');
      if(!gateway?.classList.contains('active') || !pane || pane.hidden) return;
      const p=el.textContent.split(':').map(Number);
      let t=(p[0]||0)*60+(p[1]||0);
      if(t<=0) return;
      t--;
      el.textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
      if(t===0){
        showActionToast('QR หมดอายุแล้ว กรุณาสร้างรายการชำระเงินใหม่','warning');
        replaceCurrent(gateway.id==='consultpay-gw' ? 'consultpay-fail' : 'payfail');
      }
    });
  },1000);
/* formatPatientDate: shared/lib/ui.js */

/* syncPatientDateField: shared/lib/ui.js */

/* syncPatientDateFields: shared/lib/ui.js */

  document.addEventListener('krane:languagechange',syncPatientDateFields);
  document.addEventListener('krane:languagechange',()=>document.querySelectorAll('[data-order-progress][data-progress-label-en]').forEach(bar=>{
    bar.removeAttribute('data-al-th');
    bar.setAttribute('aria-label',document.documentElement.lang==='th' ? bar.dataset.progressLabelTh : bar.dataset.progressLabelEn);
  }));
  /* The checkout composes its own add-on labels, so they keep whichever
     language they were built in until the row is rebuilt. */
  document.addEventListener('krane:languagechange',()=>{ try{ syncOrderCheckout(); }catch(_error){ /* Checkout is not on every screen. */ } });
/* openPatientDatePicker: shared/lib/ui.js */

/* enhancePatientDateFields: shared/lib/ui.js */


  // initialise now that featureMap + toast exist (honours deep-link hash, else current screen)
  renderConsultationCatalog();
  setupClearableFields();
  setupAddressSearch();
  restoreIntakeDraft();
  restorePartnerFields();
  enhancePatientDateFields();
  syncPartnerScreening();
  syncPartnerReview();
  const restoredPatientPhone=document.getElementById('patient-phone');
  kraneInit_patient_info_restorePhone();
  const restoredFirstName=document.getElementById('patient-first-name');
  const restoredLastName=document.getElementById('patient-last-name');
  kraneInit_patient_info_restoreName();
  restoreAuthenticatedAccount();
kraneInit_consult_675();

  if(pendingQueue && !queuePreview && !(flowConfig.get('entry')==='partner' && flowConfig.get('fresh')==='1')){pendingQueue.suspended=true;history=['landing'];show('queue-resume',false);}
  else if(location.hash) applyHash();
  else if(window.kraneDemoStage){
    /* Embedded landing showcases opt in with ?demoStage= rather than a hash.
       Open that seeded screen immediately so the live UI sits inside the phone
       overlay instead of briefly (or permanently) showing the landing page. */
    history=seededHistory(window.kraneDemoStage);
    show(window.kraneDemoStage,false);
  }
  else if(window.kraneDemoStatus){
    history=seededHistory('tracking');
    show('tracking',false);
  }
  else {
    history=['landing'];
    show('landing',false);
  }
kraneInit_consult_677();

kraneInit_landing_678();


  // address search: suggestions appear only while typing (hidden otherwise)
  const addrSearch = document.getElementById('addrSearch'), addrSuggest = document.getElementById('addrSuggest');
  kraneInit_address_owned_327();
  const deliveryAddressScreen=document.getElementById('address');
  kraneInit_address_owned_329();
kraneInit_intake_concern_683();


  // Optional photos on the shared intake. Thumbnails are local previews only.
  kraneInit_intake_concern_owned_331();

  // F02 language toggle is handled by i18n.js (active-state + TH/EN copy swap).

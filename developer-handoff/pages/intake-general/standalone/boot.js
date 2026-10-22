let kraneHashNavigation=false,kraneDocumentNavigation=false;
let kraneEntryPermit=sessionStorage.getItem('krane-standalone-entry-permit');sessionStorage.removeItem('krane-standalone-entry-permit');
if(!location.hash && new URLSearchParams(location.search).get('entry')==='partner'){const u=new URL(location.href);u.hash='consent-terms';u.searchParams.set('fresh','1');window.history.replaceState(null,'',u); }
window.kraneDemoStage=new URLSearchParams(location.search).get('demoStage')||undefined;
const KRANE_PAGE_ID="intake-general", KRANE_PAGE_IDS=["landing","conditions","articles","article","intake1","intake2","intake3","intake4","intake5","intake-concern","intake-general","ineligible","signup","login","set-password","social-confirm","patient-info","insurance-result","matching","appointment","appointment-booked","consultpay","consultpay-gw","consultpay-fail","waitroom","queue-resume","consult","video","rx-writing","rx-plan","address","delivery-quote","pharmacy-search","payment-items","payment","payment-gw","payment-success","insurance","payfail","pharmacypending","tracking","order-summary","feedbackdone","profile","treatment-detail","my-documents","activity","notifications","account","settings","empty-activities","empty-history","consent-terms","identity","otp","upload-rx","referral","partner-idcard","partner-patient-info","partner-insurance","partner-phr","preloader"];
if(!location.hash)window.history.replaceState(null,'',location.pathname+location.search+'#'+KRANE_PAGE_ID);
const kraneSaved=JSON.parse(sessionStorage.getItem('krane-standalone-state')||'{}');
document.querySelectorAll('.screen').forEach(screen => {
    const body=screen.querySelector(':scope > .screen__body');
    const footer=body && body.querySelector(':scope > .screen__footer');
    if(footer) screen.appendChild(footer);
  });
const screens = [...document.querySelectorAll('.screen')];
const reviewScreenIds=window.KraneReviewTools.screenIds;
const prototypeRail = document.querySelector('#prototype-rail');
screens.forEach(screen => {
    const reviewId=reviewScreenIds[screen.id];
    if(reviewId) screen.dataset.reviewScreenId=reviewId;
  });
const railLinks = [...document.querySelectorAll('.rail a[data-go]')];
const railToggle = prototypeRail?.querySelector('.rail-toggle');
const railCollapseStorageKey = 'krane-prototype-rail-collapsed';
try{ setPrototypeRailCollapsed(window.localStorage.getItem(railCollapseStorageKey) === '1', false); }catch(error){ setPrototypeRailCollapsed(false, false); }
railToggle?.addEventListener('click', () => setPrototypeRailCollapsed(!document.body.classList.contains('rail-is-collapsed')));
let history = Object.hasOwn(kraneSaved,"history") ? kraneSaved["history"] : ( ['landing']);
let selectedCategoryId = Object.hasOwn(kraneSaved,"selectedCategoryId") ? kraneSaved["selectedCategoryId"] : ( 'hair-skin');
let selectedConditionId = Object.hasOwn(kraneSaved,"selectedConditionId") ? kraneSaved["selectedConditionId"] : ( 'hair-loss');
let isAuthenticated = Object.hasOwn(kraneSaved,"isAuthenticated") ? kraneSaved["isAuthenticated"] : ( false);
let journeyActive = Object.hasOwn(kraneSaved,"journeyActive") ? kraneSaved["journeyActive"] : ( false);
const JOURNEY_INTAKE = ['concern','conditions','intake1','intake2','intake3','intake4','intake5','intake-concern','intake-general'];
const JOURNEY_AUTH = ['signup','login','social-confirm','otp','consent-terms','patient-info','identity'];
let hasActiveCase = Object.hasOwn(kraneSaved,"hasActiveCase") ? kraneSaved["hasActiveCase"] : ( false);
let postAuthNext = Object.hasOwn(kraneSaved,"postAuthNext") ? kraneSaved["postAuthNext"] : ( 'intake1');
let patientInfoNext = Object.hasOwn(kraneSaved,"patientInfoNext") ? kraneSaved["patientInfoNext"] : ( 'matching');
let doctorAvailable = Object.hasOwn(kraneSaved,"doctorAvailable") ? kraneSaved["doctorAvailable"] : ( true);
let actionToastTimer;
const actionToast = document.createElement('div');
actionToast.className = 'action-toast';
actionToast.setAttribute('role', 'status');
placeActionToast();
const activeCaseModal = document.getElementById('active-case-modal');
let activeCaseReturnFocus = null;
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
const IS_DEMO_EMBED = (() => {
    try{
      const params=new URLSearchParams(location.search);
      return Boolean(params.get('demoStage') || params.get('demoStatus'));
    }catch(_){ return false; }
  })();
if(IS_DEMO_EMBED) document.documentElement.classList.add('is-demo-embed');
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
if(flowState.consentsComplete && !hasCurrentConsent('direct') && !hasCurrentConsent('partner')) flowState.consentsComplete=false;
if(flowState.partnerConsentComplete && !hasCurrentConsent('partner')) flowState.partnerConsentComplete=false;
persistFlowState();
const consentChecks = [...document.querySelectorAll('[data-consent-checkbox]')];
const requiredConsentChecks = consentChecks.filter(input => input.dataset.consentRequired !== 'false');
const consentContinue = document.querySelector('[data-consent-continue]');
const careJourneyLabels = ['แบบประเมิน','ปรึกษาแพทย์','ยาและชำระเงิน'];
const careJourneyShort  = ['แบบประเมิน','ปรึกษาแพทย์','ยาและชำระเงิน'];
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
const PAYMENT_METHOD_LABELS={qr:'QR Code',card:'บัตรเครดิต / เดบิต',bank:'โมบายล์แบงกิ้ง',covered:'Covered by benefit'};
let appliedPromo = Object.hasOwn(kraneSaved,"appliedPromo") ? kraneSaved["appliedPromo"] : ( flowState.orderState.promoAmount
    ? {code:flowState.orderState.promoCode,amount:Number(flowState.orderState.promoAmount)}
    : null);
let paymentDue = Object.hasOwn(kraneSaved,"paymentDue") ? kraneSaved["paymentDue"] : ( 558);
let paymentCredit = Object.hasOwn(kraneSaved,"paymentCredit") ? kraneSaved["paymentCredit"] : ( 0);
let paymentConsultationDiscount = Object.hasOwn(kraneSaved,"paymentConsultationDiscount") ? kraneSaved["paymentConsultationDiscount"] : ( 0);
window.addEventListener('pageshow',syncFieldClearButtons);
let addressPageMode=['new','editor'].includes(flowState.addressDraftMode) ? flowState.addressDraftMode : 'list';
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
const intakeTemplates = kraneCreateIntakeTemplates();
const intakeBaseMarkup = {};
const INTAKE_ONE_QUESTION_SCREENS = ['intake1','intake2','intake3','intake4'];
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
const DOCTOR_NAME = 'นรินทร์';
const THEME_COLOR_APP='#F7F7F7';
const THEME_COLOR_LANDING='#5871B5';
let conditionListRevealed = false;
let enterTimer;
let paymentSuccessTimer;
let preloaderTimer;
let connectTimer;
let waitTimer;
let typingTimer;
let pharmacyRetryCount = Object.hasOwn(kraneSaved,"pharmacyRetryCount") ? kraneSaved["pharmacyRetryCount"] : ( 0);
let pharmacyForceDecline = Object.hasOwn(kraneSaved,"pharmacyForceDecline") ? kraneSaved["pharmacyForceDecline"] : ( false);
let deliveryMethod = Object.hasOwn(kraneSaved,"deliveryMethod") ? kraneSaved["deliveryMethod"] : ( flowState.orderState.deliveryMethod || 'same-day');
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
document.querySelectorAll('input[type="tel"]:not(.phone-field__input)').forEach(input => {
    input.value=formatPhoneForDisplay(input.value);
  });
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
let insuranceEntry = Object.hasOwn(kraneSaved,"insuranceEntry") ? kraneSaved["insuranceEntry"] : ( 'checkout');
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
const PARTNER_SCREENS = ['partner-idcard','partner-patient-info','partner-insurance',
    'partner-phr'];
const CONSULTATION_FEE_BAHT = 350;
const APPOINTMENT_ONLY = new Set(['sexual-health','ed','early-ejaculation','sexual-general']);
const MEDICINE_PRICES={cough:85,loratadine:94,paracetamol:20,naproxen:134};
const ADDON_PRICES={wellness:290,pillcase:190,pouch:250};
if(flowState.orderState.clinicalPrescription)importClinicalPrescription(flowState.orderState.clinicalPrescription);
let paymentDeadlineTimer=null;
let appointmentDay= Object.hasOwn(kraneSaved,"appointmentDay") ? kraneSaved["appointmentDay"] : ('วันนี้');
let appointmentSlot= Object.hasOwn(kraneSaved,"appointmentSlot") ? kraneSaved["appointmentSlot"] : ('');
const appointmentTime = minutes => `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
window.kraneProgramSchedule={slots(date){
    const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const selected=new Date(date+'T00:00:00'),dayIndex=Math.round((selected-today)/86400000);
    if(!Number.isFinite(dayIndex)||dayIndex<0||dayIndex>30)return [];
    const values=[];for(let minutes=540;minutes<1440;minutes+=15){if(!appointmentSlotUnavailable(minutes,dayIndex,now))values.push(appointmentTime(minutes));}return values;
  }};
const INTAKE_CONCERN_SPECIFIC = ['intake3'];
const GENERAL_COMPACT_SKIPPED_SCREENS = ['intake2','intake3','intake4','intake5'];
const INTAKE_CATEGORY_KEY = { 'hair-skin':'hair', skin:'skin', weight:'weight', 'sexual-health':'sexual', 'sleep-stress':'sleep', hormone:'hormone' };
const INTAKE_DRAFT_SCREENS = ['intake1','intake2','intake3','intake4','intake5','intake-concern','intake-general'];
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
const REQUIRED_CARE_TARGETS = new Set([
    'matching','appointment','appointment-booked','consultpay','consultpay-gw','consultpay-fail','waitroom',
    'consult','video','rx-writing','rx-plan','address','delivery-quote','pharmacy-search',
    'pharmacypending','payment-items','payment','payment-gw','payment-processing','payment-success','insurance','insurance-result','payfail',
    'tracking','order-summary','feedback','feedbackdone','upload-rx'
  ]);
const DIRECT_PRE_DOCTOR_GATE_TARGETS = new Set(['matching','appointment',
    'consultpay','consultpay-gw','consultpay-fail','waitroom','consult','video','rx-writing','rx-plan']);
document.addEventListener('input',event => syncFloatingFieldState(event.target.closest?.('.float-field')));
document.addEventListener('change',event => syncFloatingFieldState(event.target.closest?.('.float-field')));
document.addEventListener('focusout',event => syncFloatingFieldState(event.target.closest?.('.float-field')));
window.addEventListener('pagehide',()=>{if(pendingQueue && !kraneDocumentNavigation){pendingQueue.suspended=true;savePendingQueue()}});
let waitEntryTimer = null;
const waitroomExpiredModal = () => document.getElementById('waitroom-expired-modal');
let freshDeepLinkConsumed=false;
window.addEventListener('hashchange', applyHash);
window.addEventListener('message', e => {
    const messageTarget=e.data?.to ? normalizeScreenTarget(e.data.to) : '';
    if(e.data && e.data.krane === 'nav' && messageTarget && KRANE_PAGE_IDS.includes(messageTarget)){
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
let authNext = Object.hasOwn(kraneSaved,"authNext") ? kraneSaved["authNext"] : ( 'identity');
let socialCompletesAuth = Object.hasOwn(kraneSaved,"socialCompletesAuth") ? kraneSaved["socialCompletesAuth"] : ( false);
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
document.body.addEventListener('click', e => {
    const treatmentTab=e.target.closest('[data-treatment-tab]');
    if(treatmentTab){ if (false) return; }
    const followUpCaseOpen=e.target.closest('[data-followup-case-open]');
    if(followUpCaseOpen){ if (false) return; }
    const followUpJoin=e.target.closest('[data-followup-join]');
    if(followUpJoin){ if (false) return; }
    const treatmentOpen=e.target.closest('[data-treatment-open]');
    if(treatmentOpen){ if (false) return; }
    const followUpEditSymptoms=e.target.closest('[data-followup-edit-symptoms]');
    if(followUpEditSymptoms){ if (false) return; }
    const profileFollowup=e.target.closest('[data-profile-followup]');
    if(profileFollowup){ if (false) return; }
    /* "Consult now" duplicated the two appointment actions beside it and the
       button at the bottom of every treatment card. The slot carries the
       referral instead, which had nowhere to live (client, 10 Sep). */
    const profileReferral=e.target.closest('[data-profile-referral]');
    if(profileReferral){ if (false) return; }
    if(e.target.closest('[data-referral-close]')){ if (false) return; }
    const referralAction=e.target.closest('[data-referral-native-share],[data-referral-copy-code]');
    if(referralAction){ if (false) return; }
    const referralShare=e.target.closest('[data-referral-share]');
    if(referralShare){ if (false) return; }
    const profileNewAppointment=e.target.closest('[data-profile-new-appointment]');
    if(profileNewAppointment){ if (false) return; }
    /* The continue button this served lived on #rx-writing, a waiting screen,
       and was enabled in the same tick that auto-advanced away from it. The
       plan screen carries that step now and refreshMedicationCheckout() runs
       when the writing state finishes, so nothing is left to do here. */
    // The insurance intake/claim screen is shared by two contexts: opened from patient
    // profile setup (no order yet, just save the policy) or from checkout (an order is
    // being paid). Detect which one from where the click came from.
    const goInsurance = e.target.closest('[data-go="insurance"]');
    if(goInsurance){ if (false) return; }
    // Demo: force the "no doctor available" outcome, then run the match animation
    // so the flow shows match -> available-time fallback -> pay.
    const noMatch = e.target.closest('[data-demo-nomatch]');
    if(noMatch){ if (false) return; }
    // Demo: force the next pharmacy match to decline (out of stock), so the retry loop
    // and the standard-delivery fallback after 3 tries can be shown on demand.
    const noStock = e.target.closest('[data-demo-nostock]');
    if(noStock){ if (false) return; }
    // OAuth demo: each provider returns to a visible confirmation step before entering the app.
    const social = e.target.closest('[data-social]');
    if(social){ if (false) return; }
    const authContinue = e.target.closest('[data-auth-continue]');
    if(authContinue){ if (false) return; }
    const signupPhone = e.target.closest('[data-signup-phone]');
    if(signupPhone){ if (false) return; }
    /* A returning patient signs in with the password they set, so there is no
       second SMS on the ordinary path. The code is only asked for again when
       the password has to be replaced (client, 12 Sep). */
    const loginSubmit = e.target.closest('[data-login-submit]');
    if(loginSubmit){ if (false) return; }
    const loginForgot = e.target.closest('[data-login-forgot]');
    if(loginForgot){ if (false) return; }
    const authComplete = e.target.closest('[data-auth-complete]');
    if(authComplete){ if (false) return; }
    const passwordSave = e.target.closest('[data-password-save]');
    if(passwordSave){ if (false) return; }
    const partnerInfoContinue=e.target.closest('[data-partner-info-continue]');
    if(partnerInfoContinue){ if (false) return; }
    const partnerPayment=e.target.closest('[data-partner-payment]');
    if(partnerPayment){ if (false) return; }
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
    if(obesityRiskChoice){ if (false) return; }
    const directHistoryChoice=e.target.closest('[data-direct-history-choice]');
    if(directHistoryChoice){ if (kraneHandle_intake_directHistory(e, directHistoryChoice)) return; }
    const partnerScreeningOption=e.target.closest('[data-partner-screening-value]');
    if(partnerScreeningOption){ if (kraneHandle_intake_general_screening(e, partnerScreeningOption)) return; }
    const partnerComplete = e.target.closest('[data-partner-complete]');
    if(partnerComplete){ if (false) return; }
    const patientInfoContinue = e.target.closest('[data-patient-info-continue]');
    if(patientInfoContinue){ if (false) return; }
    const identityContinue = e.target.closest('[data-identity-continue]');
    if(identityContinue){ if (false) return; }
    const consentSubmit = e.target.closest('[data-consent-continue]');
    if(consentSubmit){ if (false) return; }
    const newAccount = e.target.closest('[data-new-account]');
    if(newAccount){ if (false) return; }
    // category card: set the chosen category (so the conditions screen knows what to show)
    // BEFORE the generic navigation handler runs below.
    const catCard = e.target.closest('[data-category-card]');
    if(catCard){ if (false) return; }
    const conditionCard = e.target.closest('[data-condition-card]');
    if(conditionCard) { if (false) return; }
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
    if(fillItem){ if (false) return; }
    // F13: End hangs up (the chat return-bar disappears); Chat keeps the call running
    const ec = e.target.closest('[data-endcall]');
    if(ec) { if (false) return; }
    // ---- declined medicines: put one back ----
    const restore=e.target.closest('[data-restore-item]');
    if(restore){ if (false) return; }
    // ---- accept the medicine list, which ends the consultation ----
    if(e.target.closest('[data-accept-plan]')){ if (false) return; }
    if(e.target.closest('[data-acceptplan-cancel]')){ if (false) return; }
    if(e.target.closest('[data-acceptplan-confirm]')){ if (false) return; }
    // ---- end-call confirmation (item 7) ----
    const endCall=e.target.closest('[data-endcall]');
    if(endCall){ if (false) return; }
    if(e.target.closest('[data-endcall-cancel]')){ if (false) return; }
    if(e.target.closest('[data-endcall-confirm]')){ if (false) return; }
    // ---- map picker (in-app only, never navigates out) ----
    const simZoom=e.target.closest('[data-sim-zoom]');
    if(simZoom){ if (false) return; }
    if(e.target.closest('[data-address-picker-open]')){ if (false) return; }
    if(e.target.closest('[data-address-picker-close]')){ if (false) return; }
    if(e.target.closest('[data-sim-locate]')){ if (false) return; }
    if(e.target.closest('[data-address-map-confirm]')){ if (false) return; }
    const addressSave=e.target.closest('[data-address-save]');
    if(addressSave){ if (false) return; }
    const fulfillmentModeChoice=e.target.closest('[data-fulfillment-mode-option]');
    if(fulfillmentModeChoice){ if (false) return; }
    const deliveryChoice=e.target.closest('[data-delivery-value]');
    if(deliveryChoice){ if (false) return; }
    /* The basket row carries its own remove, so an add-on can be dropped where
       it is listed instead of hunting for its card in the rail below. Adding it
       back is still the card, which is where the price and description live. */
    /* The filter narrows the one feed. It runs before the [data-go] handler so a
       filter press never also opens the card underneath it. */
    const activityFilter=e.target.closest('[data-activity-filter]');
    if(activityFilter){ if (false) return; }
    /* There is no dispatch map behind the prototype, so the button says where
       the live position actually lives rather than opening an empty frame. */
    const riderLocate=e.target.closest('[data-rider-locate]');
    if(riderLocate){ if (false) return; }
    const addOnEdit=e.target.closest('[data-addon-edit]');
    if(addOnEdit){ if (false) return; }
    const addOnRemove=e.target.closest('[data-addon-remove]');
    if(addOnRemove){ if (false) return; }
    const addOnChoice=e.target.closest('[data-addon-option]');
    if(addOnChoice){ if (false) return; }
    // F16 (client 5 Jul): reduce-only quantity stepper; the prescription is the ceiling
    const qbtn = e.target.closest('[data-qty-minus],[data-qty-plus]');
    if(qbtn && !qbtn.disabled){ if (kraneHandle_orders_quantity(e, qbtn)) return; }
    const insuranceConfirm = e.target.closest('[data-insurance-confirm]');
    if(insuranceConfirm){ if (false) return; }
    const chatSend = e.target.closest('[data-chat-send]');
    if(chatSend){ if (false) return; }
    const markRead = e.target.closest('[data-mark-read]');
    if(markRead){ if (false) return; }
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
    if(e.target.closest('[data-delivery-confirm]')){ if (false) return; }
    if(e.target.closest('[data-address-recipient-edit]')) { if (false) return; }
    const mockDelivery=e.target.closest('[data-mock-status]');
    if(mockDelivery){ if (false) return; }
    const paidTracking=e.target.closest('[data-payment-success-cta][data-go="tracking"]');
    if(paidTracking){ if (false) return; }
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
      if(backScreen?.id==='address' && addressPageMode!=='list' && savedAddresses().length){ if (false) return; }
      if(backScreen?.id==='otp' && flowState.partnerPhoneOtpPending){ if (false) return; }
      if(backScreen?.id==='otp' && flowState.phoneOtpPending){ if (false) return; }
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
    if(docOpen){ if (false) return; }
    const tog = e.target.closest('[data-toggle]');
    if(tog){
      [...tog.parentElement.querySelectorAll('[data-toggle]')].forEach(o => o.setAttribute('aria-selected', o===tog));
      if(tog.dataset.accountDoc){ if (false) return; }
      if(tog.dataset.insuranceDoc){ if (false) return; }
      saveIntakeDraft();
      // documents screen: the toggle swaps the prescription / certificate blocks
      if(tog.dataset.docTab){ if (false) return; }
    }
    // independent press toggles (call controls: mute / cam / speaker)
    const press = e.target.closest('[data-press]');
    if(press){ if (false) return; }
    // rating stars: fill up to the clicked star within its group
    const star = e.target.closest('.rating[data-rate] .star');
    if(star){
      const stars = [...star.parentElement.querySelectorAll('.star')];
      const idx = stars.indexOf(star);
      stars.forEach((s,i) => s.classList.toggle('on', i <= idx));
    }
  });
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
const featToast = document.createElement('div');
featToast.id = 'featToast';
featToast.className = 'feat-strip';
document.body.appendChild(featToast);
document.querySelectorAll('svg[data-qr]').forEach(drawQR);
document.body.addEventListener('click',event => {
    if(event.target.closest('[data-consult-payment-submit]')){ if (false) return; }
    if(event.target.closest('[data-consult-payment-retry]')){ if (false) return; }
    if(event.target.closest('[data-consult-payment-alternate]')){ if (false) return; }
  });
let paymentMethod = Object.hasOwn(kraneSaved,"paymentMethod") ? kraneSaved["paymentMethod"] : ( flowState.orderState.paymentMethod || 'qr');
const pickupBranchModal = document.getElementById('pickup-branch-modal');
document.body.addEventListener('click',event => {
    if(event.target.closest('[data-payment-deadline-retry]')){ if (false) return; }
    if(event.target.closest('[data-payment-submit]')){ if (false) return; }
    if(event.target.closest('[data-payment-retry]')){ if (false) return; }
    if(event.target.closest('[data-payment-alternate-method]')){ if (false) return; }
  });
document.body.addEventListener('click', e => {
    const intakeComplete=e.target.closest('[data-intake-complete]');
    if(!intakeComplete) return;
    const intakeQuestionScreen=intakeComplete.closest('.screen');
    if(intakeQuestionScreen && INTAKE_ONE_QUESTION_SCREENS.includes(intakeQuestionScreen.id) && advanceIntakeQuestionPage(intakeQuestionScreen)) return;
    if(intakeComplete.closest('#intake-concern')){ if (false) return; }
    if(intakeComplete.closest('#intake-general')){ if (kraneHandle_intake_general_submit(e, intakeComplete)) return; }
    completeSharedHealthIntake(false);
  });
const csatModal = document.getElementById('csat-modal');
let csatTarget = 'tracking';
let csatReplaces = false;
let trackingDemoTimer=0;
const obesityRiskModal = document.getElementById('obesity-risk-modal');
let obesityRiskStep= Object.hasOwn(kraneSaved,"obesityRiskStep") ? kraneSaved["obesityRiskStep"] : (0);
const healthHistoryModal = document.getElementById('health-history-modal');
kraneInit_intake_general_owned_302();
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
document.addEventListener('krane:languagechange',syncPatientDateFields);
document.addEventListener('krane:languagechange',()=>document.querySelectorAll('[data-order-progress][data-progress-label-en]').forEach(bar=>{
    bar.removeAttribute('data-al-th');
    bar.setAttribute('aria-label',document.documentElement.lang==='th' ? bar.dataset.progressLabelTh : bar.dataset.progressLabelEn);
  }));
restoreIntakeDraft();
restorePartnerFields();
enhancePatientDateFields();
syncPartnerScreening();
restoreAuthenticatedAccount();
function kraneNavigateDocument(id){sessionStorage.setItem('krane-standalone-entry-permit',id);kraneSavePageForm();if(window.kraneArticleState)sessionStorage.setItem('krane-article-selection',JSON.stringify({selectedId:window.kraneArticleState.selectedId,filter:window.kraneArticleState.filter}));persistFlowState();sessionStorage.setItem('krane-standalone-state',JSON.stringify({history,selectedCategoryId,selectedConditionId,isAuthenticated,journeyActive,hasActiveCase,postAuthNext,patientInfoNext,doctorAvailable,insuranceEntry,authNext,socialCompletesAuth,appointmentDay,appointmentSlot,pharmacyRetryCount,pharmacyForceDecline,deliveryMethod,paymentMethod,paymentDue,paymentCredit,paymentConsultationDiscount,appliedPromo,obesityRiskStep}));const url=new URL('../developer-handoff/pages/'+id+'/index.html',document.baseURI);url.search=location.search;url.searchParams.delete('fresh');url.searchParams.set('category',selectedCategoryId);url.hash=id;kraneDocumentNavigation=true;if(kraneHashNavigation)location.replace(url);else location.assign(url);}
if(KRANE_PAGE_ID==='login'&&!Object.hasOwn(kraneSaved,'postAuthNext'))postAuthNext='profile';
if(flowConfig.get('category'))setSelectedCategory(flowConfig.get('category'));
if(window.kraneDemoStage){seedPartnerStage(window.kraneDemoStage);seedClinicalDemoStage(window.kraneDemoStage); }
applyHash();
kraneRestorePageForm();
if(KRANE_PAGE_ID==='ineligible'&&flowState.ineligibleReturn)document.querySelector('#ineligible .btn--ghost').dataset.go=flowState.ineligibleReturn;
if(typeof kraneRenderArticles==='function')kraneRenderArticles();

document.documentElement.dataset.pageReady='true';

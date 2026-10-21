/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function isEnglishUi(){
    if(document.documentElement.lang === 'en' || /[?&#]lang=en\b/.test(window.location.href)) return true;
    try{ return window.localStorage.getItem('krane_lang') === 'en'; }catch(error){ return false; }
  }

  function setPrototypeRailCollapsed(collapsed, persist = true){
    document.body.classList.toggle('rail-is-collapsed', collapsed);
    if(railToggle){
      const english=isEnglishUi();
      const railLabel=english
        ? (collapsed ? 'Expand the step menu' : 'Collapse the step menu')
        : (collapsed ? 'ขยายเมนูเส้นทาง' : 'ย่อเมนูเส้นทาง');
      railToggle.setAttribute('aria-expanded', String(!collapsed));
      railToggle.setAttribute('aria-label', railLabel);
      railToggle.title = railLabel;
    }
    if(persist){
      try{ window.localStorage.setItem(railCollapseStorageKey, collapsed ? '1' : '0'); }catch(error){}
    }
  }

  // Insurance is claimable only on the general health path. Specialty paths are self-pay.
  function isGeneralPath(){ return selectedCategoryId === 'general'; }

  // SCR-002/SCR-003 are the approved compact Partner intake. Direct entry never
  // uses them: every Direct concern starts at SCR-DIR-02 (#intake1).
  function sharedConcernRequired(){ return flowState.entryChannel === 'partner' || isGeneralPath(); }

  function placeActionToast(){
    const host = document.querySelector('.screen.active') || document.querySelector('.stage');
    if(host){
      if(actionToast.parentElement !== host) host.appendChild(actionToast);
      const footer = host.querySelector(':scope > .screen__footer');
      actionToast.style.setProperty('--action-toast-bottom',((footer?.offsetHeight || 0) + 16) + 'px');
    }
  }

  function showActionToast(message,type='success'){
    const iconNames={info:'info',success:'circle-check',warning:'triangle-alert',danger:'circle-x'};
    placeActionToast();
    const tone=['warning','danger','error'].includes(type) ? 'warning' : (type==='info' ? 'info' : 'success');
    actionToast.className = 'action-toast action-toast--' + tone;
    actionToast.innerHTML = '<span class="action-toast__icon">'+window.kraneIcon(iconNames[tone],'ui-icon--sm')+'</span><span>'+message+'</span>';
    actionToast.classList.remove('is-wrapping');
    actionToast.classList.add('is-visible');
    if(actionToast.scrollWidth > actionToast.clientWidth) actionToast.classList.add('is-wrapping');
    clearTimeout(actionToastTimer);
    actionToastTimer = setTimeout(() => actionToast.classList.remove('is-visible'), 1800);
  }

  function openActiveCaseModal(){
    activeCaseReturnFocus = document.activeElement;
    activeCaseModal.hidden = false;
    activeCaseModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => activeCaseModal.querySelector('[data-active-case-resume]').focus());
  }

  function closeActiveCaseModal(returnFocus=true){
    activeCaseModal.hidden = true;
    activeCaseModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    if(returnFocus && activeCaseReturnFocus && activeCaseReturnFocus.focus) activeCaseReturnFocus.focus();
  }

  function readSessionJson(key){
    try { return JSON.parse(sessionStorage.getItem(key) || '{}'); } catch(error) { return {}; }
  }

  function writeSessionJson(key,value){
    try { sessionStorage.setItem(key,JSON.stringify(value)); } catch(error) {}
  }

  function readLocalJson(key){
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch(error) { return {}; }
  }

  function writeLocalJson(key,value){
    try { localStorage.setItem(key,JSON.stringify(value)); } catch(error) {}
  }

  function persistFlowState(){ if(IS_DEMO_EMBED) return; writeSessionJson(FLOW_STATE_KEY,flowState); }

  function resetRequiredFlow(){
    delete flowState.sharedEncounterId;
    delete flowState.orderState.clinicalPrescription;
    delete flowState.addressDraft;
    delete flowState.addressSearchDraft;
    Object.assign(flowState,{
      draftReady:false,accountCreated:false,otpVerified:false,passwordSet:false,passwordResetPending:false,signupDonePending:false,patientInfoComplete:false,appointmentWhen:"",appointmentAt:"",
      identityVerified:false,returningIdentityValid:false,consentsComplete:false,
      verifiedPhone:'',phoneOtpPending:false,pendingPhone:'',phoneOtpReturn:'',
      phoneOtpDestination:'',phoneOtpCompletesAuth:false,lastRequiredScreen:'concern',patientName:'',
      authProvider:'',profileDisplayName:'',profilePictureUrl:'',lineProfilePictureUrl:'',paymentPreference:'self-pay',
      consentRead:{pdpa:false,telemedicine:false},
      consentChecked:{pdpa:false,telemedicine:false,marketing:false},
      entryChannel:'direct',
      consultationPaymentTiming:'after',consultationFeeAcknowledged:false,consultationPaid:false,directGeneralHealthComplete:false,followUpDirectToWaitroom:false,followUpContext:null,paymentResolution:'',documentsUnlocked:false,
      coverage:{provider:'',policyId:'',consultationCredit:0,medicineCredit:0},
      orderState:{checkoutOrigin:'consultation',quantities:{cough:2,loratadine:1,paracetamol:2,naproxen:1},deliveryMethod:'same-day',fulfillmentMode:'delivery',address:{},addressConfirmed:false,deliveryQuoteStatus:'pending',deliveryQuoteAmount:null,checkoutFlowVersion:'pharmacy-precheckout-v4',addOns:{wellness:false,pillcase:false,pouch:false},addonQuantities:{wellness:0,pillcase:0,pouch:0},promoCode:'',promoAmount:0,paymentMethod:'qr',amountDue:558,stockLocked:false,pharmacyAccepted:false,pharmacyPrepared:false,paymentExpiresAt:null,paidAmount:null,paidMethod:'',paidDeliveryMethod:''},
      partnerConsentComplete:false,partnerIdStepDone:false,partnerInfoComplete:false,partnerPaymentChosen:false,
      partnerHealthComplete:false,partnerReviewComplete:false,partnerReviewConfirmedAt:'',
      partnerConcernComplete:false,partnerConcern:'',partnerConcernDuration:'',partnerConcernRelief:'',
      partnerNurseComplete:false,partnerPhone:'',partnerPhoneVerified:false,
      partnerInfoContinueAfterOtp:false,partnerPhoneOtpPending:false,partnerPendingPhone:'',partnerName:'',partnerIdentityDob:'',partnerPaymentMethod:'',partnerConsultationBalanceDue:null,
      partnerMedicineCredit:0,
      partnerHealth:{conditions:'ไม่มี',medications:'ไม่มี',allergies:'ไม่มี',lifestyle:'ไม่',sex:'',dob:'',height:'',weight:''},
      partnerScreening:{urgent:'',accurate:'',remote:''}
    });
    try { sessionStorage.removeItem(DRAFT_KEY); sessionStorage.removeItem(CONSENT_RECORD_KEY); } catch(error) {}
    persistFlowState();
  }

  function careJourneyFill(id){
    const stage=careJourneyScreens[id];
    if(!stage) return 1;
    const steps=careJourneyMilestones[stage] || [];
    const at=steps.findIndex(ids => ids.includes(id));
    if(at<0) return 1;
    /* Landing on a step counts it whole, unless the screen paginates and can
       say how far through itself the patient is. */
    const within=intakeQuestionFraction(document.getElementById(id)) || 1;
    return Math.min(1,Math.max(.08,(at + within) / steps.length));
  }

  function syncCareJourneyFill(id){
    const nav=document.getElementById(id)?.querySelector('.care-journey');
    if(!nav) return;
    const current=nav.querySelector('.care-journey__step.is-current');
    if(current) current.style.setProperty('--journey-fill',(careJourneyFill(id)*100).toFixed(1)+'%');
  }

  function careJourneyMarkup(current){
    const total=careJourneyLabels.length;
    const nextStep=current<total ? careJourneyShort[current] : '';
    const steps=careJourneyShort.map((short,index) => {
      const step=index+1;
      const state=step===current?' is-current':step<current?' is-done':'';
      const mark=step<current
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
        : String(step);
      return '<li class="care-journey__step'+state+'" aria-current="'+(step===current?'step':'false')+'">'+
        '<span class="care-journey__dot">'+mark+'</span>'+
        '<span class="care-journey__name">'+short+'</span>'+
        '<span class="sr-only">ขั้นตอนที่ '+step+' จาก '+total+', '+careJourneyLabels[index]+'</span>'+
      '</li>';
    }).join('');
    return '<nav class="care-journey" aria-label="ขั้นตอนการรับบริการ">'+
      '<span class="care-journey__current"><b>'+String(current).padStart(2,'0')+'</b><strong>'+careJourneyShort[current-1]+'</strong><small>'+(nextStep ? '<i>Next</i> '+nextStep : '<i>Final step</i>')+'</small></span>'+
      '<ol class="care-journey__steps">'+steps+'</ol>'+
    '</nav>';
  }


  function baht(amount){ return '฿ ' + Number(amount).toLocaleString('en-US'); }

  function currentMedicationDue(){
    return Math.max(0,paymentDue - (appliedPromo ? appliedPromo.amount : 0));
  }

  function splitRecipientName(fullName=''){
    const parts=String(fullName || '').trim().split(/\s+/).filter(Boolean);
    return {firstName:parts.shift() || '',lastName:parts.join(' ')};
  }

  function recipientNameParts(address=flowState.orderState.address){
    const fallback=splitRecipientName(address.recipientName ?? flowState.patientName ?? '');
    return {
      firstName:String(address.recipientFirstName ?? fallback.firstName ?? '').trim(),
      lastName:String(address.recipientLastName ?? fallback.lastName ?? '').trim()
    };
  }

  /* Address fields arrive prefilled from the map pin, so editing one usually
     means replacing it rather than appending — holding backspace through a
     Thai address is the worst part of this form. One clear button per field,
     added here so the nine fields cannot drift apart in the markup. */
  function hasClearableFieldValue(input){
    const value=String(input?.value || '').trim();
    return input?.type==='tel' ? /\d/.test(value) : value.length>0;
  }

  function clearRecipientFields(){
    const fields=recipientFields();
    fields.forEach(input => {
      input.value='';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      clearFieldError(input);
    });
    syncFieldClearButtons();
    fields[0]?.focus({preventScroll:true});
    showActionToast('ล้างข้อมูลผู้รับพัสดุแล้ว','success');
  }


  /* An invalid field says so where it went wrong — red outline and a line of
     help under the field — instead of only firing a toast the reader has to
     map back onto a form (client, 18 Aug). */
  function clearFieldError(input){
    const field=input?.closest('.field');
    if(!field) return;
    field.classList.remove('is-invalid');
    field.style.removeProperty('--field-error-h');
    input.removeAttribute('aria-invalid');
  }

  function setFieldError(input,message){
    const field=input?.closest('.field');
    if(!field) return;
    if(!message){ clearFieldError(input); return; }
    let error=field.querySelector('.field__error');
    if(!error){
      error=document.createElement('p');
      error.className='field__error';
      error.setAttribute('role','alert');
      field.appendChild(error);
    }
    error.textContent=message;
    field.classList.add('is-invalid');
    /* The × is pinned to the bottom of the field, so the error line pushed it
       out of the input and left it floating on the border (client, 19 Aug).
       Publish the height the message added and let CSS lift the × back. */
    field.style.setProperty('--field-error-h',(error.offsetHeight+6)+'px');
    input.setAttribute('aria-invalid','true');
    if(input.dataset.errorBound!=='true'){
      input.dataset.errorBound='true';
      ['input','change'].forEach(type => input.addEventListener(type,() => clearFieldError(input)));
    }
  }


  function tomorrowLabel(){
    const tomorrow=new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    const thai=document.documentElement.lang==='th';
    return new Intl.DateTimeFormat(thai ? 'th-TH' : 'en-GB',{day:'numeric',month:'short',year:'numeric'}).format(tomorrow);
  }

  function syncCertificateIdentity(){
    document.querySelectorAll('[data-certificate-name]').forEach(el => {
      el.textContent = flowState.patientName || 'มะลิ สุธิดา';
    });
  }


  function iconSvg(type){
    // Category-specific drawings share the UI icon grid and stroke weight.
    const categoryPaths={
      hair:'<path d="M13 3c-3 2-3 5-2 8l1 4"/><path d="M8 10c0 3 1 5 0 7-1 3 1 5 3 5s4-2 3-5c-1-2-1-4-1-7"/><path d="M2 10h4m10 0h6"/><path d="M10 18c0 1 0 2 1 2"/>',
      weight:'<path d="M6 3h12a2 2 0 0 1 2 2l2 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2L4 5a2 2 0 0 1 2-2Z"/><path d="M8 8a4 4 0 0 1 8 0v2H8V8Z"/><path d="m12 8 1.5-2M7 14v3m10-3v3"/>'
    };
    if(categoryPaths[type]) return `<svg class="ui-icon ui-icon--md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${categoryPaths[type]}</svg>`;
    /* One glyph per category. Skin, weight and hormones all used to share the
       sparkle, which made three different services look like the same one. */
    const icons = {
      chat:'message-circle',
      heart:'mars',
      moon:'moon-star',
      pulse:'sparkles',
      skin:'sparkles',
      hormone:'flask-conical'
    };
    return window.kraneIcon(icons[type] || icons.chat, 'ui-icon--md');
  }

  function liveCategories(){
    return consultationCatalog.filter(cat => LIVE_CATEGORY_IDS.includes(cat.id));
  }


  // Explicit client-identified flags plus existing authored data-flag questions.
  function redFlagSource(question){
    return question && (['hair.scalp_symptoms','ed.heart_history','ed.nitrate_use'].includes(question.dataset.questionId) || question.querySelector('[data-flag]'));
  }

  /* The lockup is common app chrome on every page that has a Back action.
     Route-specific titles stay available as accessible names and page-level
     headings remain in the body. */
  function ensureAppBarLockup(id){
    document.querySelectorAll(`#${id} .screen__body > .intake-lockup`).forEach(node => node.remove());
    /* Client, 22 Sep: the lockup belongs on these pages too. A transition stage
       closes with an × instead of going back, so it has no .back and this used
       to skip it — leaving "จับคู่แพทย์" as the only routed page still showing
       its route name where every other page shows the brand. */
    const top=document.querySelector(`#${id} .screen__top:has(> .back), #${id} .screen__top.transition-stage__top`);
    /* Tracking has its own centred order number and right-side actions. Adding
       the common brand lockup here creates a second centre item and overlays
       the order title, so this custom app bar deliberately stays logo-free. */
    if(top?.classList.contains('postpay-tracking-topbar')) return;
    if(!top || top.querySelector(':scope > .checkout-brandbar__logo')) return;
    /* Client, 22 Sep: a bar that already names the thing you are looking at
       keeps that name. Tracking titles itself with the order number, and the
       lockup — centred and absolutely placed — was printed on top of it. */
    if(top.querySelector(':scope > [class$="__title"]')) return;
    let title=top.querySelector(':scope > .ttl');
    if(!title){
      title=document.createElement('span');
      title.className='ttl';
      const anchor=top.querySelector(':scope > .back');
      if(anchor) anchor.insertAdjacentElement('afterend',title);
      else top.prepend(title);
    }
    if(title.querySelector('.intake-lockup')) return;
    const accessibleTitle=title.textContent.trim();
    const lockup=document.createElement('span');
    lockup.className='intake-lockup';
    lockup.setAttribute('aria-hidden','true');
    if(accessibleTitle) title.setAttribute('aria-label',accessibleTitle);
    title.classList.add('ttl--lockup');
    title.append(lockup);
  }

  function simApplyTransform(){
    document.querySelectorAll('[data-sim-plane]').forEach(plane => {
      plane.style.transform = `translate(calc(-50% + ${simState.x}px), calc(-50% + ${simState.y}px)) scale(${simState.z})`;
    });
  }

  function simUpdateReadout(apply){
    const place = simReverseGeocode(simState.x, simState.y);
    simState.place = place;
    if(apply !== false) applyAddress(place);
  }

  function simBindPan(map){
    if(!map || map.dataset.simBound === 'true') return;
    map.dataset.simBound = 'true';
    let active=false, sx=0, sy=0, ox=0, oy=0;
    map.addEventListener('pointerdown', e => {
      if(e.target.closest('[data-sim-zoom],[data-sim-locate]')) return;
      active=true; sx=e.clientX; sy=e.clientY; ox=simState.x; oy=simState.y;
      map.classList.add('is-panning');
      if(map.setPointerCapture) try{ map.setPointerCapture(e.pointerId) }catch(err){}
    });
    map.addEventListener('pointermove', e => {
      if(!active) return;
      simState.x = ox + (e.clientX - sx);
      simState.y = oy + (e.clientY - sy);
      simApplyTransform();
    });
    const end = () => { if(!active) return; active=false; map.classList.remove('is-panning'); simUpdateReadout(); };
    map.addEventListener('pointerup', end);
    map.addEventListener('pointercancel', end);
    map.addEventListener('pointerleave', end);
  }

  function simLocate(){
    const session=++addressPickerSession;
    addressPickerPlace=null;
    osmReverseToken++;
    clearTimeout(osmReverseTimer);
    addressPickerStatus('กำลังค้นหาตำแหน่งปัจจุบัน…');
    if(!navigator.geolocation){
      addressPickerStatus('ใช้งานตำแหน่งปัจจุบันไม่ได้ เลื่อนแผนที่หรือกลับไปกรอกที่อยู่เอง');
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      if(!addressPicker?.open || session!==addressPickerSession)return;
      osmSetView(position.coords.latitude,position.coords.longitude,17,true);
    },() => {
      if(!addressPicker?.open || session!==addressPickerSession)return;
      addressPickerStatus('เปิดสิทธิ์ตำแหน่งไม่ได้ เลื่อนแผนที่หรือกลับไปกรอกที่อยู่เอง');
    },{enableHighAccuracy:true,timeout:8000});
  }

  /* A point of interest often comes back with a sparse address block, which left
     the rest of the form empty after picking a suggestion. Whatever the
     structured fields miss is recovered from the display name, which spells the
     address out in full (client, 19 Aug). */
  function partsFromDisplayName(displayName){
    const parts=String(displayName || '').split(',').map(part => part.trim()).filter(Boolean);
    const found={line:'',subdistrict:'',districtName:'',province:'',postcode:''};
    parts.forEach(part => {
      if(!found.postcode && /^\d{5}$/.test(part)) found.postcode=part;
      else if(!found.line && /^(ถนน|ซอย|Soi|Road|Thanon)/i.test(part)) found.line=part;
      else if(!found.subdistrict && /^(แขวง|ตำบล)/.test(part)) found.subdistrict=part;
      else if(!found.districtName && /^(เขต|อำเภอ)/.test(part)) found.districtName=part;
      else if(!found.province && /(กรุงเทพมหานคร|จังหวัด)/.test(part)) found.province=part;
    });
    return found;
  }

  function formatFollowUpDate(when){
    if(!when || Number.isNaN(when.getTime())) return '';
    const thai=document.documentElement.lang==='th';
    const months=thai ? FOLLOWUP_MONTHS_TH : FOLLOWUP_MONTHS_EN;
    return `${when.getDate()} ${months[when.getMonth()]} ${when.getFullYear()}`;
  }

  function formatFollowUpTime(when){
    if(!when || Number.isNaN(when.getTime())) return '';
    const pad=value => String(value).padStart(2,'0');
    const time=`${pad(when.getHours())}:${pad(when.getMinutes())}`;
    return document.documentElement.lang==='th' ? `${time} น.` : time;
  }

  function syncFollowUpDates(){
    document.querySelectorAll('[data-followup-date][data-followup-offset]').forEach(node => {
      const when=followUpAppointmentFor(node);
      if(!when){if(window.kraneTreatmentPause?.hasCancelledFollowup(node.dataset.followupCase))node.textContent=window.kraneTreatmentPause.isPaused(node.dataset.followupCase)?'พักโปรแกรม':'ไม่มีนัดติดตาม';return;}
      const pad=value => String(value).padStart(2,'0');
      node.setAttribute('data-followup-iso',`${when.getFullYear()}-${pad(when.getMonth()+1)}-${pad(when.getDate())}`);
      node.setAttribute('data-followup-at',when.toISOString());
      const text=node.hasAttribute('data-followup-time')
        ? `${formatFollowUpDate(when)} · ${formatFollowUpTime(when)}`
        : formatFollowUpDate(when);
      if(node.textContent!==text) node.textContent=text;
    });
  }

  function formatFollowUpCountdown(milliseconds){
    const total=Math.max(0,Math.ceil(milliseconds/1000));
    const hours=String(Math.floor(total/3600)).padStart(2,'0');
    const minutes=String(Math.floor((total%3600)/60)).padStart(2,'0');
    const seconds=String(total%60).padStart(2,'0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /* The home banner runs its countdown inside a pill, where a leading "00:" is
     two wasted characters. Hours only appear once there are hours to show. */
  function formatFollowUpPill(milliseconds){
    const total=Math.max(0,Math.ceil(milliseconds/1000));
    const pad=value => String(value).padStart(2,'0');
    const hours=Math.floor(total/3600);
    const minutes=Math.floor((total%3600)/60);
    return hours ? `${hours}:${pad(minutes)}:${pad(total%60)}` : `${pad(minutes)}:${pad(total%60)}`;
  }

  function followUpNodeForCase(caseId){
    return [...document.querySelectorAll('[data-followup-date][data-followup-case]')]
      .find(node => node.dataset.followupCase===caseId) || null;
  }

  function syncFollowUpCaseStates(){
    const thai=document.documentElement.lang!=='en';
    document.querySelectorAll('[data-followup-case-card]').forEach(card => {
      const caseId=card.dataset.followupCaseCard;
      card.hidden=Boolean(window.kraneTreatmentPause?.isPaused(caseId));
      if(card.hidden)return;
      const dateNode=followUpNodeForCase(caseId);
      const when=followUpAppointmentFor(dateNode);
      if(!when) return;
      const remaining=when.getTime()-Date.now();
      const ready=remaining<=FOLLOWUP_JOIN_MS && remaining>=-FOLLOWUP_GRACE_MS;
      const countdown=card.querySelector('[data-followup-case-countdown]');
      const status=card.querySelector('[data-followup-case-status]');
      const join=card.querySelector('[data-followup-join]');
      if(countdown) countdown.textContent=formatFollowUpCountdown(remaining);
      /* "Within 24 hours" is true of an appointment twelve minutes away and
         tells the patient nothing. Inside the hour the status names how close
         it is; the countdown underneath carries the exact time either way. */
      const soon=remaining>FOLLOWUP_JOIN_MS && remaining<=60*60*1000;
      if(status) status.textContent=ready
        ? (thai ? 'เข้าห้องได้แล้ว' : 'Room is open')
        : soon
          ? (thai ? 'ใกล้ถึงเวลานัด' : 'Starting soon')
          : (thai ? 'ภายใน 24 ชั่วโมง' : 'Within 24 hours');
      if(join){
        join.disabled=!ready;
        join.setAttribute('aria-disabled',String(!ready));
        join.classList.toggle('is-ready',ready);
        const label=join.querySelector('[data-followup-join-label]');
        if(label) label.textContent=ready
          ? (thai ? 'เข้าห้องพบแพทย์' : 'Join appointment')
          : (thai ? 'เข้าได้ก่อนนัด 10 นาที' : 'Opens 10 min before');
      }
    });
  }


  function syncDeclinedMedicines(){
    const plan=document.getElementById('plan');
    if(!plan) return;
    const wrap=plan.querySelector('[data-declined-list]');
    const target=plan.querySelector('[data-declined-items]');
    if(!wrap || !target) return;
    const declined=[];
    plan.querySelectorAll('[data-order-item]').forEach(row => {
      const key=row.dataset.orderItem;
      const ctl=row.querySelector('[data-qty]');
      if(!ctl) return;
      const q=parseInt(ctl.querySelector('[data-qty-n]')?.textContent || '0',10);
      const nameEl=row.querySelector('[style*="fw-semibold"]');
      const name=(nameEl?.textContent || key).trim();
      row.hidden = q<=0;
      if(q<=0) declined.push({key,name});
    });
    target.innerHTML = declined.map(d =>
      '<div class="declined-row"><span class="grow">'+d.name+'</span>'+
      '<button type="button" class="btn btn--ghost btn--sm" data-restore-item="'+d.key+'">เพิ่มกลับ</button></div>'
    ).join('');
    wrap.hidden = declined.length===0;
  }

  /* The number was typed as one run of digits. It is grouped as it is typed,
     in the Thai 0xx-xxx-xxxx shape on +66 and in plain 3-3-4 groups on any
     other code, where that shape would be wrong (client, 10 Sep). */
  function formatDialledNumber(value,dial){
    const digits=String(value || '').replace(/\D/g,'');
    if(dial==='66') return formatThaiPhone(digits);
    if(!digits) return '';
    return digits.replace(/(\d{1,3})(\d{1,3})?(\d{1,4})?/, (m,a,b,c) =>
      [a,b,c].filter(Boolean).join(' ')).trim();
  }

  /* 1-4-5-2-1, the grouping printed on a Thai ID card. */
  function formatNationalId(value){
    const digits=String(value || '').replace(/\D/g,'').slice(0,13);
    const groups=[digits.slice(0,1),digits.slice(1,5),digits.slice(5,10),digits.slice(10,12),digits.slice(12,13)];
    return groups.filter(Boolean).join('-');
  }

  function isValidThaiMobile(value){
    const digits = normalizePhone(value);
    return /^0[689]\d{8}$/.test(digits) || /^66[689]\d{8}$/.test(digits);
  }

  function setDirectHistoryChoice(group,hasDetails){
    if(!group) return;
    group.querySelectorAll('[data-direct-history-choice]').forEach(option => {
      option.setAttribute('aria-checked',String(
        option.dataset.directHistoryChoice===(hasDetails ? 'yes' : 'none')
      ));
    });
    const detail=group.querySelector('[data-direct-history-detail]');
    const input=detail?.querySelector('input');
    if(detail) detail.hidden=!hasDetails;
    if(input){
      input.disabled=!hasDetails;
      if(!hasDetails) input.value='';
    }
  }

  function directHistoryValue(key){
    const group=document.querySelector(`#health-history-modal [data-direct-history="${key}"]`);
    const selected=group?.querySelector('[data-direct-history-choice][aria-checked="true"]');
    if(!group || selected?.dataset.directHistoryChoice!=='yes') return 'ไม่มี';
    return group.querySelector('input')?.value.trim() || '';
  }

  function syncRailPath(id){
    const link = railLinks.find(a => a.dataset.go === id);
    if(!link) return;
    /* Following the current screen opens its group and closes the others, so
       the rail always shows one journey at a time. The edge cases inside it
       are already expanded — there is no second accordion to open. */
    const activeGroup = link.closest('.rail-group');
    if(activeGroup){
      prototypeRail?.querySelectorAll(':scope > .rail-group[open]').forEach(group => {
        if(group !== activeGroup) group.open = false;
      });
      activeGroup.open = true;
    }
    if(link.scrollIntoView) link.scrollIntoView({ block:'nearest' });
  }

  function replaceCurrent(id){
    if(history.length) history[history.length - 1] = id;
    else history = [id];
    show(id, false);
  }


  function resetOptionalAddOns(){
    Object.keys(ADDON_PRICES).forEach(key => {
      flowState.orderState.addOns[key]=false;
      flowState.orderState.addonQuantities[key]=0;
    });
  }

  function medicineSubtotal(){
    return Object.entries(MEDICINE_PRICES).reduce((sum,[key,unit]) => sum + unit * Math.max(0,Number(flowState.orderState.quantities[key] || 0)),0);
  }

  function hasMedicines(){ return medicineSubtotal()>0; }

  function selectedAddOnTotal(){
    return Object.entries(ADDON_PRICES).reduce((sum,[key,price]) => {
      const quantity=Math.max(0,Math.min(10,Number(flowState.orderState.addonQuantities[key] || 0)));
      return sum + price*quantity;
    },0);
  }

  function hasFulfillableItems(){ return hasMedicines() || selectedAddOnTotal()>0; }

  function invalidateFulfillmentQuote(){
    /* A different address is a different set of nearby branches. */
    delete flowState.orderState.sameDayUnavailable;
    flowState.orderState.deliveryQuoteStatus='pending';
    flowState.orderState.deliveryQuoteAmount=null;
    flowState.orderState.stockLocked=false;
    flowState.orderState.pharmacyAccepted=false;
    flowState.orderState.pharmacyPrepared=false;
    flowState.orderState.paymentExpiresAt=null;
  }

  function treatmentRefillOpensOn(category){
    const card=document.querySelector(`#profile .treatment-card[data-category="${category}"]`);
    const match=(card?.dataset.treatmentRefillText || '').match(/เติมยาได้\s+(\d{1,2})\s+(\S+)\s+(\d{4})/);
    if(!match || REFILL_THAI_MONTHS[match[2]]==null) return null;
    return {date:new Date(Number(match[3]),REFILL_THAI_MONTHS[match[2]],Number(match[1])),label:`${match[1]} ${match[2]} ${match[3]}`};
  }

  function availableRefillKeys(){
    if(!refillSheet?.dataset.refillGated) return Object.keys(REFILL_PRESCRIPTIONS);
    return [...refillSheet.querySelectorAll('[data-refill-choice]')]
      .map(option => option.dataset.refillChoice)
      .filter(key => REFILL_PRESCRIPTIONS[key]);
  }

  function refillCardFor(source,today){
    const category=source.dataset.category;
    const card=source.cloneNode(true);
    [...card.attributes].forEach(attribute => {
      if(attribute.name.startsWith('data-') && attribute.name!=='data-category') card.removeAttribute(attribute.name);
    });
    card.removeAttribute('aria-label');card.removeAttribute('id');
    card.querySelector('.treatment-pause-status')?.remove();
    card.classList.add('refill-card');
    card.setAttribute('role','listitem');
    const supply=((source.dataset.treatmentRefillText || '').match(/^(\d+\s*วัน)/) || [])[1] || '';
    const opens=treatmentRefillOpensOn(category);
    const expired=Boolean(REFILL_EXPIRES[category]) && new Date(REFILL_EXPIRES[category])<today;
    const due=!expired && (!opens || opens.date<=today);
    const rows=[['ยาคงเหลือ',supply],['เติมยาได้',expired ? 'ใบสั่งยาหมดอายุ' : (due ? 'วันนี้' : opens.label)]]
      .filter(([,value]) => value)
      .map(([label,value]) => {
        const row=document.createElement('span');
        row.className='followup-row';
        const hint=document.createElement('span');
        hint.className='hint';
        hint.textContent=label;
        const strong=document.createElement('strong');
        strong.textContent=value;
        row.append(hint,strong);
        return row;
      });
    card.querySelector('.followup-details')?.replaceChildren(...rows);
    const badge=card.querySelector('.badge');
    if(badge){
      badge.removeAttribute('data-treatment-status');
      badge.textContent=due ? 'เติมยาได้' : (expired ? 'หมดอายุ' : 'ยังไม่ถึงรอบ');
      badge.className=due ? 'badge badge--ok' : 'badge';
    }
    if(due) card.dataset.refillChoice=category;
    else {
      card.setAttribute('aria-disabled','true');
      card.classList.add('refill-card--off');
    }
    const sourceFolder=source.closest('.treatment-folder');
    if(sourceFolder){const folder=sourceFolder.cloneNode(false);folder.removeAttribute('id');sourceFolder.querySelectorAll('.treatment-folder__sheet').forEach(sheet=>folder.append(sheet.cloneNode(true)));folder.append(card);window.kraneTreatmentFolders?.outline(card,folder);return folder;}
    return card;
  }

  function closeRefillSheet(){
    if(!refillSheet || refillSheet.hidden) return;
    refillSheet.hidden=true;
    refillSheet.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  function finishDirectF02(){
    // Partner never enters F02, but keep an explicit escape hatch so a stale
    // Partner bookmark cannot mutate its locked SCR-002/SCR-003 state.
    if(flowState.entryChannel==='partner'){
      show('intake-concern');
      return;
    }
    Object.assign(flowState,{
      draftReady:true,
      directGeneralHealthComplete:false,
      consultationFeeAcknowledged:false,
      consultationPaid:false,
      paymentResolution:'',
      lastRequiredScreen:'signup'
    });
    flowState.orderState.checkoutOrigin='consultation';
    persistFlowState();
    saveIntakeDraft();
    postAuthNext='matching';
    /* Already signed in: the questionnaire hands straight on. It used to send
       every patient to "create an account", including one who had just logged
       in (client, 19 Aug). */
    if(signedIn()){
      flowState.lastRequiredScreen='';
      persistFlowState();
      show(nextAfterAuthentication(directClinicalStartTarget()));
      return;
    }
    show('signup');
  }

  function skipForwardFrom(id){
    const seq = ['intake1','intake2','intake3','intake4'];
    let i = seq.indexOf(id);
    if(i < 0) return id;
    while(i < seq.length && intakeSkipped(seq[i])) i++;
    /* null, not a fallback: on the general route every screen after intake1 is
       skipped, and falling back to intake4 dropped the patient back into the
       stepped questionnaire the single page had just replaced. */
    return seq[i] || null;
  }

  function skipBackFrom(id){
    const seq = ['intake1','intake2','intake3','intake4'];
    let i = seq.indexOf(id);
    if(i < 0) return null;
    i--;
    while(i >= 0 && intakeSkipped(seq[i])) i--;
    return i >= 0 ? seq[i] : null;
  }

  function selectedOptionTitles(selector,fallback,limit=2){
    const values = [...document.querySelectorAll(selector)]
      .map(control => control.matches('select')
        ? (control.value ? control.selectedOptions[0]?.textContent.trim() : '')
        : control.querySelector('.opt-title')?.textContent.trim())
      .filter(Boolean);
    return values.length ? values.slice(0,limit).join(' · ') : fallback;
  }

  function updateSelectedCare(){
    const cat = selectedCategory();
    const condition = cat.conditions.find(item => item.id === selectedConditionId);
    const thai = document.documentElement.lang === 'th';
    const summaries = {
      'hair-skin':{th:'ผมร่วงและหนังศีรษะ',en:'Hair loss & scalp',symTh:'ผมบาง ผมร่วง หรือปัญหาหนังศีรษะ',symEn:'Hair thinning, shedding or scalp concern',durationTh:'6 เดือน ถึง 2 ปี',durationEn:'6 months to 2 years',detailTh:'ปานกลาง · รูปแบบเปลี่ยนอย่างต่อเนื่อง',detailEn:'Moderate · gradual pattern change'},
      weight:{th:'ดูแลน้ำหนัก',en:'Weight care',symTh:'เป้าหมายการดูแลน้ำหนักตามที่เลือก',symEn:'Selected weight-care goal',durationTh:'ช่วง 6 เดือนที่ผ่านมา',durationEn:'Over the past 6 months',detailTh:'แนวโน้มน้ำหนักตามที่เลือก',detailEn:'Selected weight-change pattern'},
      skin:{th:'ผิวและสิว',en:'Skin & acne',symTh:'สิว ผื่น หรือการระคายเคืองผิว',symEn:'Acne, rash or skin irritation',durationTh:'น้อยกว่า 3 เดือน',durationEn:'Less than 3 months',detailTh:'อาการผิวตามที่เลือก',detailEn:'Selected skin symptoms'},
      'sexual-health':{th:'สุขภาพทางเพศ',en:'Sexual health',symTh:'อาการสุขภาพทางเพศตามที่เลือก',symEn:'Selected sexual health symptoms',durationTh:'น้อยกว่า 3 เดือน',durationEn:'Less than 3 months',detailTh:'ข้อมูลเป็นความลับสำหรับแพทย์',detailEn:'Private details for doctor review'},
      'sleep-stress':{th:'การนอนและความเครียด',en:'Sleep & stress',symTh:'การนอน ความเครียด หรือพลังงาน',symEn:'Sleep, stress or energy concern',durationTh:'1 ถึง 3 เดือน',durationEn:'1 to 3 months',detailTh:'อาการและพฤติกรรมการนอนตามที่เลือก',detailEn:'Selected sleep pattern and habits'},
      general:{th:'ปรึกษาสุขภาพทั่วไป',en:'General consultation',symTh:'อาการสุขภาพทั่วไป',symEn:'General health concern',durationTh:'1 ถึง 4 สัปดาห์',durationEn:'1 to 4 weeks',detailTh:'ปานกลาง · เป็น ๆ หาย ๆ',detailEn:'Moderate · comes and goes'}
    };
    const summary = summaries[cat.id] || summaries.general;
    const concern = condition && !cat.general
      ? (thai ? (condition.titleTh || summary.th) : condition.title)
      : (thai ? summary.th : summary.en);
    const symptoms = selectedOptionTitles(
      '#intake1 .option[data-multi][aria-selected="true"]',
      thai ? summary.symTh : summary.symEn
    );
    const durationValue = document.querySelector('#intake1 input[data-intake-role="duration"]')?.value;
    const durationUnit = document.querySelector('#intake1 [data-intake-duration-unit][aria-selected="true"]')?.dataset.intakeDurationUnit;
    const duration = durationValue && durationUnit
      ? `${durationValue} ${durationUnit}`
      : selectedOptionTitles(
          '#intake1 select[data-intake-role="duration"], #intake1 .option[data-select][aria-selected="true"]',
          thai ? summary.durationTh : summary.durationEn,
          1
        );
    const detail = selectedOptionTitles(
      '#intake2 .option[aria-selected="true"], #intake2 select[data-intake-select]',
      thai ? summary.detailTh : summary.detailEn
    );
    const treatment = selectedOptionTitles(
      '#intake3 .option[aria-selected="true"], #intake3 select[data-intake-select]',
      thai ? 'ไม่ได้ระบุการรักษาก่อนหน้า' : 'No previous treatment reported'
    );
    const safety = selectedOptionTitles(
      '#intake4 .option[aria-selected="true"]',
      thai ? 'ผ่านเกณฑ์ปรึกษาออนไลน์' : 'Clear for online review'
    );
    const compactHistoryValue=(name,emptyValue) => {
      const group=document.querySelector(`#health-history-modal [data-direct-history="${name}"]`);
      const selected=group?.querySelector('[data-direct-history-choice][aria-checked="true"]');
      if(selected?.dataset.directHistoryChoice!=='yes') return emptyValue;
      return group?.querySelector('input')?.value.trim() || (thai ? 'มี · ยังไม่ระบุรายละเอียด' : 'Yes · details not provided');
    };
    const medical=compactHistoryValue('conditions',thai ? 'ไม่มีโรคประจำตัว' : 'None reported');
    const medication=compactHistoryValue('medications',thai ? 'ไม่มียาหรืออาหารเสริมที่ใช้อยู่' : 'None reported');
    const allergies=compactHistoryValue('allergies',thai ? 'ไม่มีประวัติแพ้ยา/อาหาร' : 'No known allergies');
    const concernEl = document.querySelector('[data-summary-concern]');
    const symptomEl = document.querySelector('[data-summary-symptoms]');
    const durationEl = document.querySelector('[data-summary-duration]');
    const detailEl = document.querySelector('[data-summary-detail]');
    const treatmentEl = document.querySelector('[data-summary-treatment]');
    const safetyEl = document.querySelector('[data-summary-safety]');
    const photosEl = document.querySelector('[data-summary-photos]');
    const summaryPhotoThumb = document.querySelector('[data-summary-photo-thumb]');
    const summaryPhotoImg = document.querySelector('[data-summary-photo-img]');
    const medicalEl = document.querySelector('[data-summary-medical]');
    const medicationEl = document.querySelector('[data-summary-medication]');
    const allergiesEl = document.querySelector('[data-summary-allergies]');
    const measurementsEl = document.querySelector('[data-summary-measurements]');
    const photoRow = document.querySelector('[data-summary-photo-row]');
    const photoDivider = document.querySelector('[data-summary-photo-divider]');
    const concernEdit = document.querySelector('#summary [aria-label="Edit concern"]');
    if(concernEl) concernEl.textContent = concern;
    if(symptomEl) symptomEl.textContent = symptoms;
    if(durationEl) durationEl.textContent = duration;
    if(detailEl) detailEl.textContent = detail;
    if(treatmentEl) treatmentEl.textContent = treatment;
    if(safetyEl) safetyEl.textContent = safety;
    if(medicalEl) medicalEl.textContent = medical;
    if(medicationEl) medicationEl.textContent = medication;
    if(allergiesEl) allergiesEl.textContent = allergies;
    if(measurementsEl){
      const height = document.getElementById('intake-height')?.value || '?';
      const weight = document.getElementById('intake-weight')?.value || '?';
      measurementsEl.textContent = `${height} ซม. · ${weight} กก.`;
    }
    if(photosEl){
      const thumbs = [...document.querySelectorAll('#intake5 .up-thumb img')];
      const count = thumbs.length;
      photosEl.textContent = count
        ? (thai ? `เพิ่มแล้ว ${count} รูป` : `${count} photo${count === 1 ? '' : 's'} added`)
        : (thai ? 'ยังไม่ได้เพิ่มรูป' : 'No photos added');
      if(summaryPhotoThumb && summaryPhotoImg){
        const firstThumb = thumbs[0];
        if(firstThumb && firstThumb.src){
          summaryPhotoImg.src = firstThumb.src;
          summaryPhotoImg.alt = firstThumb.alt || (thai ? 'รูปที่อัปโหลดแล้ว' : 'Uploaded photo');
          summaryPhotoThumb.hidden = false;
        }else{
          summaryPhotoImg.removeAttribute('src');
          summaryPhotoImg.alt = '';
          summaryPhotoThumb.hidden = true;
        }
      }
    }
    if(photoRow) photoRow.hidden = !categoryNeedsPhotos();
    if(photoDivider) photoDivider.hidden = !categoryNeedsPhotos();
    if(concernEdit) concernEdit.dataset.go = cat.general ? 'concern' : 'conditions';
    const matchingCopy = document.querySelector('[data-matching-copy]');
    /* The heading says what is happening; this says what is being matched on,
       so it must not open with the same verb again. */
    if(matchingCopy) matchingCopy.textContent = thai
      ? `เลือกจากแพทย์ที่มีใบอนุญาตและเหมาะกับเรื่อง${concern}`
      : `Choosing from licensed doctors suited to ${concern.toLowerCase()}.`;
  }

  function cloneFollowUpRecord(record){
    return JSON.parse(JSON.stringify(record || {}));
  }

  function followUpRecordFor(category){
    const normalized=categoryAliases[category] || category || 'general';
    const recordKey=DEFAULT_FOLLOWUP_RECORDS[normalized] ? normalized : 'general';
    const stored=readLocalJson(FOLLOWUP_RECORD_KEY);
    const fallback=DEFAULT_FOLLOWUP_RECORDS[recordKey];
    const record=Object.assign(cloneFollowUpRecord(fallback),cloneFollowUpRecord(stored[recordKey]));
    record.fields=Object.assign({},fallback.fields || {},stored[recordKey]?.fields || {});
    record.optionLabels=Object.assign({},fallback.optionLabels || {},stored[recordKey]?.optionLabels || {});
    record.history=Object.assign({},fallback.history || {},stored[recordKey]?.history || {});
    record.category=recordKey;
    if(!stored[recordKey]){
      stored[recordKey]=record;
      writeLocalJson(FOLLOWUP_RECORD_KEY,stored);
    }
    return record;
  }

  function optionLabel(option){
    return option.querySelector('.opt-title')?.textContent.trim() || option.textContent.trim();
  }

  function applyFollowUpOptionLabels(record){
    Object.entries(record.optionLabels || {}).forEach(([screenId,labels]) => {
      const wanted=new Set(labels || []);
      document.querySelectorAll(`#${screenId} .option`).forEach(option => {
        option.setAttribute('aria-selected',String(wanted.has(optionLabel(option))));
      });
    });
  }

  function applyFollowUpHistory(history){
    Object.entries(history || {}).forEach(([key,value]) => {
      const group=document.querySelector(`#health-history-modal [data-direct-history="${key}"]`);
      if(!group) return;
      const hasDetails=Boolean(value && value!=='ไม่มี');
      setDirectHistoryChoice(group,hasDetails);
      const input=group.querySelector('input');
      if(input && hasDetails) input.value=value;
    });
  }

  // Client update: PDPA consent now comes right after OTP, before patient info and
  // identity. New order: otp -> consent-terms -> patient-info -> identity -> care flow.
  /* Krane direct access no longer asks for an ID card (client, 23 Aug). Both
     users in the 22 Aug test refused to upload one, and it was the wall they
     hit before they had seen anything the clinic does. The partner channel
     keeps its own document step (#partner-idcard); #identity stays in the app
     for the contexts that still need it, but nothing in the direct route
     requires it or leads to it. */
  function identityRequired(){
    return flowState.entryChannel !== 'direct';
  }

  /* One floating-label contract for every form field. Text controls can use
     :placeholder-shown, but select and date controls cannot, so the field owns
     an explicit filled state that is kept in sync for user and restored data. */
  function syncFloatingFieldState(field){
    if(!field?.matches?.('.float-field')) return;
    const control=field.querySelector('.float-field__slot input,.float-field__slot textarea,.float-field__slot select');
    if(!control) return;
    const variants=['text','select','date','textarea','phone','password'];
    variants.forEach(variant => field.classList.remove(`float-field--${variant}`));
    let variant='text';
    if(control.matches('select')) variant='select';
    else if(control.matches('textarea')) variant='textarea';
    else if(control.matches('input[type="date"]')) variant='date';
    else if(field.querySelector('.phone-field')) variant='phone';
    else if(field.querySelector('.password-field')) variant='password';
    field.classList.add(`float-field--${variant}`);
    field.dataset.fieldVariant=variant;
    field.classList.toggle('is-filled',String(control.value ?? '').trim().length>0);
  }

  function syncFloatingFieldStates(scope=document){
    scope.querySelectorAll?.('.float-field').forEach(syncFloatingFieldState);
  }

  // waiting room reset + doctor-admits simulation (v3: no entering a blank room)
  function paintElapsedTimer(timer,elapsedSeconds){
    if(!timer) return;
    const safeElapsed=Math.max(0,Math.floor(elapsedSeconds));
    const mm=String(Math.floor(safeElapsed/60)).padStart(2,'0');
    const ss=String(safeElapsed%60).padStart(2,'0');
    timer.textContent=mm+':'+ss;
    timer.setAttribute('aria-label',document.documentElement.lang==='th'
      ? `ผ่านไป ${safeElapsed} วินาที`
      : `${safeElapsed} seconds elapsed`);
  }

  function stopWaitroomEntryWindow(){
    clearInterval(waitEntryTimer);
    waitEntryTimer = null;
  }

  function startWaitroomEntryWindow(screen,timer){
    stopWaitroomEntryWindow();
    const deadline=(pendingQueue?.readyAt || Date.now())+WAITROOM_ENTRY_WINDOW*1000;
    let remaining = Math.max(0,Math.ceil((deadline-Date.now())/1000));
    const paint = () => {
      if(!timer) return;
      const mm=String(Math.floor(remaining/60)).padStart(2,'0');
      const ss=String(remaining%60).padStart(2,'0');
      timer.textContent = `${mm}:${ss}`;
      timer.setAttribute('aria-label',document.documentElement.lang==='th'
        ? `เข้าห้องภายใน ${mm}:${ss}`
        : `Enter within ${mm}:${ss}`);
      timer.classList.toggle('waitroom-entry-cta__timer--urgent', remaining <= 60);
    };
    paint();
    if(remaining===0){
      screen.querySelector('[data-wait-enter]').hidden=true;
      openWaitroomExpiredModal();
      return;
    }
    waitEntryTimer = setInterval(() => {
      if(!screen.classList.contains('active')){ stopWaitroomEntryWindow(); return; }
      remaining = Math.max(0,Math.ceil((deadline-Date.now())/1000));
      paint();
      if(remaining === 0){
        stopWaitroomEntryWindow();
        if(timer) timer.textContent = '';
        screen.querySelector('[data-wait-enter]').hidden=true;
        openWaitroomExpiredModal();
      }
    }, 1000);
  }

  function openWaitroomExpiredModal(){
    const modal = waitroomExpiredModal();
    if(!modal) return;
    fillDoctorName(modal);
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    modal.querySelector('.waitroom-expired-dialog')?.focus({preventScroll:true});
  }

  function closeWaitroomExpiredModal(){
    const modal = waitroomExpiredModal();
    if(!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  function submitOnce(key,button,action){
    if(submissionLocks.has(key)) return;
    submissionLocks.add(key);
    if(button) button.disabled=true;
    try { action(); }
    finally {
      window.setTimeout(() => {
        submissionLocks.delete(key);
        if(button && document.body.contains(button)) button.disabled=false;
        syncConsentContinue();
        syncPartnerScreening();
      },500);
    }
  }

  /* One reading of "already signed in", used by every route that would
     otherwise ask for an account. */
  function signedIn(){
    const storedAuth=readSessionJson(AUTH_PROFILE_KEY);
    return Boolean(storedAuth.authenticated || isAuthenticated || (flowState.accountCreated && flowState.otpVerified && flowState.passwordSet));
  }

  /* The patient record keeps a first and a last name (client, 20 Sep); the rest
     of the flow, and the pharmacy label, want one line. */
  function patientNameValue(){
    const first=document.getElementById('patient-first-name')?.value.trim() || '';
    const last=document.getElementById('patient-last-name')?.value.trim() || '';
    return [first,last].filter(Boolean).join(' ');
  }

  function syncPatientInfoPrefill(){
    // A new phone signup has only a verified phone. Names appear here only
    // after a previous identity step or an authenticated provider supplied them.
    const saved=splitRecipientName(flowState.patientName);
    const first=document.getElementById('patient-first-name');
    const last=document.getElementById('patient-last-name');
    const phone=document.getElementById('patient-phone');
    if(first) first.value=saved.firstName;
    if(last) last.value=saved.lastName;
    if(phone) phone.value=flowState.verifiedPhone ? formatPhoneForDisplay(flowState.verifiedPhone) : '';
  }

  function syncFrequencySlider(slider){
    const labels=(slider.dataset.frequencyLabels || '').split('|');
    const value=Number(slider.value) || 0;
    const max=Number(slider.max) || 1;
    slider.setAttribute('aria-valuetext',labels[value] || '');
    slider.style.setProperty('--frequency-fill',`${(value/max)*100}%`);
    slider.closest('.frequency-field')?.querySelectorAll('[data-frequency-stop]').forEach(stop => {
      stop.classList.toggle('is-active',Number(stop.dataset.frequencyStop)===value);
    });
  }

  function syncFrequencySliders(){ document.querySelectorAll('[data-frequency-slider]').forEach(syncFrequencySlider); }

  function updateFeatToast(id){
    const feat = featureMap[id];
    if(!feat){ featToast.style.display = 'none'; return; }
    featToast.style.display = '';
    const ul = feat.stories.length
      ? `<ul class="fs-stories">${feat.stories.map(s=>`<li>${s}</li>`).join('')}</ul>`
      : '';
    featToast.innerHTML = `<span class="fs-id">${feat.id}</span><span class="fs-name">${feat.name}</span>${ul}`;
  }

  // ---- KBank K-Payment gateway: working Card/QR/bank tabs, QR render, countdown (F18/F39) ----
  function drawQR(el){
    const n=25, cell=8, S=n*cell, dark='#0c1a26'; let seed=(+el.dataset.qrSeed||7)+9973;
    const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
    let r=`<rect width="${S}" height="${S}" fill="#fff"/>`;
    const finder=(x,y)=>{ r+=`<rect x="${x*cell}" y="${y*cell}" width="${7*cell}" height="${7*cell}" fill="${dark}"/><rect x="${(x+1)*cell}" y="${(y+1)*cell}" width="${5*cell}" height="${5*cell}" fill="#fff"/><rect x="${(x+2)*cell}" y="${(y+2)*cell}" width="${3*cell}" height="${3*cell}" fill="${dark}"/>`; };
    const inF=(c,w)=>((c<8&&w<8)||(c>n-9&&w<8)||(c<8&&w>n-9));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ if(inF(x,y))continue; if(rnd()>0.52) r+=`<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="${dark}"/>`; }
    finder(0,0); finder(n-7,0); finder(0,n-7);
    el.setAttribute('viewBox',`0 0 ${S} ${S}`); el.innerHTML=r;
  }

  function resetGatewayAttempt(screenId){
    const gateway=document.getElementById(screenId);
    if(!gateway) return;
    gateway.querySelectorAll('[data-qr-countdown]').forEach(counter => { counter.textContent='04:59'; });
    gateway.querySelectorAll('svg[data-qr]').forEach(drawQR);
  }

  function activateGatewayMethod(screenId,key,{persistMedicationMethod=false}={}){
    const screen=document.getElementById(screenId);
    const gateway=screen?.querySelector('[data-gw]');
    if(!gateway || !['card','qr','bank'].includes(key)) return;
    gateway.querySelectorAll('.gw-tab').forEach(tab => tab.classList.toggle('is-active',tab.dataset.gwTab===key));
    gateway.querySelectorAll('.gw-pane').forEach(pane => { pane.hidden=pane.dataset.gwPane!==key; });
    if(!persistMedicationMethod) return;
    paymentMethod=key;
    pendingPaymentMethod=key;
    flowState.orderState.paymentMethod=key;
    const label=document.querySelector('[data-payment-method]');
    if(label) label.textContent=PAYMENT_METHOD_LABELS[key] || PAYMENT_METHOD_LABELS.qr;
    persistFlowState();
    syncCheckoutReadiness();
  }

  function openPostpayHelp(trigger){
    if(!postpayHelpSheet) return;
    postpayHelpReturnFocus=trigger || null;
    postpayHelpSheet.hidden=false;
    postpayHelpSheet.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    postpayHelpSheet.querySelector('.postpay-help-dialog')?.focus({preventScroll:true});
  }

  function closePostpayHelp(){
    if(!postpayHelpSheet || postpayHelpSheet.hidden) return;
    postpayHelpSheet.hidden=true;
    postpayHelpSheet.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    const focusTarget=postpayHelpReturnFocus;
    postpayHelpReturnFocus=null;
    focusTarget?.focus({preventScroll:true});
  }

  function pickupLocationKey(address=flowState.orderState.address || {}){
    return [address.building,address.line,address.district,address.postcode,address.km]
      .map(part => String(part || '').trim().toLowerCase()).join('|');
  }

  function pickupLocationConfirmed(){
    const address=flowState.orderState.address || {};
    return Boolean(flowState.orderState.addressConfirmed && address.building && address.line && address.district);
  }

  function pickupBranchForCurrentLocation(){
    const branch=flowState.orderState.pickupBranch;
    if(!pickupLocationConfirmed() || !branch) return null;
    return branch.locationKey===pickupLocationKey() ? branch : null;
  }

  function syncPickupBranch(){
    const locationReady=pickupLocationConfirmed();
    const chosen=pickupBranchForCurrentLocation();
    const row = document.querySelector('[data-pickup-branch]');
    const trigger=document.querySelector('[data-open-branch]');
    if(row) row.textContent = !locationReady
      ? 'เลือกตำแหน่งเพื่อค้นหาร้านยา'
      : (chosen?.name || 'เลือกร้านยาใกล้คุณ');
    if(trigger) trigger.setAttribute('aria-label',!locationReady
      ? 'เลือกตำแหน่งของคุณก่อนค้นหาร้านยา'
      : (chosen ? `เปลี่ยนสาขารับยา ปัจจุบัน ${chosen.name}` : 'เลือกร้านยาใกล้ตำแหน่งของคุณ'));
    pickupBranchModal?.querySelectorAll('[data-branch-option]').forEach(option => {
      const selected = Boolean(chosen && option.dataset.branchOption === chosen.id);
      option.setAttribute('aria-selected', String(selected));
    });
  }

  function openPickupBranchModal(){
    if(!pickupBranchModal) return;
    syncPickupBranch();
    const locationReady=pickupLocationConfirmed();
    const title=pickupBranchModal.querySelector('#pickup-branch-title');
    const description=pickupBranchModal.querySelector('#pickup-branch-description');
    const list=pickupBranchModal.querySelector('[data-pickup-branch-list]');
    const emptyAction=pickupBranchModal.querySelector('[data-pickup-location-empty]');
    if(title) title.textContent=locationReady ? 'เลือกสาขาที่จะไปรับยา' : 'เลือกตำแหน่งของคุณก่อน';
    if(description) description.textContent=locationReady
      ? 'สาขาที่ใกล้คุณที่สุดก่อน ยืนยันสต็อกและเวลารับอีกครั้งหลังชำระเงิน'
      : 'เราจะใช้ตำแหน่งของคุณเพื่อค้นหาร้านยาที่ใกล้ที่สุดและแสดงระยะทางที่ถูกต้อง';
    if(list) list.hidden=!locationReady;
    if(emptyAction) emptyAction.hidden=locationReady;
    pickupBranchModal.hidden = false;
    pickupBranchModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    const focusTarget=locationReady
      ? (pickupBranchModal.querySelector('[data-branch-option][aria-selected="true"]') || pickupBranchModal.querySelector('[data-branch-option]'))
      : pickupBranchModal.querySelector('[data-pickup-location-add]');
    focusTarget?.focus();
  }

  function closePickupBranchModal(){
    if(!pickupBranchModal) return;
    pickupBranchModal.hidden = true;
    pickupBranchModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    document.querySelector('[data-open-branch]')?.focus();
  }
   // client, 22 Sep: show five, then "+n"
  function setPostpayText(selector,value){
    document.querySelectorAll(selector).forEach(node => { node.textContent=value; });
  }

  function setPostpayHidden(selector,hidden){
    document.querySelectorAll(selector).forEach(node => { node.hidden=hidden; });
  }

  function createPostpayThumbnail(source){
    const image=document.createElement('img');
    image.src=source;
    image.alt='';
    image.loading='lazy';
    image.decoding='async';
    return image;
  }

  function renderPostpaySnapshotThumbnails(items){
    const sources=items.map(item => item.imageSource).filter(Boolean);
    const previewSources=sources.slice(0,POSTPAY_THUMBNAIL_LIMIT);
    const remaining=sources.length-previewSources.length;
    document.querySelectorAll('.postpay-order-snapshot__thumbs').forEach(container => {
      const previewImages=previewSources.map(createPostpayThumbnail);
      container.replaceChildren(...previewImages,...(remaining ? [createPostpayThumbnailOverflow(remaining)] : []));
      container.hidden=sources.length===0;
    });
  }

  /* A window, not a single minute: a courier ETA that reads as exact is a
     promise the dispatch cannot keep. */
  function clockStamp(date){
    return String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0');
  }

  function signupDoneDescription(target){
    return SIGNUP_DONE_DESCRIPTION[target]
      || 'ขั้นตอนต่อไป ตอบแบบประเมินสุขภาพ';
  }

  function openSignupDoneModal(target){
    signupDoneTarget = target;
    if(!signupDoneModal){ show(target); return; }
    const description = signupDoneModal.querySelector('[data-signup-done-description]');
    if(description) description.textContent=signupDoneDescription(target);
    signupDoneReturnFocus=document.activeElement;
    signupDoneModal.hidden = false;
    signupDoneModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    signupDoneModal.querySelector('.signup-done-dialog')?.focus({preventScroll:true});
  }

  function closeSignupDoneModal(){
    if(!signupDoneModal) return;
    signupDoneModal.hidden = true;
    signupDoneModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    signupDoneReturnFocus?.focus({preventScroll:true});
  }

  function openHealthHistoryModal(){
    if(!healthHistoryModal){ completeSharedHealthIntake(true); return; }
    healthHistoryModal.hidden = false;
    healthHistoryModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    healthHistoryModal.querySelector('[data-direct-history-choice][aria-checked="true"]')?.focus();
  }

  function closeHealthHistoryModal(){
    if(!healthHistoryModal) return;
    healthHistoryModal.hidden = true;
    healthHistoryModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }


  function applyInsuranceVisibility(){
    const general = isGeneralPath();
    // Checkout: the insurance row is only offered on the general path.
    const payIns = document.querySelector('#payment [data-payment-insurance-row]');
    if(payIns) payIns.hidden = !general;
    // Client 16 Aug: an insurance choice is only ever offered on two routes, the
    // partner entry (which has its own screen) and general consultation. Every
    // condition-specific direct path is self-pay, so the question never appears
    // and the stored preference is forced back rather than left dangling.
    const directChoice = document.querySelector('#patient-info [data-patient-payment-choice]');
    if(directChoice){
      directChoice.hidden = !general;
      if(!general && flowState.paymentPreference !== 'self-pay'){
        flowState.paymentPreference = 'self-pay';
        flowState.coverage = {provider:'',policyId:'',consultationCredit:0,medicineCredit:0};
        persistFlowState();
      }
    }
  }


  /* Native iOS date text has inconsistent intrinsic width and alignment. Keep the
     native picker as the full hit target, but render its value in a symmetric,
     centred display layer so every DOB field stays inside the mobile frame. */
  function formatPatientDate(value){
    // Written by script, so it takes the language from the page rather than
    // from the dictionary, which only swaps text that was in the markup.
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return isEnglishUi() ? 'DD / MM / YYYY' : 'วว / ดด / ปปปป';
    const [year,month,day]=value.split('-');
    return `${day} / ${month} / ${year}`;
  }

  function syncPatientDateField(input){
    const field=input.closest('.float-field');
    field?.classList.add('float-field--date-placeholder-only');
    field?.classList.toggle('is-filled',Boolean(input.value));
    if(!input.hasAttribute('aria-label')) input.setAttribute('aria-label',field?.querySelector('label')?.textContent || 'วันเกิด');
    const value=input.closest('.date-control')?.querySelector('.date-control__value');
    if(!value) return;
    value.textContent=formatPatientDate(input.value);
    value.classList.toggle('is-placeholder',!input.value);
  }

  function syncPatientDateFields(){
    document.querySelectorAll('.date-control>input[type="date"]').forEach(syncPatientDateField);
  }

  function openPatientDatePicker(input){
    if(!input || input.disabled || input.readOnly) return;
    input.focus({preventScroll:true});
    if(typeof input.showPicker==='function'){
      try{ input.showPicker(); }catch(_error){ /* Native focus remains as the fallback. */ }
    }
  }

  function enhancePatientDateFields(){
    const today=new Date().toISOString().slice(0,10);
    document.querySelectorAll('input[type="date"].input').forEach(input => {
      input.min=input.min || '1900-01-01';
      input.max=input.max || today;
      if(input.closest('.date-control')){ syncPatientDateField(input); return; }
      const control=document.createElement('div');
      control.className='date-control';
      input.parentNode.insertBefore(control,input);
      control.appendChild(input);
      const display=document.createElement('div');
      display.className='date-control__display';
      display.setAttribute('aria-hidden','true');
      display.innerHTML='<span></span><span class="date-control__value is-placeholder"></span><svg class="date-control__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path></svg>';
      control.appendChild(display);
      input.addEventListener('input',() => syncPatientDateField(input));
      input.addEventListener('change',() => syncPatientDateField(input));
      // Chromium desktop may only focus a fully transparent native date input.
      // Explicitly open its picker so the entire visible control, including the
      // centred value and calendar icon, is one reliable click target.
      input.addEventListener('click',() => openPatientDatePicker(input));
      input.addEventListener('keydown',event => {
        if(event.key!=='Enter' && event.key!==' ') return;
        event.preventDefault();
        openPatientDatePicker(input);
      });
      syncPatientDateField(input);
    });
  }

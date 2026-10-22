/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function consentLedger(){
    const stored=readSessionJson(CONSENT_RECORD_KEY);
    if(stored.direct || stored.partner) return stored;
    if(Array.isArray(stored.records)){
      return stored.source==='partner' ? {partner:stored} : {direct:stored};
    }
    return {};
  }

  function saveConsentRecords(source,records){
    const ledger=consentLedger();
    ledger[source]={source,records};
    writeSessionJson(CONSENT_RECORD_KEY,ledger);
  }

  function hasCurrentConsent(source){
    const bundle=consentLedger()[source];
    if(!bundle || !Array.isArray(bundle.records)) return false;
    const required=source==='partner'
      ? partnerConsentVersions
      : Object.fromEntries(Object.entries(consentDocuments).map(([type,document]) => [type,document.version]));
    return Object.entries(required).every(([type,version]) =>
      bundle.records.some(record => record && record.type===type && record.version===version)
    );
  }

  function consentIdentityVerified(){
    // Keep this in lockstep with requiredRouteFor('consent-terms'). A returning
    // patient may have a valid restored identity without repeating the password
    // creation step; the route already admits that state, so the consent controls
    // must not remain permanently disabled after the legal copy has been read.
    const accountReady = flowState.accountCreated && flowState.otpVerified &&
      (flowState.passwordSet || flowState.returningIdentityValid);
    if(!accountReady) return false;
    return flowState.entryChannel !== 'partner' || Boolean(flowState.partnerPhoneVerified);
  }


  function renderConsentReadState(type){
    const input = document.querySelector(`[data-consent-checkbox][data-consent-type="${type}"]`);
    const state = document.querySelector(`[data-consent-read-state="${type}"]`);
    const card = document.querySelector(`[data-consent-card="${type}"]`);
    if(type === 'marketing'){
      const requiredDocumentsRead = consentRead.pdpa && consentRead.telemedicine;
      if(input){
        input.disabled = !requiredDocumentsRead || !consentIdentityVerified();
        input.checked = Boolean(consentChecked.marketing);
      }
      if(card) card.classList.toggle('is-unread',!requiredDocumentsRead);
      return;
    }
    if(input){
      input.disabled = !consentRead[type] || !consentIdentityVerified();
      // Reaching the end visibly selects the shared consent items in every entry
      // context. Identity verification still gates submission, not the read state.
      input.checked = Boolean(consentRead[type] && consentChecked[type]);
    }
    if(card) card.classList.toggle('is-unread',!consentRead[type]);
    // Once read, the checkbox itself is the confirmation: an enabled, tappable control
    // needs no extra sentence repeating that. The warning stays until then.
    if(state){
      state.textContent = consentRead[type] ? '' : 'กรุณาอ่านเพื่อให้ความยินยอม';
      state.hidden = Boolean(consentRead[type]);
    }
  }


  // Reading is recorded only after the patient reaches the end of the legal page.
  function markConsentRead(type){
    if(consentRead[type]) return;
    consentRead[type] = true;
    flowState.consentRead = Object.assign({},consentRead);
    persistFlowState();
    renderConsentReadState(type);
    syncConsentContinue();
  }

  function checkConsentScrollEnd(box){
    const type = box.hasAttribute('data-consent-page-scroll') ? 'all' : box.dataset.consentScroll;
    const bundleComplete = consentRead.pdpa && consentRead.telemedicine && consentChecked.pdpa && consentChecked.telemedicine;
    if(!type || (type === 'all' ? bundleComplete : (consentRead[type] && consentChecked[type]))) return;
    // While the screen is hidden every height is 0, which would otherwise look like
    // a completed document before the patient has seen it.
    if(!box.clientHeight) return;
    const overflows = box.scrollHeight > box.clientHeight + 4;
    const reachedEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 12;
    if(!overflows || reachedEnd){
      if(type === 'all'){
        unlockConsentBundleAfterDelay(box);
      }
      else markConsentRead(type);
    }
  }


  function syncConsentContinue(){
    if(consentContinue) consentContinue.disabled = !consentIdentityVerified() || !requiredConsentChecks.every(input => !input.disabled && input.checked);
  }

  /* Client, 5 Oct: the thin sub-step bar under the stepper was taken out on
     the promise written two comments below — "the current stage's segment now
     fills as the sub-steps complete" — and that half was never written. Every
     current stage drew a full segment, so the bar said exactly the same thing
     on the first question of the questionnaire as on the last one. It is
     computed here: how far into its own stage the screen is, refined by the
     question pager on the screens that paginate. */
  function intakeQuestionFraction(screen){
    const body=screen?.querySelector('.screen__body');
    const total=body ? body.querySelectorAll('[data-intake-question]').length : 0;
    if(total<2) return 0;
    const index=Number(body.dataset.intakeQuestionIndex || 0);
    return Math.min(1,(Math.max(0,index)+1)/total);
  }

  function writeDeliveryAddressDraft(screen,address){
    if(!screen) return;
    screen.dataset.addressDraft=JSON.stringify({
      building:String(address.building || ''),
      floor:String(address.floor || ''),
      line:String(address.line || ''),
      district:String(address.district || ''),
      note:String(address.note || ''),
      dropoffMethod:String(address.dropoffMethod || 'hand'),
      km:String(address.km || screen.dataset.selectedKm || '3.2')
    });
  }

  function readDeliveryAddressDraft(screen){
    try { return JSON.parse(screen?.dataset.addressDraft || '{}'); } catch(error) { return {}; }
  }


  function deliveryAddressDraft(){
    return flowState.addressDraft || flowState.orderState.address || {};
  }

  function persistAddressEditorDraft(){
    flowState.addressDraft={...deliveryAddressDraft(),...readAddressInputs()};
    persistFlowState();
  }


  function selectedCategory(){
    return consultationCatalog.find(cat => cat.id === selectedCategoryId) || consultationCatalog[0];
  }

  function setSelectedCategory(value){
    const normalized = categoryAliases[value] || value;
    const cat = consultationCatalog.find(item => item.id === normalized);
    if(!cat){
      /* A condition id is accepted here too. Only group ids resolved before, so
         a shared link reading category=ed silently selected nothing and the
         route matched a doctor as if sexual health had never been picked —
         exactly the case a test link is most likely to name. */
      for(const group of consultationCatalog){
        const condition = group.conditions.find(item => item.id === normalized);
        if(!condition) continue;
        selectedCategoryId = group.id;
        selectedConditionId = condition.id;
        renderedIntakeContext = '';
        return true;
      }
      return false;
    }
    selectedCategoryId = cat.id;
    const firstAvailable = cat.conditions.find(item => item.status !== 'Soon') || cat.conditions[0];
    selectedConditionId = firstAvailable ? firstAvailable.id : `${cat.id}-general`;
    renderedIntakeContext = '';
    return true;
  }

  function categoryNeedsPhotos(){
    return selectedCategoryId === 'hair-skin' || selectedCategoryId === 'skin';
  }

  function intakeDropdown({id,label,placeholder,options,role=''}){
    const roleAttribute = role ? ` data-intake-role="${role}"` : '';
    return `<div class="field intake-dropdown-field float-field"><div class="float-field__box"><span class="float-field__slot"><select class="select" id="${id}" data-intake-select${roleAttribute} required>
        <option value="" selected disabled>${placeholder}</option>
        ${options.map(([value,text]) => `<option value="${value}">${text}</option>`).join('')}
      </select><label for="${id}">${label}</label></span></div>
    </div>`;
  }

  function intakeDurationControl({label,thai=false}){
    const units = thai
      ? [['วัน','วัน'],['สัปดาห์','สัปดาห์'],['เดือน','เดือน'],['ปี','ปี']]
      : [['day','Day'],['week','Week'],['month','Month'],['year','Year']];
    return `<div class="field intake-duration-field">
      <label for="intake-duration">${label}</label>
      <div class="partner-duration-row intake-duration-control">
        <div class="partner-duration-stepper">
          <button type="button" data-intake-duration-step="-1" aria-label="${thai ? 'ลดระยะเวลา' : 'Decrease duration'}">−</button>
          <input id="intake-duration" data-intake-role="duration" type="number" inputmode="numeric" min="1" max="99" value="1" required>
          <button type="button" data-intake-duration-step="1" aria-label="${thai ? 'เพิ่มระยะเวลา' : 'Increase duration'}">+</button>
        </div>
        <div class="partner-duration-units">
          ${units.map(([value,text],index) => `<button type="button" aria-selected="${index===0}" data-intake-duration-unit="${value}">${text}</button>`).join('')}
        </div>
      </div>
    </div>`;
  }

  /* Doctor Review questionnaires share one rendering contract. Stable IDs are
     deliberately carried in the markup so the backend can persist answers
     without depending on Thai copy or DOM position. */
  function intakeChoiceQuestion({id,title,options,multiple=false,helper=''}){
    const selectAttribute=multiple ? 'data-multi' : 'data-select';
    return `<div class="common-group" data-question-id="${id}" data-string-id="intake.${id}.title">
      <div class="section-label">${title}</div>
      ${helper ? `<p class="hint">${helper}</p>` : ''}
      <div class="stack-3">
        ${options.map((option,index) => `<button class="option" type="button" ${selectAttribute} data-answer-id="${id}.${index+1}"><span class="opt-body"><span class="opt-title">${option}</span></span><span class="opt-check"></span></button>`).join('')}
      </div>
    </div>`;
  }

  function addIntakeQuestionGuidance(screenId,questions){
    (INTAKE_GUIDANCE[screenId] || []).forEach(item => {
      const question=questions[item.question];
      if(!question || question.querySelector('[data-intake-guidance], .intake-privacy-note')) return;
      if(item.copy && (!item.explain || item.explain(selectedCategoryId))){
        const aside=document.createElement('aside');
        aside.className='intake-explainer';
        aside.dataset.intakeGuidance='';
        aside.innerHTML='<strong class="intake-explainer__title">Why we ask</strong><p class="intake-explainer__copy">'+item.copy+'</p>';
        question.appendChild(aside);
      }
      if(item.privacy){
        const privacy=document.createElement('p');
        privacy.className='intake-privacy-note';
        privacy.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.7 8.2 7 10 4.3-1.8 7-5.4 7-10V6Z"/><path d="m9 12 2 2 4-4"/></svg><span>Private · Shared only with your assigned doctor.</span>';
        question.appendChild(privacy);
      }
    });
  }

  function intakeQuestionPageState(screenOrId){
    const screen = typeof screenOrId === 'string' ? document.getElementById(screenOrId) : screenOrId;
    const body = screen?.querySelector('.screen__body');
    const questions = body ? [...body.querySelectorAll('[data-intake-question]')] : [];
    const storedIndex = Number(body?.dataset.intakeQuestionIndex || 0);
    const index = Math.max(0,Math.min(Number.isFinite(storedIndex) ? storedIndex : 0,Math.max(questions.length-1,0)));
    return {screen,body,questions,index,total:questions.length};
  }

  /* A question whose only control is a single-choice list answers itself: the
     tap IS the answer, so the page moves on rather than asking for a second
     press on Continue, and the radio tick is redundant. Anything with a
     multi-select, a text field or a dropdown keeps its button — there is no
     way to know when someone has finished with those. */
  function intakeQuestionIsSingleChoice(question){
    if(!question) return false;
    if(question.querySelector('.option[data-multi],input,select,textarea')) return false;
    return Boolean(question.querySelector('.option[data-select]'));
  }

  function activateIntakeQuestionPage(screenOrId,index=0){
    const state = intakeQuestionPageState(screenOrId);
    if(!state.screen || !state.body || !state.total) return false;
    const nextIndex = Math.max(0,Math.min(index,state.total-1));
    state.body.dataset.intakeQuestionIndex=String(nextIndex);
    syncCareJourneyFill(state.screen.id);
    state.questions.forEach((question,questionIndex) => {
      const active = questionIndex===nextIndex;
      question.hidden=!active;
      question.setAttribute('aria-hidden',String(!active));
    });
    state.body.querySelectorAll('.partner-health-grid,.partner-clinical-grid').forEach(group => {
      const nestedQuestions=[...group.querySelectorAll('[data-intake-question]')];
      if(nestedQuestions.length) group.hidden=!nestedQuestions.some(question => !question.hidden);
    });
    /* One page, one heading. Where the question carries its own label that
       label is the heading, and the screen title stands down rather than
       shouting the same words over every page. */
    const activeQuestion=state.questions[nextIndex];
    const promoted=activeQuestion?.dataset.intakeQuestionTitled
      ? activeQuestion.querySelector('.intake-question__title')
      : null;
    const titleBlock=[...state.body.children].find(child => child.querySelector('.h1'));
    /* When a later question supplies its own heading, it becomes the first
       visible item in the body. Mark that state so stack spacing from hidden
       siblings cannot push the heading down between steps. */
    state.body.toggleAttribute('data-intake-promoted-title',Boolean(promoted));
    // No question counter any more (client, 23 Sep); clear any the DOM still holds.
    state.body.querySelectorAll('[data-intake-question-count]').forEach(node => node.remove());
    if(titleBlock) titleBlock.hidden=Boolean(promoted);
    const autoAdvance=intakeQuestionIsSingleChoice(state.questions[nextIndex]);
    state.body.toggleAttribute('data-intake-auto-advance',autoAdvance);
    const footer=state.screen.querySelector('.screen__footer');
    if(footer) footer.hidden=autoAdvance;
    const continueButton=state.screen.querySelector('.screen__footer .btn--primary[data-go]');
    if(continueButton){
      if(!continueButton.dataset.intakeFinalLabel) continueButton.dataset.intakeFinalLabel=continueButton.textContent.trim();
      continueButton.textContent=document.documentElement.lang==='th'
        ? 'ดำเนินการต่อ'
        : (nextIndex<state.total-1 ? 'Continue' : continueButton.dataset.intakeFinalLabel);
    }
    state.body.scrollTop=0;
    requestAnimationFrame(()=>{if(state.screen.classList.contains("active") && redFlagSource(activeQuestion))openRedFlagSheet(state.screen,nextIndex);});
    syncIntakeDropdownContinue(state.screen);
    return true;
  }

  function setupIntakeQuestionPages(screenOrId,{reset=false}={}){
    const screen = typeof screenOrId === 'string' ? document.getElementById(screenOrId) : screenOrId;
    if(!screen || !INTAKE_ONE_QUESTION_SCREENS.includes(screen.id)) return;
    const body=screen.querySelector('.screen__body');
    if(!body) return;
    /* The compact general intake keeps the description and its "how long"
       qualifier together as one question. The duration fold below also keeps
       that relationship consistent for category-specific intake screens. */
    // The Krane Clinic lockup is chrome, not a question.
    const children=[...body.children].filter(child => !child.classList.contains('intake-lockup'));
    const titleBlock=children.find(child => child.querySelector('.h1')) || children[0];
    /* "How long has this been happening?" is not a question of its own — it
       qualifies the one above it. Fold it into that question so the pair is
       answered together instead of splitting one thought across two pages. */
    children.filter(child => child!==titleBlock && child.classList.contains('intake-duration-field'))
      .forEach(field => {
        const previous=field.previousElementSibling;
        if(previous && previous!==titleBlock) previous.appendChild(field);
      });
    const remaining=[...body.children].filter(child => !child.classList.contains('intake-lockup'));
    const questions=remaining.filter(child => child!==titleBlock);
    questions.forEach((question,index) => {
      question.dataset.intakeQuestion=String(index+1);
    });
    addIntakeQuestionGuidance(screen.id,questions);
    /* The screen title stayed huge on every page while the question itself sat
       in a small grey label — the hierarchy read backwards (client, 18 Aug).
       When a page carries exactly one labelled question, that label becomes the
       page heading and the screen title steps aside. A page that folds two
       prompts together (a description and its "how long") keeps the shared
       title, because neither label speaks for the whole page. */
    questions.forEach(question => {
      question.querySelectorAll('.intake-question__title')
        .forEach(node => node.classList.remove('intake-question__title'));
      const labels=[...question.querySelectorAll('.section-label,.field>label,legend')];
      /* The first label is the page's question and becomes its heading; any
         other prompt on the page (a duration, a unit) stays a small field
         label. Pages used to fall back to the screen title whenever a second
         label existed, so a set with folded durations looked nothing like a
         set without them (client, 19 Aug). */
      question.querySelectorAll('.intake-question__sub')
        .forEach(node => node.classList.remove('intake-question__sub'));
      /* A folded qualifier — "how long has this been happening?" — is never the
         page's question. When the block has no label of its own the screen
         title is the question and stays; the qualifier drops to sub size. It
         was being promoted over the real question, so the page showed two big
         headings (client, 19 Aug). */
      const ownLabels=labels.filter(label => !label.closest('.intake-duration-field'));
      const heading=ownLabels[0] || null;
      if(heading){
        heading.classList.add('intake-question__title');
        question.dataset.intakeQuestionTitled='1';
      } else {
        delete question.dataset.intakeQuestionTitled;
      }
      /* Every follow-up prompt on the page is the same component and gets the
         same look, whether it started life as a section label or a field
         label. */
      labels.filter(label => label!==heading)
        .forEach(label => label.classList.add('intake-question__sub'));
    });
    /* Client, 23 Sep: no counters in the questionnaire. The stepper at the top
       of the screen already says how far along this is; a second "1 / 2" beside
       the question was counting the same journey twice. Any left over from an
       earlier render are cleared here. */
    titleBlock?.querySelectorAll('[data-intake-question-count]').forEach(node => node.remove());
    if(reset || body.dataset.intakeQuestionIndex===undefined) body.dataset.intakeQuestionIndex='0';
    activateIntakeQuestionPage(screen,Number(body.dataset.intakeQuestionIndex || 0));
  }

  function focusMissingIntakeAnswer(state){
    if(!state?.target) return;
    const customTrigger = state.target.matches?.('select') && state.target.parentElement?.querySelector('.custom-select__trigger');
    const focusTarget = customTrigger || state.target;
    focusTarget.scrollIntoView({behavior:reduceMotion ? 'auto' : 'smooth',block:'center'});
    window.setTimeout(() => focusTarget.focus?.(),reduceMotion ? 0 : 220);
  }

  function advanceIntakeQuestionPage(screenOrId){
    const page=intakeQuestionPageState(screenOrId);
    if(!page.total || page.index>=page.total-1) return false;
    const requirement=syncIntakeDropdownContinue(page.screen);
    if(!requirement?.ready){
      showActionToast(requirement?.message || 'กรุณาตอบคำถามก่อนดำเนินการต่อ','warning');
      focusMissingIntakeAnswer(requirement);
      return true;
    }
    saveIntakeDraft();
    activateIntakeQuestionPage(page.screen,page.index+1);
    return true;
  }

  function retreatIntakeQuestionPage(screenOrId){
    const page=intakeQuestionPageState(screenOrId);
    if(!page.total || page.index<=0) return false;
    activateIntakeQuestionPage(page.screen,page.index-1);
    return true;
  }

  function syncIntakeDropdownContinue(screenOrId){
    const screen = typeof screenOrId === 'string' ? document.getElementById(screenOrId) : screenOrId;
    if(!screen) return;
    const state = intakeRequirementState(screen);
    const continueButton = screen.querySelector('.screen__footer .btn--primary');
    if(continueButton){
      continueButton.disabled = false;
      continueButton.classList.toggle('is-disabled',!state.ready);
      continueButton.setAttribute('aria-disabled',String(!state.ready));
      if(state.message) continueButton.dataset.missingMessage = state.message;
      else delete continueButton.dataset.missingMessage;
    }
    return state;
  }


  function renderIntakeQuestions(){
    // One question set per access path. General keeps the broad screening set.
    const byCategory = { 'hair-skin':'hair', skin:'skin', weight:'weight', 'sexual-health':'sexual', 'sleep-stress':'sleep', hormone:'hormone' };
    const key = selectedCategory().general ? 'general' : (byCategory[selectedCategoryId] || 'hair');
    if(renderedIntakeContext === key) return;
    // Template coverage per concern (verified 2026-08-04):
    //   weight / skin / sexual / sleep -> own intake1, intake2, intake3
    //   hair                  -> own intake1, intake2; intake3 falls back to the
    //                            authored base, which is the generic "previous
    //                            care or treatment" set and is concern-appropriate
    //   general               -> own intake1 only, and it carries the whole
    //                            questionnaire; intake2-intake5 are skipped
    // A missing template therefore falls back to the authored base markup only
    // where that base is genuinely generic. Never let it inherit another
    // concern's set: add an explicit template, or add the screen to
    // GENERAL_COMPACT_SKIPPED_SCREENS.
    ['intake1','intake2','intake3','intake4'].forEach(id => {
      const body = document.querySelector(`#${id} .screen__body`);
      if(!body) return;
      // Cache the AUTHORED markup, never the enhanced markup. Reading innerHTML
      // after custom-select has run captures its generated wrapper without the
      // listeners, so restoring that cache produced a select that looked right
      // and ignored every tap until a page refresh rebuilt it.
      if(!intakeBaseMarkup[id]){
        const pristine = body.cloneNode(true);
        if(window.kraneStripSelectEnhancement) window.kraneStripSelectEnhancement(pristine);
        intakeBaseMarkup[id] = pristine.innerHTML;
      }
      const template = (intakeTemplates[key] || {})[id];
      body.innerHTML = template !== undefined ? template : intakeBaseMarkup[id];
      if(window.kraneEnhanceSelects) window.kraneEnhanceSelects(body);
      setupIntakeQuestionPages(id,{reset:true});
      syncIntakeDropdownContinue(id);
    });
    renderedIntakeContext = key;
  }

  function completePartnerPatientInfo(){
    const paymentMethod=flowState.partnerPaymentMethod;
    flowState.entryChannel='partner';
    flowState.partnerInfoComplete=true;
    flowState.partnerPaymentChosen=true;
    flowState.partnerPaymentMethod=paymentMethod;
    flowState.partnerConsultationBalanceDue=paymentMethod==='self-pay' ? CONSULTATION_FEE_BAHT : null;
    flowState.partnerMedicineCredit=0;
    flowState.coverage={provider:'',policyId:'',consultationCredit:0,medicineCredit:0};
    persistFlowState();
    showActionToast('ยืนยันข้อมูลผู้รับบริการแล้ว','success');
    if(paymentMethod==='insurance') insuranceEntry='partner';
    else setSelectedCategory('general');
    // Paying out of pocket changes who settles the bill, not which intake
    // this entry uses. Both branches start with concern details, then move
    // to general health; insurance only adds the entitlement detour.
    show(paymentMethod==='insurance' ? 'insurance' : 'intake-concern');
  }

  function syncPartnerScreening(){
    document.querySelectorAll('[data-partner-screening-question]').forEach(group => {
      const value=flowState.partnerScreening[group.dataset.partnerScreeningQuestion] || '';
      group.querySelectorAll('[data-partner-screening-value]').forEach(option => {
        option.setAttribute('aria-selected',String(option.dataset.partnerScreeningValue===value));
      });
    });
  }

  function setPartnerHistoryChoice(group,hasDetails){
    if(!group) return;
    group.querySelectorAll('[data-partner-history-choice]').forEach(option => {
      option.setAttribute('aria-checked',String(
        option.dataset.partnerHistoryChoice===(hasDetails ? 'yes' : 'none')
      ));
    });
    const detail=group.querySelector('[data-partner-history-detail]');
    const input=detail?.querySelector('input');
    // Item 3 (04/08 deck): the detail box appears only when "มี" is chosen,
    // rather than always showing as a disabled field.
    if(detail) detail.hidden=!hasDetails;
    if(input){
      input.disabled=!hasDetails;
      if(!hasDetails) input.value='';
    }
  }

  function syncPartnerHistoryFields(){
    document.querySelectorAll('[data-partner-history]').forEach(group => {
      const key=group.dataset.partnerHistory;
      const value=flowState.partnerHealth[key] || 'ไม่มี';
      const hasDetails=value!=='ไม่มี';
      const input=group.querySelector('input');
      if(input) input.value=hasDetails ? value : '';
      setPartnerHistoryChoice(group,hasDetails);
    });
  }

  function partnerHistoryValue(key){
    const group=document.querySelector(`[data-partner-history="${key}"]`);
    const selected=group?.querySelector('[data-partner-history-choice][aria-checked="true"]');
    if(!group || selected?.dataset.partnerHistoryChoice!=='yes') return 'ไม่มี';
    return group.querySelector('input')?.value.trim() || '';
  }

  /* The partner record keeps one name line, the screen now asks for the two
     halves separately, exactly as the direct journey does. */
  function partnerNameValue(){
    const first=document.getElementById('partner-first-name')?.value.trim() || '';
    const last=document.getElementById('partner-last-name')?.value.trim() || '';
    return [first,last].filter(Boolean).join(' ');
  }

  function restorePartnerName(){
    const first=document.getElementById('partner-first-name');
    const last=document.getElementById('partner-last-name');
    if(!first || !last) return;
    const parts=(flowState.partnerName || flowState.patientName || '').trim().split(/\s+/);
    first.value=parts.shift() || '';
    last.value=parts.join(' ');
  }

  function restorePartnerFields(){
    restorePartnerName();
    // A verified account may already have supplied these details; a new partner
    // visitor must never inherit the prototype's sample identity.
    if(!flowState.partnerPhone && flowState.otpVerified && flowState.verifiedPhone){
      flowState.partnerPhone=normalizePhone(flowState.verifiedPhone);
      flowState.partnerPhoneVerified=true;
    }
    const draftFields=readSessionJson(DRAFT_KEY).fields || {};
    const drafted=id => draftFields[id]?.value || '';
    const values={
      'partner-phone':flowState.partnerPhone ? formatPhoneForDisplay(flowState.partnerPhone) : '',
      'partner-lifestyle':flowState.partnerHealth.lifestyle || 'ไม่'
    };
    if(flowState.entryChannel==='partner') Object.assign(values,{
      'intake-sex':flowState.partnerHealth.sex || drafted('intake-sex'),
      'intake-dob':flowState.partnerHealth.dob || drafted('intake-dob') || flowState.partnerIdentityDob || '',
      'intake-height':flowState.partnerHealth.height || drafted('intake-height'),
      'intake-weight':flowState.partnerHealth.weight || drafted('intake-weight'),
      'partner-concern-text':flowState.partnerConcern || drafted('partner-concern-text'),
      'partner-concern-duration-value':parseInt(flowState.partnerConcernDuration,10) || 1
    });
    Object.entries(values).forEach(([id,value]) => {
      const input=document.getElementById(id);
      if(!input) return;
      input.value=value;
    });
    const phone=document.getElementById('partner-phone');
    const note=document.querySelector('#partner-patient-info [data-phone-note]');
    if(phone){
      const verified=Boolean(flowState.partnerPhoneVerified && flowState.partnerPhone);
      phone.readOnly=verified;
      phone.toggleAttribute('aria-readonly',verified);
    }
    if(note) note.textContent=flowState.partnerPhoneVerified && flowState.partnerPhone
      ? 'ยืนยันด้วยรหัส OTP แล้ว'
      : 'กรอกเบอร์แล้ว ยืนยันด้วยรหัส OTP';
    const phoneAction=document.querySelector('#partner-patient-info [data-phone-edit]');
    if(phoneAction){ phoneAction.hidden=false; phoneAction.textContent=flowState.partnerPhoneVerified && flowState.partnerPhone ? 'เปลี่ยนเบอร์' : 'ยืนยันด้วย OTP'; }
    const paymentMethod=flowState.partnerPaymentMethod || 'insurance';
    document.querySelectorAll('#partner-patient-info [data-partner-payment-choice-value]').forEach(option => {
      option.setAttribute('aria-selected',String(option.dataset.partnerPaymentChoiceValue===paymentMethod));
    });
    if(flowState.entryChannel==='partner'){
      Object.entries(flowState.partnerHealth || {}).forEach(([key,value]) => {
        const group=document.querySelector(`#health-history-modal [data-direct-history="${key}"]`);
        if(!group || !['conditions','medications','allergies'].includes(key)) return;
        const hasDetails=Boolean(value && value!=='ไม่มี');
        setDirectHistoryChoice(group,hasDetails);
        const input=group.querySelector('input');
        if(input && hasDetails) input.value=value;
      });
      const durationUnit=(String(flowState.partnerConcernDuration || '').match(/\s(วัน|สัปดาห์|เดือน|ปี)$/) || [])[1];
      if(durationUnit){
        document.querySelectorAll('#intake-concern [data-partner-duration-unit]').forEach(option => {
          option.setAttribute('aria-selected',String(option.dataset.partnerDurationUnit===durationUnit));
        });
      }
      document.querySelectorAll('#intake-concern [data-partner-relief-value]').forEach(option => {
        option.setAttribute('aria-selected',String(option.dataset.partnerReliefValue===flowState.partnerConcernRelief));
      });
    }
    syncPartnerHistoryFields();
  }



  function seedPartnerStage(target){
    const order=['consent-terms','partner-idcard','partner-patient-info','partner-insurance','intake-concern','intake-general','partner-phr','matching'];
    const targetIndex=order.indexOf(target);
    if(targetIndex<0) return;
    flowState.entryChannel='partner';
    if(targetIndex>0){
      flowState.partnerConsentComplete=true;
      saveConsentRecords('partner',Object.entries(partnerConsentVersions).map(([type,version]) => ({
        type,version,acceptedAt:new Date().toISOString()
      })));
    }
    if(targetIndex>1){
      flowState.partnerIdStepDone=true;
      flowState.partnerInfoComplete=true;
      flowState.partnerPhoneVerified=true;
      flowState.partnerPaymentChosen=true;
      flowState.partnerPaymentMethod=flowState.partnerPaymentMethod || 'insurance';
      if(targetIndex>2 && flowState.partnerPaymentMethod==='insurance'){
        flowState.partnerConsultationBalanceDue=0;
        flowState.partnerMedicineCredit=1000;
        flowState.coverage={provider:'แผนสุขภาพออนไลน์',policyId:'online-care',consultationCredit:CONSULTATION_FEE_BAHT,medicineCredit:1000};
      }
    }
    if(targetIndex>3) flowState.partnerConcernComplete=true;
    if(targetIndex>4) flowState.partnerHealthComplete=true;
    if(targetIndex>6){
      flowState.partnerReviewComplete=true;
      flowState.partnerReviewConfirmedAt=new Date().toISOString();
    }
    persistFlowState();
    syncPartnerScreening();
    syncPartnerReview();
  }

  function partnerMedicineCoverageCredit(){
    if(!['partner','insured'].includes(flowState.entryChannel)) return 0;
    const credit=Number(flowState.coverage?.medicineCredit ?? flowState.partnerMedicineCredit);
    return Number.isFinite(credit) ? Math.max(0,credit) : 0;
  }

  function intakeConcernKey(){
    try { return selectedCategory().general ? 'general' : (INTAKE_CATEGORY_KEY[selectedCategoryId] || 'hair'); }
    catch(e){ return 'hair'; }
  }

  /* The screens this concern actually visits, in order. Everything that counts
     intake steps reads from here so the progress label can never disagree with
     the routing. */
  function intakeStepOrder(){
    if(flowState.entryChannel==='partner') return ['intake-concern','intake-general'];
    const seq = ['intake1','intake2','intake3','intake4'];
    try { if(categoryNeedsPhotos()) seq.push('intake5'); } catch(e){}
    return seq.filter(id => !intakeSkipped(id));
  }

  /* BMI is the indication the doctor's SOP screens on (>=27.5 with a
     weight-related condition, per the Thai FDA labelling the client quoted), so
     the patient sees it the moment both numbers are in rather than hearing it
     first from the doctor. It is shown, never used to gate: the eligibility
     call is the doctor's. */
  function syncObesityBmi(){
    const row=document.querySelector('[data-obesity-bmi]');
    if(!row) return;
    const height=Number(document.getElementById('obesity-height')?.value);
    const weight=Number(document.getElementById('obesity-weight')?.value);
    const metres=height/100;
    const ready=height>0 && weight>0 && metres>0;
    const value=row.querySelector('[data-obesity-bmi-value]');
    if(value) value.textContent = ready ? (weight/(metres*metres)).toFixed(1) : '\u2014';
    row.hidden=!ready;
  }



  function syncPaymentItemDraft(){
    if(!paymentItemSheet || !paymentItemDraft) return;
    const quantity=paymentItemSheet.querySelector('[data-payment-item-quantity]');
    const price=paymentItemSheet.querySelector('[data-payment-item-price]');
    const minus=paymentItemSheet.querySelector('[data-payment-item-minus]');
    const plus=paymentItemSheet.querySelector('[data-payment-item-plus]');
    const limit=paymentItemSheet.querySelector('[data-payment-item-limit]');
    if(quantity) quantity.textContent=String(paymentItemDraft.quantity);
    if(price) price.textContent=baht(paymentItemDraft.unit*paymentItemDraft.quantity);
    if(minus) minus.disabled=paymentItemDraft.quantity<=0;
    if(plus) plus.disabled=!paymentItemDraft.allowIncrease || paymentItemDraft.quantity>=paymentItemDraft.max;
    if(limit){
      limit.textContent=paymentItemDraft.type==='addon'
        ? `ลดได้ถึง 0 และเพิ่มได้สูงสุด ${paymentItemDraft.max} ชิ้น`
        : 'ลดหรือเพิ่มกลับได้ ไม่เกินจำนวนที่แพทย์สั่ง';
    }
  }

  /* Client, 18 Sep: a "ใช่" to any GLP-1 exclusion stops online care. The sheet
     warns as soon as one is ticked and disables confirmation. */
  function obesityRiskFlagged(){
    return Boolean(obesityRiskModal?.querySelector('[data-obesity-risk-choice="yes"][aria-checked="true"]'));
  }

  function syncObesityRiskWarning(){
    const warning=obesityRiskModal?.querySelector('[data-obesity-risk-warning]');
    const flagged=obesityRiskFlagged();
    if(warning) warning.hidden=!flagged;
    const confirm=obesityRiskModal?.querySelector("[data-obesity-risk-confirm]");
    if(confirm) confirm.disabled=flagged;
  }

  function renderObesityRiskStep(){
    const groups=[...obesityRiskModal.querySelectorAll('[data-obesity-risk]')];
    groups.forEach((group,index)=>group.hidden=Math.floor(index/3)!==obesityRiskStep);
    obesityRiskModal.querySelector('[data-obesity-risk-confirm]').textContent=obesityRiskStep===0?'ถัดไป':'ยืนยันและไปต่อ';
  }

  function openObesityRiskModal(){
    if(!obesityRiskModal){ finishDirectF02(); return; }
    obesityRiskStep=0;renderObesityRiskStep();
    syncObesityRiskWarning();
    obesityRiskModal.hidden = false;
    obesityRiskModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    obesityRiskModal.querySelector('[data-obesity-risk-choice][aria-checked="true"]')?.focus();
  }

  function closeObesityRiskModal(){
    if(!obesityRiskModal) return;
    obesityRiskModal.hidden = true;
    obesityRiskModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_durationStep(e, intakeDurationStep) {
      const screen=intakeDurationStep.closest('.screen');
      const input=screen?.querySelector('input[data-intake-role="duration"]');
      if(!input) return true;
      input.value=String(Math.min(99,Math.max(1,(Number(input.value) || 1)+Number(intakeDurationStep.dataset.intakeDurationStep || 0))));
      input.dispatchEvent(new Event('input',{bubbles:true}));
      syncIntakeDropdownContinue(screen);
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_durationUnit(e, intakeDurationUnit) {
      const screen=intakeDurationUnit.closest('.screen');
      screen?.querySelectorAll('[data-intake-duration-unit]').forEach(option => {
        option.setAttribute('aria-selected',String(option===intakeDurationUnit));
      });
      saveIntakeDraft();
      syncIntakeDropdownContinue(screen);
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_directHistory(e, directHistoryChoice) {
      const group=directHistoryChoice.closest('[data-direct-history]');
      const hasDetails=directHistoryChoice.dataset.directHistoryChoice==='yes';
      setDirectHistoryChoice(group,hasDetails);
      saveIntakeDraft();
      if(hasDetails) requestAnimationFrame(() => group?.querySelector('input')?.focus());
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_directComplete(e, directIntakeComplete) {
      finishDirectF02();
      return true;

  return false;
}

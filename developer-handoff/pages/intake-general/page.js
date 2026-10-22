/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */


  function beginAssignedDoctorFlow(category){
    if(category) setSelectedCategory(category);
    const followUpRecord=hydrateFollowUpRecord(selectedCategoryId);
    Object.assign(flowState,{
      entryChannel:'direct',draftReady:true,directGeneralHealthComplete:false,
      followUpDirectToWaitroom:true,consultationFeeAcknowledged:true,lastRequiredScreen:'intake-general',
      followUpContext:{
        active:true,
        category:followUpRecord.category,
        sourceConsultationAt:followUpRecord.sourceConsultationAt,
        loadedAt:new Date().toISOString()
      }
    });
    persistFlowState();
    saveIntakeDraft();
    journeyActive=true;
    show('intake-general');
  }

  function syncGeneralHealthContext(){
    const direct=flowState.entryChannel==='direct';
    const partner=flowState.entryChannel==='partner';
    const assignedDoctorFlow=direct && flowState.followUpDirectToWaitroom;
    const generalHealth=document.getElementById('intake-general');
    if(generalHealth) generalHealth.dataset.entryChannel=flowState.entryChannel;
    const title=document.querySelector('#intake-general [data-general-health-title]');
    const hint=document.querySelector('#intake-general [data-general-health-hint]');
    const submit=document.querySelector('#intake-general [data-general-health-submit]');
    if(title) title.textContent='ยืนยันข้อมูลสุขภาพ';
    if(hint) hint.hidden=false;
    if(submit) submit.textContent='ยืนยันข้อมูลและดำเนินการต่อ';
    const safetyTitle=document.getElementById('health-history-title');
    if(safetyTitle) safetyTitle.textContent=partner ? 'ยืนยันข้อมูลความปลอดภัย' : 'ยืนยันข้อมูลส่วนตัวและสุขภาพ';
    const safetyIntro=document.querySelector('[data-partner-safety-intro]');
    if(safetyIntro) safetyIntro.hidden=!partner;
    const medicinesQuestion=document.querySelector('[data-medications-question]');
    if(medicinesQuestion) medicinesQuestion.textContent=partner ? 'ยาที่ใช้ประจำ' : 'ยาหรืออาหารเสริมที่ใช้อยู่';
    const medicinesGroup=document.querySelector('[data-medications-group]');
    if(medicinesGroup) medicinesGroup.setAttribute('aria-label',partner ? 'ยาที่ใช้ประจำ' : 'ยาหรืออาหารเสริมที่ใช้อยู่');
    const medicinesDetailLabel=document.querySelector('[data-medications-detail-label]');
    if(medicinesDetailLabel) medicinesDetailLabel.textContent=partner ? 'ระบุยาที่ใช้ประจำ' : 'ระบุยาหรืออาหารเสริมที่ใช้อยู่';
    const allergiesQuestion=document.querySelector('[data-allergies-question]');
    if(allergiesQuestion) allergiesQuestion.textContent=partner ? 'ประวัติแพ้ยา' : 'ประวัติแพ้ยา/อาหาร';
    const allergiesGroup=document.querySelector('[data-allergies-group]');
    if(allergiesGroup) allergiesGroup.setAttribute('aria-label',partner ? 'ประวัติแพ้ยา' : 'ประวัติแพ้ยา/อาหาร');
    const allergiesDetailLabel=document.querySelector('[data-allergies-detail-label]');
    if(allergiesDetailLabel) allergiesDetailLabel.textContent=partner ? 'ระบุประวัติแพ้ยา' : 'ระบุประวัติแพ้ยา/อาหาร';
    updateFollowUpPrefillCard(flowState.followUpContext?.active ? followUpRecordFor(flowState.followUpContext.category) : null);
  }

  /* Client, 26 Aug: the height / weight / conditions page belongs immediately
     after the name-and-phone page, not on the far side of doctor matching and
     payment. Everything the patient knows about themselves is now asked in one
     run, and only then does the app go looking for a doctor. */
  function directNextAfterPatientInfo(){
    if(flowState.entryChannel==='direct' && !flowState.directGeneralHealthComplete) return 'intake-general';
    return directClinicalStartTarget();
  }

  function updateFollowUpPrefillCard(record){
    const card=document.querySelector('#intake-general [data-followup-prefill]');
    const active=Boolean(flowState.followUpContext?.active && record);
    if(!card) return;
    card.hidden=!active;
    if(!active) return;
    const concern=card.querySelector('[data-followup-prefill-concern]');
    const medicines=card.querySelector('[data-followup-prefill-medicines]');
    const reviewed=card.querySelector('[data-followup-prefill-reviewed]');
    if(concern) concern.textContent=record.concern || 'ข้อมูลอาการจากครั้งก่อน';
    if(medicines) medicines.textContent=record.currentMedicines || record.history?.medications || 'ไม่มี';
    if(reviewed) reviewed.textContent=`ทบทวนล่าสุด ${record.sourceConsultationAt || 'ในการปรึกษาครั้งก่อน'} · ข้อมูลนี้จะถูกส่งให้แพทย์พร้อมการเปลี่ยนแปลงครั้งนี้`;
  }


  /* Everything that happens once the shared health intake is confirmed. Split
     out so the general-health route can run it from the safety dialog while
     the other entries still run it inline. */
  function completeSharedHealthIntake(fromGeneralHealth){
    if(fromGeneralHealth && flowState.entryChannel==='direct'){
      const completingFollowUp=Boolean(flowState.followUpContext?.active);
      if(completingFollowUp) captureFollowUpRecord();
      flowState.draftReady=true;
      flowState.directGeneralHealthComplete=true;
      /* A normal new-care route still starts doctor allocation. A follow-up or
         consult-now shortcut already belongs to the patient's assigned doctor,
         so after this safety confirmation it can enter that doctor's room. */
      const next=flowState.followUpDirectToWaitroom ? 'waitroom' : directClinicalStartTarget();
      flowState.followUpDirectToWaitroom=false;
      if(completingFollowUp){
        flowState.followUpContext=Object.assign({},flowState.followUpContext,{active:false,completedAt:new Date().toISOString()});
      }
      flowState.lastRequiredScreen=next;
      persistFlowState();
      saveIntakeDraft();
      showActionToast(completingFollowUp ? 'บันทึกข้อมูลติดตามผลแล้ว' : 'ยืนยันข้อมูลสุขภาพแล้ว','success');
      show(next);
      return;
    }
    flowState.draftReady=true;
    if(flowState.entryChannel==='partner'){
      flowState.partnerHealth={
        conditions:directHistoryValue('conditions'),
        medications:directHistoryValue('medications'),
        allergies:directHistoryValue('allergies'),
        lifestyle:'ไม่',
        sex:document.getElementById('intake-sex')?.value || '',
        dob:document.getElementById('intake-dob')?.value || '',
        height:document.getElementById('intake-height')?.value.trim() || '',
        weight:document.getElementById('intake-weight')?.value.trim() || ''
      };
      flowState.partnerHealthComplete=true;
      flowState.partnerReviewComplete=true;
      flowState.partnerReviewConfirmedAt=new Date().toISOString();
      flowState.accountCreated=true;
      flowState.otpVerified=true;
      flowState.consentsComplete=true;
      flowState.patientInfoComplete=true;
      flowState.identityVerified=true;
      flowState.patientName=flowState.partnerName || flowState.patientName || '';
      flowState.lastRequiredScreen='matching';
      persistFlowState();
      saveIntakeDraft();
      showActionToast('บันทึกข้อมูลสุขภาพแล้ว กำลังจับคู่แพทย์','success');
      show(partnerClinicalStartTarget());
      return;
    }
    flowState.lastRequiredScreen='signup';
    persistFlowState();
    saveIntakeDraft();
    postAuthNext='matching';
    if(signedIn()){
      flowState.lastRequiredScreen='';
      persistFlowState();
      show(nextAfterAuthentication(directClinicalStartTarget()));
      return;
    }
    show('signup');
  }

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_intake_general_owned_302(){
if(healthHistoryModal){
    healthHistoryModal.addEventListener('click', event => {
      if(event.target.closest('[data-health-history-close]')){
        closeHealthHistoryModal();
        document.querySelector('#intake-general [data-general-health-submit]')?.focus();
        return;
      }
      if(!event.target.closest('[data-health-history-confirm]')) return;
      const incompleteHistory=[...healthHistoryModal.querySelectorAll('[data-direct-history]')].find(group => {
        const selected=group.querySelector('[data-direct-history-choice][aria-checked="true"]');
        return selected?.dataset.directHistoryChoice==='yes' && !group.querySelector('input')?.value.trim();
      });
      if(incompleteHistory){
        const label=incompleteHistory.querySelector('legend')?.textContent.trim() || 'ข้อมูลสุขภาพ';
        showActionToast(`กรุณาระบุ${label}`,'warning');
        incompleteHistory.querySelector('input')?.focus();
        return;
      }
      closeHealthHistoryModal();
      completeSharedHealthIntake(true);
    });
    document.addEventListener('keydown', event => {
      if(event.key==='Escape' && !healthHistoryModal.hidden) closeHealthHistoryModal();
    });
  }
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_general_partnerHistory(e, partnerHistoryChoice) {
      const group=partnerHistoryChoice.closest('[data-partner-history]');
      const hasDetails=partnerHistoryChoice.dataset.partnerHistoryChoice==='yes';
      setPartnerHistoryChoice(group,hasDetails);
      if(hasDetails) requestAnimationFrame(() => group?.querySelector('input')?.focus());
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_general_screening(e, partnerScreeningOption) {
      const group=partnerScreeningOption.closest('[data-partner-screening-question]');
      if(group){
        flowState.partnerScreening[group.dataset.partnerScreeningQuestion]=partnerScreeningOption.dataset.partnerScreeningValue;
        persistFlowState();
        syncPartnerScreening();
      }
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_general_submit(e, intakeComplete) {
      const dob=document.getElementById('intake-dob');
      if(!dob?.value){
        showActionToast('กรุณาเลือกวันเกิด','warning');
        dob?.focus();
        return true;
      }
      /* The three safety answers decide whether it is safe to prescribe, so
         they are confirmed in their own dialog at the moment of submission
         rather than sitting mid-page where they are scrolled past. */
      openHealthHistoryModal();
      return true;

  return false;
}

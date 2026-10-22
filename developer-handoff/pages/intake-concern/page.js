/* intake-concern: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  function saveIntakeDraft(){
    const fields={};
    INTAKE_DRAFT_SCREENS.forEach(screenId => {
      const screen=document.getElementById(screenId);
      if(!screen) return;
      screen.querySelectorAll('input:not([type="file"]),textarea,select').forEach((field,index) => {
        const key=field.id || `${screenId}:field:${index}`;
        fields[key]={value:field.value,checked:field.checked,type:field.type};
      });
    });
    const options={};
    INTAKE_DRAFT_SCREENS.forEach(screenId => {
      const screen=document.getElementById(screenId);
      if(!screen) return;
      options[screenId]=[...screen.querySelectorAll('.option[aria-selected]')].map(option => option.getAttribute('aria-selected'));
    });
    const obesityRisk={};
    document.querySelectorAll('[data-obesity-risk]').forEach(group => {
      obesityRisk[group.dataset.obesityRisk]=group.querySelector('[data-obesity-risk-choice][aria-checked="true"]')?.dataset.obesityRiskChoice || 'no';
    });
    const compactHistory={};
    document.querySelectorAll('#health-history-modal [data-direct-history]').forEach(group => {
      compactHistory[group.dataset.directHistory]=group.querySelector('[data-direct-history-choice][aria-checked="true"]')?.dataset.directHistoryChoice || 'none';
    });
    const sharedConcern={
      durationUnit:document.querySelector('#intake-concern [data-partner-duration-unit][aria-selected="true"]')?.dataset.partnerDurationUnit || 'วัน',
      relief:document.querySelector('#intake-concern [data-partner-relief-value][aria-selected="true"]')?.dataset.partnerReliefValue || ''
    };
    writeSessionJson(DRAFT_KEY,{
      selectedCategoryId,selectedConditionId,fields,options,compactHistory,obesityRisk,sharedConcern,
      savedAt:new Date().toISOString(),
      complete:flowState.draftReady
    });
  }

  function restoreIntakeDraft(){
    const draft=readSessionJson(DRAFT_KEY);
    if(!draft || !draft.fields) return;
    if(draft.selectedCategoryId) selectedCategoryId=draft.selectedCategoryId;
    if(draft.selectedConditionId) selectedConditionId=draft.selectedConditionId;
    renderIntakeQuestions();
    Object.entries(draft.fields).forEach(([key,state]) => {
      const field=document.getElementById(key);
      if(!field) return;
      if(state.type==='checkbox' || state.type==='radio') field.checked=Boolean(state.checked);
      else field.value=state.value ?? '';
    });
    Object.entries(draft.options || {}).forEach(([screenId,states]) => {
      const options=[...document.querySelectorAll(`#${screenId} .option[aria-selected]`)];
      states.forEach((value,index) => { if(options[index]) options[index].setAttribute('aria-selected',value); });
    });
    Object.entries(draft.obesityRisk || {}).forEach(([name,value]) => {
      document.querySelectorAll(`[data-obesity-risk="${name}"] [data-obesity-risk-choice]`).forEach(option => {
        option.setAttribute('aria-checked',String(option.dataset.obesityRiskChoice===value));
      });
    });
    syncObesityBmi();
    Object.entries(draft.compactHistory || {}).forEach(([name,value]) => {
      const group=document.querySelector(`#health-history-modal [data-direct-history="${name}"]`);
      if(group) setDirectHistoryChoice(group,value==='yes');
    });
    document.querySelectorAll('#intake-concern [data-partner-duration-unit]').forEach(option => {
      option.setAttribute('aria-selected',String(option.dataset.partnerDurationUnit===(draft.sharedConcern?.durationUnit || 'วัน')));
    });
    document.querySelectorAll('#intake-concern [data-partner-relief-value]').forEach(option => {
      option.setAttribute('aria-selected',String(option.dataset.partnerReliefValue===(draft.sharedConcern?.relief || '')));
    });
    flowState.draftReady=Boolean(flowState.draftReady || draft.complete);
    persistFlowState();
    INTAKE_DRAFT_SCREENS.forEach(syncIntakeDropdownContinue);
    updateSelectedCare();
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_intake_concern_683(){

  // Shared concern controls live on their own page for both Krane-direct and
  // insurance entry. General health follows as the next screen.
  document.body.addEventListener('click', e => {
    const step = e.target.closest('#intake-concern [data-partner-duration-step]');
    if(step){
      const input = document.getElementById('partner-concern-duration-value');
      if(input) input.value = String(Math.min(99, Math.max(1,
        (Number(input.value) || 1) + Number(step.dataset.partnerDurationStep || 0))));
      saveIntakeDraft();
      return;
    }
    const unit = e.target.closest('#intake-concern [data-partner-duration-unit]');
    if(unit){
      document.querySelectorAll('#intake-concern [data-partner-duration-unit]').forEach(o =>
        o.setAttribute('aria-selected', String(o === unit)));
      saveIntakeDraft();
      return;
    }
    const relief = e.target.closest('#intake-concern [data-partner-relief-value]');
    if(relief){
      document.querySelectorAll('#intake-concern [data-partner-relief-value]').forEach(o =>
        o.setAttribute('aria-selected', String(o === relief)));
      saveIntakeDraft();
    }
  });
}


/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_intake_concern_owned_331(){
(function partnerConcernPhotos(){
    const input = document.querySelector('[data-partner-photo-input]');
    const thumbs = document.querySelector('[data-partner-photo-thumbs]');
    if(!input || !thumbs) return;
    const empty = thumbs.querySelector('[data-partner-photo-empty]');
    const MAX = 10 * 1024 * 1024;
    const syncEmpty = () => { if(empty) empty.hidden = Boolean(thumbs.querySelector('.up-thumb')); };
    input.addEventListener('change', () => {
      Array.from(input.files || []).forEach(file => {
        if(!file.type.startsWith('image/')) return;
        if(file.size > MAX){ showActionToast('รูปใหญ่เกิน 10 MB','error'); return; }
        if(thumbs.querySelectorAll('.up-thumb').length >= 5){ showActionToast('เพิ่มรูปได้สูงสุด 5 รูป','warning'); return; }
        const fig = document.createElement('figure');
        fig.className = 'up-thumb';
        const img = document.createElement('img');
        img.alt = file.name;
        const rm = document.createElement('button');
        rm.type = 'button'; rm.className = 'x'; rm.textContent = '×';
        rm.setAttribute('aria-label','ลบรูปนี้');
        rm.addEventListener('click', () => { fig.remove(); syncEmpty(); });
        fig.append(img, rm);
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          img.src = String(reader.result || '');
          thumbs.appendChild(fig);
          syncEmpty();
        });
        reader.readAsDataURL(file);
      });
      input.value = '';
    });
    syncEmpty();
  })();
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_intake_concern_submit(e, intakeComplete) {
      const concern=document.getElementById('partner-concern-text')?.value.trim() || '';
      const amount=Number(document.getElementById('partner-concern-duration-value')?.value) || 0;
      const unitOn=document.querySelector('#intake-concern [data-partner-duration-unit][aria-selected="true"]');
      const reliefOn=document.querySelector('#intake-concern [data-partner-relief-value][aria-selected="true"]');
      if(concern.length<5){
        showActionToast('กรุณาอธิบายอาการอย่างน้อย 5 ตัวอักษร','warning');
        document.getElementById('partner-concern-text')?.focus();
        return true;
      }
      if(!amount || !unitOn){
        showActionToast('กรุณาระบุระยะเวลาที่มีอาการ','warning');
        document.getElementById('partner-concern-duration-value')?.focus();
        return true;
      }
      if(!reliefOn){
        showActionToast('กรุณาเลือกสิ่งที่ลองทำเพื่อบรรเทาอาการ','warning');
        return true;
      }
      flowState.partnerConcern=concern;
      flowState.partnerConcernDuration=amount+' '+unitOn.dataset.partnerDurationUnit;
      flowState.partnerConcernRelief=reliefOn.dataset.partnerReliefValue;
      flowState.partnerConcernComplete=true;
      if(flowState.entryChannel==='direct') flowState.draftReady=true;
      flowState.lastRequiredScreen='intake-general';
      persistFlowState();
      saveIntakeDraft();
      show('intake-general');
      return true;

  return false;
}

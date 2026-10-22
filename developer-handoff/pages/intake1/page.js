/* intake1: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  function intakeRequirementState(screenOrId){
    const screen = typeof screenOrId === 'string' ? document.getElementById(screenOrId) : screenOrId;
    if(!screen) return {ready:true,message:'',target:null};
    const scope = screen.querySelector('[data-intake-question]:not([hidden])') || screen;
    const thai = document.documentElement.lang === 'th';
    const durationInput = scope.querySelector('input[data-intake-role="duration"][required]');
    if(durationInput && (!durationInput.value || Number(durationInput.value) < 1)){
      return {
        ready:false,
        message:thai ? 'กรุณาระบุระยะเวลาที่มีอาการ' : 'Please enter symptom duration',
        target:durationInput
      };
    }
    const requiredSelects = [...scope.querySelectorAll('select[data-intake-select][required]')];
    const missingSelect = requiredSelects.find(select => !select.value);
    if(missingSelect){
      const label = scope.querySelector(`label[for="${missingSelect.id}"]`)?.textContent.trim();
      const isDuration = missingSelect.dataset.intakeRole === 'duration';
      return {
        ready:false,
        message:isDuration
          ? (thai ? 'กรุณาเลือกระยะเวลาที่มีอาการ' : 'Please select symptom duration')
          : (thai
            ? `กรุณาเลือกคำตอบ${label ? `สำหรับ “${label}”` : 'ที่จำเป็น'}`
            : `Please select ${label || 'the required information'}`),
        target:missingSelect
      };
    }
    const requiredField=scope.querySelector('input[required],select[required],textarea[required]');
    if(requiredField && !String(requiredField.value || '').trim()){
      const label=scope.querySelector(`label[for="${requiredField.id}"]`)?.textContent.trim();
      return {
        ready:false,
        message:thai ? `กรุณาระบุ${label || 'ข้อมูลที่จำเป็น'}` : `Please enter ${label || 'the required information'}`,
        target:requiredField
      };
    }
    const directHistory=scope.matches('[data-direct-history]') ? scope : scope.querySelector('[data-direct-history]');
    const directHistoryChoice=directHistory?.querySelector('[data-direct-history-choice][aria-checked="true"]');
    const directHistoryInput=directHistory?.querySelector('input');
    if(directHistoryChoice?.dataset.directHistoryChoice==='yes' && !directHistoryInput?.value.trim()){
      const label=directHistory.querySelector('legend')?.textContent.trim() || 'ข้อมูลสุขภาพ';
      return {ready:false,message:`กรุณาระบุ${label}`,target:directHistoryInput};
    }
    const optionGroups = [
      ...(scope.matches('.stack-3') ? [scope] : []),
      ...scope.querySelectorAll('.stack-3')
    ].filter(group => {
      const choices = [...group.children].filter(child => child.matches('.option[data-multi],.option[data-select]'));
      return choices.length > 0 && choices.length === group.children.length;
    });
    const missingGroup = optionGroups.find(group => !group.querySelector('.option[aria-selected="true"]'));
    if(missingGroup){
      const section = missingGroup.closest('.common-group')?.querySelector('.section-label')?.textContent.trim();
      const message = screen.id === 'intake1'
        ? (thai ? 'กรุณาเลือกอาการที่คุณกำลังพบอย่างน้อย 1 ข้อ' : 'Please select at least one symptom')
        : (thai
          ? `กรุณาเลือกคำตอบ${section ? `ในหัวข้อ “${section}”` : ''}อย่างน้อย 1 ข้อ`
          : `Please select at least one answer${section ? ` for “${section}”` : ''}`);
      return {ready:false,message,target:missingGroup.querySelector('.option')};
    }
    return {ready:true,message:'',target:null};
  }

  function renderConditionList(){
    const cat = selectedCategory();
    const thai = document.documentElement.lang === 'th';
    const list = document.querySelector('[data-condition-list]');
    if(!list) return;
    list.className = 'choice-list';
    if(cat.general || !conditionListRevealed){
      list.innerHTML = '';
      return;
    }
    const conditions = cat.conditions.length ? cat.conditions : [{ id:`${cat.id}-general`, title:'General consultation', description:'Talk to a doctor about this category.', status:'General', next:'intake1' }];
    // conditions are full-width tap-to-go cards with a status badge, no radio.
    const heading = `<p class="section-label">${thai ? 'เลือกอาการที่ตรงกับคุณที่สุด' : 'Choose the closest concern'}</p>`;
    list.innerHTML = heading + conditions.map(condition => {
      const soon = condition.status === 'Soon';
      return `
      <button class="choice-card${soon ? ' choice-card--soon' : ''}" data-condition-card data-condition-id="${condition.id}" ${soon ? 'disabled aria-disabled="true"' : `data-go="${condition.next || 'intake1'}"`}>
        <span class="cc-body"><span class="cc-title">${thai && condition.titleTh ? condition.titleTh : condition.title}</span></span>
        ${soon ? '<span class="cc-soon">Soon</span>' : ''}<span class="cc-chev" aria-hidden="true"></span>
      </button>
    `}).join('');
  }

  function hydrateFollowUpRecord(category){
    const record=followUpRecordFor(category);
    setSelectedCategory(record.category);
    if(record.selectedConditionId) selectedConditionId=record.selectedConditionId;
    renderIntakeQuestions();
    Object.entries(record.fields || {}).forEach(([id,value]) => {
      const field=document.getElementById(id);
      if(field) field.value=value ?? '';
    });
    document.querySelectorAll('#intake1 [data-intake-duration-unit]').forEach(option => {
      option.setAttribute('aria-selected',String(option.dataset.intakeDurationUnit===record.durationUnit));
    });
    applyFollowUpOptionLabels(record);
    applyFollowUpHistory(record.history);
    INTAKE_DRAFT_SCREENS.forEach(syncIntakeDropdownContinue);
    updateSelectedCare();
    return record;
  }

  function captureFollowUpRecord(){
    const context=flowState.followUpContext;
    if(!context?.active) return null;
    const existing=followUpRecordFor(context.category);
    const fields={};
    INTAKE_DRAFT_SCREENS.forEach(screenId => {
      document.querySelectorAll(`#${screenId} input:not([type="file"]),#${screenId} textarea,#${screenId} select`).forEach(field => {
        if(field.id) fields[field.id]=field.value;
      });
    });
    const optionLabels={};
    INTAKE_DRAFT_SCREENS.forEach(screenId => {
      optionLabels[screenId]=[...document.querySelectorAll(`#${screenId} .option[aria-selected="true"]`)].map(optionLabel);
    });
    const history={
      conditions:directHistoryValue('conditions'),
      medications:directHistoryValue('medications'),
      allergies:directHistoryValue('allergies')
    };
    const durationUnit=document.querySelector('#intake1 [data-intake-duration-unit][aria-selected="true"]')?.dataset.intakeDurationUnit || existing.durationUnit;
    const next=Object.assign({},existing,{
      fields,optionLabels,history,durationUnit,
      currentMedicines:history.medications==='ไม่มี' ? existing.currentMedicines : history.medications,
      updatedAt:new Date().toISOString()
    });
    const records=readLocalJson(FOLLOWUP_RECORD_KEY);
    records[context.category]=next;
    writeLocalJson(FOLLOWUP_RECORD_KEY,records);
    return next;
  }

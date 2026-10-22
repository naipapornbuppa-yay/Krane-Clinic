function kraneHandle_conditions_category(e, catCard) {
      flowState.entryChannel='direct';
      flowState.coverage={provider:'',policyId:'',consultationCredit:0,medicineCredit:0};
      flowState.partnerConsultationBalanceDue=null;
      flowState.partnerMedicineCredit=0;
      persistFlowState();
      setSelectedCategory(catCard.dataset.categoryId);
      const chosen = selectedCategory();
      const choices = (chosen.conditions || []).filter(item => item.status !== 'Soon');
      /* A category with one condition has nothing to choose between — the
         second card only repeated the first. Go straight to the questionnaire
         and reveal the list only when there is a real choice. */
      if(catCard.dataset.go === 'conditions' && choices.length <= 1){
        conditionListRevealed = false;
        renderConditionList();
        if(choices[0]) selectedConditionId = choices[0].id;
        show(choices[0] ? (choices[0].next || 'intake1') : 'intake1');
        return true;
      }
      conditionListRevealed = true;
      renderConditionList();

  return false;
}

function renderConsultationCatalog(){
    const categoryList = document.querySelector('[data-category-list]');
    if(categoryList){
      // One programme card per service. Keep the visible hierarchy to two plain
      // text lines: programme name, then clinical category. Longer catalogue
      // descriptions remain data for handoff/other screens, not a third card row.
      const cards = liveCategories().map(cat => {
        const soon = cat.status === 'Soon';
        return `
        <button class="choice-card${soon ? ' choice-card--soon' : ''}" data-category-card data-category-id="${cat.id}" ${soon ? 'disabled aria-disabled="true"' : `data-go="${cat.next || 'conditions'}"`}>
          <span class="cc-icon">${iconSvg(cat.icon)}</span>
          <span class="cc-body">
            <span class="cc-title-row"><span class="cc-title">${cat.programTitle || cat.title}</span>${soon ? '<span class="cc-soon">Soon</span>' : ''}</span>
            <span class="cc-category">${cat.title}</span>
          </span>
          <span class="cc-chev" aria-hidden="true"></span>
        </button>
      `}).join('');
      const general = consultationCatalog.find(cat => cat.general);
      const generalCard = general ? `
        <button class="choice-card choice-card--wide" data-category-card data-category-id="${general.id}" data-go="${general.next || 'intake1'}">
          <span class="cc-icon">${iconSvg(general.icon)}</span>
          <span class="cc-body">
            <span class="cc-title-row"><span class="cc-title">${general.programTitle || general.title}</span></span>
            <span class="cc-category">${general.title}</span>
          </span>
          <span class="cc-chev" aria-hidden="true"></span>
        </button>
      ` : '';
      categoryList.innerHTML = cards + generalCard;
      categoryList.className = 'choice-grid';
    }
    renderConditionList();
  }

function kraneHandle_conditions_condition(e, conditionCard) {selectedConditionId = conditionCard.dataset.conditionId;
  return false;
}

function kraneHandle_conditions_lifecycle_8(){

      conditionListRevealed=false;
      renderConditionList();

return false;
}
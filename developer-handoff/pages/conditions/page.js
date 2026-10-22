/* pages/conditions/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
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

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_conditions_condition(e, conditionCard) {selectedConditionId = conditionCard.dataset.conditionId;
  return false;
}

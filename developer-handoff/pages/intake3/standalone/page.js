function kraneHandle_intake3_obesityRisk(e, obesityRiskChoice) {
      const group=obesityRiskChoice.closest('[data-obesity-risk]');
      group?.querySelectorAll('[data-obesity-risk-choice]').forEach(option => {
        option.setAttribute('aria-checked',String(option===obesityRiskChoice));
      });
      syncObesityRiskWarning();
      saveIntakeDraft();
      return true;

  return false;
}

function kraneInit_intake3_owned_300(){
if(obesityRiskModal){
    obesityRiskModal.addEventListener('click', event => {
      if(event.target.closest('[data-obesity-risk-close]')){
        if(obesityRiskStep>0){obesityRiskStep--;renderObesityRiskStep();return;}
        closeObesityRiskModal();
        document.querySelector('#intake3 .screen__footer [data-go]')?.focus();
        return;
      }
      if(!event.target.closest('[data-obesity-risk-confirm]')) return;
      if(obesityRiskFlagged()) return;
      if(obesityRiskStep===0){obesityRiskStep++;renderObesityRiskStep();return;}
      closeObesityRiskModal();
      finishDirectF02();
    });
    document.addEventListener('keydown', event => {
      if(event.key==='Escape' && !obesityRiskModal.hidden) closeObesityRiskModal();
    });
  }
}
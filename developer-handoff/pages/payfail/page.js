/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function syncMedicationFailureAmount(amount=currentMedicationDue()){
    const failureTotal=document.querySelector('#payfail [data-payment-failure-total]');
    if(failureTotal) failureTotal.textContent=baht(amount);
  }

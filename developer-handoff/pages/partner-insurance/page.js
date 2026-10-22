/* partner-insurance: behavior is supplied by shared libraries. No duplicate per-page implementation.
 * Add page-owned functions here; shared/runtime.js owns ordered initialization.
 */

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_partner_insurance_owned_220(){
document.body.addEventListener('change',event => {
    if(event.target.closest('[data-partner-policy-select]')) syncPartnerPolicySummary();
  });
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_partner_insurance_paymentChoice(e, partnerPayment) {
      const paymentMethod=partnerPayment.dataset.partnerPayment;
      const eligiblePartnerPolicy=paymentMethod==='insurance' && Boolean(partnerPayment.closest('#partner-insurance'));
      const selectedPartnerPolicy=eligiblePartnerPolicy ? syncPartnerPolicySummary() : null;
      const partnerMedicineCredit=Number(selectedPartnerPolicy?.dataset.medicineCredit || 1000);
      const partnerPolicyProvider=selectedPartnerPolicy?.dataset.product || 'แผนสุขภาพออนไลน์';
      const partnerPolicyId=selectedPartnerPolicy?.value || 'online-care';
      flowState.entryChannel='partner';
      flowState.partnerPaymentChosen=true;
      flowState.partnerPaymentMethod=paymentMethod;
      // Selecting insurance opens entitlement review; only confirming an eligible
      // policy makes this demo balance zero and records the medicine credit for the
      // post-consult checkout. Self-pay keeps the ฿350 balance and no medicine credit.
      flowState.partnerConsultationBalanceDue=eligiblePartnerPolicy ? 0 : (paymentMethod==='self-pay' ? CONSULTATION_FEE_BAHT : null);
      flowState.partnerMedicineCredit=eligiblePartnerPolicy ? partnerMedicineCredit : 0;
      flowState.coverage=eligiblePartnerPolicy
        ? {provider:partnerPolicyProvider,policyId:partnerPolicyId,consultationCredit:CONSULTATION_FEE_BAHT,medicineCredit:partnerMedicineCredit}
        : {provider:'',policyId:'',consultationCredit:0,medicineCredit:0};
      persistFlowState();
      if(partnerPayment.dataset.go==='intake1') setSelectedCategory('general');
      show(partnerPayment.dataset.go || (flowState.partnerPaymentMethod==='insurance' ? 'partner-insurance' : 'intake-concern'));
      return true;

  return false;
}

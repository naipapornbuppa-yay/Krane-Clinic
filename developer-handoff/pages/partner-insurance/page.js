/* partner-insurance: behavior is supplied by shared libraries. No duplicate per-page implementation.
 * Add page-owned functions here; shared/runtime.js owns ordered initialization.
 */

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_partner_insurance_owned_220(){
document.body.addEventListener('change',event => {
    if(event.target.closest('[data-partner-policy-select]')) syncPartnerPolicySummary();
  });
}

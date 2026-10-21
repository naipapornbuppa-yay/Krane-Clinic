/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_payment_gw_550(){
  // switch panes inside any gateway
  document.body.addEventListener('click', e => {
    const tab = e.target.closest('.gw-tab'); if(!tab) return;
    const gw = tab.closest('[data-gw]'); if(!gw) return;
    const key = tab.dataset.gwTab;
    const screen=gw.closest('.screen');
    activateGatewayMethod(screen?.id,key,{persistMedicationMethod:screen?.id==='payment-gw'});
  });
}


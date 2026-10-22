/* pages/pharmacy-search/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_pharmacy_search_demoNoStock(e, noStock) {
      if(noStock.closest('.rail')){
        seedClinicalDemoStage('pharmacy-search');
        history=seededHistory('pharmacy-search');
      }
      pharmacyForceDecline = true;
      show('pharmacy-search',!noStock.closest('.rail'));
      return true;

  return false;
}

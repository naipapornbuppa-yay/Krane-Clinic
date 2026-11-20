(() => {
  const detail = document.getElementById('treatment-detail');
  const archived = document.querySelector('#activity [data-treatment-source-category][aria-label$=" #KR-10170"]');
  if (!detail || !archived) return;

  // The original completed treatment fixture is in 98120543b, public/b2c/krane-b2c.html#history.
  // Keep it separate from the current treatment, which has a different date and prescription.
  const fixture = {
    treatmentTitle: 'การรักษาผมร่วง',
    treatmentDate: '12/05/2026',
    treatmentRx: 'RX-2026-10170',
    treatmentDiagnosis: 'ผมร่วงจากพันธุกรรม',
    treatmentNote: JSON.stringify({
      findings: ['ผมบางบริเวณแนวไรผมด้านหน้า'],
      assessment: ['ผมร่วงจากพันธุกรรมระยะแรก']
    }),
    treatmentMedicines: JSON.stringify([
      {name: 'Finasteride 1 mg', facts: ['รับประทาน 1 เม็ด วันละครั้ง']},
      {name: 'Minoxidil 5%', facts: ['ทาบนหนังศีรษะ วันละ 2 ครั้ง']}
    ])
  };
  delete archived.dataset.treatmentSourceCategory;
  Object.assign(archived.dataset, fixture);

  const medicineHeading = detail.querySelector('#treatment-medicine-panel .treatment-detail__section-title');
  const prescription = document.createElement('p');
  prescription.className = 'hint krane-archive-prescription';
  prescription.textContent = `ใบสั่งยา · ${fixture.treatmentRx}`;
  medicineHeading?.after(prescription);

  const style = document.createElement('style');
  style.textContent = `
    #treatment-detail:not([data-archived-treatment]) .krane-archive-prescription,
    #treatment-detail[data-archived-treatment] :is(.treatment-care__next, [data-refill-treatment], .related-documents-footer, .treatment-medicine-group__title) { display: none !important; }
  `;
  document.head.append(style);

  // The same renderer opens active, completed, and order-adjacent records; only this
  // archive suppresses future actions and the generic PDF sheet (not visit-specific).
  document.addEventListener('treatment-record-open', event => {
    detail.toggleAttribute('data-archived-treatment', event.target === archived);
  }, true);
})();

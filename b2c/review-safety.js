/* Review-only pages for existing screening questions. These samples never save answers. */
(() => {
  const programmes = [
    { name: 're:body', questions: [
      ['weight.risk.mtc', 'คุณหรือสมาชิกในครอบครัวเคยเป็นมะเร็งไทรอยด์ชนิดเมดัลลารี (Medullary Thyroid Carcinoma) ใช่หรือไม่?', 'Have you or a family member had medullary thyroid carcinoma?'],
      ['weight.risk.esrd', 'คุณเคยเป็นโรคไตวายระยะสุดท้าย (ESRD) ใช่หรือไม่?', 'Have you had end-stage kidney failure (ESRD)?'],
      ['weight.risk.pancreatitis', 'คุณเคยมีภาวะตับอ่อนอักเสบโดยไม่ทราบสาเหตุใช่หรือไม่?', 'Have you had pancreatitis with no known cause?'],
      ['weight.risk.pregnancy', 'คุณกำลังตั้งครรภ์หรือให้นมบุตรใช่หรือไม่?', 'Are you pregnant or breastfeeding?'],
    ] },
    { name: 're:hair', questions: [
      ['hair.scalp_symptoms', 'คุณมีอาการคัน แสบ ปวด สะเก็ด ตุ่ม หรือรอยแดงที่หนังศีรษะร่วมด้วยใช่หรือไม่?', 'Do you also have itching, burning, pain, scaling, bumps, or redness on your scalp?'],
      ['hair.female_cycle_weight', 'คุณมีประจำเดือนมาไม่สม่ำเสมอ หรือน้ำหนักเปลี่ยนแปลงผิดปกติใช่หรือไม่?', 'Do you have irregular periods or unusual weight changes?', false],
      ['hair.female_pregnancy', 'คุณกำลังตั้งครรภ์หรือมีแผนตั้งครรภ์ใช่หรือไม่?', 'Are you pregnant or planning a pregnancy?', false],
    ] },
    { name: 're:flow', questions: [
      ['ed.heart_history', 'คุณเคยเป็นโรคหัวใจ หรือมีอาการผิดปกติขณะออกแรงใช่หรือไม่?', 'Have you had heart disease or unusual symptoms during physical exertion?'],
      ['ed.nitrate_use', 'ปัจจุบันคุณใช้ยาอม ยาพ่น หรือยารักษาอาการเจ็บหน้าอกกลุ่ม Nitrate ใช่หรือไม่?', 'Do you currently use nitrate tablets, sprays, or medicines for chest pain?'],
    ] },
    { name: 'ปรึกษาทั่วไป', nameEn: 'General consultation', questions: [
      ['general.safety.chest', 'เจ็บหน้าอก เป็นลม หรือหายใจลำบาก ใช่หรือไม่?', 'Chest pain, fainting or shortness of breath?'],
      ['general.safety.infection', 'ปวดรุนแรง บวม ไข้ หรือสัญญาณติดเชื้อ ใช่หรือไม่?', 'Severe pain, swelling, fever or infection signs?'],
      ['general.safety.sudden', 'อาการเปลี่ยนแปลงรุนแรงเฉียบพลัน ใช่หรือไม่?', 'Sudden major symptom change?'],
    ] },
  ];
  const path = id => 'review-safety.html?question=' + id;
  window.KraneReviewSafetyGroups = programmes.map(({name, nameEn = name, questions}) => ({
    th: 'คัดกรองความปลอดภัย · ' + name,
    en: 'Safety screening · ' + nameEn,
    safety: true,
    pages: questions.map(([id, th, en]) => [id, path(id), th, en]),
  }));

  const dialog = document.querySelector('[data-review-safety-root]');
  if (!dialog) return;
  const params = new URLSearchParams(location.search);
  const english = params.get('lang') === 'en';
  const questionId = params.get('question');
  const programme = programmes.find(({questions}) => questions.some(([id]) => id === questionId)) || programmes[0];
  const index = Math.max(0, programme.questions.findIndex(([id]) => id === questionId));
  const [id, th, en, stopsCare = true] = programme.questions[index];
  const label = (thai, translated) => english ? translated : thai;
  const title = label('ยืนยันข้อมูลความปลอดภัย', 'Confirm safety information');
  const text = english ? en : th;
  document.documentElement.lang = english ? 'en' : 'th';
  document.title = text + ' · Krane Clinic';
  dialog.querySelector('h1').textContent = title;
  const field = dialog.querySelector('fieldset');
  field.dataset.questionId = id;
  field.querySelector('legend').textContent = text;
  dialog.querySelector('[data-warning-title]').textContent = label('เพื่อความปลอดภัยของคุณ', 'For your safety');
  dialog.querySelector('[data-warning-line1]').textContent = label('รักษาออนไลน์อาจไม่ปลอดภัย', 'Online care may be unsafe.');
  dialog.querySelector('[data-warning-line2]').textContent = label('ควรพบแพทย์ที่โรงพยาบาลค่ะ', 'Please see a doctor at a hospital.');
  const next = dialog.querySelector('[data-next]');
  const back = dialog.querySelector('[data-back]');
  const open = document.querySelector('[data-open]');
  next.textContent = label('ยืนยันและไปต่อ', 'Confirm and continue');
  back.textContent = label('ย้อนกลับ', 'Back');
  open.textContent = title;
  const close = dialog.querySelector('[data-close]');
  close.setAttribute('aria-label', label('ปิดหน้าต่าง', 'Close'));
  const options = [...dialog.querySelectorAll('[data-answer]')];
  function select(option) {
    options.forEach(button => button.setAttribute('aria-checked', String(button === option)));
    next.disabled = stopsCare && option.dataset.answer === 'yes';
    dialog.querySelector('[data-intake-safety-warning]').hidden = !next.disabled;
  }
  options.forEach(button => {
    button.textContent = button.dataset.answer === 'yes' ? label('ใช่', 'Yes') : label('ไม่ใช่', 'No');
    button.addEventListener('click', () => select(button));
  });
  function showQuestion(offset) {
    const question = programme.questions[index + offset];
    if (!question) {
      dialog.close();
      return;
    }
    location.href = path(question[0]) + '&lang=' + document.documentElement.lang;
  }
  next.addEventListener('click', () => showQuestion(1));
  back.addEventListener('click', () => showQuestion(-1));
  close.addEventListener('click', () => dialog.close());
  function show() {
    select(options[0]);
    dialog.showModal();
    dialog.querySelector('h1').focus();
  }
  open.addEventListener('click', show);
  show();
})();

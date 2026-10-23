/* Re:Body editorial structure, adapted from the supplied programme reference.
   Stock interview is explicitly labelled mock pending the real doctor footage. */
window.KraneProgrammeOverview = data => {
  const heroCopy = document.querySelector('.condition-hero__copy');
  const actions = heroCopy.querySelector('.condition-hero__actions');
  const facts = document.createElement('ul');
  facts.className = 'programme-hero-facts';
  facts.innerHTML = '<li><i data-lucide="video" aria-hidden="true"></i>ปรึกษาออนไลน์</li><li><i data-lucide="shield-check" aria-hidden="true"></i>ประเมินโดยแพทย์</li><li><i data-lucide="package-check" aria-hidden="true"></i>จัดยาโดย Fascino</li><li><i data-lucide="calendar-check" aria-hidden="true"></i>ติดตามกับแพทย์</li>';
  heroCopy.append(facts, actions);
  if (data.category !== 'weight') return;
  const main = document.querySelector('main');
  main.classList.add('programme-reference');
  const overview = document.querySelector('#cd-panel-overview');
  const reviews = document.querySelector('#reviews');
  const steps = document.querySelector('#cd-panel-steps');
  const price = document.querySelector('#cd-panel-price');
  const nav = document.querySelector('.cd-tabs');
  const panels = document.querySelector('.cd-panels');
  // Four destinations share the existing scroll and current-section behaviour.
  main.insertBefore(nav, panels);
  overview.after(reviews);
  reviews.dataset.cdPanel = 'reviews';
  const reviewTab = document.createElement('button');
  reviewTab.type = 'button';reviewTab.className = 'cd-tab';reviewTab.id = 'cd-tab-reviews';
  reviewTab.dataset.cdTab = 'reviews';reviewTab.setAttribute('aria-controls', 'reviews');
  reviewTab.textContent = 'รีวิว';
  document.querySelector('#cd-tab-overview').after(reviewTab);

  document.querySelector('[data-lead]').textContent = 'ดูแลน้ำหนักด้วย GLP-1 กับคุณหมอประจำตัวออนไลน์ พร้อมแผนการกิน การออกกำลังกาย และติดตามผล';
  const heroAction = document.querySelector('.condition-hero__actions [data-intake-link]');
  heroAction.firstChild.textContent = 'เริ่มปรึกษาฟรี ';
  const intro = overview.querySelector('.cd-card');
  const copy = document.createElement('div');copy.className = 'programme-intro__copy';
  const heading = document.createElement('h2');heading.className = 'cd-h2';heading.dataset.overviewTitle = '';heading.textContent = intro.querySelector('[data-overview-title]').textContent;
  const paragraph = intro.querySelector('[data-overview-copy]');
  paragraph.textContent = 'คุณหมอประเมินสุขภาพก่อนเริ่มและปรับแผนไปกับคุณ ควบคู่กับการดูแลอาหารและการเคลื่อนไหว เพื่อรักษามวลกล้ามเนื้อและดูแลน้ำหนักในระยะยาว';
  copy.append(heading, paragraph);
  const points = document.createElement('ul');points.className = 'programme-intro__points';
  points.innerHTML = [
    ['clipboard-check', 'ประเมินก่อนเริ่ม', 'ดูสุขภาพโดยรวมและเป้าหมายของคุณ'],
    ['leaf', 'กินและขยับอย่างพอดี', 'วางแผนการกินและออกกำลังกายให้เข้ากับชีวิต'],
    ['calendar-check', 'ติดตามกับคุณหมอ', 'ทบทวนผลและปรับแผนตามความเหมาะสม']
  ].map(([icon,title,text]) => `<li><i data-lucide="${icon}" aria-hidden="true"></i><div><strong>${title}</strong><p>${text}</p></div></li>`).join('');
  copy.append(points);
  const doctor = document.createElement('aside');doctor.className = 'programme-intro__doctor';
  const media = document.createElement('div');media.className = 'programme-intro__media';
  media.innerHTML = '<video controls playsinline muted preload="none" poster="assets/landing/interview-off-camera-poster.jpg" aria-label="วิดีโอจำลองสำหรับจัดหน้า ไม่ใช่บทสัมภาษณ์แพทย์"><source src="assets/landing/interview-off-camera-pexels-6602739.mp4" type="video/mp4"></video>';
  doctor.append(media);
  const designer = document.querySelector('.programme-designer');
  if (designer) doctor.append(designer);
  intro.classList.add('programme-intro');intro.replaceChildren(doctor,copy);
  overview.querySelector('.cd-feature-grid').remove();
  const fit = overview.querySelector('[data-fit-list]');
  fit.innerHTML = ['อยากดูแลน้ำหนักควบคู่กับสุขภาพโดยรวม','ต้องการให้แพทย์ประเมินความเหมาะสมก่อนเริ่ม','อยากมีคุณหมอช่วยวางแผนและติดตามผล','สะดวกปรึกษาและรับการดูแลจากที่บ้าน'].map(text=>`<li>${text}</li>`).join('');
  fit.parentElement.classList.add('programme-fit');

  // Care phases give context; the practical five-step guide stays available.
  const guide = steps.querySelector('.cd-card');
  const detail = document.createElement('details');detail.className = 'programme-start-guide';
  const summary = document.createElement('summary');summary.textContent = 'ดูรายละเอียดการเริ่มต้นและรับยา';
  guide.querySelector('h3').remove();detail.append(summary,guide);
  steps.replaceChildren();
  const journeyHeading = document.createElement('h2');journeyHeading.className = 'cd-h2';journeyHeading.textContent = 'เริ่มง่าย ดูแลต่อเนื่อง';
  const journeyNote = document.createElement('p');journeyNote.className = 'programme-section-note';journeyNote.textContent = '3 ช่วงการดูแล กับแพทย์ประจำตัวของคุณ';
  const phases = document.createElement('ol');phases.className = 'programme-care-phases';
  phases.innerHTML = [
    ['video','คุยกับแพทย์','ประเมินสุขภาพและเลือกแผนที่เหมาะกับคุณ'],
    ['package-check','เริ่มตามแผน','รับคำแนะนำและยา หากแพทย์เห็นว่าเหมาะสม'],
    ['calendar-check','ติดตามและปรับ','ทบทวนผลและปรับแผนร่วมกับคุณหมอ']
  ].map(([icon,title,text],index)=>`<li><div class="programme-phase-visual"><span class="programme-phase-icon" aria-hidden="true"><i data-lucide="${icon}"></i></span><span class="programme-phase-number">0${index+1}</span></div><h3>${title}</h3><p>${text}</p></li>`).join('');
  steps.append(journeyHeading,journeyNote,phases,detail);

  const priceHeading = document.createElement('h2');priceHeading.className = 'cd-h2 programme-price-title';priceHeading.textContent = 'ราคา';price.prepend(priceHeading);
  price.querySelector('[data-programme-price] span').textContent = 'บาท / ยา 1 เดือน';
  const fine = price.querySelector('.cd-price > .cd-fine:not([data-pricing-note])');
  fine.textContent = 'ราคาเริ่มต้นสำหรับยาขนาดเริ่มต้น ไม่รวมค่าปรึกษาและค่าจัดส่ง · บัญชีใหม่ปรึกษาครั้งแรกฟรี';
  price.querySelector('[data-pricing-note]').textContent = 'ไม่มีค่าสมาชิกรายเดือน ตรวจสอบยอดทั้งหมดก่อนชำระเงิน';
  price.querySelector('.cd-card:not(.cd-price) .cd-checklist').innerHTML = ['แพทย์ช่วยตั้งเป้าหมายและติดตามผล','แผนการกินและออกกำลังกายที่เหมาะกับคุณ','แนะนำวิธีใช้ยาและดูแลระหว่างใช้ยา','เติมยาออนไลน์ได้ เมื่อแพทย์อนุมัติ','ติดตามความคืบหน้าได้ในบัญชีของคุณ'].map(text=>`<li>${text}</li>`).join('');
  const priceLink = document.createElement('a');priceLink.className = 'programme-text-link';priceLink.href = 'pricing.html';priceLink.innerHTML = 'ดูค่าปรึกษาและค่าจัดส่ง <i data-lucide="arrow-right" aria-hidden="true"></i>';price.querySelector('.cd-price').append(priceLink);
  const faq = document.querySelector('.cd-faq');
  const faqHead = document.createElement('div');faqHead.className = 'programme-faq-heading';
  faqHead.append(faq.querySelector('h2'));
  faq.append(document.querySelector('.cd-safety-link'));
  faq.prepend(faqHead);
  const firstQuestion = faq.querySelector('summary');
  if (firstQuestion) {
    firstQuestion.firstChild.textContent = 'มีค่าใช้จ่ายอะไรบ้าง และชำระตอนไหน?';
    const answer = firstQuestion.parentElement.querySelector('.cd-faq__answer');
    if (answer) answer.innerHTML = '<p>ค่าใช้จ่ายมี 3 ส่วน: ค่าปรึกษาแพทย์ ค่ายา และค่าจัดส่ง บัญชีใหม่ปรึกษาครั้งแรกฟรี</p><p>ชำระหลังพบแพทย์และยืนยันรายการยาแล้ว โดยระบบจะแสดงยอดรวมให้ตรวจสอบก่อนชำระเงินทุกครั้ง</p>';
  }
  // One open answer at a time keeps a long FAQ easy to scan.
  faq.querySelectorAll('details').forEach(item=>item.name = 'programme-questions');
};

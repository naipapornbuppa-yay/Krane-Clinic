/* Profile ages and occupations are mock presentation data; see content registry. */
window.KraneReviews=[{"id": "weight-02", "category": "weight", "name": "คุณเมย์", "caption": "ประสบการณ์การปรึกษาแพทย์เพื่อดูแลน้ำหนัก", "src": "assets/reviews/weight-02.mp4", "poster": "assets/reviews/weight-02-poster.jpg", "before": "assets/reviews/weight-02-before.jpg", "after": "assets/reviews/weight-02-after.jpg", "exampleMonths": 3, "age": 29, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "กรุงเทพมหานคร"}, {"id": "weight-04", "category": "weight", "name": "คุณพลอย", "caption": "การดูแลน้ำหนักผ่านการปรึกษาแพทย์ออนไลน์", "quote": "เข้ามาปรึกษาคุณหมอ<br>ผ่านออนไลน์ที่เทเลเมดิซีนได้ค่ะ", "src": "assets/reviews/weight-04.mp4", "poster": "assets/reviews/weight-04-poster.jpg", "before": "assets/reviews/weight-04-before.jpg", "after": "assets/reviews/weight-04-after.jpg", "exampleMonths": 4, "age": 32, "occupation": "ธุรกิจส่วนตัว", "profileIsSample": true, "province": "นนทบุรี"}, {"id": "weight-05", "category": "weight", "name": "คุณฝน", "caption": "อีกหนึ่งประสบการณ์การดูแลน้ำหนักกับแพทย์", "src": "assets/reviews/weight-05.mp4", "poster": "assets/reviews/weight-05-poster.jpg", "before": "assets/reviews/weight-05-before.jpg", "after": "assets/reviews/weight-05-after.jpg", "exampleMonths": 3, "age": 24, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "เชียงใหม่"}, {"id": "hair-pha", "category": "hair-loss", "name": "คุณพา", "caption": "ประสบการณ์ดูแลผมร่วงของคุณพา", "quote": "ลองมาปรึกษาคุณหมอ<br>ที่มีความเชี่ยวชาญด้านนี้โดยตรง", "src": "assets/reviews/hair-pha.mp4", "poster": "assets/reviews/hair-pha-poster.jpg", "before": "assets/reviews/hair-pha-before.jpg", "after": "assets/reviews/hair-pha-after.jpg", "exampleMonths": 6, "age": 34, "occupation": "ธุรกิจส่วนตัว", "profileIsSample": true, "province": "ปทุมธานี"}, {"id": "hair-03", "category": "hair-loss", "name": "คุณแป้ง", "caption": "ประสบการณ์การดูแลผมบางผ่านแพทย์ออนไลน์", "quote": "ไม่ค่อยมีเวลาเดินทางไปพบคุณหมอ<br>อันนี้ก็เป็นตัวช่วยอีกทางหนึ่งด้วย", "src": "assets/reviews/hair-03.mp4", "poster": "assets/reviews/hair-03-poster.jpg", "before": "assets/reviews/hair-03-before.jpg", "after": "assets/reviews/hair-03-after.jpg", "exampleMonths": 4, "age": 28, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "ชลบุรี"}, {"id": "confidence-real-med", "category": "re-flow", "name": "คุณต้น", "caption": "ประสบการณ์การปรึกษาแพทย์เรื่องสุขภาพผู้ชาย", "quote": "ตอนนี้ก็มั่นใจขึ้นเยอะ<br>คิดว่าเรามาถูกทางแล้ว", "src": "assets/reviews/confidence-real-med.mp4", "poster": "assets/reviews/confidence-real-med-poster.jpg", "age": 35, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "กรุงเทพมหานคร"}];

/* Supplied testimonials and separately labelled demo reviews never mix. */
window.KraneProgrammeReviews = category =>
  window.KraneReviews.filter(review => review.category === category && !review.isSample);

window.KraneReviewCard = function (review) {
  const card = document.createElement('article');
  card.className = 'public-review-card';
  const rating = review.rating;
  const rated = Number.isInteger(rating) && rating >= 1 && rating <= 5;
  const english = document.documentElement.lang === 'en';
  if (rated) {
    const stars = document.createElement('span');
    stars.className = 'public-review-card__stars';
    stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', english ? `${rating} out of 5 stars` : `คะแนน ${rating} จาก 5 ดาว`);
    card.append(stars);
  }
  const localized = (value) => typeof value === 'string' ? value : value?.[english ? 'en' : 'th'] || '';
  const headline = document.createElement('strong');
  headline.textContent = localized(review.caption);
  card.append(headline);
  if (review.quote) {
    const quote = document.createElement('blockquote');
    quote.textContent = `“${localized(review.quote).replace(/<br\s*\/?\s*>/gi, ' ')}”`;
    card.append(quote);
  }

  const meta = document.createElement('div');
  meta.className = 'public-review-card__meta';
  const initial = review.name.replace(/^คุณ\s*/, '').match(/[ก-ฮA-Z]/i)?.[0] || '–';
  const avatar = document.createElement('span');
  avatar.className = 'public-review-card__initial';
  avatar.textContent = initial;
  avatar.setAttribute('aria-hidden', 'true');

  const identity = document.createElement('div');
  const author = document.createElement('strong');
  author.textContent = `${initial}***`;
  const details = document.createElement('small');
  const age = review.profileIsSample === false && Number.isInteger(review.age) ? `${review.age} ปี` : '';
  details.textContent = [age, localized(review.province)].filter(Boolean).join(' · ');
  identity.append(author);
  if (details.textContent) identity.append(details);
  meta.append(avatar, identity);
  card.append(meta);
  return card;
};


/* Fictional service-experience examples for prototype review only. No real
   identity, location, clinical result, or aggregate score is represented. */
const kraneFictionalReviewCopy = {
  weight: [
    [5, 'เตรียมตัวก่อนนัดง่าย', 'Easy to get ready', 'อ่านขั้นตอนก่อนนัดแล้วรู้ว่าควรเตรียมอะไร', 'The steps told me what to prepare before the visit.'],
    [4, 'เลือกเวลาก่อนยืนยันได้', 'Time options were clear', 'เทียบเวลาที่ว่างได้ก่อนกดยืนยัน', 'I could compare time slots before confirming.'],
    [5, 'กลับมาอ่านสรุปได้', 'The summary was easy to find', 'กลับมาเปิดสรุปการปรึกษาในมือถือได้', 'I could open the consultation summary on my phone.'],
    [4, 'เห็นขั้นตอนชัดเจน', 'Clear next steps', 'หน้าจอบอกว่าถึงขั้นตอนไหนและต้องทำอะไรต่อ', 'The screen showed where I was and what to do next.'],
    [5, 'เปลี่ยนเวลาสะดวก', 'Easy to reschedule', 'หาเมนูเปลี่ยนเวลานัดได้โดยไม่ต้องเริ่มใหม่', 'I could find the rescheduling menu without starting over.'],
    [4, 'อ่านรายการก่อนจบได้', 'Helpful final review', 'มีหน้าสรุปให้เช็กข้อมูลอีกครั้ง', 'There was a summary screen to double-check my details.'],
  ],
  'hair-loss': [
    [5, 'แนบรูปก่อนปรึกษาได้', 'Easy to attach photos', 'หน้าแนบรูปบอกว่าถ่ายมุมไหนบ้าง', 'The upload screen showed which angles to photograph.'],
    [4, 'พิมพ์คำถามในแชตสะดวก', 'Chat was convenient', 'พิมพ์ถามเพิ่มได้โดยไม่ต้องออกจากหน้าปรึกษา', 'I could type a follow-up question without leaving the consultation.'],
    [5, 'ย้อนกลับไปแก้คำตอบได้', 'I could edit my answers', 'กลับไปแก้คำตอบก่อนส่งได้ง่าย', 'It was easy to go back and edit an answer before submitting.'],
    [4, 'เช็กนัดจากมือถือได้', 'Easy to check on mobile', 'หาเวลานัดที่เลือกไว้ได้จากมือถือ', 'I could find my selected appointment time on my phone.'],
    [5, 'หน้าสรุปอ่านง่าย', 'Readable summary', 'หัวข้อแบ่งชัด ไม่ต้องเลื่อนหาข้อมูลนาน', 'Clear headings made the information easy to find.'],
    [4, 'รู้ว่าต้องทำอะไรต่อ', 'I knew what came next', 'แต่ละหน้ามีปุ่มไปต่ออยู่ตำแหน่งเดิม', 'The continue button was in the same place on each screen.'],
  ],
  're-flow': [
    [5, 'เลือกเวลาจากมือถือได้', 'Easy to choose a time', 'เลือกช่วงเวลาที่สะดวกจากมือถือได้', 'I could choose a convenient time on my phone.'],
    [4, 'รู้ว่าห้องรอทำอะไรได้บ้าง', 'The waiting room was clear', 'หน้าห้องรอบอกว่าต้องรออะไรต่อ', 'The waiting screen told me what would happen next.'],
    [5, 'แบบประเมินอ่านง่าย', 'Clear questionnaire', 'คำถามแยกทีละข้อ ไม่ต้องอ่านข้อความยาวทีเดียว', 'Questions were shown one at a time.'],
    [4, 'หาเมนูเอกสารได้ง่าย', 'Easy to find documents', 'กลับมาเปิดเอกสารหลังจบการปรึกษาได้', 'I could reopen the documents after the consultation.'],
    [5, 'ดูสถานะได้ชัด', 'Clear status', 'ข้อความสถานะอยู่ด้านบน หาเจอง่าย', 'The status was easy to find at the top of the screen.'],
    [4, 'ปุ่มย้อนกลับอยู่ที่เดิม', 'Consistent back navigation', 'ย้อนกลับไปดูขั้นตอนก่อนหน้าได้จากที่เดิม', 'I could return to the previous step from the same place.'],
  ],
};

// Locations belong to fictional aliases only, not to the supplied patient stories.
const kraneFictionalProvinces = [
  {th:'กรุงเทพมหานคร', en:'Bangkok'}, {th:'นนทบุรี', en:'Nonthaburi'},
  {th:'เชียงใหม่', en:'Chiang Mai'}, {th:'ชลบุรี', en:'Chon Buri'},
  {th:'ปทุมธานี', en:'Pathum Thani'}, {th:'ขอนแก่น', en:'Khon Kaen'},
];

let kraneFictionalReviewGroupId = 0;
window.KraneFictionalReviewGroup = (category, railClass, heading) => {
  const entries = kraneFictionalReviewCopy[category];
  if (!entries?.length) return null;
  const group = document.createElement('section');
  group.className = 'public-review-demo';
  const label = document.createElement(heading ? 'p' : 'h4');
  label.className = 'public-review-demo__label';
  label.id = 'fictional-review-group-' + (++kraneFictionalReviewGroupId);
  if (heading) {
    heading.id ||= label.id + '-title';
    group.setAttribute('aria-labelledby', heading.id);
    group.setAttribute('aria-describedby', label.id);
  } else {
    group.setAttribute('aria-labelledby', label.id);
  }
  const rail = document.createElement('div');
  rail.className = railClass;
  rail.tabIndex = 0;
  group.append(label, rail);
  function render() {
    const en = document.documentElement.lang === 'en';
    if (heading) heading.textContent = en ? 'What our patients say' : 'เสียงจากผู้ใช้บริการ';
    label.textContent = en ? 'Fictional reviews for demo' : 'รีวิวจำลองเพื่อสาธิต';
    rail.dataset.carouselRail = en ? 'Reviews, page' : 'ความคิดเห็น หน้า';
    rail.replaceChildren(...entries.map(([rating, captionTh, captionEn, quoteTh, quoteEn], index) =>
      window.KraneReviewCard({name: 'ABCDEF'[index], rating, province: kraneFictionalProvinces[index],
        caption: {th:captionTh, en:captionEn}, quote: {th:quoteTh, en:quoteEn}})
    ));
  }
  render();
  document.addEventListener('krane:languagechange', render);
  return group;
};


window.KraneSuppliedReviewGroup = rail => {
  const group = document.createElement('section');
  group.className = 'public-review-supplied';
  const label = document.createElement('h4');
  label.className = 'public-review-demo__label';
  label.id = 'supplied-review-group-' + (++kraneFictionalReviewGroupId);
  group.setAttribute('aria-labelledby', label.id);
  const labelGroup = () => {
    label.textContent = document.documentElement.lang === 'en' ? 'Patient stories' : 'เสียงจากผู้ใช้บริการ';
  };
  labelGroup();
  document.addEventListener('krane:languagechange', labelGroup);
  group.append(label, rail);
  return group;
};

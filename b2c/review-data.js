/* Profile ages and occupations are mock presentation data; see content registry. */
window.KraneReviews=[{"id": "weight-02", "category": "weight", "name": "คุณเมย์", "caption": "ประสบการณ์การปรึกษาแพทย์เพื่อดูแลน้ำหนัก", "src": "assets/reviews/weight-02.mp4", "poster": "assets/reviews/weight-02-poster.jpg", "before": "assets/reviews/weight-02-before.jpg", "after": "assets/reviews/weight-02-after.jpg", "exampleMonths": 3, "age": 29, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "กรุงเทพมหานคร"}, {"id": "weight-04", "category": "weight", "name": "คุณพลอย", "caption": "การดูแลน้ำหนักผ่านการปรึกษาแพทย์ออนไลน์", "quote": "เข้ามาปรึกษาคุณหมอ<br>ผ่านออนไลน์ที่เทเลเมดิซีนได้ค่ะ", "src": "assets/reviews/weight-04.mp4", "poster": "assets/reviews/weight-04-poster.jpg", "before": "assets/reviews/weight-04-before.jpg", "after": "assets/reviews/weight-04-after.jpg", "exampleMonths": 4, "age": 32, "occupation": "ธุรกิจส่วนตัว", "profileIsSample": true, "province": "นนทบุรี"}, {"id": "weight-05", "category": "weight", "name": "คุณฝน", "caption": "อีกหนึ่งประสบการณ์การดูแลน้ำหนักกับแพทย์", "src": "assets/reviews/weight-05.mp4", "poster": "assets/reviews/weight-05-poster.jpg", "before": "assets/reviews/weight-05-before.jpg", "after": "assets/reviews/weight-05-after.jpg", "exampleMonths": 3, "age": 24, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "เชียงใหม่"}, {"id": "hair-pha", "category": "hair-loss", "name": "คุณพา", "caption": "ประสบการณ์ดูแลผมร่วงของคุณพา", "quote": "ลองมาปรึกษาคุณหมอ<br>ที่มีความเชี่ยวชาญด้านนี้โดยตรง", "src": "assets/reviews/hair-pha.mp4", "poster": "assets/reviews/hair-pha-poster.jpg", "before": "assets/reviews/hair-pha-before.jpg", "after": "assets/reviews/hair-pha-after.jpg", "exampleMonths": 6, "age": 34, "occupation": "ธุรกิจส่วนตัว", "profileIsSample": true, "province": "ปทุมธานี"}, {"id": "hair-03", "category": "hair-loss", "name": "คุณแป้ง", "caption": "ประสบการณ์การดูแลผมบางผ่านแพทย์ออนไลน์", "quote": "ไม่ค่อยมีเวลาเดินทางไปพบคุณหมอ<br>อันนี้ก็เป็นตัวช่วยอีกทางหนึ่งด้วย", "src": "assets/reviews/hair-03.mp4", "poster": "assets/reviews/hair-03-poster.jpg", "before": "assets/reviews/hair-03-before.jpg", "after": "assets/reviews/hair-03-after.jpg", "exampleMonths": 4, "age": 28, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "ชลบุรี"}, {"id": "confidence-real-med", "category": "re-flow", "name": "คุณต้น", "caption": "ประสบการณ์การปรึกษาแพทย์เรื่องสุขภาพผู้ชาย", "quote": "ตอนนี้ก็มั่นใจขึ้นเยอะ<br>คิดว่าเรามาถูกทางแล้ว", "src": "assets/reviews/confidence-real-med.mp4", "poster": "assets/reviews/confidence-real-med-poster.jpg", "age": 35, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "กรุงเทพมหานคร"}];

/* Fictional comments for the programme review rails. Keep them separate from
   the supplied reviews used by stories and testimonial media. */
window.KraneProgrammeReviews = (() => {
  const sampleProgrammeComments = {
    weight: [
      [5, 'คุยเรื่องเป้าหมายได้เต็มที่', 'หมอฟังว่าชีวิตประจำวันเราเป็นแบบไหน แล้วค่อยช่วยวางเป้าหมายที่ทำได้'],
      [4, 'เข้าใจแผนง่ายขึ้น', 'หมอสรุปทีละข้อ อยากให้มีรายการสรุปสั้น ๆ ไว้เปิดดูหลังคุยด้วย'],
      [5, 'นัดคุยได้จากที่บ้าน', 'เลือกเวลาหลังเลิกงานได้ ไม่ต้องเผื่อเวลาเดินทางไปคลินิก'],
      [5, 'มีเวลาถามเรื่องอาหาร', 'ได้ถามว่าถ้าต้องกินข้าวนอกบ้านบ่อย ๆ ควรเริ่มปรับตรงไหน'],
      [4, 'อ่านขั้นตอนได้ชัดเจน', 'ก่อนคุยมีแบบประเมินให้เตรียมตัว อยากให้บอกเวลาโดยประมาณไว้ด้วย'],
      [5, 'คุยเรื่องน้ำหนักได้สบายใจ', 'รู้สึกว่าหมอรับฟัง และอธิบายตัวเลือกให้ตัดสินใจได้เอง'],
    ],
    'hair-loss': [
      [5, 'รู้ว่าควรเริ่มดูแลจากตรงไหน', 'หมอถามทั้งเรื่องผมร่วงและหนังศีรษะ แล้วสรุปสิ่งที่ควรสังเกตต่อ'],
      [4, 'ส่งรูปก่อนคุยได้', 'ส่งรูปประกอบได้สะดวก อยากมีตัวอย่างมุมถ่ายรูปไว้ตั้งแต่แรก'],
      [5, 'อธิบายให้เห็นภาพ', 'หมออธิบายว่าผมร่วงกับผมบางสังเกตต่างกันอย่างไร ใช้คำง่าย ๆ'],
      [5, 'ถามเรื่องที่กังวลได้ครบ', 'ได้เล่าว่าใช้ผลิตภัณฑ์อะไรอยู่ และถามเรื่องการดูแลระหว่างรอนัดติดตาม'],
      [4, 'ปรึกษาผ่านแชตสะดวก', 'พิมพ์อธิบายอาการได้ตามถนัด อยากให้แจ้งเตือนชัดขึ้นตอนหมอตอบ'],
      [5, 'นัดติดตามชัดเจน', 'หมอบอกว่าครั้งหน้าควรเตรียมอะไรไว้คุยต่อและควรเก็บรูปแบบไหน'],
    ],
    're-flow': [
      [5, 'คุยได้เป็นส่วนตัว', 'เลือกคุยจากที่บ้านได้ เลยกล้าเล่ารายละเอียดที่กังวลมากขึ้น'],
      [4, 'แบบประเมินช่วยเตรียมตัว', 'คำถามก่อนคุยช่วยให้นึกออกว่าจะเล่าอะไร อยากเห็นเวลาที่ใช้กรอกล่วงหน้า'],
      [5, 'หมออธิบายตรงไปตรงมา', 'ได้ถามทั้งเรื่องที่กังวลและเรื่องที่ไม่แน่ใจ หมออธิบายทีละข้อ'],
      [5, 'เลือกเวลาที่สะดวกได้', 'นัดช่วงเย็นและคุยจากมือถือได้ เหมาะกับวันที่เวลาค่อนข้างจำกัด'],
      [4, 'ถามต่อได้โดยไม่ต้องรีบ', 'ชอบที่หมอเปิดให้ถามเพิ่ม อยากให้ขั้นตอนนัดติดตามเห็นง่ายขึ้น'],
      [5, 'สบายใจตั้งแต่เริ่มคุย', 'หมอค่อย ๆ ถามและให้เวลาอธิบาย ทำให้คุยเรื่องส่วนตัวได้ง่ายขึ้น'],
    ],
  };

  return category => [
    ...window.KraneReviews.filter(review => review.category === category),
    ...(sampleProgrammeComments[category] || []).map(([rating, caption, quote]) => ({
      rating, caption, quote, isSample: true,
    })),
  ];
})();

window.KraneReviewCard = function (review) {
  const card = document.createElement('article');
  card.className = 'public-review-card';
  const rating = review.rating;
  const rated = Number.isInteger(rating) && rating >= 1 && rating <= 5;
  const english = document.documentElement.lang === 'en';
  const stars = document.createElement('span');
  stars.className = 'public-review-card__stars';
  stars.textContent = rated ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '☆☆☆☆☆';
  if (rated) {
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', english ? `${rating} out of 5 stars` : `คะแนน ${rating} จาก 5 ดาว`);
  } else {
    stars.setAttribute('aria-hidden', 'true');
    stars.classList.add('is-unrated');
  }

  const headline = document.createElement('strong');
  headline.textContent = review.caption;
  card.append(stars, headline);
  if (review.quote) {
    const quote = document.createElement('blockquote');
    quote.textContent = `“${review.quote.replace(/<br\s*\/?\s*>/gi, ' ')}”`;
    card.append(quote);
  }

  const meta = document.createElement('div');
  meta.className = 'public-review-card__meta';
  const initial = review.isSample ? 'ต' : review.name.replace(/^คุณ\s*/, '').match(/[ก-ฮA-Z]/i)?.[0] || '–';
  const avatar = document.createElement('span');
  avatar.className = 'public-review-card__initial';
  avatar.textContent = initial;
  avatar.setAttribute('aria-hidden', 'true');

  const identity = document.createElement('div');
  const author = document.createElement('strong');
  author.textContent = review.isSample ? (english ? 'Sample review' : 'รีวิวตัวอย่าง') : `${initial}***`;
  const details = document.createElement('small');
  const age = review.profileIsSample === false && Number.isInteger(review.age) ? `${review.age} ปี` : '';
  // Keep each field in its own text node so the exact-string TH/EN layer can
  // translate existing province/age labels instead of an unknown joined string.
  const detailParts = [review.isSample && (english ? 'Fictional example' : 'ข้อมูลสมมติ'), age, review.province, !rated && (english ? 'No rating yet' : 'ยังไม่มีคะแนน')].filter(Boolean);
  detailParts.forEach((part, index) => {
    if (index) details.append(' · ');
    const field = document.createElement('span');
    field.textContent = part;
    details.append(field);
  });
  identity.append(author, details);
  meta.append(avatar, identity);
  card.append(meta);
  return card;
};

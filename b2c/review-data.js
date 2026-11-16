/* Profile ages and occupations are mock presentation data; see content registry. */
window.KraneReviews=[{"id": "weight-02", "category": "weight", "name": "คุณเมย์", "caption": "ประสบการณ์การปรึกษาแพทย์เพื่อดูแลน้ำหนัก", "src": "assets/reviews/weight-02.mp4", "poster": "assets/reviews/weight-02-poster.jpg", "before": "assets/reviews/weight-02-before.jpg", "after": "assets/reviews/weight-02-after.jpg", "exampleMonths": 3, "age": 29, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "กรุงเทพมหานคร"}, {"id": "weight-04", "category": "weight", "name": "คุณพลอย", "caption": "การดูแลน้ำหนักผ่านการปรึกษาแพทย์ออนไลน์", "quote": "เข้ามาปรึกษาคุณหมอ<br>ผ่านออนไลน์ที่เทเลเมดิซีนได้ค่ะ", "src": "assets/reviews/weight-04.mp4", "poster": "assets/reviews/weight-04-poster.jpg", "before": "assets/reviews/weight-04-before.jpg", "after": "assets/reviews/weight-04-after.jpg", "exampleMonths": 4, "age": 32, "occupation": "ธุรกิจส่วนตัว", "profileIsSample": true, "province": "นนทบุรี"}, {"id": "weight-05", "category": "weight", "name": "คุณฝน", "caption": "อีกหนึ่งประสบการณ์การดูแลน้ำหนักกับแพทย์", "src": "assets/reviews/weight-05.mp4", "poster": "assets/reviews/weight-05-poster.jpg", "before": "assets/reviews/weight-05-before.jpg", "after": "assets/reviews/weight-05-after.jpg", "exampleMonths": 3, "age": 24, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "เชียงใหม่"}, {"id": "hair-pha", "category": "hair-loss", "name": "คุณพา", "caption": "ประสบการณ์ดูแลผมร่วงของคุณพา", "quote": "ลองมาปรึกษาคุณหมอ<br>ที่มีความเชี่ยวชาญด้านนี้โดยตรง", "src": "assets/reviews/hair-pha.mp4", "poster": "assets/reviews/hair-pha-poster.jpg", "before": "assets/reviews/hair-pha-before.jpg", "after": "assets/reviews/hair-pha-after.jpg", "exampleMonths": 6, "age": 34, "occupation": "ธุรกิจส่วนตัว", "profileIsSample": true, "province": "ปทุมธานี"}, {"id": "hair-03", "category": "hair-loss", "name": "คุณแป้ง", "caption": "ประสบการณ์การดูแลผมบางผ่านแพทย์ออนไลน์", "quote": "ไม่ค่อยมีเวลาเดินทางไปพบคุณหมอ<br>อันนี้ก็เป็นตัวช่วยอีกทางหนึ่งด้วย", "src": "assets/reviews/hair-03.mp4", "poster": "assets/reviews/hair-03-poster.jpg", "before": "assets/reviews/hair-03-before.jpg", "after": "assets/reviews/hair-03-after.jpg", "exampleMonths": 4, "age": 28, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "ชลบุรี"}, {"id": "confidence-real-med", "category": "re-flow", "name": "คุณต้น", "caption": "ประสบการณ์การปรึกษาแพทย์เรื่องสุขภาพผู้ชาย", "quote": "ตอนนี้ก็มั่นใจขึ้นเยอะ<br>คิดว่าเรามาถูกทางแล้ว", "src": "assets/reviews/confidence-real-med.mp4", "poster": "assets/reviews/confidence-real-med-poster.jpg", "age": 35, "occupation": "พนักงานออฟฟิศ", "profileIsSample": true, "province": "กรุงเทพมหานคร"}];

window.KraneReviewCard = function (review) {
  const card = document.createElement('article');
  card.className = 'public-review-card';
  const rating = review.rating;
  const rated = Number.isFinite(rating) && rating >= 1 && rating <= 5;
  const english = document.documentElement.lang === 'en';
  const stars = document.createElement('span');
  stars.className = 'public-review-card__stars';
  stars.textContent = !rated ? '☆☆☆☆☆' : rating === 5 ? '★★★★★' : '★★★★☆';
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
  details.textContent = [age, review.province, !rated && (english ? 'No rating yet' : 'ยังไม่มีคะแนน')]
    .filter(Boolean).join(' · ');
  identity.append(author, details);
  meta.append(avatar, identity);
  card.append(meta);
  return card;
};

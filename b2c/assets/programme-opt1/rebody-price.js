(() => {
  const section = document.querySelector('[data-programme="rebody"] .opt-price');
  if (!section || section.dataset.pricingSource === 'pricing.html') return;
  section.classList.add('rebody-pricing');
  section.dataset.pricingSource = 'pricing.html';
  section.setAttribute('aria-labelledby', 'rebody-price-title');
  // Reuse the re:body card from pricing.html on gh-pages, including its supplied image,
  // rates, benefit icons and destination. Only layout wrappers differ.
  section.innerHTML = '<div class="opt-wrap"><h2 id="rebody-price-title">รู้ราคาก่อน ทุกขั้นตอน</h2>' +
    "<article class=\"pricing-card\">\n<div class=\"pricing-card__image pricing-card__image--weight\"><img class=\"pricing-card__waist\" src=\"assets/product-hero/weight-care-waist-crop-v2.png\" width=\"1536\" height=\"1024\" loading=\"lazy\" decoding=\"async\" alt=\"\"><header>\n<h3>re:body</h3>\n<p class=\"\">ดูแลและควบคุมน้ำหนัก</p>\n</header></div>\n<div class=\"pricing-rates\">\n<p class=\"pricing-eyebrow\">เริ่มต้น</p>\n<div class=\"pricing-rate\">\n<div>\n<h4>ยาฉีดชนิดปากกา</h4>\n<small>ขนาดเริ่มต้น 1 ด้าม</small>\n</div>\n<p class=\"pricing-amount\">\n<span>฿</span>\n<strong>9,999</strong>\n<small>/ เดือน <sup>*</sup>\n</small>\n</p>\n</div>\n</div>\n<div class=\"pricing-benefits\">\n<h4>จุดเด่นของโปรแกรม</h4>\n<ul>\n<li>\n<i data-lucide=\"target\" aria-hidden=\"true\">\n</i>\n<span>แพทย์ช่วยตั้งเป้าหมายที่ทำได้จริง</span>\n</li>\n<li>\n<i data-lucide=\"leaf\" aria-hidden=\"true\">\n</i>\n<span>แผนการกินและออกกำลังกายเฉพาะคุณ</span>\n</li>\n<li>\n<i data-lucide=\"calendar\" aria-hidden=\"true\">\n</i>\n<span>นัดติดตามผลกับแพทย์ประจำตัว</span>\n</li>\n<li>\n<i data-lucide=\"refresh-cw\" aria-hidden=\"true\">\n</i>\n<span>เติมยาออนไลน์ได้สะดวก เมื่อแพทย์อนุมัติ</span>\n</li>\n<li>\n<i data-lucide=\"chart-no-axes-combined\" aria-hidden=\"true\">\n</i>\n<span>ติดตามความคืบหน้าได้ที่โปรไฟล์</span>\n</li>\n</ul>\n</div>\n<div class=\"pricing-actions\">\n<a class=\"pricing-action\" href=\"condition-detail.html?condition=weight\" target=\"_parent\">ดูโปรแกรม</a>\n</div>\n</article>" +
    '</div>';
  const card = section.querySelector('.pricing-card');
  card.setAttribute('aria-label', 'ราคาโปรแกรม re:body');
  const content = document.createElement('div');
  content.className = 'pricing-card__content';
  const consultation = document.createElement('div');
  consultation.className = 'pricing-card__consult';
  const footnote = document.createElement('p');
  footnote.className = 'pricing-footnote';
  footnote.textContent = "* ราคาค่ายายังไม่รวมค่าปรึกษาแพทย์และค่าจัดส่ง · บัญชีใหม่ปรึกษาครั้งแรกฟรี";
  consultation.append(card.querySelector('.pricing-benefits'), card.querySelector('.pricing-actions'), footnote);
  content.append(card.querySelector('.pricing-rates'), consultation);
  card.append(content);
  window.lucide?.createIcons({ attrs: { 'stroke-width': 1.6 } });
})();

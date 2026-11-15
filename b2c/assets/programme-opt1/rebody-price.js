/* The final programmes use the public pricing cards in landscape or portrait layout. */
(() => {
  const page = document.querySelector('main[data-programme]');
  if (!page) return;
  const cards = {
    rebody: `
<article class="pricing-card">
<div class="pricing-card__image pricing-card__image--weight"><img class="pricing-card__waist" src="assets/product-hero/weight-care-waist-crop-v2.png" width="1536" height="1024" loading="lazy" decoding="async" alt=""><header>
<h3>re:body</h3>
<p class="">ดูแลและควบคุมน้ำหนัก</p>
</header></div>
<div class="pricing-rates">
<p class="pricing-eyebrow">เริ่มต้น</p>
<div class="pricing-rate">
<div>
<h4>ยาฉีดชนิดปากกา</h4>
<small>ขนาดเริ่มต้น 1 ด้าม</small>
</div>
<p class="pricing-amount">
<span>฿</span>
<strong>9,999</strong>
<small>/ เดือน <sup>*</sup>
</small>
</p>
</div>
</div>
<div class="pricing-benefits">
<h4>จุดเด่นของโปรแกรม</h4>
<ul>
<li>
<i data-lucide="target" aria-hidden="true">
</i>
<span>แพทย์ช่วยตั้งเป้าหมายที่ทำได้จริง</span>
</li>
<li>
<i data-lucide="leaf" aria-hidden="true">
</i>
<span>แผนการกินและออกกำลังกายเฉพาะคุณ</span>
</li>
<li>
<i data-lucide="calendar" aria-hidden="true">
</i>
<span>นัดติดตามผลกับแพทย์ประจำตัว</span>
</li>
<li>
<i data-lucide="refresh-cw" aria-hidden="true">
</i>
<span>เติมยาออนไลน์ได้สะดวก เมื่อแพทย์อนุมัติ</span>
</li>
<li>
<i data-lucide="chart-no-axes-combined" aria-hidden="true">
</i>
<span>ติดตามความคืบหน้าได้ที่โปรไฟล์</span>
</li>
</ul>
</div>
<div class="pricing-actions">
<a class="pricing-action" href="condition-detail.html?condition=weight" target="_parent">ดูโปรแกรม</a>
</div>
</article>
`,
    rehair: `
<article class="pricing-card">
<div class="pricing-card__image"><img class="pricing-card__hair" src="assets/optimized-web/rehair-hand-on-head-20261115.webp" width="1920" height="1072" loading="lazy" decoding="async" alt=""><header>
<h3>re:hair</h3>
<p class="">ดูแลผมบาง ผมร่วง</p>
</header></div>
<div class="pricing-rates">
<p class="pricing-eyebrow">เริ่มต้น</p>
<div class="pricing-rate">
<div>
<h4>ยาเม็ดรับประทาน</h4>
<small>30 เม็ด</small>
</div>
<p class="pricing-amount">
<span>฿</span>
<strong>270</strong>
<small>/ เดือน <sup>*</sup>
</small>
</p>
</div>
<div class="pricing-rate">
<div>
<h4>ยาเม็ด + ยาทาภายนอก</h4>
<small>30 เม็ด และ 1 ขวด (30 มล.)</small>
</div>
<p class="pricing-amount">
<span>฿</span>
<strong>700</strong>
<small>/ เดือน <sup>*</sup>
</small>
</p>
</div>
</div>
<div class="pricing-benefits">
<h4>จุดเด่นของโปรแกรม</h4>
<ul>
<li>
<i data-lucide="search" aria-hidden="true">
</i>
<span>แพทย์ช่วยวิเคราะห์สาเหตุที่ผมร่วง</span>
</li>
<li>
<i data-lucide="camera" aria-hidden="true">
</i>
<span>ถ่ายภาพติดตามผลร่วมกับแพทย์</span>
</li>
<li>
<i data-lucide="calendar" aria-hidden="true">
</i>
<span>นัดติดตามผลกับแพทย์ประจำตัว</span>
</li>
<li>
<i data-lucide="refresh-cw" aria-hidden="true">
</i>
<span>เติมยาออนไลน์ได้สะดวก เมื่อแพทย์อนุมัติ</span>
</li>
<li>
<i data-lucide="chart-no-axes-combined" aria-hidden="true">
</i>
<span>ติดตามความคืบหน้าได้ที่โปรไฟล์</span>
</li>
</ul>
</div>
<div class="pricing-actions">
<a class="pricing-action" href="condition-detail.html?condition=hair-loss" target="_parent">ดูโปรแกรม</a>
</div>
</article>
`,
    reflow: `
<article class="pricing-card">
<div class="pricing-card__image"><img src="assets/product-hero/flow-hands-refined-v5.png" width="1536" height="1024" loading="lazy" decoding="async" alt=""><header>
<h3>re:flow</h3>
<p class="">ฟื้นฟูสมรรถภาพทางเพศ</p>
</header></div>
<div class="pricing-rates">
<p class="pricing-eyebrow">เริ่มต้น</p>
<div class="pricing-rate">
<div>
<h4>ยาสามัญ</h4>
<small>ยาเม็ดรับประทาน 4 เม็ด</small>
</div>
<p class="pricing-amount">
<span>฿</span>
<strong>200</strong>
<small>/ แผง <sup>*</sup>
</small>
</p>
</div>
<div class="pricing-rate">
<div>
<h4>ยาต้นแบบ</h4>
<small>ยาเม็ดรับประทาน 4 เม็ด</small>
</div>
<p class="pricing-amount">
<span>฿</span>
<strong>2,200</strong>
<small>/ แผง <sup>*</sup>
</small>
</p>
</div>
</div>
<div class="pricing-benefits">
<h4>จุดเด่นของโปรแกรม</h4>
<ul>
<li>
<i data-lucide="message-square" aria-hidden="true">
</i>
<span>ปรึกษาแพทย์แบบส่วนตัว</span>
</li>
<li>
<i data-lucide="search" aria-hidden="true">
</i>
<span>แพทย์แนะนำการรักษาที่เหมาะกับคุณ</span>
</li>
<li>
<i data-lucide="calendar" aria-hidden="true">
</i>
<span>นัดติดตามผลกับแพทย์ประจำตัว</span>
</li>
<li>
<i data-lucide="refresh-cw" aria-hidden="true">
</i>
<span>เติมยาออนไลน์ได้สะดวก เมื่อแพทย์อนุมัติ</span>
</li>
<li>
<i data-lucide="package" aria-hidden="true">
</i>
<span>จัดส่งยาในบรรจุภัณฑ์มิดชิด</span>
</li>
</ul>
</div>
<div class="pricing-actions">
<a class="pricing-action" href="condition-detail.html?condition=re-flow" target="_parent">ดูโปรแกรม</a>
</div>
</article>
`,
  };
  const categories = {rebody:'weight', rehair:'hair-skin', reflow:'sexual-health'};
  const key = page.dataset.programme;
  const category = categories[key];
  const programme = key.replace('re', 're:');
  const section = page.querySelector('.opt-price');
  section.classList.add('rebody-pricing');
  section.dataset.pricingSource = 'pricing.html';
  section.setAttribute('aria-labelledby', 'programme-price-title');
  section.innerHTML = '<div class="opt-wrap"><h2 id="programme-price-title">ราคาโปรแกรม</h2>' + cards[key] + '</div>';
  const card = section.querySelector('.pricing-card');
  card.setAttribute('aria-label', 'ราคาโปรแกรม ' + programme);
  const button = card.querySelector('.pricing-action');
  button.href = 'krane-b2c.html?entry=direct&fresh=1&category=' + category + '#intake1';
  button.textContent = 'เริ่มปรึกษา';
  const content = document.createElement('div');
  content.className = 'pricing-card__content';
  const consultation = document.createElement('div');
  consultation.className = 'pricing-card__consult';
  const footnote = document.createElement('p');
  footnote.className = 'pricing-footnote';
  footnote.textContent = "* ราคาค่ายายังไม่รวมค่าปรึกษาแพทย์และค่าจัดส่ง · บัญชีใหม่ปรึกษาครั้งแรกฟรี";
  consultation.append(card.querySelector('.pricing-benefits'), card.querySelector('.pricing-actions'));
  content.append(card.querySelector('.pricing-rates'), consultation);
  card.append(content);
  card.after(footnote);
  window.lucide?.createIcons({ attrs: { 'stroke-width': 1.6 } });
})();

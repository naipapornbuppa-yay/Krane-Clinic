(() => {
  const section = document.querySelector('[data-programme="rebody"] .opt-price');
  if (!section || section.classList.contains('rebody-pricing')) return;
  const intake = section.querySelector('a.opt-cta')?.getAttribute('href') || 'krane-b2c.html?entry=direct&fresh=1&category=weight#intake1';
  section.classList.add('rebody-pricing');
  section.setAttribute('aria-labelledby', 'rebody-price-title');
  section.innerHTML = `
    <div class="opt-wrap">
      <h2 id="rebody-price-title">รู้ราคาก่อน ทุกขั้นตอน</h2>
      <article class="rebody-pricing-card" aria-label="ราคาและการดูแล re:body">
        <div class="rebody-pricing-photo">
          <img src="assets/programme-opt1/body-doctor.webp" alt="แพทย์ผู้ให้คำปรึกษาด้านการดูแลน้ำหนัก" loading="lazy" decoding="async">
          <header><h3>re:body</h3><p>ดูแลน้ำหนัก กับแผนเฉพาะตัว</p></header>
        </div>
        <div class="rebody-pricing-content">
          <div class="rebody-pricing-rates">
            <p class="rebody-pricing-eyebrow">เริ่มต้น</p>
            <dl>
              <div class="rebody-pricing-rate"><dt>ค่าปรึกษาแพทย์<small>ปรึกษาออนไลน์</small></dt><dd><span>฿</span><strong>350</strong><small>/ ครั้ง</small></dd></div>
              <div class="rebody-pricing-rate"><dt>ค่าจัดส่ง<small>ตรวจสอบก่อนยืนยัน</small></dt><dd><span>฿</span><strong>50</strong><small>/ ครั้ง</small></dd></div>
            </dl>
          </div>
          <div class="rebody-pricing-consult">
            <div class="rebody-pricing-benefits">
              <h4>จุดเด่นของโปรแกรม</h4>
              <ul>
                <li><i data-lucide="search" aria-hidden="true"></i><span>แพทย์ประเมินสุขภาพรายบุคคล</span></li>
                <li><i data-lucide="clipboard-list" aria-hidden="true"></i><span>วางแผนดูแลให้เหมาะกับคุณ</span></li>
                <li><i data-lucide="calendar-days" aria-hidden="true"></i><span>นัดติดตามกับแพทย์ประจำตัว</span></li>
                <li><i data-lucide="refresh-cw" aria-hidden="true"></i><span>ทบทวนและปรับแผนร่วมกับแพทย์</span></li>
                <li><i data-lucide="chart-no-axes-combined" aria-hidden="true"></i><span>ติดตามความคืบหน้าได้ที่โปรไฟล์</span></li>
              </ul>
            </div>
            <a class="opt-cta rebody-pricing-action">เริ่มปรึกษาแพทย์</a>
            <p class="rebody-pricing-note">เลือกแผนหลังแพทย์ประเมิน และตรวจสอบค่าใช้จ่ายก่อนยืนยันคำสั่งซื้อ<br><a href="pricing.html">ดูรายละเอียดราคา →</a></p>
          </div>
        </div>
      </article>
    </div>`;
  section.querySelector('.rebody-pricing-action').setAttribute('href', intake);
  window.lucide?.createIcons({ attrs: { 'stroke-width': 1.5 } });
})();

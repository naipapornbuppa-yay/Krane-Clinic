/* Shared public footer. Copy: Doctor info / footer details, 19 October 2026.
   Null destinations are intentionally unavailable until approved URLs exist. */
(() => {
  const groups = [
    { id: 'services', title: ['บริการของเรา', 'Our Service'], items: [
      ['ปรึกษาอาการทั่วไป', 'General Consultation', 'general-consultation.html'],
      ['re:body', 're:body', 'rebody-opt1/index.html'],
      ['re:hair', 're:hair', 'rehair-opt1/index.html'],
      ['re:flow', 're:flow', 'reflow-opt1/index.html'],
      ['เติมยาออนไลน์', 'Online Refills', 'online-refills.html'],
      ['สั่งยาตามใบสั่งแพทย์', 'Prescription Delivery', 'prescription-delivery.html']
    ] },
    { id: 'about', title: ['เกี่ยวกับเรา', 'About Us'], items: [
      ['เกี่ยวกับ Krane', 'About Krane', 'about.html'],
      ['วิธีใช้งาน', 'How It Works', 'how-it-works.html'],
      ['ทีมแพทย์ของเรา', 'Our Medical Team', 'doctors.html'],
      ['คลังความรู้สุขภาพ', 'Health Library', 'articles.html'],
      ['ร่วมงานกับเรา', 'Careers', 'careers.html']
    ] },
    { id: 'support', title: ['ช่วยเหลือ', 'Support'], items: [
      ['ติดต่อเรา', 'Contact Us', 'contact.html'],
      ['คำถามที่พบบ่อย', 'FAQ', 'faq.html'],
      ['การคืนสินค้าและคืนเงิน', 'Returns & Refunds', 'returns-refunds.html'],
      ['ราคา', 'Pricing', 'pricing.html']
    ] },
    { id: 'legal', title: ['กฎหมาย', 'Legal'], items: [
      ['ข้อกำหนดและเงื่อนไข', 'Terms and Conditions', 'terms.html'],
      ['นโยบายความเป็นส่วนตัว', 'Privacy Policy', 'privacy.html'],
      ['นโยบายคุกกี้', 'Cookies Policy', 'cookies.html'],
      ['ตั้งค่าคุกกี้', 'Manage Cookies', 'cookies.html#controls']
    ] }
  ];
  const copy = {
    description: ['การดูแลสุขภาพสำหรับผู้ชายยุคใหม่ บนพื้นฐานวิทยาศาสตร์การแพทย์ พร้อมแผนเฉพาะบุคคลที่ออกแบบให้เหมาะกับคุณ', 'Healthcare for modern men, grounded in medical science, with a personal plan designed around you.'],
    licence: ['เครน คลินิกเวชกรรม 10101017669', 'Krane Medical Clinic, licence 10101017669'],
    disclaimer: ['*บริการการแพทย์ทางไกลให้บริการโดยแพทย์ที่มีใบอนุญาต ตัวเลือกการสั่งยาขึ้นอยู่กับการประเมินทางคลินิก ข้อมูลบนเว็บไซต์นี้มีวัตถุประสงค์เพื่อให้ข้อมูลเท่านั้นและไม่ทดแทนคำแนะนำทางการแพทย์', '*Telemedicine is provided by licensed doctors. Prescribing options depend on clinical assessment. The information on this site is for information only and does not replace medical advice.'],
    unavailable: [' — ยังไม่พร้อมใช้งาน', ' — unavailable'],
    social: ['ช่องทางโซเชียลมีเดีย', 'Social channels']
  };
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const label = (key, words, className = '') => '<span class="' + className + '" data-i18n="footer.' + key + '" data-footer-copy data-th="' + escape(words[0]) + '" data-en="' + escape(words[1]) + '">' + escape(words[0]) + '</span>';
  const unavailable = (key, words, icon = '') => '<span class="kf__pending" role="link" aria-disabled="true">' + icon + label(key, words, icon ? 'kf__sr-only' : '') + label(key + '.unavailable', copy.unavailable, 'kf__sr-only') + '</span>';
  const link = (item, key) => {
    const [th, en, href, route] = item;
    if (!href) return unavailable(key, [th, en]);
    return '<a href="' + escape(href) + '"' + (href==='cookies.html#controls' ? ' data-cookie-settings' : '') + (route ? ' target="_parent" data-route="' + escape(route) + '"' : '') + '>' + label(key, [th, en]) + '</a>';
  };
  const chevron = '<svg class="kf__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  const footerIcon = name => '<img src="assets/landing-figma-20261115/footer-' + name + '.svg" alt="" loading="lazy">';
  const socials = ['Facebook', 'Instagram', 'YouTube', 'TikTok', 'LINE', 'X'];

  function render() {
    const mobile = window.matchMedia('(max-width: 760px)');
    document.querySelectorAll('[data-site-footer]').forEach((footer, footerIndex) => {
      const flush = footer.dataset.footerLayout === 'flush';
      const social = (name, index) => {
        const icon = flush ? footerIcon(name.toLowerCase()) : '';
        const artwork = name === 'LINE' && icon ? '<span class="kf__line" aria-hidden="true">' + icon + '<span>LINE</span></span>' : icon;
        return unavailable('social.' + index, [name, name], artwork);
      };
      const groupsMarkup = groups.map(group => {
        const id = 'krane-footer-' + footerIndex + '-' + group.id;
        return '<details class="kf__group" data-footer-group><summary aria-controls="' + id + '"><h2>' + label(group.id, group.title) + '</h2>' + chevron + '</summary><ul id="' + id + '">' + group.items.map((item, index) => '<li>' + link(item, group.id + '.' + index) + '</li>').join('') + '</ul></details>';
      }).join('');
      footer.innerHTML = '<div class="kf__main"><div class="kf__brand"><a class="kf__wordmark" href="krane-b2c-landing.html#top" aria-label="Krane Clinic"><img class="brand-lockup" src="../assets/brand-final/krane-lockup.svg" width="473" height="72" loading="lazy" alt="Krane Clinic"></a><p>' + label('description', copy.description) + '</p><div class="kf__contact"><a href="mailto:support@kraneclinic.com">' + (flush ? footerIcon('email') : '') + 'support@kraneclinic.com</a><a href="tel:+66613840206">' + (flush ? footerIcon('phone') : '') + '061-384-0206</a></div><small class="kf__licence">' + label('licence', copy.licence) + '</small><small>' + label('disclaimer', copy.disclaimer) + '</small></div><nav class="kf__links">' + groupsMarkup + '</nav></div><div class="kf__bottom"><div class="kf__social"><span class="kf__sr-only">' + label('social', copy.social) + '</span>' + socials.map(social).join('') + '</div><span class="kf__copyright">Copyright © 2026 kraneclinic.com All rights reserved.</span></div>';
      // Keep the programme action bar from covering footer navigation.
      const actionBar = document.querySelector('.cd-stickybar');
      if (actionBar && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          actionBar.style.visibility = entry.isIntersecting ? 'hidden' : '';
          actionBar.inert = entry.isIntersecting;
        }).observe(footer);
      }
      const details = [...footer.querySelectorAll('[data-footer-group]')];
      const syncViewport = () => details.forEach(group => {
        group.open = !mobile.matches;
        const summary = group.querySelector('summary');
        summary.tabIndex = mobile.matches ? 0 : -1;
        if (mobile.matches) summary.removeAttribute('aria-disabled');
        else summary.setAttribute('aria-disabled', 'true');
      });
      details.forEach(group => group.querySelector('summary').addEventListener('click', event => {
        if (!mobile.matches) event.preventDefault();
      }));
      syncViewport();
      mobile.addEventListener('change', syncViewport);
    });
    const syncLanguage = () => {
      const english = document.documentElement.lang === 'en';
      document.querySelectorAll('[data-site-footer]').forEach(footer => {
        footer.setAttribute('aria-label', english ? 'Krane Clinic information' : 'ข้อมูล Krane Clinic');
        footer.querySelector('.kf__links').setAttribute('aria-label', english ? 'Footer navigation' : 'เมนูท้ายเว็บไซต์');
        footer.querySelectorAll('[data-footer-copy]').forEach(node => {
          const text = english ? node.dataset.en : node.dataset.th;
          if (node.textContent !== text) node.textContent = text;
        });
      });
    };
    syncLanguage();
    document.addEventListener('krane:languagechange', syncLanguage);
    new MutationObserver(syncLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
})();

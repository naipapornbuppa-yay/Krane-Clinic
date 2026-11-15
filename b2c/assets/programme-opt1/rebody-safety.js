/* Safety copy is preserved from the live glp1-safety.html and programme-safety.js.
   Shared drawer geometry/motion follows doctors-page.css and doctors.js. */
(() => {
  if (window.KraneSafety) return;
  const source = {"weightMain":"\n    <section class=\"safety-hero\" aria-labelledby=\"page-title\">\n      <div class=\"safety-hero__copy\">\n        <a class=\"safety-hero__back back-link\" href=\"condition-detail.html?condition=weight#safety-title\"><svg class=\"back-link__icon\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M19 12H5m7-7-7 7 7 7\"/></svg><span class=\"back-link__label\">กลับหน้าดูแลน้ำหนัก</span></a>\n        <h1 id=\"page-title\">ข้อมูลความปลอดภัย<br><span>ยากลุ่ม GLP‑1</span></h1>\n        <p class=\"safety-hero__lead\">อ่านข้อควรรู้ อาการที่ควรเฝ้าระวัง และสิ่งที่ต้องแจ้งแพทย์ก่อนใช้ semaglutide หรือ tirzepatide</p>\n      </div>\n\n    </section>\n\n    <nav class=\"safety-index\" aria-label=\"สารบัญข้อมูลความปลอดภัย\" data-safety-index>\n      <a class=\"is-active\" href=\"#overview\">ภาพรวม</a>\n      <a href=\"#avoid\">ใครไม่ควรใช้</a>\n      <a href=\"#tell-doctor\">แจ้งแพทย์ก่อนเริ่ม</a>\n      <a href=\"#side-effects\">ผลข้างเคียง</a>\n      <a href=\"#urgent\">สัญญาณอันตราย</a>\n      <a href=\"#safe-use\">ใช้อย่างปลอดภัย</a>\n    </nav>\n\n    <div class=\"safety-layout\">\n      <article class=\"safety-article\">\n        <section class=\"safety-section safety-section--intro\" id=\"overview\" aria-labelledby=\"overview-title\">\n\n          <h2 id=\"overview-title\">ยากลุ่มนี้ต้องใช้ตามใบสั่งแพทย์</h2>\n          <p>ยากลุ่ม GLP‑1 และ GIP/GLP‑1 ช่วยควบคุมความอยากอาหารและการรับประทาน แต่ไม่เหมาะกับทุกคน แพทย์ต้องประเมินประวัติสุขภาพ ยาที่ใช้อยู่ เป้าหมาย และความเสี่ยงก่อนเลือกชนิดยาและขนาดยาให้คุณ</p>\n          <div class=\"alert alert--info safety-note\"><span class=\"a-ic\"><i data-lucide=\"info\" aria-hidden=\"true\"></i></span><p><strong class=\"a-title\">ชื่อการค้าไม่ใช่สิ่งเดียวกันทั้งหมด</strong><br>ข้อบ่งใช้ วิธีใช้ และคำเตือนของแต่ละผลิตภัณฑ์ต่างกัน ให้ทำตามใบสั่งยาและเอกสารกำกับยาของผลิตภัณฑ์ที่ได้รับเสมอ</p></div>\n        </section>\n\n        <section class=\"safety-section\" id=\"avoid\" aria-labelledby=\"avoid-title\">\n          <p class=\"section-number\">ใครไม่ควรใช้</p>\n          <h2 id=\"avoid-title\">ห้ามใช้หรือควรหยุดก่อน จนกว่าแพทย์จะประเมิน</h2>\n          <div class=\"safety-grid safety-grid--two\">\n            <div class=\"safety-card\"><i data-lucide=\"dna\" aria-hidden=\"true\"></i><h3>มะเร็งไทรอยด์บางชนิด</h3><p>ห้ามใช้หากคุณหรือคนในครอบครัวเคยเป็นมะเร็งไทรอยด์ชนิด medullary thyroid carcinoma (MTC) หรือมีภาวะ MEN 2</p></div>\n            <div class=\"safety-card\"><i data-lucide=\"shield-alert\" aria-hidden=\"true\"></i><h3>เคยแพ้ยารุนแรง</h3><p>ห้ามใช้หากเคยแพ้ตัวยาหรือส่วนประกอบของผลิตภัณฑ์นั้นอย่างรุนแรง</p></div>\n            <div class=\"safety-card\"><i data-lucide=\"baby\" aria-hidden=\"true\"></i><h3>ตั้งครรภ์หรือวางแผนตั้งครรภ์</h3><p>ไม่ควรใช้เพื่อลดน้ำหนักระหว่างตั้งครรภ์ แจ้งแพทย์หากกำลังตั้งครรภ์ ให้นมบุตร หรือมีแผนตั้งครรภ์เพื่อวางแผนหยุดยาให้เหมาะกับชนิดยา</p></div>\n            <div class=\"safety-card\"><i data-lucide=\"activity\" aria-hidden=\"true\"></i><h3>กระเพาะอาหารทำงานช้ามาก</h3><p>ผู้ที่มีภาวะ gastroparesis รุนแรงหรือปัญหาทางเดินอาหารรุนแรงควรให้แพทย์ประเมินเป็นพิเศษ</p></div>\n          </div>\n        </section>\n\n        <section class=\"safety-section\" id=\"tell-doctor\" aria-labelledby=\"tell-doctor-title\">\n          <p class=\"section-number\">แจ้งแพทย์ก่อนเริ่ม</p>\n          <h2 id=\"tell-doctor-title\">ข้อมูลที่ช่วยให้แพทย์เลือกยาได้ปลอดภัยขึ้น</h2>\n          <ul class=\"check-list\">\n            <li><i data-lucide=\"check\" aria-hidden=\"true\"></i><span>ประวัติตับอ่อนอักเสบ นิ่วหรือถุงน้ำดีอักเสบ โรคไต หรือภาวะขาดน้ำ</span></li>\n            <li><i data-lucide=\"check\" aria-hidden=\"true\"></i><span>เบาหวาน ภาวะน้ำตาลต่ำ เบาหวานขึ้นจอตา และยาควบคุมน้ำตาลทุกชนิด</span></li>\n            <li><i data-lucide=\"check\" aria-hidden=\"true\"></i><span>ยาประจำ อาหารเสริม ยาคุมกำเนิดชนิดรับประทาน และประวัติแพ้ยา</span></li>\n            <li><i data-lucide=\"check\" aria-hidden=\"true\"></i><span>แผนผ่าตัด ทำหัตถการ หรือรับยาสลบ/ยากล่อมประสาท เนื่องจากยาทำให้อาหารออกจากกระเพาะช้าลง</span></li>\n          </ul>\n        </section>\n\n        <section class=\"safety-section\" id=\"side-effects\" aria-labelledby=\"side-effects-title\">\n          <p class=\"section-number\">ผลข้างเคียง</p>\n          <h2 id=\"side-effects-title\">อาการที่พบบ่อย โดยเฉพาะช่วงเริ่มหรือเพิ่มขนาดยา</h2>\n          <div class=\"symptom-list\" aria-label=\"ผลข้างเคียงที่พบบ่อย\">\n            <span>คลื่นไส้</span><span>อาเจียน</span><span>ท้องเสีย</span><span>ท้องผูก</span><span>ปวดท้อง</span><span>แน่นท้อง</span><span>อ่อนเพลีย</span><span>ปวดศีรษะ</span>\n          </div>\n          <p>จิบน้ำ รับประทานมื้อเล็ก และทำตามวิธีปรับขนาดยาที่แพทย์กำหนด หากอาการมากขึ้น ไม่ดีขึ้น หรือกินดื่มไม่ได้ ให้ติดต่อทีมดูแล</p>\n        </section>\n\n        <section class=\"safety-section safety-section--urgent\" id=\"urgent\" aria-labelledby=\"urgent-title\">\n          <p class=\"section-number\">สัญญาณอันตราย</p>\n          <h2 id=\"urgent-title\">หยุดใช้และขอความช่วยเหลือเมื่อมีอาการรุนแรง</h2>\n          <div class=\"urgent-list\">\n            <div><strong>ปวดท้องรุนแรงต่อเนื่อง</strong><span>โดยเฉพาะปวดร้าวไปด้านหลัง มีหรือไม่มีอาเจียน อาจเป็นสัญญาณตับอ่อนอักเสบ</span></div>\n            <div><strong>ปวดท้องด้านขวาบน ไข้ หรือตัว/ตาเหลือง</strong><span>อาจเกี่ยวข้องกับถุงน้ำดี</span></div>\n            <div><strong>อาเจียนหรือท้องเสียมาก ปัสสาวะน้อย เวียนศีรษะ</strong><span>อาจเกิดภาวะขาดน้ำและกระทบไต</span></div>\n            <div><strong>หน้า ปาก ลิ้น หรือคอบวม หายใจหรือกลืนลำบาก</strong><span>อาจเป็นอาการแพ้ยารุนแรง ให้โทร 1669</span></div>\n            <div><strong>มีก้อนที่คอ เสียงแหบเรื้อรัง กลืนลำบาก หรือหายใจลำบาก</strong><span>ควรติดต่อแพทย์เพื่อประเมินต่อมไทรอยด์</span></div>\n          </div>\n          <a class=\"emergency-button\" href=\"tel:1669\"><i data-lucide=\"phone-call\" aria-hidden=\"true\"></i> อาการฉุกเฉิน โทร 1669</a>\n        </section>\n\n        <section class=\"safety-section\" id=\"safe-use\" aria-labelledby=\"safe-use-title\">\n          <p class=\"section-number\">ใช้อย่างปลอดภัย</p>\n          <h2 id=\"safe-use-title\">สิ่งสำคัญระหว่างการรักษา</h2>\n          <div class=\"steps-list\">\n            <div><b>01</b><span><strong>ใช้ตามขนาดและวันเวลาที่แพทย์สั่ง</strong><small>อย่าเพิ่มขนาดยา เร่งรอบฉีด หรือชดเชยยาที่ลืมเอง วิธีจัดการเมื่อพลาดยาแตกต่างกันตามผลิตภัณฑ์</small></span></div>\n            <div><b>02</b><span><strong>ติดตามอาการและผลตรวจตามนัด</strong><small>แพทย์อาจติดตามน้ำหนัก ระดับน้ำตาล อาการทางเดินอาหาร และปัจจัยเสี่ยงอื่นตามสุขภาพของคุณ</small></span></div>\n            <div><b>03</b><span><strong>บอกทีมผ่าตัดหรือวิสัญญีแพทย์</strong><small>แจ้งว่ากำลังใช้ยา GLP‑1 ก่อนหัตถการที่ต้องดมยาสลบหรือให้ยากล่อมประสาท</small></span></div>\n            <div><b>04</b><span><strong>รับยาจากแหล่งที่ตรวจสอบได้</strong><small>ยาที่ไม่ได้รับการอนุมัติหรือยาปรุงผสมไม่ได้ผ่านการทบทวนด้านความปลอดภัย ประสิทธิผล และคุณภาพแบบเดียวกับยาที่ได้รับอนุมัติ</small></span></div>\n          </div>\n        </section>\n\n        <section class=\"safety-section safety-section--sources\" id=\"sources\" aria-labelledby=\"sources-title\">\n          <p class=\"section-number\">แหล่งข้อมูลทางการ</p>\n          <h2 id=\"sources-title\">อ่านฉลากฉบับเต็ม</h2>\n          <p>ข้อมูลหน้านี้เป็นสรุปเพื่อการศึกษา ไม่แทนฉลากยา การประเมิน หรือคำแนะนำเฉพาะบุคคลจากแพทย์</p>\n          <div class=\"source-links\">\n            <a href=\"https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215256s030lbl.pdf\" target=\"_blank\" rel=\"noreferrer\">ฉลาก Wegovy (semaglutide) <i data-lucide=\"external-link\" aria-hidden=\"true\"></i></a>\n            <a href=\"https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/217806s042lbl.pdf\" target=\"_blank\" rel=\"noreferrer\">ฉลาก Zepbound (tirzepatide) <i data-lucide=\"external-link\" aria-hidden=\"true\"></i></a>\n            <a href=\"https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss\" target=\"_blank\" rel=\"noreferrer\">ข้อควรระวังผลิตภัณฑ์ GLP‑1 ที่ไม่ได้รับอนุมัติ <i data-lucide=\"external-link\" aria-hidden=\"true\"></i></a>\n          </div>\n        </section>\n      </article>\n    </div>\n  ","hair":[["overview","เริ่มจากประเมินสาเหตุผมร่วง","การเลือกยาและรูปแบบการใช้ขึ้นอยู่กับการประเมินของแพทย์ ข้อมูล minoxidil ในหน้านี้กล่าวถึงชนิดทา ไม่ใช่ชนิดรับประทาน"],["avoid","ข้อจำกัดแตกต่างกันตามชนิดยา","แจ้งประวัติแพ้ยาและการตั้งครรภ์ก่อนเริ่มใช้ finasteride ไม่เหมาะสำหรับผู้ตั้งครรภ์ และไม่ควรสัมผัสยาเม็ดที่แตกหรือบด"],["tell-doctor","บอกข้อมูลสุขภาพและยาที่ใช้อยู่","แจ้งโรคประจำตัว ยา อาหารเสริม ปัญหาหนังศีรษะ และประวัติอารมณ์ซึมเศร้า เพื่อให้แพทย์เลือกวิธีที่เหมาะสม"],["side-effects","ติดตามการเปลี่ยนแปลงระหว่างใช้ยา","Finasteride อาจมีผลต่อความต้องการหรือการทำงานทางเพศ ส่วน minoxidil ชนิดทาอาจทำให้หนังศีรษะระคายเคือง หากรบกวนการใช้ชีวิตให้ติดต่อแพทย์"],["urgent","อาการที่ต้องขอความช่วยเหลือ","หากใช้ finasteride เพื่อผมร่วงแล้วมีอารมณ์ซึมเศร้า ให้หยุดยาและติดต่อแพทย์ทันที หากมีความคิดทำร้ายตัวเองให้ขอความช่วยเหลือฉุกเฉิน หากใช้ minoxidil แล้วเจ็บหน้าอก ใจเต้นเร็ว หรือเวียนศีรษะ ให้หยุดใช้และพบแพทย์"],["safe-use","ใช้ตามชนิดและวิธีที่ได้รับ","อย่าเพิ่มปริมาณหรือสลับชนิดทากับชนิดรับประทานเอง อ่านเอกสารของผลิตภัณฑ์ที่ได้รับ และติดตามผลตามนัด"]],"flow":[["overview","ให้แพทย์ประเมินก่อนเลือกยา","Sildenafil และ tadalafil เป็นคนละตัวยา วิธีใช้และระยะออกฤทธิ์ต่างกัน ใช้ตามใบสั่งและเอกสารกำกับยาที่ได้รับ"],["avoid","ห้ามใช้ร่วมกับยาไนเตรต","ห้ามใช้ร่วมกับยาไนเตรตหรือสารกลุ่ม poppers แจ้งแพทย์หากมีโรคหัวใจ เพิ่งมีหัวใจขาดเลือดหรือโรคหลอดเลือดสมอง หรือมีความดันผิดปกติ"],["tell-doctor","แจ้งยาและโรคประจำตัวทั้งหมด","รวมถึงยาหัวใจ ยาลดความดัน ยารักษาต่อมลูกหมาก และยาเสริมสมรรถภาพอื่น เพื่อประเมินการใช้ยาร่วมกัน"],["side-effects","อาการที่อาจพบระหว่างใช้ยา","เช่น ปวดศีรษะ เวียนศีรษะ หรืออาการทางทางเดินอาหาร หากไม่ดีขึ้นหรือรบกวนการใช้ชีวิตให้ปรึกษาแพทย์หรือเภสัชกร"],["urgent","อาการที่ควรรับการรักษาทันที","เจ็บหน้าอก แพ้รุนแรง การมองเห็นลดลงฉับพลัน หรือแข็งตัวต่อเนื่องเกิน 4 ชั่วโมง ให้รับการรักษาทันที หากเจ็บหน้าอกอย่าใช้ยาไนเตรตเอง และแจ้งทีมรักษาว่าใช้ยาใดไปเมื่อไร"],["safe-use","อย่าเพิ่มยาหรือผสมยาเอง","ใช้ตามขนาดและเวลาที่แพทย์กำหนด ไม่ใช้ร่วมกับยาเสริมสมรรถภาพอื่นโดยไม่ปรึกษาแพทย์ และไม่รับยาจากแหล่งที่ตรวจสอบไม่ได้"]],"hairSources":[["NHS: finasteride","https://www.nhs.uk/medicines/finasteride/"],["NHS: ผลข้างเคียง finasteride","https://www.nhs.uk/medicines/finasteride/side-effects-of-finasteride/"],["เอกสารกำกับยา minoxidil ชนิดทา","https://www.medicines.org.uk/emc/product/100306/pil"]],"flowSources":[["NHS: sildenafil","https://www.nhs.uk/medicines/sildenafil-viagra/"],["เอกสารกำกับยา tadalafil","https://www.medicines.org.uk/emc/product/9729/pil"]]};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let dialog, content, closeButton, returnFocus, closeTimer;
  let savedOverflow = '';
  let dragId = null, startX = 0, startY = 0, dx = 0, axis = '';
  const normalize = value => ['hair-loss','hair','hair-skin','re-hair','rehair'].includes(value) ? 'hair' : ['re-flow','reflow','ed','sexual-health'].includes(value) ? 'flow' : 'weight';
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const render = condition => {
    content.innerHTML = source.weightMain;
    content.querySelector('.safety-hero__back')?.remove();
    if (condition !== 'weight') {
      const programme = condition === 'hair' ? 're:hair' : 're:flow';
      content.querySelector('#page-title').innerHTML = 'ข้อมูลความปลอดภัย<br><span>โปรแกรม ' + programme + '</span>';
      content.querySelector('.safety-hero__lead').textContent = condition === 'hair'
        ? 'ข้อควรรู้เกี่ยวกับ finasteride และ minoxidil ชนิดทา ก่อนเริ่มดูแลเส้นผมกับแพทย์'
        : 'ข้อควรรู้เกี่ยวกับ sildenafil และ tadalafil ก่อนเริ่มดูแลสุขภาพทางเพศกับแพทย์';
      const emergency = content.querySelector('#urgent .emergency-button').cloneNode(true);
      source[condition].forEach(([id,title,text]) => {
        content.querySelector('#' + id).innerHTML = '<h2 id="' + id + '-title">' + escape(title) + '</h2><p>' + escape(text) + '</p>';
      });
      content.querySelector('#urgent').append(emergency);
      content.querySelector('#sources').innerHTML = '<h2 id="sources-title">อ่านข้อมูลยาเพิ่มเติม</h2><p>สรุปข้อควรรู้ ไม่แทนเอกสารกำกับยาหรือคำแนะนำเฉพาะบุคคลจากแพทย์</p>' +
        source[condition + 'Sources'].map(([name,url]) => '<a class="programme-source" href="' + escape(url) + '" target="_blank" rel="noopener noreferrer">' + escape(name) + ' ↗</a>').join('');
    }
    content.querySelectorAll('.section-number,.eyebrow').forEach(node => node.remove());
    // Namespace anchor IDs so the drawer can coexist with a programme page.
    content.querySelectorAll('[id]').forEach(node => { node.id = 'ks-' + node.id; });
    content.querySelectorAll('[aria-labelledby]').forEach(node => {
      node.setAttribute('aria-labelledby', node.getAttribute('aria-labelledby').split(' ').map(id => 'ks-' + id).join(' '));
    });
    content.querySelectorAll('a[href^="#"]').forEach(link => {
      link.dataset.safetyAnchor = 'ks-' + link.getAttribute('href').slice(1);
      link.href = '#' + link.dataset.safetyAnchor;
    });
    const heading = content.querySelector('#ks-page-title');
    const title = document.createElement('h2');
    title.id = heading.id;
    title.innerHTML = heading.innerHTML;
    heading.replaceWith(title);
    content.querySelectorAll('a[target="_blank"]').forEach(link => { link.rel = 'noopener noreferrer'; });
    window.lucide?.createIcons();
  };
  const resetDrag = () => {
    dragId = null; dx = 0; axis = '';
    dialog?.classList.remove('is-dragging','is-settling');
    if (dialog) dialog.style.transform = '';
  };
  const finishClose = () => {
    clearTimeout(closeTimer);
    if (!dialog?.open) return;
    dialog.close();
  };
  const close = () => {
    if (!dialog?.open) return;
    resetDrag();
    dialog.classList.remove('is-opening');
    if (reduced.matches) return finishClose();
    dialog.classList.add('is-dismissing');
    closeTimer = setTimeout(finishClose, 240);
  };
  const ensureDialog = () => {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'ks-dialog';
    dialog.id = 'krane-safety-dialog';
    dialog.setAttribute('aria-labelledby','ks-page-title');
    dialog.innerHTML = '<div class="ks-toolbar"><button type="button" class="ks-close" aria-label="ปิดข้อมูลความปลอดภัย"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="ks-content"></div>';
    document.body.append(dialog);
    content = dialog.querySelector('.ks-content');
    closeButton = dialog.querySelector('.ks-close');
    closeButton.addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
      }
      const link = event.target.closest('[data-safety-anchor]');
      if (!link) return;
      event.preventDefault();
      const target = content.querySelector('#' + link.dataset.safetyAnchor);
      if (!target) return;
      dialog.scrollTo({top:dialog.scrollTop + target.getBoundingClientRect().top - dialog.getBoundingClientRect().top - 80,behavior:reduced.matches?'instant':'smooth'});
    });
    dialog.addEventListener('animationend', event => {
      if (event.target === dialog) dialog.classList.remove('is-opening');
    });
    dialog.addEventListener('transitionend', event => {
      if (event.target === dialog && event.propertyName === 'transform' && dialog.classList.contains('is-dismissing')) finishClose();
    });
    dialog.addEventListener('close', () => {
      clearTimeout(closeTimer);
      document.body.style.overflow = savedOverflow;
      document.body.classList.remove('krane-safety-open');
      dialog.classList.remove('is-opening','is-dismissing');
      resetDrag();
      if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
    });
    // Like the doctor drawer, a clearly horizontal touch swipe dismisses.
    dialog.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' || dragId !== null || event.target.closest('a,button,input,select,textarea')) return;
      dragId = event.pointerId; startX = event.clientX; startY = event.clientY; dx = 0; axis = '';
    });
    dialog.addEventListener('pointermove', event => {
      if (event.pointerId !== dragId) return;
      const moveX = event.clientX - startX, moveY = event.clientY - startY;
      if (!axis) {
        if (Math.abs(moveX) < 8 && Math.abs(moveY) < 8) return;
        axis = Math.abs(moveX) > Math.abs(moveY) * 1.3 ? 'x' : 'y';
        if (axis === 'y') { dragId = null; return; }
        dialog.classList.remove('is-opening','is-settling');
        dialog.classList.add('is-dragging');
        dialog.setPointerCapture?.(event.pointerId);
      }
      dx = Math.max(0,moveX);
      dialog.style.transform = 'translateX(' + dx + 'px)';
    });
    ['pointerup','pointercancel'].forEach(type => dialog.addEventListener(type, event => {
      if (event.pointerId !== dragId) return;
      if (axis !== 'x') { resetDrag(); return; }
      const dismiss = type !== 'pointercancel' && dx > Math.min(120,dialog.clientWidth * .28);
      dialog.classList.remove('is-dragging');
      dragId = null; axis = ''; dx = 0;
      if (dismiss) close();
      else {
        dialog.classList.add('is-settling');
        dialog.style.transform = 'translateX(0)';
        setTimeout(resetDrag,reduced.matches?0:240);
      }
    }));
  };
  const open = (condition = 'weight', trigger = document.activeElement) => {
    ensureDialog();
    clearTimeout(closeTimer);
    dialog.classList.remove('is-dismissing');
    resetDrag();
    render(normalize(condition));
    returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    if (!dialog.open) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('krane-safety-open');
      dialog.showModal();
      if (!reduced.matches) dialog.classList.add('is-opening');
    }
    dialog.scrollTop = 0;
    closeButton.focus({preventScroll:true});
    return true;
  };
  window.KraneSafety = {open,close};
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-safety-open],a[href*="glp1-safety.html"]');
    if (!trigger || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (trigger.matches('a[href*="glp1-safety.html"]') && new URL(trigger.href).origin !== location.origin) return;
    event.preventDefault();
    const condition = trigger.dataset.safetyOpen || (trigger.href ? new URL(trigger.href).searchParams.get('condition') : '') || 'weight';
    open(condition,trigger);
  });
  const installFaqCta = () => {
    const wrap = document.querySelector('main[data-programme="rebody"] .opt-faq > .opt-wrap');
    if (!wrap || wrap.querySelector('[data-safety-open]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rebody-safety-cta';
    button.dataset.safetyOpen = 'weight';
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-controls','krane-safety-dialog');
    button.innerHTML = '<i data-lucide="shield-alert" aria-hidden="true"></i><span><strong>ข้อควรระวังสำคัญ</strong><small>สิ่งที่ควรรู้ก่อนเริ่มใช้ยากลุ่ม GLP-1</small></span><i data-lucide="arrow-right" aria-hidden="true"></i>';
    wrap.insertBefore(button,wrap.querySelector('.opt-faq-glass'));
    window.lucide?.createIcons();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',installFaqCta,{once:true});
  else installFaqCta();
})();


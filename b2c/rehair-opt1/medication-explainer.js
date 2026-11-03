/* Educational examples, not a Krane formulary or a prescription.
 * Opt-in only: <div data-medication-explainer="hair-loss"></div>.
 * Sources checked 2026-11-03; see tools/medication-explainer-qa.mjs.
 */
(() => {
  'use strict';
  const sources = {
    finasteride: 'https://www.nhs.uk/medicines/finasteride/common-questions-about-finasteride/',
    finasterideSafety: 'https://www.nhs.uk/medicines/finasteride/side-effects-of-finasteride/',
    minoxidil: 'https://www.medicines.org.uk/emc/product/5765/smpc',
    hair: 'https://www.nhs.uk/symptoms/hair-loss/'
  };
  const copy = {
    th: {
      eyebrow: 'เข้าใจการรักษา', title: 'ยาดูแลผม ทำงานอย่างไร',
      intro: 'เริ่มจากเข้าใจสาเหตุ แล้วเลือกแนวทางที่เหมาะกับคุณไปพร้อมกับแพทย์',
      disclaimer: 'ตัวอย่างยาเพื่อให้ความรู้ ไม่ใช่รายการยาที่รับรองว่ามีให้บริการหรือคำแนะนำให้เริ่มยา แพทย์ต้องประเมินสาเหตุ ข้อห้าม และความเหมาะสมก่อนเลือกการรักษา ผลลัพธ์แตกต่างกันในแต่ละคน',
      open: 'อ่านเพิ่มเติม', close: 'ปิดรายละเอียด', previous: 'การ์ดก่อนหน้า', next: 'การ์ดถัดไป', sources: 'แหล่งข้อมูล', safety: 'อ่านข้อควรระวังก่อนเริ่มดูแล',
      cards: [
        {name: 'Finasteride', title: 'ลดผลของ DHT ต่อเส้นผม', paragraphs: ['Finasteride ยับยั้งเอนไซม์ที่เปลี่ยน testosterone เป็น DHT ซึ่งเป็นฮอร์โมนที่เกี่ยวข้องกับผมบางจากพันธุกรรม จึงอาจช่วยลดการหลุดร่วงในผู้ที่เหมาะสม', 'ไม่ใช่ยาสำหรับผมร่วงทุกสาเหตุ แพทย์จะพิจารณาประวัติสุขภาพและผลข้างเคียงก่อนเลือกใช้'], note: 'อาจมีผลข้างเคียงทางเพศหรืออารมณ์ หากใช้รักษาผมร่วงแล้วมีอารมณ์ซึมเศร้า ให้หยุดยาและติดต่อแพทย์ทันที', links: ['finasteride', 'finasterideSafety']},
        {name: 'Topical minoxidil', title: 'ช่วยเส้นผมในระยะเติบโต', paragraphs: ['Minoxidil ชนิดทาหนังศีรษะช่วยกระตุ้นและยืดระยะเติบโตของเส้นผมในผมบางจากพันธุกรรม แต่กลไกทั้งหมดของยายังไม่เป็นที่เข้าใจอย่างสมบูรณ์', 'อาจระคายเคืองหนังศีรษะหรือมีผมร่วงเพิ่มในช่วงเริ่มต้น วิธีใช้ขึ้นอยู่กับผลิตภัณฑ์และคำแนะนำของแพทย์'], note: 'ไม่ทาบนหนังศีรษะอักเสบหรือมีแผล หากเจ็บหน้าอก ใจเต้นเร็ว หรือหน้ามืด ให้หยุดใช้และพบแพทย์', links: ['minoxidil']},
        {name: 'Ongoing care', title: 'ให้เวลา และติดตามร่วมกัน', paragraphs: ['การดูแลผมต้องใช้เวลา ไม่ใช่ทุกคนที่จะตอบสนองต่อยา บันทึกภาพในแสงและมุมเดิมเพื่อใช้พูดคุยกับแพทย์เรื่องความเปลี่ยนแปลง', 'ผลจาก finasteride และ minoxidil ต้องอาศัยการใช้ต่อเนื่อง แพทย์จะช่วยทบทวนผลและอาการข้างเคียงก่อนวางแผนดูแลต่อ'], note: 'แจ้งแพทย์หากผมร่วงฉับพลัน เป็นหย่อม ๆ หรือไม่ทราบสาเหตุ รวมถึงโรคประจำตัว ยาที่ใช้ และการตั้งครรภ์หรือให้นมบุตร', links: ['hair', 'minoxidil']}
      ]
    },
    en: {
      eyebrow: 'Understand your treatment', title: 'How hair-loss medicines work',
      intro: 'Understand the cause. Explore the options with your doctor.',
      disclaimer: 'Educational medicine examples, not a confirmed list of available treatments or advice to start medication. A doctor must assess the cause, contraindications and suitability before choosing treatment. Individual results vary.',
      open: 'Read more', close: 'Close details', previous: 'Previous card', next: 'Next card', sources: 'Sources', safety: 'Read the treatment safety information',
      cards: [
        {name: 'Finasteride', title: 'Reduce the effect of DHT', paragraphs: ['Finasteride inhibits the enzyme that converts testosterone into DHT, a hormone involved in male-pattern hair loss. This may help reduce hair loss in suitable patients.', 'It does not treat every cause of hair loss. Your doctor reviews your health history and possible side effects before choosing treatment.'], note: 'Sexual and mood-related side effects can occur. If you take it for hair loss and develop depression, stop taking it and contact your doctor immediately.', links: ['finasteride', 'finasterideSafety']},
        {name: 'Topical minoxidil', title: 'Support the growth phase', paragraphs: ['Minoxidil applied to the scalp can stimulate and prolong the growth phase in pattern hair loss. Its complete mechanism is not fully understood.', 'Scalp irritation or increased shedding may occur at first. Instructions depend on the product and your doctor’s advice.'], note: 'Do not apply to inflamed or damaged scalp skin. Stop using it and seek medical advice for chest pain, a racing heartbeat or faintness.', links: ['minoxidil']},
        {name: 'Ongoing care', title: 'Give it time. Keep in touch.', paragraphs: ['Hair care takes time and medicines do not work for everyone. Take photographs in consistent lighting and from the same angle to discuss changes with your doctor.', 'Benefits from finasteride and minoxidil depend on continued use. Your doctor can review the response and side effects before planning ongoing care.'], note: 'Tell your doctor about sudden, patchy or unexplained hair loss, your health conditions and medicines, and pregnancy or breastfeeding.', links: ['hair', 'minoxidil']}
      ]
    }
  };
  let sequence = 0;
  function mount(host) {
    if (!host || host.dataset.medicationMounted || host.dataset.medicationExplainer !== 'hair-loss') return;
    host.dataset.medicationMounted = 'true';
    const id = `medication-explainer-${++sequence}`;
    const section = document.createElement('section');
    section.className = 'medication-explainer';
    section.setAttribute('aria-labelledby', `${id}-title`);
    const header = document.createElement('header');
    header.className = 'medication-explainer__header';
    header.innerHTML = `<h2 id="${id}-title"></h2><p class="medication-explainer__intro"></p>`;
    const rail = document.createElement('div');
    rail.className = 'medication-explainer__rail';
    const cards = copy.en.cards.map((_, index) => {
      const card = document.createElement('article');
      card.className = `medication-explainer__card medication-explainer__card--${index + 1}`;
      // Original CSS illustrations, not product packs or clinical outcome images.
      const art = document.createElement('div');
      art.className = 'medication-explainer__art'; art.setAttribute('aria-hidden', 'true');
      art.innerHTML = '<span class="medication-explainer__orbit"></span><span class="medication-explainer__strand"></span><span class="medication-explainer__strand"></span><span class="medication-explainer__strand"></span>';
      const panel = document.createElement('div'); panel.className = 'medication-explainer__detail'; panel.id = `${id}-detail-${index}`; panel.hidden = true;
      const heading = document.createElement('h3'); heading.className = 'medication-explainer__card-heading';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'medication-explainer__toggle';
      button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', panel.id);
      button.innerHTML = `<span class="medication-explainer__front"><span class="medication-explainer__number">0${index + 1}</span><span class="medication-explainer__name"></span><span class="medication-explainer__title"></span></span><span class="medication-explainer__icon" aria-hidden="true">+</span>`;
      heading.append(button); card.append(art, panel, heading); rail.append(card);
      button.addEventListener('click', () => setOpen(index, button.getAttribute('aria-expanded') !== 'true'));
      card.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); setOpen(index, false); button.focus(); } });
      return {card, panel, button};
    });
    const controls = document.createElement('div'); controls.className = 'medication-explainer__controls';
    const previous = document.createElement('button'), next = document.createElement('button');
    previous.type = next.type = 'button'; previous.textContent = '←'; next.textContent = '→';
    controls.append(previous, next);
    function move(direction) {
      const first = rail.getBoundingClientRect().left;
      const current = cards.reduce((best, item, i) => Math.abs(item.card.getBoundingClientRect().left - first) < Math.abs(cards[best].card.getBoundingClientRect().left - first) ? i : best, 0);
      const target = cards[Math.max(0, Math.min(cards.length - 1, current + direction))].card;
      rail.scrollBy({left: target.getBoundingClientRect().left - first, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }
    previous.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
    const disclaimer = document.createElement('p'); disclaimer.className = 'medication-explainer__disclaimer';
    const safety = document.createElement('a'); safety.className = 'medication-explainer__safety'; safety.href = '../glp1-safety.html?condition=hair-loss';
    section.append(header, rail, controls, disclaimer, safety); host.append(section);
    const language = () => document.documentElement.lang === 'en' ? 'en' : 'th';
    function setOpen(index, open) {
      const item = cards[index]; item.panel.hidden = !open; item.card.classList.toggle('is-open', open); item.button.setAttribute('aria-expanded', String(open));
      item.button.querySelector('.medication-explainer__icon').textContent = open ? '×' : '+';
      item.button.setAttribute('aria-label', `${open ? copy[language()].close : copy[language()].open}: ${copy[language()].cards[index].title}`);
    }
    function translate() {
      const text = copy[language()]; section.lang = language();
      
      header.querySelector('h2').textContent = text.title;
      header.querySelector('.medication-explainer__intro').textContent = text.intro;
      disclaimer.textContent = text.disclaimer; safety.textContent = `${text.safety} ↗`;
      previous.setAttribute('aria-label', text.previous); next.setAttribute('aria-label', text.next);
      cards.forEach((item, index) => {
        const value = text.cards[index];
        item.button.querySelector('.medication-explainer__name').textContent = value.name;
        item.button.querySelector('.medication-explainer__title').textContent = value.title;
        item.panel.replaceChildren();
        const label = document.createElement('p'); label.className = 'medication-explainer__detail-name'; label.textContent = value.name; item.panel.append(label);
        [...value.paragraphs, value.note].forEach((line, i) => { const p = document.createElement('p'); p.textContent = line; if (i === value.paragraphs.length) p.className = 'medication-explainer__note'; item.panel.append(p); });
        const refs = document.createElement('p'); refs.className = 'medication-explainer__sources'; refs.append(`${text.sources}: `);
        value.links.forEach((key, i) => { if (i) refs.append(' · '); const a = document.createElement('a'); a.href = sources[key]; a.textContent = key === 'minoxidil' ? 'Minoxidil SmPC' : 'NHS' + (key === 'finasterideSafety' ? ' (safety)' : ''); refs.append(a); });
        item.panel.append(refs); setOpen(index, !item.panel.hidden);
      });
    }
    translate();
    const observer = new MutationObserver(translate); observer.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
    return {element: section, destroy() {observer.disconnect(); section.remove(); delete host.dataset.medicationMounted;}};
  }
  window.KraneMedicationExplainer = {mount};
  function boot() {document.querySelectorAll('[data-medication-explainer]').forEach(mount);}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true}); else boot();
})();

/* One progressive enhancement for all programme pages. The authored steps
   remain the copy source and the no-JavaScript fallback. No patient records,
   app sessions, prices or treatment recommendations are created here. */
(() => {
  const source = document.querySelector('#cd-panel-steps .cd-steps');
  if (!source) return;
  const steps = Array.from(source.children);
  if (steps.length !== 5) return;
  const labels = ['ประเมินสุขภาพ', 'แผนจากแพทย์', 'รับยาที่บ้าน', 'ติดตามผล', 'เติมยา'];
  const icons = ['clipboard-list', 'file-check-2', 'package', 'calendar-check', 'repeat-2'];
  const visuals = [
    '<img src="assets/editorial-stock-20261017/pexels-6129645.jpg" alt="" width="1125" height="750" loading="lazy">',
    '<img src="assets/editorial-stock-20261017/pexels-5452269.jpg" alt="" loading="lazy">',
    '<i data-lucide="package-check"></i>',
    '<img src="assets/editorial-stock-20261017/pexels-6129645.jpg" alt="" width="1125" height="750" loading="lazy">',
    '<img src="assets/partners/fascino-storefront-official.png" alt="" width="1326" height="624" loading="lazy">'
  ];
  const root = document.createElement('div');
  root.className = 'programme-journey';
  root.innerHTML = '<p class="journey-hint">เลือกแต่ละขั้นตอนเพื่อดูรายละเอียด</p>' +
    '<div class="journey-layout"><div class="journey-tabs" role="tablist" aria-label="ขั้นตอนการดูแล"></div>' +
    '<div class="journey-panels"></div></div>' +
    '<div class="journey-footer"><div><button type="button" data-journey-prev aria-label="ขั้นตอนก่อนหน้า"><i data-lucide="arrow-left"></i></button>' +
    '<span data-journey-count>1 / 5</span><button type="button" data-journey-next aria-label="ขั้นตอนถัดไป"><i data-lucide="arrow-right"></i></button></div></div>';
  const tablist = root.querySelector('.journey-tabs');
  const panels = root.querySelector('.journey-panels');
  steps.forEach((step, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'journey-tab';
    button.id = `journey-tab-${index}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `journey-panel-${index}`);
    button.innerHTML = `<span class="journey-tab__number">${index + 1}</span><span>${labels[index]}</span><i data-lucide="${icons[index]}" aria-hidden="true"></i>`;
    tablist.append(button);
    const panel = document.createElement('section');
    panel.id = `journey-panel-${index}`;
    panel.className = 'journey-panel';
    panel.dataset.step = index;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;
    panel.innerHTML = `<div class="journey-visual" aria-hidden="true">${visuals[index]}</div><div class="journey-copy"><h4></h4><p></p></div>`;
    panel.querySelector('h4').textContent = step.querySelector('strong').textContent;
    panel.querySelector('p').textContent = step.querySelector('p').textContent;
    panels.append(panel);
  });
  let selected = 0;
  const buttons = Array.from(tablist.children);
  function select(index, focus = false) {
    selected = (index + steps.length) % steps.length;
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === selected));
      button.tabIndex = i === selected ? 0 : -1;
      panels.children[i].hidden = i !== selected;
    });
    root.querySelector('[data-journey-count]').textContent = `${selected + 1} / ${steps.length}`;
    const active = buttons[selected];
    if (focus) active.focus({preventScroll: true});
    // Only move the horizontal rail; selecting a step never jumps the page.
    if (tablist.scrollWidth > tablist.clientWidth) {
      tablist.scrollLeft = active.offsetLeft - tablist.offsetLeft - (tablist.clientWidth - active.clientWidth) / 2;
    }
  }
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  tablist.addEventListener('keydown', event => {
    const indices = {ArrowRight: selected + 1, ArrowDown: selected + 1, ArrowLeft: selected - 1, ArrowUp: selected - 1, Home: 0, End: steps.length - 1};
    if (Object.prototype.hasOwnProperty.call(indices, event.key)) {
      event.preventDefault();
      select(indices[event.key], true);
    }
  });
  root.querySelector('[data-journey-prev]').addEventListener('click', () => select(selected - 1));
  root.querySelector('[data-journey-next]').addEventListener('click', () => select(selected + 1));
  source.after(root);
  source.hidden = true;
  source.closest('.cd-card').classList.add('journey-card');
  select(0);
  window.lucide?.createIcons();
})();

(() => {
  'use strict';
  const headings = document.querySelectorAll(
    '#tracking .postpay-tracking-topbar__title > strong, #order-summary .postpay-summary-status > span > strong'
  );
  if (!headings.length) return;

  const style = document.createElement('style');
  style.textContent = `
    .kr-order-copy{position:relative;display:inline-flex;align-items:center;gap:2px;min-width:0;max-width:100%;width:fit-content}
    .kr-order-copy>strong{min-width:0;user-select:text}
    #tracking .kr-order-copy{justify-content:center}
    .kr-order-copy>button{appearance:none;display:grid;place-items:center;flex:none;width:40px;height:36px;padding:0;border:0;background:transparent;color:inherit;border-radius:6px;cursor:pointer}
    .kr-order-copy>button:hover{background:rgb(127 127 127 / .12)}
    .kr-order-copy>button:focus-visible{outline:2px solid currentColor;outline-offset:-2px}
    .kr-order-copy svg{width:16px;height:16px;pointer-events:none}
    .kr-order-copy>button[data-copied] .kr-copy-icon,
    .kr-order-copy>button:not([data-copied]) .kr-copy-check{display:none}
    .kr-order-copy__status{position:absolute;z-index:4;top:100%;right:0;width:max-content;max-width:min(240px,75vw);margin:0;border-radius:6px;text-align:left;font-size:12px;line-height:1.3;pointer-events:none}
    .kr-order-copy__status:not(:empty){padding:5px 8px;background:#142638;color:#fff}
  `;
  document.head.append(style);

  const english = () => document.documentElement.lang.toLowerCase().startsWith('en');
  const label = () => english() ? 'Copy order number' : 'คัดลอกเลขคำสั่งซื้อ';

  function legacyCopy(text, button) {
    const field = document.createElement('textarea');
    const selected = window.getSelection();
    const ranges = selected ? Array.from({length:selected.rangeCount}, (_, i) => selected.getRangeAt(i)) : [];
    field.value = text;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;top:0;left:-9999px;pointer-events:none';
    document.body.append(field);
    const focus = document.activeElement;
    try {
      field.select();
      return document.execCommand('copy');
    } finally {
      field.remove();
      (focus instanceof HTMLElement && focus !== document.body ? focus : button).focus({preventScroll:true});
      if (selected && ranges.length) {
        selected.removeAllRanges();
        for (const range of ranges) selected.addRange(range);
      }
    }
  }

  const controls = [];
  for (const heading of headings) {
    const group = document.createElement('span');
    group.className = 'kr-order-copy';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label());
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><g class="kr-copy-icon"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></g><path class="kr-copy-check" d="m5 12 4 4L19 6"/></svg>';
    controls.push(button);

    const status = document.createElement('span');
    status.className = 'kr-order-copy__status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    let timer;
    let pending = false;
    button.addEventListener('click', async () => {
      if (pending) return;
      pending = true;
      clearTimeout(timer);
      status.textContent = '';
      button.removeAttribute('data-copied');
      // Read only this heading, preserving the currently displayed reference.
      const ref = heading.textContent.match(/(?:^|[#\s])(KR-\d+)\b/i)?.[1];
      let copied = false;
      if (ref) {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(ref);
            copied = true;
          } else {
            copied = legacyCopy(ref, button);
          }
        } catch {
          // Do not retry via a different clipboard API after a permission denial.
        }
      }
      if (copied) button.setAttribute('data-copied', '');
      status.textContent = copied
        ? (english() ? 'Copied' : 'คัดลอกแล้ว')
        : (english() ? 'Could not copy. Select the number to copy it.' : 'คัดลอกไม่ได้ ลองเลือกเลขเพื่อคัดลอก');
      timer = setTimeout(() => {
        button.removeAttribute('data-copied');
        status.textContent = '';
      }, copied ? 1800 : 3600);
      pending = false;
    });

    heading.before(group);
    group.append(heading, button, status);
  }

  new MutationObserver(() => {
    for (const button of controls) button.setAttribute('aria-label', label());
  }).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
})();

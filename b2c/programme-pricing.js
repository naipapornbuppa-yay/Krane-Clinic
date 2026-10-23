/* Reuse the matching public pricing card as the single source of rates and benefits. */
(async () => {
  const key = new URLSearchParams(location.search).get('condition');
  if (!['weight', 'hair-loss', 're-flow'].includes(key)) return;
  const panel = document.getElementById('cd-panel-price');
  if (!panel) return;
  try {
    const response = await fetch('pricing.html?v=20261023-programme-cards');
    if (!response.ok) return;
    const source = new DOMParser().parseFromString(await response.text(), 'text/html');
    const card = [...source.querySelectorAll('.pricing-card')].find(node => node.querySelector('a[href="condition-detail.html?condition=' + key + '"]'));
    if (!card) return;
    const action = card.querySelector('.pricing-action');
    action.href = document.querySelector('[data-intake-link]').href;
    action.textContent = 'เริ่มปรึกษาฟรี';
    const note = source.querySelector('.pricing-footnote').cloneNode(true);
    const fees = document.createElement('a');
    fees.href = 'pricing.html';
    fees.textContent = 'ดูค่าปรึกษาและค่าจัดส่ง →';
    note.append(fees);
    card.append(note);
    const title = document.createElement('h2');
    title.className = 'cd-h2';
    title.textContent = 'ราคาโปรแกรม';
    panel.classList.add('programme-price');
    panel.replaceChildren(title, card);
    window.lucide?.createIcons();
  } catch (error) { console.warn('Programme pricing card unavailable; retaining price summary.', error); }
})();

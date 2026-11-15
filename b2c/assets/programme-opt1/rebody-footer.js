(() => {
  const page = document.querySelector('main[data-programme="rebody"]');
  if (!page) return;
  document.body.classList.add('rebody-final-page');
  const readMore = page.querySelector('.opt-faq .opt-wrap > a');
  if (readMore) {
    const arrow = document.createElement('img');
    arrow.src = 'assets/programme-opt1/rebody-faq-arrow.svg';
    arrow.alt = '';
    arrow.width = 16;
    arrow.height = 16;
    readMore.replaceChildren('อ่านเพิ่มเติม', arrow);
  }
  const faq = page.querySelector('.opt-faq-glass');
  if (!faq) return;
  const summaries = [...faq.querySelectorAll('summary')];
  summaries.at(-1).textContent = 'ใครเข้าถึงข้อมูลสุขภาพของฉัน?';
  summaries.forEach(summary => {
    summary.parentElement.name = 'rebody-faq';
    summary.addEventListener('keydown', event => {
      const index = summaries.indexOf(summary);
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % summaries.length;
      if (event.key === 'ArrowUp') next = (index + summaries.length - 1) % summaries.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = summaries.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      summaries[next].focus();
    });
  });
  // The approved footer uses open link columns at every size.
  // Reuse the shared links and copy, while removing disclosure-only behavior.
  const footer = document.querySelector('[data-site-footer]');
  const showLinkColumns = () => {
    if (!footer?.querySelector('details.kf__group')) return false;
    footer.querySelectorAll('details.kf__group').forEach(details => {
      const section = document.createElement('section');
      section.className = details.className;
      const heading = details.querySelector('h2');
      const links = details.querySelector('ul');
      heading.id = links.id + '-heading';
      section.setAttribute('aria-labelledby', heading.id);
      section.append(heading, links);
      details.replaceWith(section);
    });
    return true;
  };
  if (footer && !showLinkColumns()) {
    const observer = new MutationObserver(() => {
      if (showLinkColumns()) observer.disconnect();
    });
    observer.observe(footer, {childList:true});
  }
})();

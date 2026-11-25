(() => {
  const grid = document.querySelector('.doctor-directory__grid');
  if (grid) {
    const pageSize = 12;
    const nav = document.createElement('nav');
    const previous = document.createElement('button');
    const next = document.createElement('button');
    const indicator = document.createElement('span');
    for (const button of [previous, next]) {
      button.type = 'button';
      button.setAttribute('aria-controls', grid.id);
    }
    nav.className = 'doctor-directory__pagination';
    indicator.setAttribute('aria-live', 'polite');
    nav.append(previous, indicator, next);
    grid.after(nav);
    const cards = () => [...grid.children].filter(node => node.matches('.doctor-directory-card'));
    const doctor = new URLSearchParams(location.search).get('doctor');
    let page = Math.max(0, Math.floor(cards().findIndex(card => card.dataset.doctorId === doctor) / pageSize));

    function render() {
      const results = cards();
      const count = Math.max(1, Math.ceil(results.length / pageSize));
      page = Math.min(page, count - 1);
      results.forEach((card, index) => { card.hidden = Math.floor(index / pageSize) !== page; });
      nav.hidden = count === 1;
      previous.disabled = page === 0;
      next.disabled = page === count - 1;
      const english = document.documentElement.lang === 'en';
      nav.setAttribute('aria-label', english ? 'Doctor directory pages' : 'หน้ารายชื่อแพทย์');
      previous.textContent = english ? 'Previous' : 'ก่อนหน้า';
      next.textContent = english ? 'Next' : 'ถัดไป';
      indicator.textContent = english ? `Page ${page + 1} of ${count}` : `หน้า ${page + 1} จาก ${count}`;
    }

    previous.addEventListener('click', () => { page -= 1; render(); });
    next.addEventListener('click', () => { page += 1; render(); });
    new MutationObserver(render).observe(grid, {childList:true});
    new MutationObserver(render).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
    render();
  }
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const stories=document.querySelectorAll('.doctor-work__story');
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{entry.target.classList.toggle('is-revealed',entry.isIntersecting);entry.target.classList.toggle('is-above',!entry.isIntersecting&&entry.boundingClientRect.bottom<0);});},{threshold:.12});
    stories.forEach(story=>{story.classList.add('will-reveal');observer.observe(story);});
  }
})();

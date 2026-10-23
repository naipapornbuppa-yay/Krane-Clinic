(() => {
  const index = document.querySelector("[data-safety-index]");
  if (!index) return;

  const layout=document.querySelector('.safety-layout');
  layout.prepend(index);
  document.querySelectorAll('.safety-section > .eyebrow,.safety-section > .section-number').forEach(el=>el.remove());
  const label=document.createElement('h2');label.className='safety-index__title';label.textContent='สารบัญ';index.prepend(label);
  const links = [...index.querySelectorAll("a[href^='#']")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "location");
        index.scrollTo({ left: Math.max(0, link.offsetLeft - index.clientWidth / 2 + link.offsetWidth / 2), behavior: "smooth" });
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, { rootMargin: "-110px 0px -55%", threshold: [0, .2, .6] });

  sections.forEach((section) => observer.observe(section));
})();

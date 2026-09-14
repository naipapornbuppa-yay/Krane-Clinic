(() => {
  const index = document.querySelector("[data-safety-index]");
  if (!index) return;

  const links = [...index.querySelectorAll("a[href^='#']")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "location");
        link.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
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

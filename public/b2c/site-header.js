/* Shared public-site navigation behaviour: mobile drawer, desktop dropdowns,
   language switch and the scrolled header state. Loaded by every public page
   alongside site-header.css so the nav behaves identically across the app. */
(() => {
  const NAV_TRANSLATIONS = {
    navWeight: "Weight",
    navMen: "Men's health",
    navHairSkin: "Hair & skin",
    navMore: "More",
    menuWeightStart: "Start a weight-loss plan",
    menuWeightGlp1: "GLP-1 options",
    menuWeightCheck: "Check your eligibility",
    menuEd: "Erectile dysfunction (ED)",
    menuSexual: "Sexual health",
    menuHormone: "Hormones & TRT",
    menuHair: "Hair loss & scalp",
    menuSkin: "Skin & acne",
    menuSkinAge: "Skin & healthy ageing",
    menuSleep: "Sleep & stress",
    navHow: "How it works",
    navDoctors: "Our doctors",
    healthArticles: "Health articles",
    login: "Log in",
    chooseCare: "Choose your care",
    language: "Language",
    partnerAccess: "Partner access"
  };

  const mobileMenu = document.querySelector("#mobile-menu");
  const menuOpen = document.querySelector("[data-menu-open]");
  const menuClose = document.querySelector("[data-menu-close]");
  const mobileQuery = window.matchMedia("(max-width: 880px)");

  function mobileMenuIsOpen() {
    return mobileMenu && (mobileMenu.open || mobileMenu.hasAttribute("open"));
  }

  function openMobileMenu() {
    if (!mobileMenu || mobileMenuIsOpen()) return;
    document.body.classList.add("menu-open");
    menuOpen?.setAttribute("aria-expanded", "true");
    if (typeof mobileMenu.showModal === "function") mobileMenu.showModal();
    else mobileMenu.setAttribute("open", "");
    // Focus the panel, not the first link — see krane-b2c-landing.js.
    requestAnimationFrame(() => mobileMenu.querySelector(".mobile-menu__head")?.focus());
  }

  function closeMobileMenu({ restoreFocus = false } = {}) {
    if (!mobileMenu || !mobileMenuIsOpen()) return;
    if (typeof mobileMenu.close === "function") mobileMenu.close();
    else mobileMenu.removeAttribute("open");
    document.body.classList.remove("menu-open");
    menuOpen?.setAttribute("aria-expanded", "false");
    if (restoreFocus) menuOpen?.focus();
  }

  menuOpen?.addEventListener("click", openMobileMenu);
  menuClose?.addEventListener("click", () => closeMobileMenu({ restoreFocus: true }));
  mobileMenu?.addEventListener("click", (event) => {
    if (event.target === mobileMenu) closeMobileMenu({ restoreFocus: true });
  });
  mobileMenu?.addEventListener("close", () => {
    document.body.classList.remove("menu-open");
    menuOpen?.setAttribute("aria-expanded", "false");
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMobileMenu()));
  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) closeMobileMenu();
  });

  const navMenus = [...document.querySelectorAll("[data-nav-menu]")];
  const hoverNavQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  let navCloseTimer = 0;

  function setNavMenu(activeMenu) {
    window.clearTimeout(navCloseTimer);
    navMenus.forEach((navMenu) => {
      const open = navMenu === activeMenu;
      navMenu.classList.toggle("is-open", open);
      navMenu.querySelector("[data-nav-menu-trigger]")?.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function queueNavClose() {
    window.clearTimeout(navCloseTimer);
    navCloseTimer = window.setTimeout(() => setNavMenu(null), 140);
  }

  navMenus.forEach((navMenu) => {
    const trigger = navMenu.querySelector("[data-nav-menu-trigger]");
    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      const alreadyOpen = navMenu.classList.contains("is-open");
      const toggleCloses = alreadyOpen && (!hoverNavQuery.matches || event.detail === 0);
      setNavMenu(toggleCloses ? null : navMenu);
    });
    trigger?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      setNavMenu(navMenu);
      navMenu.querySelector(".nav-menu__menu a")?.focus();
    });
    if (hoverNavQuery.matches) {
      navMenu.addEventListener("pointerenter", () => setNavMenu(navMenu));
      navMenu.addEventListener("pointerleave", queueNavClose);
    }
    navMenu.addEventListener("focusout", (event) => {
      if (!navMenu.contains(event.relatedTarget)) queueNavClose();
    });
    navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setNavMenu(null)));
  });

  document.querySelectorAll("[data-mobile-nav-section]").forEach((section, _, sections) => {
    section.addEventListener("toggle", () => {
      if (!section.open) return;
      sections.forEach((sibling) => {
        if (sibling !== section) sibling.open = false;
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("[data-nav-menu]")) setNavMenu(null);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openNavMenu = navMenus.find((navMenu) => navMenu.classList.contains("is-open"));
    if (!openNavMenu) return;
    setNavMenu(null);
    openNavMenu.querySelector("[data-nav-menu-trigger]")?.focus();
  });

  const languageSelects = [...document.querySelectorAll("[data-language]")];
  function setNavigationLanguage(language) {
    const lang = language === "en" ? "en" : "th";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-nav-i18n]").forEach((element) => {
      if (!element.dataset.navTh) element.dataset.navTh = element.innerHTML;
      element.innerHTML = lang === "en" ? NAV_TRANSLATIONS[element.dataset.navI18n] || element.dataset.navTh : element.dataset.navTh;
    });
    languageSelects.forEach((select) => { select.value = lang; });
    menuOpen?.setAttribute("aria-label", lang === "th" ? "เปิดเมนู" : "Open menu");
    menuClose?.setAttribute("aria-label", lang === "th" ? "ปิดเมนู" : "Close menu");
    try { localStorage.setItem("krane_lang", lang); } catch (_) {}
  }

  languageSelects.forEach((select) => select.addEventListener("change", () => setNavigationLanguage(select.value)));
  /* ?lang=en works on the app, so it has to work here too — a shared link into
     the English site should not land in Thai (client audit, 19 Aug). */
  let initialLanguage = "th";
  try { initialLanguage = localStorage.getItem("krane_lang") || "th"; } catch (_) {}
  if (/[?&#]lang=en\b/.test(location.href)) initialLanguage = "en";
  else if (/[?&#]lang=th\b/.test(location.href)) initialLanguage = "th";
  setNavigationLanguage(initialLanguage);

  const siteHeader = document.querySelector("[data-site-header]");
  const updateHeader = () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });
  window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });
})();

/* The Krane public navigation, as one component.

   Every public page used to carry its own copy of the header markup and they
   drifted apart: the landing and the condition page offered บริการของเรา /
   วิธีใช้งาน / ทีมแพทย์ของเรา / บทความสุขภาพ, while the doctors page and the
   GLP-1 page still offered the four-category menu the site had before —
   น้ำหนัก, สุขภาพผู้ชาย, ผม & ผิว, เพิ่มเติม — pointing at conditions that are
   not in the catalogue any more, and drew the wordmark from a different file
   at a different size. The links live here once now and every page renders the
   same bar from them, so a change to the menu reaches all of them together
   (client, 23 Sep).

   A page opts in with
     <header class="site-header site-header--landing" data-site-header data-site-header-render></header>
   and loads this file before anything that reads the header. The drawer is
   written in next to it. Behaviour — the drawer, the dropdowns, the language
   switch — is site-header.js on the sub-pages and krane-b2c-landing.js on the
   landing, so this file renders and does nothing else. */
(() => {
const SITE_NAV_BRAND = {
  src: "../assets/krane-clinic-lockup-v1.svg?v=20260920-float-v1",
  width: 193,
  height: 31,
  alt: "Krane Clinic"
};
/* "Our services": the treatment programmes first, then the three ways into
   care that are not a programme. The app routes carry data-route so the
   landing's iframe bridge can hand them to the shell instead of navigating
   the frame. */
const SITE_NAV_SERVICES = [
  ["condition-detail.html?condition=weight", "โปรแกรม re:body"],
  ["condition-detail.html?condition=hair-loss", "โปรแกรม re:hair"],
  ["condition-detail.html?condition=ed", "โปรแกรม re:confidence"],
  ["krane-b2c.html?v=20260922-general-care-picker-v17&entry=direct#conditions", "ปรึกษาทั่วไป", "conditions"],
  ["krane-b2c.html#profile", "เติมยา", "profile"],
  ["krane-b2c.html?v=20260920-float-v1#upload-rx", "อัพโหลดใบสั่งยา", "upload-rx"]
];
const SITE_NAV_LINKS = [
  ["krane-b2c-landing.html#how", "วิธีใช้งาน"],
  ["doctors.html", "ทีมแพทย์ของเรา"],
  ["krane-b2c.html#articles", "บทความสุขภาพ", "articles"]
];
const SITE_NAV_HOME = "krane-b2c-landing.html#top";

function siteNavAttrs(route) {
  return route ? ' target="_parent" data-route="' + route + '"' : "";
}
/* A link to a section of the page you are already on is an anchor, not a
   reload: "วิธีใช้งาน" on the landing has to scroll, the way it did before the
   header became shared. */
function siteNavHref(href) {
  const hash = href.indexOf("#");
  if (hash < 1) return href;
  const page = href.slice(0, hash).split("?")[0];
  return location.pathname.endsWith("/" + page) ? href.slice(hash) : href;
}
function siteNavBrand() {
  return '<img class="brand-lockup" src="' + SITE_NAV_BRAND.src + '" width="' + SITE_NAV_BRAND.width +
    '" height="' + SITE_NAV_BRAND.height + '" alt="' + SITE_NAV_BRAND.alt + '">';
}
function siteHeaderMarkup() {
  const services = SITE_NAV_SERVICES.map(([href, label, route]) =>
    '<a href="' + siteNavHref(href) + '"' + siteNavAttrs(route) + '><span>' + label +
    '</span><i data-lucide="chevron-right" aria-hidden="true"></i></a>').join("");
  const links = SITE_NAV_LINKS.map(([href, label, route]) =>
    '<a href="' + siteNavHref(href) + '"' + siteNavAttrs(route) + ">" + label + "</a>").join("");
  return '<a class="brand" href="' + siteNavHref(SITE_NAV_HOME) + '" aria-label="Krane Clinic home">' + siteNavBrand() + "</a>" +
    '<nav class="desktop-nav" aria-label="เมนูหลัก">' +
      '<div class="nav-menu" data-nav-menu>' +
        '<button class="nav-menu__trigger" type="button" aria-expanded="false" aria-haspopup="true" data-nav-menu-trigger><span>บริการของเรา</span><i data-lucide="chevron-down" aria-hidden="true"></i></button>' +
        '<div class="nav-menu__menu">' + services + "</div>" +
      "</div>" + links +
    "</nav>" +
    '<div class="header-actions">' +
      '<label class="language-control"><span class="sr-only">ภาษา</span><select data-language aria-label="ภาษา"><option value="th">TH</option><option value="en">EN</option></select></label>' +
      '<div class="header-profile" data-header-profile>' +
        '<a class="profile-trigger profile-trigger--login" href="krane-b2c.html#login" target="_parent" data-route="login" data-profile-login data-nav-i18n-aria="login" aria-label="เข้าสู่ระบบ"><i data-lucide="user-round"></i><span class="profile-trigger__label" data-nav-i18n="login">เข้าสู่ระบบ</span></a>' +
        '<button class="profile-trigger profile-trigger--account" type="button" aria-label="เปิดเมนูโปรไฟล์" aria-haspopup="menu" aria-expanded="false" data-profile-trigger hidden><img alt="" referrerpolicy="no-referrer" data-profile-picture hidden><span data-profile-fallback><i data-lucide="user-round" aria-hidden="true"></i></span></button>' +
        '<div class="profile-menu" role="menu" data-profile-menu hidden>' +
          '<div class="profile-menu__identity"><strong data-profile-name>ผู้ใช้ Krane</strong><span data-profile-provider>บัญชีผู้ใช้</span></div>' +
          '<a href="krane-b2c.html#profile" target="_parent" data-route="profile" role="menuitem"><i data-lucide="user-round"></i><span>โปรไฟล์</span></a>' +
          '<button type="button" role="menuitem" data-profile-logout><i data-lucide="log-out"></i><span>ออกจากระบบ</span></button>' +
        "</div>" +
      "</div>" +
      '<button class="menu-toggle" type="button" aria-label="เปิดเมนู" aria-controls="mobile-menu" aria-expanded="false" data-menu-open><i data-lucide="menu"></i></button>' +
    "</div>";
}
function siteDrawerMarkup() {
  const services = SITE_NAV_SERVICES.map(([href, label, route]) =>
    '<a href="' + siteNavHref(href) + '"' + siteNavAttrs(route) + ">" + label + "</a>").join("");
  const links = SITE_NAV_LINKS.map(([href, label, route]) =>
    '<a class="mobile-nav-link" href="' + siteNavHref(href) + '"' + siteNavAttrs(route) + ">" + label + "</a>").join("");
  return '<div class="mobile-menu__head" tabindex="-1" autofocus><span class="mobile-menu__brand">' + siteNavBrand() +
      '</span><button type="button" aria-label="ปิดเมนู" data-menu-close><i data-lucide="x"></i></button></div>' +
    '<h2 class="sr-only" id="mobile-menu-title">เมนูหลัก</h2>' +
    '<nav aria-label="เมนูหลัก">' +
      '<details class="mobile-care-menu" open data-mobile-nav-section><summary><span>บริการของเรา</span><i data-lucide="chevron-down"></i></summary>' +
      '<div class="mobile-care-menu__list">' + services + "</div></details>" + links +
    "</nav>" +
    '<div class="mobile-menu__language"><span>ภาษา</span><label class="language-control"><span class="sr-only">ภาษา</span><select data-language aria-label="ภาษา"><option value="th">ภาษาไทย</option><option value="en">English</option></select></label></div>' +
    '<div class="mobile-menu__actions"><a class="button button--dark" href="krane-b2c.html#login" target="_parent" data-route="login" data-mobile-login data-nav-i18n="login">เข้าสู่ระบบ</a></div>';
}
function renderSiteHeader() {
  const header = document.querySelector("[data-site-header][data-site-header-render]");
  if (!header) return;
  header.innerHTML = siteHeaderMarkup();
  let drawer = document.querySelector("#mobile-menu");
  if (!drawer) {
    drawer = document.createElement("dialog");
    drawer.id = "mobile-menu";
    header.insertAdjacentElement("afterend", drawer);
  }
  drawer.className = "drawer mobile-menu mobile-menu--landing";
  drawer.setAttribute("aria-labelledby", "mobile-menu-title");
  drawer.innerHTML = siteDrawerMarkup();
  /* The icons are drawn from the markup, so they have to be asked for again
     now that this markup did not exist when the page first painted. */
  window.lucide?.createIcons?.();
}


  window.KraneSiteNav = { render: renderSiteHeader, markup: siteHeaderMarkup, drawerMarkup: siteDrawerMarkup };
  renderSiteHeader();
})();

export const QA_ROUTE_ALIASES = Object.freeze({
  "/": "/START-HERE.html",
  "/qa": "/START-HERE.html",
  "/index.html": "/START-HERE.html",
  "/b2c/landing": "/b2c/krane-b2c-landing.html",
  "/b2c/krane-b2c": "/b2c/krane-b2c.html",
  "/cms/doctor": "/cms/cms-doctor.html",
  "/cms/admin": "/cms/cms-admin.html",
  "/ui-inventory/components": "/ui-inventory/ui-components.html",
  "/krane-b2c-landing.html": "/b2c/krane-b2c-landing.html",
  "/krane-b2c.html": "/b2c/krane-b2c.html",
  "/cms-doctor.html": "/cms/cms-doctor.html",
  "/cms-admin.html": "/cms/cms-admin.html",
  "/ui-components.html": "/ui-inventory/ui-components.html"
});

export function qaAssetPath(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return QA_ROUTE_ALIASES[normalized] || null;
}

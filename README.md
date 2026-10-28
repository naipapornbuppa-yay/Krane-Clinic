# Krane Clinic

Interactive prototype for a telehealth clinic: the patient app, the public landing page, the doctor portal, and the admin portal. The screens are static HTML, CSS, and JavaScript in `public/`. A thin [vinext](https://github.com/cloudflare/vinext) / Next.js app in `app/` redirects `/` to the review gate. GitHub Pages publishes the `public/` directory.

Live review: https://naipapornbuppa-yay.github.io/Krane-Clinic/

This is a design prototype for flow, content, and component behavior. It is not a production system and it does not contain real patient records.

## Open it

Node.js `>=22.13.0` is required for the vinext scripts. The static pages themselves need only a browser.

GitHub Pages, or any static server whose document root is `public/`:

```bash
npm run preview:b2c
```

That serves `public/` at http://127.0.0.1:5173/ and opens `START-HERE.html`. A plain static server works too:

```bash
python3 -m http.server 8765 --directory public
```

Then open http://127.0.0.1:8765/START-HERE.html

The vinext dev server serves the same files and redirects `/` to the gate:

```bash
npm install
npm run dev
```

Use a current Chrome, Edge, or Safari. Keep the HTML files next to `assets/`, `b2c/`, `cms/`, and `ui-inventory/`. Opening a single HTML file from a cloud-drive preview will not load the images, CSS, or scripts.

`public/` contains `.nojekyll` so GitHub Pages serves the prototype as static files.

## Review gate

`START-HERE.html` (also `/` and `index.html`) asks for an access code, then shows four destinations. The check runs in the browser and remembers a session flag. It is unchanged by the repo cleanup. It is not account authentication.

## Page map

| Page | File | Also reachable as |
| --- | --- | --- |
| Review gate | `public/START-HERE.html` | `/`, `index.html` |
| Patient app | `public/b2c/krane-b2c.html` | `krane-b2c.html` redirects here. Hash routes such as `#landing`, `#consent-terms`, `#conditions`, `#profile` |
| Public landing | `public/b2c/krane-b2c-landing.html` | `krane-b2c-landing.html` redirects here. The patient app embeds this page on `#landing` |
| Doctors | `public/b2c/doctors.html` | Linked from the landing page |
| Doctor profile | `public/b2c/doctor-detail.html` | `doctor-detail.html` redirects here |
| Condition guide | `public/b2c/condition-detail.html` | Linked from the landing page |
| Medical advisors | `public/b2c/advisor-detail.html` | `advisor-detail.html` redirects here |
| GLP-1 safety | `public/b2c/glp1-safety.html` | Linked from the patient flow |
| Doctor portal | `public/cms/cms-doctor.html` | `cms-doctor.html` redirects here |
| Admin portal | `public/cms/cms-admin.html` | `cms-admin.html` redirects here |
| UI inventory | `public/ui-inventory/ui-components.html` | `ui-components.html` redirects here |
| State illustrations | `public/b2c/state-illustrations-ink.html` | Set B, the set used in the app. `state-illustrations.html?archive=set-a` keeps the archived Set A gallery |

The four cards on the gate are the partner entry (`b2c/krane-b2c.html?entry=partner#consent-terms`), the patient app, the doctor portal, and the admin portal.

Thai is the default. `?lang=en` switches a page that loads `i18n.js` to English. The patient app's landing screen is the public landing in an iframe, so the language control on that screen is the one inside the landing page.

## Where the code lives

- `public/b2c/` is the patient app and landing. `design-tokens.css`, `components.css`, `i18n.js`, and `custom-select.*` in this folder are the live patient copies.
- `public/cms/` is the doctor and admin portals, with their own tokens, stylesheet, and `i18n.js`. Those files are not identical to the patient copies, so they stay separate.
- `public/ui-inventory/` is the component inventory. It keeps its own tokens, components, and CMS stylesheet because those files still differ, and `components.css` resolves `assets/` relative to this folder.
- `public/assets/lucide.min.js` is the single icon bundle. `public/assets/krane-logo.svg` is the canonical wordmark (`public/assets/krane-clinic-lockup-v1.svg` is the lockup used in the app header).
- `public/i18n.js` is an older dictionary. No page loads it. It stays because `tests/rendered-html.test.mjs` locks three strings in that file, and the live `b2c/i18n.js` translation of the same line is different.
- `app/` is the vinext shell: `page.tsx` redirects to the gate, and `layout.tsx` sets the document icon to `/assets/krane-logo.svg`.
- `worker/routes.mjs` maps the short vinext URLs (`/cms/doctor`, `/b2c/landing`, and the root HTML aliases) onto the files above.
- `public/b2c/handoff/` and `public/b2c/strings/` describe the string-id contract. The prototype does not load them, so editing them does not change the UI.
- `tests/` checks routes and a large set of markup contracts. Many cases are marked `todo` because they still describe an older landing.

## Scripts

- `npm run dev` — vinext dev server
- `npm run preview:b2c` — static server for `public/` with live reload
- `npm run build` — vinext build
- `npm test` — build, then the node tests
- `npm run test:fast` — node tests only

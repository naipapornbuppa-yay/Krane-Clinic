# BE DEV handoff — B2C patient app

> **21 October 2026 — page source handoff for Tin:** Use [developer-handoff/README.md](developer-handoff/README.md) for the new editable per-page HTML/JS/CSS and shared libraries. This is regenerated from this branch's own baseline `3beddab450c9a6da9649c75dddce402dbc9cd39d`, not the newer live `gh-pages` app. The original app and styles remain unchanged. Hair scalp screening stays before photos; ED heart and nitrate screening stay in separate steps. Pricing/navigation updates on `gh-pages` are a separate delivery. All screens still mount together in the compatibility runtime; these are not independently mounted production routes. B2C-only scope and the existing backend limitations remain.


Updated 16 October 2026 with B2C font reliability fix and scheduled QA from preview commit `17d87f6`.

## Scope

- **B2C patient app: included for frontend implementation.**
- **Landing page: included, WIP; not final or accepted.**
- **Doctor portal: coming later, still in development; excluded.**
- **Admin portal: coming later, still in development; excluded.**

Portal source retained in this repository is historical reference, not a deliverable. Do not implement or accept it from this branch. Current portal development remains separate.

## Start

Run `python3 -m http.server 8000` from the repository root, then open:

- [Patient app](b2c/krane-b2c.html): `/b2c/krane-b2c.html?screens=1&entry=partner#profile`
- [Handoff changes and checks](HANDOFF-BE-DEV.md)
- [B2C implementation guide](b2c/handoff/START-HERE.md)
- [System map and string-ID boundaries](SYSTEM-MAP.md)

Canonical patient UI: `b2c/krane-b2c.html` and the CSS/JS beside it. Root/public copies are compatibility/reference files, not alternate sources to edit.

Shared `krane-clinical-*.js` files are required frontend demo dependencies. They use browser storage; they do not provide authentication, role enforcement, backend persistence, real appointments, payments, or signed documents.

Install dev dependencies with `npm install`. Run `npm run check:ui` and `npm run check:strings`. Use `CHROMIUM_PATH` if testing with installed Chrome.

Latest regression: [scheduled B2C QA report](b2c/handoff/QA-NIGHT-2026-10-13.md). Contract 170/170 and responsive chrome 114/114 passed. Portals remain excluded.

Latest scheduled round: [17 October QA](b2c/handoff/QA-NIGHT-2026-10-17.md). Contract 170/170 and responsive 114/114 passed after retries; named regression and live smoke checks passed. No application behavior changed in this round.

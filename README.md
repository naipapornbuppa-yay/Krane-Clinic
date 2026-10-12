# BE DEV handoff — B2C patient app

Updated 13 October 2026 from preview commit `cce758a`.

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

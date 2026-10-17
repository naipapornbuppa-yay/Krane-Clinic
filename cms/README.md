# CMS Client Review

Doctor and Admin are separate HTML
surfaces but share the component system in this folder.

Open `cms-doctor.html` for the doctor portal or `cms-admin.html` for operations and admin.
Both pages share the CSS, JavaScript, localization, and assets in this folder.

Keep every file and the `assets/` and `i18n/` folders together.

Move a superseded version into `Input/03_Design/Archive/` before replacing it here.

## Consultation prescription composer (11 October 2026)
The consultation chat now includes a visible medicine editor above the thread. Search matches brand, generic name, product name and SKU while typing. Selected catalog medicines enter the same draft used by the post-consultation prescription page. Clinicians can change quantity/directions or remove items, then explicitly share a snapshot in chat. Empty drafts cannot be shared. Sending a preview does not save/confirm an order. The existing save and order-confirm flow remains separate. This is frontend demo chat; real patient delivery, persistence and authorization require backend integration.

Validation: `node cms/tools/qa-rx-composer.cjs` — SKU search, selection, edited instructions in chat, unconfirmed order state, empty-draft guard and responsive screenshots passed.

Doctor readiness and end-to-end UX review: [DOCTOR-UX-AUDIT-2026-10-11.md](DOCTOR-UX-AUDIT-2026-10-11.md). Includes fixed defects, reproducible QA evidence and remaining backend/clinical-workflow gaps.

Current browser-only workflow: [Doctor/B2C workflow review, 17 October](DOCTOR-WORKFLOW-2026-10-17.md). This iteration is excluded from BE DEV handoff. Use one browser and origin to test shared records; it does not connect a backend.

# Developer start here — Krane frontend handoff

Updated 11 October 2026. This package covers the **B2C web app, Doctor CMS and Admin CMS**. **The landing page is work in progress and is explicitly excluded from accepted handoff.** Existing landing routes remain available for review; availability is not approval.

## Open the intended implementation

| Deliverable | Canonical source | Published review entry | Status |
|---|---|---|---|
| B2C web app | [`../krane-b2c.html`](../krane-b2c.html) | [Patient app review](https://naipapornbuppa-yay.github.io/Krane-Clinic/b2c/krane-b2c.html?screens=1#conditions) | Frontend prototype and handoff candidate; see explicit remaining items below |
| Doctor CMS | [`../../cms/cms-doctor.html`](../../cms/cms-doctor.html) | [Doctor CMS](https://naipapornbuppa-yay.github.io/Krane-Clinic/cms/cms-doctor.html) | Browser prototype; route/action QA evidence exists |
| Admin CMS | [`../../cms/cms-admin.html`](../../cms/cms-admin.html) | [Admin CMS](https://naipapornbuppa-yay.github.io/Krane-Clinic/cms/cms-admin.html) | Browser prototype; some actions remain integration or scoped-feature boundaries |
| Landing | [`../krane-b2c-landing.html`](../krane-b2c-landing.html) | Existing review only | **WIP — not accepted, do not treat as final developer delivery** |

URLs name the canonical routes, not a verification that a pending local change is deployed. Use the release commit and final QA result supplied with the delivery. Root CMS routes are compatibility entries; `cms/` contains the maintained implementation.

## Read in this order

1. [Readiness and scope](FRONTEND-HANDOFF-READINESS.md) — what is delivered, what is not.
2. [Current request closure ledger](CURRENT-REQUEST-LEDGER.md) — user requests, source/evidence and remaining action; separates frontend work from backend work.
3. [All intake routes](INTAKE-FLOWS.md) — direct category paths, partner insurance/self-pay, returning users, guards and shared view mapping.
4. [Cross-surface integration matrix](CROSS-SURFACE-INTEGRATION-MATRIX.md) — which actor writes/reads each field, local adapter seams, API ownership and failures.
5. [B2C developer notes](DEVELOPER-HANDOFF.md), [UI rules](../UI-RULES.md), [view identities](screen-view-contract.json) and [reuse audit](SCREEN-REUSE-AUDIT.md).
6. [Current QA report](QA-HANDOFF-2026-10-11.md) and [machine evidence](qa-handoff-evidence/) — inspect exact tested actions and limitations, not only totals.
7. [Error/edge cases](ERROR-EDGE-CASES.md), [article CMS fields](ARTICLE-CMS-NOTES.md), [final brand assets](../../assets/BRAND-ASSETS.md).

## String IDs: three distinct inventories

| Source | Use | Current limitation |
|---|---|---|
| [API/status catalog](string-ids.v1.json) and [contract instructions](STRING-ID-HANDOFF.md) | Stable message IDs and named params for backend/frontend errors and statuses | Separate from the UI literal-text translator |
| [Static UI catalog](../strings/krane-strings.json), [dynamic strings](../strings/krane-strings-dynamic.json), [catalog guide](../strings/README.md) | Reference screen copy and retain retired IDs | 1,135 total static entries: 923 active, 212 retired; 56 dynamic entries including historical entries at audit time |
| [Shared CTA IDs](../strings/shared-cta-ids.json), [unmapped runtime copy](runtime-copy-inventory.json), [missing English](../strings/krane-strings-missing-en.json) | Map shared actions, finish runtime binding and translation | 565 active Thai entries lack English in extracted catalog; no claim of complete bilingual delivery |

Question identity (`data-question-id` / `data-answer-id`) is a data contract, not automatically a translated String ID. Inspect `intakeTemplates` and its explicit `data-string-id` hooks in the app. Doctor/admin strings still use their literal translation runtime; the B2C catalog does not claim to cover every CMS label. Backend should not send display sentences as state; agree enum/message mapping and machine values.

Run `npm run check:strings` for the stable message contract. Regenerate B2C catalogs deliberately with `python3 b2c/strings/extract-strings.py` and review changes; do not delete retired IDs. This index does not silently regenerate or change copy.

## Archive policy

[Documentation manifest](DOCUMENT-MANIFEST.md) separates current instructions, immutable historical evidence and older external references. No app, asset or route is moved by this organization. The two superseded QA reports move into a dated archive with pointer files at their old paths, so existing links keep working. Other historical material remains in place.

Final branding evidence: [QA-BRAND-FINAL-2026-10-11.md](QA-BRAND-FINAL-2026-10-11.md) — 20/20 brand checks; related consistency 114/114 and contract 170/170 passed. Deployment verification remains pending.

## Run locally

From the repository root, run `python3 -m http.server 8080` and open the canonical paths above under `http://localhost:8080`. Keep all three apps on the same origin to demonstrate shared browser data. Use fictional data. A different port/browser/device does not share the demo storage.

Tooling uses Node.js and `npm ci`. The current Playwright scripts can use installed Chrome through `CHROMIUM_PATH`; see each QA report for exact commands and tested scope. No database, API server or provider credentials are bundled.

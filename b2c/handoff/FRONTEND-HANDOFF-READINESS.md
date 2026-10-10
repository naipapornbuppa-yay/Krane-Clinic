# Frontend handoff readiness — patient, doctor and admin

**Landing is WIP and explicitly excluded from accepted handoff.** The candidate delivery comprises the B2C web app, Doctor CMS and Admin CMS. Start at [START-HERE.md](START-HERE.md); open items are recorded in [CURRENT-REQUEST-LEDGER.md](CURRENT-REQUEST-LEDGER.md).

**Assessment: suitable for backend discovery and contract agreement; not yet accepted as a complete production integration handoff.** Source audit dated 10 October 2026. A published page or passing smoke test does not establish end-to-end integration.

## Start here

1. [Cross-surface integration matrix](CROSS-SURFACE-INTEGRATION-MATRIX.md): fields/actions, consumers, permissions, exact local mock seams and required server behavior.
2. [B2C developer handoff](DEVELOPER-HANDOFF.md): patient journey, strings, prototype boundaries and tooling.
3. [Canonical screen reuse audit](SCREEN-REUSE-AUDIT.md) and [view contract](screen-view-contract.json): common screens and entry context.
4. [Error and edge-case inventory](ERROR-EDGE-CASES.md): existing patient cases; extend with the cross-surface matrix during API acceptance.
5. [Article CMS notes](ARTICLE-CMS-NOTES.md): editorial field map and current adapter boundary.
6. [Review QA](QA-REVIEW-2026-10-10.md) and [night QA](QA-NIGHT-2026-10-10.md): historical evidence with the run scope stated in each report. These are not acceptance evidence for newly changed CMS/editorial work.
7. [String ID handoff](STRING-ID-HANDOFF.md): stable API messages and remaining runtime/catalog gaps.

Current combined test report: [QA-HANDOFF-2026-10-11.md](QA-HANDOFF-2026-10-11.md). Its reported run scope is authoritative; it does not imply production backend acceptance.

## What is implemented versus pending

| Area | Current position | Completion evidence needed |
|---|---|---|
| B2C web app | Reviewed implementation, structural tests and focused behavioral evidence | Brand 20/20, consistency 114/114 and contract 170/170 passed; partner branches and direct entry/auth QA passed; initial 23-file deployment verification passed, known String ID/localization boundaries remain |
| Landing page | WIP; existing routes preserved | Explicitly excluded from accepted handoff |
| Doctor CMS | Interactive prototype; current report covers routes and core consultation actions | Integration requirements and test boundaries in the current QA report |
| Admin CMS | Route/action QA plus local editorial/settings/coupon adapters | User/refund real persistence and quiz-authoring scope remain explicit boundaries |
| Cross-surface delivery status | Shared browser storage for one golden case | Recorded same-origin test, then server-backed multi-session tests during integration |
| Patient intake / doctor prescription payload transfer | Edited prescription payload persists for the fixed golden case; no arbitrary patient intake transfer established | API schemas, adapter replacement and a fresh-patient round trip |
| Editorial publication | New browser draft/published adapter visible in source | QA of draft isolation, publish, validation, reload and cross-tab refresh |
| Production identity, payment, video and insurance | Not implemented by this static frontend | Backend/service integration, credentials and provider test environments owned by implementation team |
| Final branding assets | User-exported Final SVGs installed, byte-identical to originals; icon, horizontal and compact wordmark mapped by placement | Final brand QA 20/20 passed; see assets/BRAND-ASSETS.md and brand QA report. Initial release verification passed for all 23 checked deployed files; verify later revisions independently |
| Staff permissions/configuration | Pricing/config and new coupons save locally; permission display remains local and quiz editing is unavailable | Agree role matrix; server authorization and actual persistence |
| Localization | Existing catalogs include known gaps | Reconcile missing English and runtime IDs before claiming bilingual completeness |

## Delivery checklist and responsibilities

Frontend owner: provide the three canonical entry links and source revision; working UI/state demos; shared fixtures with their limitations; interaction/validation requirements; reproducible QA results; explicit stub inventory; final assets and component rules.

Backend owner with frontend owner: agree schemas, operation names, record identities, permission matrix, transition rules, error contracts, authentication and deployment environments. Backend owns durable records, authoritative validation/state, authorization, audit, provider integrations and webhook reconciliation. Frontend replaces mock seams with agreed adapters and verifies returned states.

Product owner: confirm permission scope, workflow exceptions, publishing rules, clinical/document ownership and which unfinished admin features are in the delivery scope. These decisions cannot be inferred from a decorative control.

## Release gate

Do not change this assessment to “complete” until current QA evidence is linked for all three surfaces, stubs are implemented or explicitly accepted as excluded, cross-surface data limitations are acknowledged, final assets are approved and canonical deployed links are verified. Backend implementation itself is a separate delivery; an honest frontend handoff can precede it, provided its contracts and open decisions are explicit.

The documentation source audit did not establish test coverage. Subsequent adapter tests are recorded separately: `node b2c/tools/shared-prescription-test.mjs` validates prescription persistence, input rejection, totals and fulfillment isolation; `node b2c/tools/admin-settings-qa.mjs` exercises admin validation, reload, storage failure and mobile controls. Results must be tied to the final source revision before release.

Final branding evidence: [QA-BRAND-FINAL-2026-10-11.md](QA-BRAND-FINAL-2026-10-11.md) — 20/20 brand checks; related consistency 114/114 and contract 170/170 passed. The initial published release passed an exact 23-file check across the three apps, shared scripts and Final SVGs. Subsequent revisions must pass the same release check; local QA alone does not establish deployment.

# Cross-surface integration matrix

Source inspection: 10 October 2026. This document describes the browser prototype and proposes responsibilities for the future API; it does not assert that an API exists or that every flow passed QA.

## Execution sources and mock seams

| Surface / seam | Source | Actual behavior |
|---|---|---|
| Patient landing and web app | `b2c/krane-b2c.html`, `b2c/krane-b2c-landing.html` | Local flow state, simulated transitions, fixture records; verify landing entry against the deployed entry links |
| Doctor | `cms/cms-doctor.html`, `cms/doctor-core-flow.js` | Demo sign-in, consultation, prescription and closeout UI; `krane-doctor-signed-in` session flag is not authentication |
| Admin | `cms/cms-admin.html` | Local navigation, account editor, order operations and configuration UI; several buttons only acknowledge actions |
| Golden shared record | `krane-golden-fixture.js` | Frozen patient, doctor, consultation, medicine and order values; localStorage `krane-golden-demo-state-v1` stores fulfilment status, consultation status, a validated prescription payload and updated time |
| Shared state consumers | `krane-golden-patient.js`, `krane-golden-doctor.js`, `krane-golden-admin.js` | Same-origin tabs react to `storage` and `krane-demo-state`; not a server or multi-device connection |
| Doctor order event | `krane-doctor-order-created` in `cms/doctor-core-flow.js` | Event includes selected items and total; golden doctor adapter calls `writePrescription`. Validated item names, quantities, prices and original directions persist; total is recalculated. The patient consumer is restricted to the explicit golden demo route, not ordinary baskets |
| Editorial data | `b2c/article-data.js`, `b2c/article-store.js`, `b2c/article-mocks.js`, `cms/article-editor.js` | New local adapter: draft/published snapshots in `krane-editorial-demo-v1`; inspect current QA report before treating it as accepted |
| Patient draft | `flowState`, `FLOW_STATE_KEY` and intake draft helpers in patient HTML | Browser session/draft state. Not an authoritative patient record; review shortcuts may keep state in memory |
| Admin settings adapter | `cms/admin-settings.js` | Prices, configuration control values and new coupons persist in `krane-admin-settings-demo-v1`; not consumed by B2C quotes or clinical routing |
| Shared view identity | `screen-view-contract.json`, `b2c/shared-view-components.js` | Reused view/component identities; entry conditions remain prototype adapters until server integration |

Use the `cms/` entry files for current back-office work. Root-level `cms-doctor.html` and `cms-admin.html` also exist and are not interchangeable without a redirect/deployment decision; confirm the distributed links with the project owner. Shared localStorage requires the same origin/browser profile. It does not sync separate computers, private sessions or arbitrary file URLs.

## Data and action mapping

The API operations below are capability names, not agreed endpoint URLs. Backend and frontend owners should agree schemas and error codes before implementation.

| User action / data | Consumers and permitted actors | Prototype evidence / limit | Server responsibility and required error states |
|---|---|---|---|
| Consent acceptance: version, timestamp, scope | Patient accepts; assigned clinician sees necessary consent; authorized admin audits | Local consent routing | Record identity-bound acceptance/version; handle withdrawn or changed consent, expired session, retry without duplicate acceptance |
| Phone, OTP, name, identity document | Patient owns profile; clinician reads assigned patient identity; admin access scoped by role | Demo OTP and local image preview; ID selection may insert fixture identity | Issue/verify/resend challenge, expiry and attempt/rate limits; secure upload/OCR; wrong code, expired code, changed number and rejected image |
| Insurance identifier and entitlement selection | Patient supplies; authorized insurer/operations verifies; clinician sees applicable context only | Fixture eligibility and policy balance | Authoritative eligibility/quote; no match, expired coverage, insufficient balance, timeout and self-pay fallback; never trust browser flags |
| Symptom, duration, prior relief, DOB, sex, height/weight, history and attachments | Patient creates/updates draft; assigned doctor reads | Patient fields exist; golden doctor record is fixed, not an arbitrary intake transfer | Save/resume validated intake with stable encounter ID; missing/invalid values, interrupted upload, expired draft and conflicting edit |
| Appointment, availability and matching | Patient requests; doctor manages own availability; admin schedules by permission | Local matching/queue/availability views | Slot reservation and authoritative queue; double booking, no doctor, cancellation, late arrival and reconnection |
| Consultation chat/video and clinical notes | Patient/assigned doctor participate; doctor owns clinical notes; audited admin access only if authorized | Room UI and local message/notes interactions | Session tokens, media service, persisted messages and notes; permission denied, microphone/camera blocked, disconnect, no-show and expired session |
| Prescription / plan / referral | Doctor authors and signs; patient accepts permitted quantities; admin/pharmacy fulfils authorized order | Doctor event persists items/total in browser shared state; explicit golden demo consumes these. No real signing, order/payment creation or ordinary patient record transfer | Signed versioned plan and order; authorization, stock checks, quantity maximum, revised plan, no-medicine closeout, duplicate submit and referral |
| Consultation/medicine payment, discount, shipping quote | Patient pays; admin sees settlement/refund; doctor sees relevant payment state | UI totals and simulated gateway; golden record has fixed totals | Server-calculated quote and provider webhook reconciliation; pending, failed, expired, canceled, duplicate callback, amount mismatch and refund failure |
| Saved address and order destination | Patient edits own address; authorized fulfillment staff reads destination | Local saved-address UI | Persist address; validation and delivery serviceability; deleted selected address, stale quote and immutable destination after dispatch policy |
| Order status | Admin/fulfillment updates; patient tracks; doctor reads summary | Shared golden status does synchronize within same browser origin | Enforce transition rules, actor permissions and optimistic version checks; backward/stale update, shipment failure, lost package and retry |
| Delivered review reminder and rating | Patient rates own completed encounter/order; admin moderates by role | Patient notification/reopen-review UI; not a shared review database | Eligibility, duplicate prevention and submitted/dismissed state; already reviewed, deleted notification and delayed delivery |
| Receipts, certificates and records | Patient accesses own documents; doctor signs authorized clinical documents; admin accesses allowed billing records | Document list/search previews | Generated versioned documents and signed download URLs; not ready, revoked, expired download and unauthorized patient |
| Article title, summary, hero, alt text, author, sections | Admin editor drafts, authorized publisher publishes; B2C consumes published snapshot only | Shared local article adapter; draft does not overwrite published copy | CMS ownership, review/publish authorization, media upload, revision history and cache invalidation; invalid media, missing fields, concurrent edits and publish failure |
| User accounts and staff permission chips | Authorized admin manages staff; each staff role sees permitted menus | Local account editor mutates UI; permission chips are not access control | Identity provider/session policy and server RBAC; unauthorized role grant, deactivated account and session expiry |
| Coupons, clinic settings and intake quiz management | Authorized admin configures; patient quote/intake consumes published config | Coupon validation/list/persistence and pricing/config save/reload are implemented locally. Config quiz editor is disabled pending approved schema; unrelated fallback actions may still toast labels | Persistence, validation, version/publish policy, audit; invalid dates, conflicting changes and dependent active consultations |
| Referral code/rewards | Patient shares; admin manages validated rewards | Frontend fixture UI | Attribution/eligibility ledger, duplicate/self referral, revoked reward and pending settlement |

## Transition and permission requirements

- Proposed ownership must be agreed with the product owner. Hiding a menu does not enforce permissions; all reads and writes need server authorization by user, role and record scope.
- Golden fulfilment enum: `Order received`, `Pharmacy accepted`, `Preparing`, `Rider pickup`, `Dispatched`, `Delivered`. Admin translates `Paid` and `Out for delivery` into shared values. Patient `advanceFulfilment` rejects backward movement, but admin currently calls `writeState` directly. Backend must define authoritative transitions rather than copy this permissive demo behavior.
- Separate encounter, prescription, invoice/payment, order and delivery identities. The golden fixture represents one fixed demonstration case, not a complete relational schema.
- Mutations need stable request identity, server timestamps, version/concurrency handling, retry behavior and returned record state. Payment completion comes from server reconciliation, not a button click.
- Keep patient-sensitive notes separate from administrative and patient-visible content. Agree field-level disclosure before wiring screens.
- API errors should use stable message IDs and parameters from the string handoff where available. Loading, empty, permission denied, unavailable, validation failure and retry states need explicit acceptance tests for each operation.

## Acceptance scenario for integration

Create a fresh synthetic patient → verify phone → submit consent/intake → assign an available doctor → clinician opens those exact answers → sends a newly edited plan → patient sees those exact items and permitted quantities → quote/pay through a test gateway → admin sees the resulting order/address → update delivery → patient and doctor see matching status → patient reviews/downloads documents. Independently edit an article draft, verify B2C remains unchanged, publish, and verify the published content updates.

The golden demo now carries edited prescription payloads, but its fixed patient/encounter identity does not satisfy the arbitrary-patient scenario above. Test separate browser sessions against a backend when one exists; same-origin localStorage tests are prototype evidence only.

## Admin configuration adapter contract

`cms/admin-settings.js` records `prices` (display-row ordered numbers), `config` (control-ordered booleans/selected indices) and `coupons` ({code,type,value,scope,vertical,start,end,maxUses}) in browser storage. The ordered arrays are a UI prototype seam, not durable API identifiers. Backend integration must replace them with stable medicine, channel and setting IDs and versioned updates.

Coupon values validate nonnegative fixed amounts, percentages from 0 to 100, uppercase unique code, ordered ISO dates and positive integer usage limits. Existing demonstration coupon rows remain separate fixture history; created records have no real redemptions. Once-per-account enforcement, eligibility, consumption counters and authoritative totals belong to the backend quote/redemption service. Neither these coupons nor changed admin prices affect B2C checkout today. Persisting a setting does not enact a clinical rule. Pricing/config writes must be approved and versioned before consumption by clinical or quote APIs.

Question editing remains an explicit unavailable feature pending approved questionnaire schema, permitted edits, revision/publish policy and behavior for in-progress consultations. Do not invent or reorder clinical questions to fill this boundary.

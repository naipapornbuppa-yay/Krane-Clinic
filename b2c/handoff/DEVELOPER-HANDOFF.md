# Krane B2C developer handoff

**Snapshot:** 10 October 2026, `gh-pages` prototype. This is a static, interactive review build, **not** a production patient system. Do not enter real patient data. The source of truth for B2C work is this repository's `b2c/` directory; copies under workspace `Output/` and `site/` are not deployment sources.

## Start here

| Need | Source |
|---|---|
| App and partner journey | [`../krane-b2c.html`](../krane-b2c.html) |
| Shared visual tokens and components | [`../design-tokens.css`](../design-tokens.css), [`../components.css`](../components.css), [`../UI-RULES.md`](../UI-RULES.md) |
| Screen/flow regression contract | [`../ui-contract.json`](../ui-contract.json), [`../tools/contract-check.mjs`](../tools/contract-check.mjs) |
| API message IDs and status enum mapping | [`string-ids.v1.json`](string-ids.v1.json), [`STRING-ID-HANDOFF.md`](STRING-ID-HANDOFF.md) |
| All extracted static screen copy | [`../strings/krane-strings.json`](../strings/krane-strings.json), [`../strings/README.md`](../strings/README.md) |
| Dynamic copy and untranslated text | [`../strings/krane-strings-dynamic.json`](../strings/krane-strings-dynamic.json), [`../strings/krane-strings-missing-en.json`](../strings/krane-strings-missing-en.json) |
| Runtime toast call sites without IDs | [`runtime-copy-inventory.json`](runtime-copy-inventory.json) |
| Failure and edge-case matrix | [`ERROR-EDGE-CASES.md`](ERROR-EDGE-CASES.md) |
| Article fixture and future CMS fields | [`ARTICLE-CMS-NOTES.md`](ARTICLE-CMS-NOTES.md), [`../article-mocks.js`](../article-mocks.js) |

The public app starts at `https://naipapornbuppa-yay.github.io/Krane-Clinic/b2c/krane-b2c.html?public=1#landing`. For the partner journey use `?entry=partner&fresh=1#consent-terms`; the screen directory can be enabled with `with_screen_tab=1`. `demoStage` URLs are isolated review shortcuts, not production routes.

## Journey contract

Partner entry retains the original question order and shares the current UI components:

1. `consent-terms` → `partner-idcard` (upload or skip).
2. `partner-patient-info`: editable name, phone verified by OTP, and insurance/self-pay choice.
3. Insurance branch: `insurance` eligibility input → `partner-insurance` entitlement selection. Self-pay bypasses these two screens. Both return to `intake-concern`.
4. `intake-concern`: symptom description, duration, attempted relief, optional image.
5. `intake-general`: sex, date of birth, height/weight and the health-history confirmation dialog.
6. Shared `matching` and consultation journey. Repeated views reuse the main flow rather than forking another UI.

On a fresh partner session, name, phone, sex, date of birth, height and weight are empty. A verified phone/name or a date of birth entered for insurance eligibility is carried forward. Skipping the ID card leaves identity fields blank. The ID-card preview currently inserts a **fixture name** after an image is selected; it is not OCR and must be replaced before production.

The local `flowState` is stored in `sessionStorage` under the keys near `FLOW_STATE_KEY` in `krane-b2c.html`; an intake draft has a separate key. `fresh=1` starts the required journey cleanly. `demoStage` deliberately keeps its state in memory so embedded previews do not overwrite a visitor's session. These browser-storage structures are prototype conveniences, not a data model or a patient record.

## String contract and current coverage

- The API-facing `string-ids.v1.json` has **87 stable IDs** and five backend status maps. Backend sends `messageId` plus named parameters; the frontend resolves Thai/English. Run `npm run check:strings` to validate uniqueness and placeholder parity.
- The extracted screen catalog has **923 active IDs** and **212 retired IDs**. Retired IDs are preserved for traceability and must not be reused for different copy. It also has **55 dynamic catalog entries (including retired entries)**. Regenerate with `cd b2c && python3 strings/extract-strings.py`; the extractor preserves an ID when screen and copy still match.
- **565 active Thai screen entries lack an English value in that catalog.** The current runtime is still literal-text based (`i18n.js` / `th-en.js`), so the catalogs are handoff inventories, not evidence that the app renders by ID.
- `runtime-copy-inventory.json` locates **92 toast call sites** still lacking message IDs. These require explicit mapping during integration. The inventory includes dynamic expressions and source line references; it does not assert that each branch is tested or translated.

## Production integration gaps

| Area | Prototype behavior | Required integration |
|---|---|---|
| Identity | ID image is previewed locally; a fixture name is shown | Secure upload, OCR/identity verification, editable verified fields, consent and retention policy |
| OTP/account | A local demo code drives verification | Backend issue/resend/expiry/rate-limit/attempt handling; never trust browser flags |
| Insurance | Eligibility and policy balance are fixtures | Insurer API, no-match/expired/insufficient coverage states and authoritative quote |
| Clinical intake | Browser storage holds answers; clinical screens are mockups | Authenticated patient record, validation, audit trail, clinical review and explicit safety policy |
| Matching/payment/fulfillment | Simulated status transitions and payment UI | Idempotent server workflows, webhook reconciliation, real inventory, delivery quote and failure recovery |
| Localization | DOM text walker plus incomplete extracted English | Bind rendered UI and backend responses to stable IDs; review Thai/English together |

## Verification and release

From repository root run `npm run check:strings` and `npm run check:ui` with Node.js, Python 3 and Playwright Chromium installed. `node b2c/tools/qa-chrome-consistency.mjs` checks repeated header/logo/navigation geometry at six widths and key screen components. See [QA-REVIEW-2026-10-10.md](QA-REVIEW-2026-10-10.md) for the current run and remaining limitations. The generated copy inventories are reviewed separately; they are not part of `check:strings`.

Before publishing a new version, run the checks, inspect the partner route at mobile and desktop widths, then update `gh-pages`. Git history is the rollback source. See the error matrix for cases that remain mock-only or unverified. Do not interpret the successful prototype checks as security, accessibility, medical, payment or backend acceptance tests.

The primary payment, continuation and insurance-check actions use the stable
IDs in `b2c/strings/shared-cta-ids.json`. `data-string-id` on their buttons
identifies the copy contract; amounts stay in the summary, and insurance
verification is a separate action from payment. The retired educational
interstitial (SID-022) and follow-up hub (SID-051F) are intentionally absent
from the review index. Old hashes redirect to their live replacements.

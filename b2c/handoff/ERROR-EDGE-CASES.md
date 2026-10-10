# Error and edge-case handoff

This matrix covers the patient app's main routes and the partner flow. **Verified** means an automated prototype check exists; **manual** means the behavior is visible in current code but needs a review pass; **integration** means the production system must supply a state the prototype cannot prove. The source of truth for exact displayed text is the code and the string inventories, not paraphrases here.

## Entry, identity, consent and OTP

| Case | Current prototype behavior | Status / next check |
|---|---|---|
| Fresh partner visit | Starts at consent and ID card; personal and health inputs begin empty | Verified in partner contract checks; recheck storage isolation across tabs |
| Returning verified visitor | Verified account phone/name can prefill; insurance DOB carries into health form | DOB and blank-state checks verified; test actual account integration |
| ID card skipped | Continues with editable blank name | Verified in flow check |
| ID card missing on continue | Warning; remains on upload screen | Manual |
| Unsupported or over-10-MB ID image | Non-image is ignored; oversized image gets warning | Manual; add explicit type error and accessible feedback |
| ID image selected | Local preview and fixture name; no upload or OCR | Integration; replace fixture and remove misleading production claim |
| Name empty | Continue blocked with warning | Code review only; add dedicated negative test |
| Phone absent/invalid/changed after verification | Invalid phone blocks; a valid first phone automatically opens OTP from the main continue action | Invalid phone tested; changed verified phone remains a separate integration test |
| OTP empty/incomplete/wrong/expired/resend/too many attempts | Prototype has local demo verification and partial warnings; catalog has IDs for invalid/expired/incomplete | Integration; enforce attempt limits, expiry and resend server-side |
| Consent not read/checked, session reload or back navigation | Flow guard should return to required step | Contract covers required route; manually test interruption and resume |

## Partner payment, concern and health

| Case | Current prototype behavior | Status / next check |
|---|---|---|
| Insurance or self-pay choice | Insurance visits eligibility and entitlement; self-pay goes straight to concern; both reuse shared intake | Verified by partner flow contract |
| Insurance ID/passport empty or DOB empty | Warning and focus on missing field | Manual |
| Insurance no match, expired policy, exhausted visits, API timeout | Current fixture always finds an eligible policy | Integration; design error/retry/self-pay fallback and test no data leakage |
| Policy changed after quote | Summary and credit are recalculated from chosen fixture | Manual; backend must return authoritative balance and lock quote |
| Symptom fewer than five characters | Warning, focus remains on symptom | Manual |
| Duration absent or attempted-relief choice absent | Warning; cannot continue | Manual |
| Optional concern image >10 MB or more than five | Warning; extra image rejected | Manual; also test format and upload interruption |
| Health DOB absent | Warning; cannot open safety dialog | Code review only; add negative test |
| Health history says “yes” but detail is blank | Warning and focus inside dialog | Manual |
| Fresh sex, height, weight | Inputs are blank; no fake birth date | Verified by partner empty-state check |
| Browser back/reload after a partially completed answer | Draft restores user-entered data in session; `demoStage` stays isolated | Manual across all steps; do not persist sensitive data to unrestricted production storage |
| Partner health submitted twice | `submitOnce`/state guard should prevent repeated transition | Manual; server must be idempotent |

## Shared clinical, payment, order and delivery

| Case | Current prototype behavior | Status / next check |
|---|---|---|
| No doctor/slot unavailable or slot taken during selection | Matching and booking have fallback screens and unavailable-slot warnings | Contract covers route existence; integration must resolve race on server |
| Consultation payment failed or expired | Failure and expiry screens exist | Contract covers screens; reconcile gateway callback and retry idempotently |
| Prescription not ready / pharmacy stock changed | Prototype has waiting and stock-update states | Manual; authoritative pharmacy events required |
| Same-day delivery unavailable | Switches to standard delivery with warning | Manual; real quote and ETA required |
| Delivery address incomplete, invalid or missing | Field-specific warning and continue blocked | Address audit scripts exist; rerun after address changes |
| Payment order expired after stock/quote change | Warning requests re-confirmation | Manual; server must invalidate old payment request |
| Quantity zero, max quantity or medicine declined | UI updates checkout amount and state | Manual; validate price and safety server-side |
| Prescription refill too early, expired or limit reached | Backend catalog defines separate IDs | Integration; no authoritative refill service in this prototype |
| Offline, timeout, unknown message ID | Catalog includes generic/offline/timeout fallbacks | Integration; runtime is not yet bound to ID catalog |
| English language switch | Many catalog entries still lack English | Known gap; review 565 active catalog entries without English values before English release |
| Mobile notch, fixed footer, nav/logo across screens | Shared visual QA spans 320–1440 px and 114 page/viewport cases | Browser QA passed before this handoff; repeat after layout changes |

## QA ownership

Run `npm run check:ui`, `npm run check:strings`, and the visual consistency script listed in [`DEVELOPER-HANDOFF.md`](DEVELOPER-HANDOFF.md). The negative and integration cases marked above are **not** claims of completed production QA. Turn each integration row into a backend contract test and one UI acceptance test before release. For every new error message, add a stable ID to `string-ids.v1.json` with Thai/English copy and matching parameters, then replace the corresponding literal listed in `runtime-copy-inventory.json`.

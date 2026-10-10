# Frontend handoff QA — 11 October 2026

## Scope and environment

Local HTTP server; installed Google Chrome through Playwright. Fictional data only. Doctor/admin route checks at 390×900 and 1440×900. This is prototype verification, not production certification or live API testing. The source worktree contains concurrent integration work; rerun the commands below after final merge.

## Verified results

- `node b2c/tools/cms-handoff-qa.mjs`: 50/50 route/runtime checks: 15 doctor pages and 8 admin pages at two widths, plus runtime error checks. All pages activate and document width fits. Tables may scroll internally. This does not prove every action works.
- `node b2c/tools/cms-actions-qa.mjs`: 13/13 interactive cases: incomplete OTP rejection and demo login; queue → consultation → prescription add/save → create order and persisted shared plan; required user fields and in-page save; refund cancellation and in-page confirmation; schedule invalid range and persisted working day; availability validation/reload; profile validation/reload; photo/signature preview reload; referral required acknowledgement/destination; no-medicine closeout; CSV audit download; patient/doctor search empty states and consultation status options; reassignment navigation.
- `node b2c/tools/cross-surface-handoff-qa.mjs`: verifies draft isolation, pending revision isolation, publication to B2C and landing, new article creation/publication, invalid title, delivery status propagation, rendered golden order snapshot, doctor plan event, reload persistence, legacy redirects, and normal basket isolation. 15/15 behavioral cases passed, with 3 additional visible-stage evidence records (18 records total). Final machine results accompany this report.
- `node b2c/tools/admin-settings-qa.mjs`: 5/5 reported by owning agent; coupons validation/persistence, pricing/config persistence with patient isolation, and mobile control sizing. Machine evidence included.
- Root agent also ran contract checks (170 passed) and string contracts (87 passed). Those are structural contracts, not end-to-end production coverage.

## Defects repaired in this QA pass

1. P1 — Admin linked to an order whose B2C total/items/address came from an unrelated default basket. Reproduce: open admin fulfilment and patient tracking in a fresh context. Previously admin showed 1,160 while B2C showed 558. The admin link now requests an explicit golden order snapshot; tracking and summary consume the shared fixture or physician plan. Existing checkout basket/address remain separate. Revised physician plan totals also update the admin summary, eliminating a stale 1,160 display after the patient snapshot changed.
2. P1 — CMS tracking deep-link could hit the normal access guard. Added the explicit review stage to that demonstration link. Normal access behavior remains unchanged.
3. P2 — Delivered hint contained a September date beside a current timestamp, and the ETA still showed a future range. Both now use the recorded delivery time.
4. P2 — Rider pickup displayed the preparing copy. The visible stage now says the rider is collecting medicine.
5. P2 — Profile/photo save feedback did not persist changes. Added browser-only demo persistence and profile required-field checks; removed duplicate signature file input and persisted signature preview. Audit export now downloads a CSV instead of only displaying feedback.
6. CMS route initialization and article publishing fixes were implemented by the root agent; route and publication regression cases cover them.

## Remaining boundaries and follow-up acceptance

| Area | Status / reproducible boundary | Severity for production |
|---|---|---|
| Authentication/roles | Demo OTP accepts a six-digit fixture flow; no server session or server-enforced role boundary is tested. | P0 release blocker |
| Data sharing | localStorage shares only within the same browser profile and origin. A different device/user does not receive these updates. | P0 release blocker |
| User management/refund | In-page behavior is tested; real account creation, payment refund, authorization and audit persistence are not implemented by these handlers. Reload persistence is not claimed. | P1 integration requirement |
| Clinical/video | Prescription prototype submission is covered; video/network failures, actual signing, medical validation and consultation service are not covered. | P1 integration requirement |
| Documents | Receipt/certificate links currently open static PDF examples. They are not regenerated from a changed prescription or payment. | P1 integration requirement |
| Other action coverage | Scheduling, availability, profile, photo/signature, referral, no-medicine closeout and CSV export now have interactive cases. Reassignment navigation and consultation status filter options are exercised; real rematching is an integration boundary. Disabled non-golden rows intentionally do not open. Inspect scope against the action inventory. | P2 QA follow-up |
| Localization | Some fixture clinical directions remain English inside Thai screens. No claim of complete bilingual copy approval. | P2 copy review |
| Payments/CMS | Publishing and order updates are browser simulation; no gateway, insurer, courier, database or authenticated CMS API was contacted. | P0 release blocker |

## Evidence

`qa-handoff-evidence/` stores compact JSON results and action inventory. Screenshots are generated under `/tmp/krane-cross-surface/editor-390.png` and `editor-1440.png` on the test host. Initial mobile sidebar clipping during viewport transition was not persistent; after 700 ms the rail is off canvas and the page aligns correctly.

Ready for backend implementation discussion with these explicit boundaries. Do not describe this report as complete production QA or as proof that every possible error/edge case has been tested.


## Final intake entry verification

- Real partner entry, without `demoStage`: insurance branch passed consent → ID skip → name/phone OTP → eligibility → coverage → concern → general health → safety confirmation → matching → fee acknowledgement → waiting room. Self-pay passed the same relevant question order through matching and fee review, with no insurance DOB assumed.
- Direct entry passed intake start and guarded consent deep link → signup → OTP → consent. This case checks prerequisite enforcement; it does not claim a full direct clinical questionnaire completion.
- Latest review-round regression: 9/9 pass. Latest night-edge regression: 4/4 pass. Evidence: `qa-handoff-evidence/real-entry.json`.
- Partner entry intentionally rewrites to `fresh=1#consent-terms` and seeds an authenticated handoff. Consent-first documentation describes this prototype behavior correctly. Real partner assertion verification remains a backend integration boundary; URL parameters are not production authentication. No runtime changes were required in this verification.


## Release language regression fix

Remote CI identified a transient Thai order-progress accessibility label after English was selected. The runtime now renders that dynamic label in the current language synchronously, without waiting for the translation MutationObserver. `order-progress-language-qa.mjs` passed immediate same-task checks for Preparing, Rider pickup, Out for delivery and Delivered, plus Thai/English language changes.

Full contract rerun after this fix: **170/170 passed** (63 screens, 44 components, 5 flows, 33 rules).

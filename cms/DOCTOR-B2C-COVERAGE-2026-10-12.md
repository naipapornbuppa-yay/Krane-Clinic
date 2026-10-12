# Doctor portal UX and B2C coverage audit

12 October 2026. Canonical entries: `cms/cms-doctor.html` and `b2c/krane-b2c.html`. Fictional records only. Doctor/admin are **work in progress, not included in the approved BE DEV handoff**. This audit does not change that handoff branch.

Subsequent implementation and remaining gaps: [clinical sync status](CLINICAL-SYNC-2026-10-12.md). The findings below describe the pre-fix baseline.

## Verdict

**Not complete:** the doctor portal supports the main single-case consultation demonstration, but does not accommodate every B2C feature through connected frontend state. Missing frontend logic is distinct from the deliberately deferred backend. Passing UI tests is not proof of a connected patient lifecycle.

## UX improvements implemented

- Separate medicine discovery from adding a result: search icon + search label, then plus icon + add action per medicine.
- Consultation shortcuts for video, prescription draft, chat and private clinical notes. Preserve route and form state; move keyboard focus into the selected task. The room chat control now opens the composer rather than displaying a toast.
- Clearer medicine item grouping, consistent CMS buttons, mobile action targets, visible focus outlines, responsive medicine search rows.
- Replace the misleading recording indicator with an explicit demo/no-recording label. Call controls remain simulated.
- Keep draft preview separate from prescription confirmation and order creation. No clinical default or questionnaire order changed.

## Coverage and ownership

“Partial” means UI or a restricted fixture exists; it does not mean patient-to-doctor synchronization passed. Rows below are source-inspected against the route inventory. Runtime evidence is separately listed below.

| B2C feature / route family | Doctor responsibility | Current coverage | Remaining frontend work / owner |
|---|---|---|---|
| Landing, conditions, articles | Read relevant published clinical content | Admin editorial subsystem; not a doctor task | Landing WIP; admin owns publication |
| Signup, login, OTP, identity, consent | See assigned patient's identity and consent status | Partial: demo identity and notes | Bind consent/version and identity to the selected encounter; authentication backend later |
| Partner insurance and self-pay | Understand referral channel and applicable patient context | Partial: fixed case | Carry actual intake/channel/entitlement summary to case; finance remains operations |
| All direct intake categories, concern/general, PHR, photos | Read exact answers and attachments before accepting | Partial: preconsult fixture | Shared patient/encounter IDs, category-specific answers and upload references; preserve question order |
| Ineligible cases | Understand reason for escalation | B2C state exists | No invented clinical auto-approval; define assigned escalation queue |
| Matching, doctor selection, appointment, booked | Availability, accept case, see chosen slot | Partial: schedule editor and fixture queue | Booking must consume availability and appear in doctor queue; conflicts/unavailable/no-show states |
| Consultation payment and failure | See eligibility to enter consultation | Partial: fixed paid label | Propagate demo payment state; doctor does not collect card details |
| Waitroom, queue-resume | Admit/reassign the correct patient | Partial: golden case only | New intake must create queue item; reassign currently navigation, not state transfer |
| Consult/video/chat | Exchange messages and previews; keep SOAP private | Partial: local bubbles and simulated controls | Two-way rendered chat, delivery/error states and immutable Rx previews; private notes excluded |
| Rx-writing, Rx-plan | Author and confirm the exact plan | Partial: editable Rx and golden shared prescription | Ordinary B2C route ignores shared Rx unless `demoOrder=golden`; eliminate fixed-case dependence |
| No-medicine outcome and referral | Close without an order; provide instructions | Local action tests pass | Show exact outcome in patient history and notifications |
| Treatment details and consultation history | Patient-visible summary and prior encounters | Partial: separate fixture history | Persist finalized encounter snapshots; never expose private SOAP |
| Pause/resume program | Cancel follow-up, see paused state; resume with confirmed slot | Missing cross-portal connection | Patient key `krane.paused-programs.v1` is not read by doctor queue; update queue and availability |
| Refill and uploaded prescription | Review eligibility/expiry and requests requiring clinician review | Partial: patient selection UI | Doctor refill queue, request details, approve/decline outcome and reasons; pharmacy owns dispensing |
| Documents, prescriptions, certificates | Generate patient-specific clinical documents | Partial: previews/signature image | Versioned frontend document records, patient matching, preview/download/error; real signing deferred |
| Address, quotes, pharmacy search/pickup | Read relevant fulfillment context only | Operations-owned | Patient/admin address and order state need stable links; not a new doctor address editor |
| Payment items, insurance, payment, failures | Read order state where clinically relevant | Restricted golden prescription/order demo | Pricing/coupons are separate adapters; frontend quote consistency needed; payment backend deferred |
| Tracking, order summary, received confirmation | See fulfillment when following up | Golden fulfillment only | Arbitrary order linkage and valid state transitions; pharmacy/admin owns delivery controls |
| CSAT/feedbackdone | See appropriate review/follow-up signals | Patient UI exists | No evidence of a doctor review feed tied to encounter; operations moderation policy needed |
| Notifications | Receive actionable patient changes | Separate fixture notifications | Generate notifications from shared events; clicking must open matching case |
| Account, settings, empty states | Assigned-case access and readable empty/error states | Separate prototype settings | Patient/profile updates must not leak between cases; multi-patient isolation tests needed |

## Reproducible gaps

| Severity | Preconditions / steps | Expected | Actual and source evidence |
|---|---|---|---|
| P1 | Same-origin doctor + ordinary B2C tabs. Edit/save/confirm Rx; open patient plan/checkout without `demoOrder=golden` | Exact confirmed medicines for selected patient | `goldenOrderSnapshot()` returns null without query; source in B2C HTML |
| P1 | Open both consultation screens; doctor sends a new Rx preview or message | Patient renders exact snapshot/message | `doctor-core-flow.js` appends to doctor `.chat__thread`; no receiving-chat event store |
| P1 | Submit a new direct/partner patient; inspect doctor queue | New encounter and submitted answers | `krane-golden-doctor.js` disables other cases as `demo-out-of-scope`; identity remains fixture |
| P1 | Pause a B2C program, then inspect doctor follow-ups; resume with another slot | Queue reflects cancelled/new appointment | Pause module owns separate category-keyed storage; doctor does not consume it |
| P2 | Upload Rx / request refill; inspect doctor tasks | Reviewable request with decision trail | No connected clinician review queue established |
| P2 | Finalize a different consultation; open patient history/documents | Matching visit summary and documents | Demo documents/history not bound to arbitrary finalized encounter |

These are source-confirmed gaps, not falsely reported successful end-to-end browser tests. Use isolated synthetic records to reproduce; viewport does not alter the state-separation issue.

## Runtime evidence

- `evidence-doctor-audit/2026-10-12/routes.json`: 50 doctor/admin route and runtime checks at 390/1440px. Navigation/render only.
- `evidence-doctor-audit/2026-10-12/actions.json`: 13 action checks, including Rx golden state, schedule, referral/no-medicine, and two admin regressions. Reassign proves navigation only.
- `evidence-doctor-audit/2026-10-12/lifecycle.json`: focused form persistence, validation, preview snapshot, search, responsive editor, allergy propagation, duplicate confirmation, storage failure and shortcut focus checks.
- Editor screenshots reviewed at mobile/desktop sizes. No whole-product accessibility certification or live media test.
- B2C full contract suite was not rerun for this doctor-only change. Existing reports are historical evidence, not new passes.

## Next implementation order

1. Shared browser demo store keyed by patient, encounter, appointment, prescription and order; same-origin storage events and explicit failure states.
2. Intake → queue → preconsult and two-way chat/Rx preview, private notes kept separate.
3. Finalized plan/no-medicine/referral → patient history, documents and notifications without special URL flags.
4. Pause/resume, booked follow-up, refill review and uploaded-Rx decisions.
5. Multi-patient/cross-tab/reload/conflict tests reading the recipient UI, followed by operational order/fulfillment reconciliation.

No backend integration or production clinical validation is claimed. Keep portals out of the BE DEV delivery until the remaining frontend work is reviewed.

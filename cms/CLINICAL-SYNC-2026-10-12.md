# Frontend clinical synchronization — implementation status

12 October 2026. Work after the [coverage audit](DOCTOR-B2C-COVERAGE-2026-10-12.md). Doctor/admin remain outside the BE DEV handoff. No backend is added.

## Implemented

- Shared browser adapter `../krane-clinical-demo.js`. Encounter and patient IDs; active encounter is tab-session scoped. Message records have individual IDs so simultaneous messages do not overwrite one shared array. Public clinical plans, patient requests and program updates use separate records. Browser write failures propagate instead of reporting success.
- Doctor/patient chat renders the other side's messages, restores after reload, and shares immutable prescription-preview snapshots. Private SOAP is not part of the shared payload.
- New validated B2C waiting-room/booked entries submit a case with answers, channel, consent flag, category, and partner health context. The doctor queue can select these cases and renders submitted answers. Other fixture patients remain disabled; this is not an arbitrary-patient clinical backend.
- Selecting another shared encounter resets prescription defaults and restores the correct session draft; it does not copy Mali's medication or SOAP. Fixture intake/history is hidden for new cases to avoid presenting it as the new patient's data.
- Finalizing prescription, no-medicine or referral outcomes writes a patient-visible record. Duplicate finalization is rejected; failed saves leave confirmation retryable. Separate patient summary field avoids exposing private SOAP.
- The ordinary patient plan, activity, notifications and prescription-document panel receive finalized data without `demoOrder=golden`. The patient explicitly imports the plan into checkout; default demonstration medicines are hidden, quantities are capped at prescribed amounts, and existing quote/payment rules remain in control.
- Patient pause/resume updates appear in the doctor's program-status panel with the patient ID. These do not yet reserve against the doctor's working-hours schedule.
- Patients can request refill review or upload a prescription image/PDF (4 MB maximum). A doctor review panel can acknowledge review or return a reason; the patient receives the decision. Acknowledgement does not authorize medicine or create a prescription. Pharmacy acceptance remains a separate required step.
- Patient-specific downloadable HTML prescription preview is explicitly unsigned. It does not pretend to be a signed PDF/certificate.

## Verification

- 14 cross-portal checks (including populated mobile overflow): rendered two-way messages, Rx preview, reload, separate encounter isolation, submitted intake display, finalized plan, checkout import, paused status, request decision, SOAP exclusion, failed send preservation and duplicate closeout rejection.
- 11 doctor lifecycle checks, 13 doctor/admin action regressions, 50 responsive route/runtime checks, and all 170 B2C contract checks passed.
- The cross-portal test creates a synthetic submitted record through the adapter; **it does not certify every real intake submission route**. The B2C contract suite tests its agreed routes separately.
- Prescription requests/program tests verify adapter-to-receiving-screen behavior; file picker/quotas and all pause/resume UI combinations need additional end-to-end coverage.
- Existing closeout tests now reset the finalized test encounter between independent scenarios. They no longer attempt to close an already completed fixture encounter for a different scenario.
- Evidence: `evidence-doctor-audit/2026-10-12-sync/`.

## Still open — do not mark the entire audit complete

1. Shared working-hours availability, conflict-safe appointment selection and rescheduling; current B2C resume slots and doctor calendar remain different sources.
2. Complete intake-field/attachment mapping across every category and partner route, account-stable identity across multiple encounters, and complete history navigation.
3. Pharmacy/admin request ownership, approvals, stock, price/coupon configuration and arbitrary-order fulfillment synchronization. The new review request must not bypass pharmacist approval.
4. Signed/versioned certificates and production document lifecycle. HTML prescription preview is not a medical certificate.
5. Full TH/EN coverage of dynamic new panels, accessibility/focus behavior for all controls, and visual polish of populated multi-case mobile panels.
6. Real video, backend authentication/authorization, cross-device storage, payments, secure file storage and authoritative clinical validation remain deliberately outside this frontend implementation.

## Adapter limits

Same origin/browser only. It is not role-enforced storage. Never use real patient information. No local adapter or UI validation is an authoritative medical or financial decision. Record-level updates are not a multi-user transaction system. Existing BE DEV branch/ZIP are not updated by this work.

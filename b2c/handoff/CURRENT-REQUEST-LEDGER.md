# Current user-request closure ledger

11 October 2026. This is a closure register for the current frontend work, not the July backlog or a production-launch checklist. “Implemented” means source exists; test evidence is linked separately. Landing is explicitly **WIP / excluded from accepted handoff**.

## Current frontend work and evidence

| Request | Current source / evidence | Remaining action or boundary |
|---|---|---|
| Consistent app controls, header/logo placement, toast colors, DOB and payment CTA | `b2c/components.css`, `b2c/UI-RULES.md`, shared CTA IDs; earlier B2C review QA and contract checks | Current final brand QA 20/20, consistency 114/114 and contract 170/170 passed; these do not imply complete production UX acceptance |
| Duration day default; prior-relief empty; appointment-style appearance | App intake helpers and latest UI rules | Preserve differing selection behavior; do not restore the prior gray connected toggle or auto-advance multi-field screens |
| Remove obsolete screens / reuse shared direct-partner UI | Canonical view contract and reuse audit; route aliases retained | Old links are compatibility adapters; backend must supply entry context and allowed transitions |
| All intake flows and String IDs for developer | `INTAKE-FLOWS.md`, START-HERE string inventory | Consent-first partner bootstrap verified; arbitrary hashes still pass normal guards. Provider identity and clinical question approval are separate |
| Tracking width, crane animation, saved-address icon row | Existing B2C implementation and shared-view QA | Recheck only if touched by a later change; historical screenshot is not current failure evidence |
| Article mock content, author/media semantics, CMS publication | Article seed/store/editor and cross-surface tests | Browser-only publishing; landing display may be tested technically but landing itself is not accepted |
| Doctor/admin QA and linked data | Current combined QA report and machine evidence | Fixed golden demo can share prescription/status; arbitrary intake record transfer and multi-device access are not implemented |
| Admin actions must not only say “saved” | Pricing/config/coupon adapter, doctor profile persistence and tested CMS actions | User accounts/refunds remain in-page simulations; quiz authoring remains unavailable pending approved scope/schema |
| Replace branding with user-exported Final SVG | Final asset manifest and source references | Match final release to brand QA; do not replace third-party logos or redesign unrelated illustrations |
| Clean handoff and archive old work safely | START-HERE, document manifest, this ledger | Two superseded QA reports physically archived with compatibility pointers; no mass deletion/moves or broken existing routes |
| Landing page | Existing code preserved | **Not ready. Excluded from accepted delivery; finish in a separate reviewed landing workstream** |

## Exact open frontend / contract items

1. Final frontend checks now pass: brand 20/20, consistency 114/114 and contract 170/170. Combined CMS/action evidence is in the current QA report. The initial published release passed the 23-file deployment check; fresh-entry QA passed both partner branches and direct entry/signup/OTP guards, with scope in the combined QA report.
2. Partner consent-first bootstrap has been verified: it models authenticated partner entry, while arbitrary hashes remain guarded. Partner insurance and self-pay branch tests passed; direct entry/auth guards also passed. This does not claim every clinical questionnaire end-to-end. No clinical question reordering is authorized.
3. Finish/adopt String ID runtime mapping and bilingual review if complete bilingual frontend delivery is required: current B2C catalog has 565 missing-English entries and runtime literals remain; CMS copy has a separate literal translator and no complete String ID catalog is claimed.
4. Agree whether admin questionnaire authoring is part of this frontend acceptance. Current control explicitly states unavailable; an approved question schema, edit permissions, versioning and in-progress-session behavior are prerequisites.
5. Agree expectations for user-management/refund persistence in the prototype versus API-backed implementation. Current QA covers in-page behavior, not real account or refund persistence.
6. Confirm clinical/editorial copy, sample author identity and demonstration documents with the responsible content owner; UI tests do not constitute clinical approval.
7. Landing remains unfinished by explicit instruction; do not count it as delivered because shared logos or editorial adapters changed.

These are explicit boundaries, not claims that every historical backlog item is still a defect. Frontend fixes discovered by current tests belong in the current QA report with reproduction steps.

## Backend implementation work (not an unimplemented UI polish request)

- Authenticated sessions, OTP provider, server role/record authorization, secure uploads and identity verification.
- Durable patient/intake/encounter/prescription records and exact payload transfer across real users/devices; signed clinical records.
- Video/chat service, doctor availability/booking locks, insurer eligibility, authoritative pricing/discounts and inventory.
- Payment/refund provider integration, idempotent webhooks, courier status, notifications, generated receipts/certificates and audit history.
- Authenticated CMS data/media/publishing APIs, version conflicts, secure secrets/configuration and operational monitoring.

Agree these through the integration matrix; do not present browser localStorage as a substitute or report them “tested” by frontend mock tests.

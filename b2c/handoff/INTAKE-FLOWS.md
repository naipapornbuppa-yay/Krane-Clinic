# Intake flows — implementation map

Scope: B2C web app. Landing presentation is WIP and not accepted delivery. This map describes current prototype routing and input ownership; it is not a newly approved clinical questionnaire or backend implementation.

## Shared source of truth

In [`../krane-b2c.html`](../krane-b2c.html), use `intakeTemplates`, `renderIntakeQuestions`, `intakeStepOrder`, `intakeSkipped`, `requiredRouteFor` and `nextAfterAuthentication` together. Do not implement routing from screen numbers or stale comments alone. [Canonical view contract](screen-view-contract.json) separates screen identity from direct/partner context.

## Direct category paths

Entry chooses a category/condition, then uses that category's templates and permitted shared authored fallback in numerical order. `intake5` is a photo step only where `categoryNeedsPhotos()` is true.

| Category key | Template key | Current question-page path | Important condition |
|---|---|---|---|
| `hair-skin` | `hair` | `intake1 → intake2 → intake3 → intake4 → intake5` | Photo path; authored question/answer identities stay intact |
| `skin` | `skin` | `intake1 → intake2 → intake3 → intake4 → intake5` | Fourth page uses shared authored fallback; photo path |
| `weight` | `weight` | `intake1 → intake2 → intake3` | GLP-1 exclusions are a safety sheet, not a duplicate fourth screen |
| `sexual-health` | `sexual` | `intake1 → intake2 → intake3 → intake4` | Matching currently demonstrates no doctor available, then appointment selection |
| `sleep-stress` | `sleep` | `intake1 → intake2 → intake3 → intake4` | Fourth page uses shared authored fallback; no photo step |
| `hormone` | `hormone` | `intake1 → intake2 → intake3 → intake4` | Fourth page uses shared authored fallback; route availability still follows condition picker status; do not expose “Soon” choices merely because templates exist |
| `general` / category marked `general` | `general` | `intake1` | Compact general questionnaire; later category pages and photo step are skipped |

After direct intake, new-account requirements are signup → OTP → password where required → consent → patient information → general health before care. Returning verified accounts reuse applicable completed identity steps, but still obey the current intake/health guards. Direct entry does not require ID-card upload. `directClinicalStartTarget()` returns matching; sexual-health appointment-only context changes availability so matching leads to booking rather than skipping the explanation.

## Partner branches

Partner context reuses patient/insurance/clinical views. The partner-specific identity capture can upload or skip an ID document; a selected image is a demo preview, not OCR. Patient information collects a phone and insurance/self-pay choice. A first unverified phone proceeds to OTP from the main continue action; changing an already verified number is a separate state.

- Insurance: eligibility/policy context must be selected before intake continues. Unknown/failed coverage must not be represented as verified by browser flags in production.
- Self-pay: bypass insurer-specific pages, retain the shared intake and care path.
- Both: `intake-concern → intake-general → partner-phr` review/confirmation → shared matching/care. `partner-phr` is guarded by completed symptom and health data; care requires recorded review confirmation.
- The approved partner demo starts consent-first. Entry bootstrap rewrites `entry=partner&fresh=1#consent-terms`; `applyHash` / `seedClinicalDemoStage` model an already authenticated partner handoff. This is different from opening an arbitrary guarded hash: `requiredRouteFor('consent-terms')` checks account/OTP/password and partner phone state. Preserve this distinction. A production provider assertion and verified identity must replace the seeded demo identity; browser bootstrap is not authentication. Fresh-entry QA verified the consent-first bootstrap; branch completion remains governed by the current QA evidence.

Canonical aliases: `partner-patient-info → patient-info`, `partner-insurance → insurance-result`. Payment purpose and entry channel are context, not reasons to fork identical screens.

## Input behavior to preserve

- Duration units and prior-relief answers use appointment-style choice buttons with consistent selected styling. Duration defaults to day; prior relief starts empty. They have different state rules despite matching appearance.
- Auto-advance applies only to standalone paginated questions; multi-field screens wait for the explicit continue action. See [UI rules](../UI-RULES.md).
- DOB shows placeholder while empty and raises its label only after input. Date validation must be shared wherever the field appears.
- Concern description, duration, relief, general health, history and optional photos belong to the intake draft, not the screen-directory navigation state.
- Review shortcuts (`screens`, `demoStage`) deliberately differ from ordinary access guards. They cannot prove production access control.

## Required regression dimensions

For every available direct category and both partner payment branches, verify forward/back, required empty input, invalid dates/phone, refresh/resume, changed phone/OTP expiry/resend, invalid/oversized upload, insurance unavailable, no doctor/booking, cancel/retry and prevented guarded deep-link access. Preserve question wording/order from the approved source; do not generate clinical changes during integration.

Existing QA reports document subsets of these dimensions. The route/category audit is structural coverage, not proof that every combination was executed. Backend must eventually own verified identity, eligibility, allowed next step, data durability and record permissions.

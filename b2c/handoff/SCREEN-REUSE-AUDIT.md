# Shared-view audit — 10 October 2026

## Scope and evidence

Inspected all 63 legacy route shells in seven service categories (441 rendered-text records). `screen-content-audit.json` records canonical identity, category, body hash and text length. No pair has identical entire body text within a category; this does not exclude shared subcomponents or context-only variations. Manual comparison found repeated identity fields and payment gateway markup; those now have a single source in `shared-view-components.js`.

## Canonical screens versus route context

| Canonical screen | Compatibility route/context | Decision |
|---|---|---|
| Patient details, SID-012 | partner-patient-info (formerly SID-062) | Same identity field renderer. OTP state, payment purpose and next step are context, not a new screen identity. |
| Insurance result, SID-039A | partner-insurance (formerly SID-063) | Same canonical coverage view. Policy selection is a context-specific control; legacy adapters still bind the existing policy fixture. |
| Payment gateway, SID-028 | payment-gw (formerly SID-041) | One gateway markup renderer. Charge purpose, amount, deadline and field namespace are supplied by the adapter. |
| Payment failure, SID-029 | payfail (formerly SID-043) | One canonical failure-state identity; retry target and outcome copy remain context-specific. |
| Consultation concern, SID-069 | Direct/partner shared concern | Already one implementation. Entry conditions must not introduce another SID. |
| Clinical questions, SID-015–018 | Service/category-specific question sets | Retained: these contain different clinical questions. Review rail now explicitly selects direct/hair context for these entries, preventing a partner-state redirect from making SID-018 appear to duplicate SID-069. No clinical questions removed or reordered. |

Group 09 identifies partner entry context and labels contextual routes as shared views. The registry exposes the canonical SID for compatibility routes. The older DOM route keys are retained to avoid breaking stored journeys, test URLs and state adapters; they are **not** additional screen identities. This is not a claim that every legacy route wrapper has been physically removed.

## Service boundary

`screen-view-contract.json` documents canonical aliases and context. The backend must return verified identity, phone-verification state, coverage, payment obligation and next allowed step. The frontend renders a canonical view and submits user intent. This repository has no production backend: `flowState` is still a prototype adapter, not authoritative eligibility or security. No backend integration is claimed by this refactor.

The identity and payment templates are expanded by the string extractor, preserving existing string IDs instead of incorrectly retiring text moved out of HTML. Legacy per-route string IDs remain compatibility inventory; canonical screen identity is separate from copy ID migration.

## Other fixes in this review

- Tracking uses the shared 752 px outer / 704 px inner desktop width; removed the 1120 px dashboard exception and the desktop horizontal reflow of ETA/progress.
- Saved address actions are accessible edit/trash icon buttons in one row aligned with the address title.
- Crane animation waits for frames to load and skips failed assets. It uses a local grayscale/contrast filter rather than a cross-document SVG filter. Review mode holds the preloader open; the ordinary user flow retains its timed transition.

## Validation

- Focused regression: 9 tests passed before the final source extraction; first-phone OTP and invalid-phone tests passed again after extraction.
- New view tests: review-route context, shared gateway namespaces, tracking width at 390/1440 px, loaded crane frame animation and aligned saved-address actions passed.
- Category inventory: all 441 records generated.
- Full contract: all 170 checks passed (63 route shells, 44 components, 5 flows, 33 rules).

Screenshots were inspected for tracking at desktop width, saved-address actions and the crane. Browser fixture state and backend service integration remain separate scopes.

# Delivery address UX audit

28 September 2026. Source: published branch at 221885a. Overall: 7.5/10.

## Scope and reference

Audited the current address entry, recipient confirmation and delivery review screens. Preserved the latest removal of the obsolete saved-address chooser. Reused Krane's existing fields, map preview, recipient summary, buttons and tokens.

Health at Work's published journey has a dedicated medicine-delivery address step after consultation: https://www.ocean.co.th/en/services/digital-healthcare/telemedxhealthatwork. This supports the focused task and sequence only. It does not document field-level interactions. Validation, draft preservation and review changes below are audit recommendations, not claims about Health at Work's implementation. No reference visual styling was copied.

## Findings addressed

- P1: Missing recipient data hid the necessary fields behind an Edit action while confirmation was disabled. Required recipient fields now open automatically; blocked actions explain the missing step and show inline errors when pressed.
- P1: Ten arbitrary phone digits were accepted. Recipient phone validation now requires ten digits beginning with 0, matching the existing Thai phone field pattern.
- P1: Editing the map overwrote the confirmed order before confirmation and could discard unfinished recipient notes. Editor and location-search drafts now survive return navigation and reload independently of the confirmed order. Only confirmation updates checkout; session reset clears drafts.
- P1: Review hardcoded the delivery method and omitted rider notes. It now renders the chosen method, estimate, accepted quote (including zero), full address and rider note.
- P2: Floor/room data was hidden and could not be corrected. Exposed it with the existing optional input pattern.
- P2: Reopening a manually entered address repeated the street text. Deduplicated it on hydration.
- P2: The address form claimed to search when its action only applied entered fields. The action now says Review this address.
- P2: Added English translations for the address controls and validation used by these changes.

## Design critique

| Dimension | Score | Evidence |
|---|---:|---|
| Philosophy | 8/10 | Existing Krane brand and calm clinical form hierarchy retained. |
| Hierarchy | 8/10 | Location, recipient, optional delivery details, one primary confirmation action. |
| Detail | 8/10 | Existing component styles; changed lines contain no raw colors, utility classes or accent edge stripes. |
| Function | 7/10 | Focused browser checks pass; larger prototype still has 16 baseline contract failures. |
| Innovation | 6/10 | Useful draft recovery and precise confirmation rather than new visual patterns. |

Biggest improvement: editing an address no longer silently changes the confirmed destination.

## Verification

- `node audit/address-flow-check.mjs`: passed with a synthetic patient session, no browser runtime errors.
- Covered empty entry, actionable missing-field validation, dependent dropdown reset, refresh, invalid and valid phone numbers, recipient and note preservation through map editing, confirmation, isolation of existing delivery details from draft edits, floor/note review, postal method and zero delivery fee, English CTA and 320px horizontal overflow.
- Inspected screenshots at 390px mobile and 1440px desktop widths.
- Existing text colors on white: heading 26/30/40, hint 94/102/120; primary button white on 57/90/164. All exceed 4.5:1 contrast. No new palette values introduced.
- `node b2c/tools/contract-check.mjs`: 148/164 passing both before and after. Same 16 baseline failures; the obsolete clear-button assertion now finds four controls instead of three. Contract assertions were not removed to manufacture a green result.
- Design lint: zero violations on added lines. Full legacy B2C scan still reports 1,322 existing violations.
- Inline JavaScript syntax and `git diff --check`: passed.

## Remaining priorities

- P1, existing prototype limitation: address geography data covers selected districts in three provinces. Nationwide coverage and address geocoding require the implementation team's service integration.
- P1, existing prototype limitation: map fallback is illustrative; typed address input does not resolve an exact geographic coordinate. Delivery quotes remain demo calculations.
- P1: Reconcile existing UI contract failures with the approved current screens, including obsolete address-search expectations, follow-up routing, tracking and translation gaps.
- P2: User-test the location-entry form on a real phone, especially the map/search panel's height and keyboard behavior.

Persistence remains the existing session-based prototype storage, not an account-backed address service. No payment, medical consultation or global design-system flow was changed.

# Bounded landing motion polish — 27 October 2026

Baseline: `0736558a5378057e3b0a7127505f8e5fb02b1033` (lighter programme palette, coloured primary CTAs and UGC fades).

## Public references and adaptation

- https://www.apple.com/airpods-pro/ — staged product imagery and finite visual highlights inspired the existing supplied hero products entering in a short sequence.
- https://linear.app/ — ordered editorial/interface composition inspired heading-to-media pacing within the existing programme chapters.

These are design references, not imported assets or source. The implementation is original browser-native Web Animations code, without an additional dependency, remote script, video or font.

## Delivered scope

1. Hero copy and three supplied product images enter in a finite, staggered sequence. CTAs are never hidden, disabled or delayed behind an overlay.
2. Existing programme headings and weight story videos reveal in order when visible. The supplied hair photo records enter separately; no carousel or new comparison outcome is introduced.
3. The private consultation phone and supplied opaque mailer receive restrained dimensional entrances, complementing their existing process sequence.

New effects use opacity and compositor-friendly translate/rotate/scale, last 700ms each, and run once. The normal document scroll remains native; there is no scroll capture, scrubbed position, pinned section or wheel handler. Completed effects release their animation handles and return to natural styles.

New effects pause offscreen or when the document is hidden. Existing finite chart, photo check-in, chat and privacy sequences now use active-time clocks that pause offscreen/background rather than advancing unseen. Typing dots pause along with their story. Reduced-motion changes finish content immediately; an initial reduced-motion or data-saving preference skips the new effects. No CSS baseline hides the content when JavaScript is unavailable.

All copy, supplied imagery, existing illustrative chart values, routes, lighter palette, rust/green/navy Start now buttons, UGC quote fades and cookie functionality are preserved.

## Verification

The dedicated `check:motion` suite is included in `check:ui`. Its 33 browser checks cover 390px/1440px, bounded finite timing, real viewport exit/resume, frozen chart/consultation clocks, typing pause, dynamic and initial reduced-motion preferences, completed existing consultation text, unchanged CTA destinations, overflow and browser errors. Existing public/consent/contract coverage remains enabled. Desktop/mobile screenshots and short recordings document actual rendered sequences; CI, Pages and live evidence are recorded for the exact published revision.

Background visibility handling is implemented through the standard visibility event. Automated motion checks exercise real viewport exits and preference changes; they do not emulate a physical device's power-saving behavior. Static prototype/backend integration boundaries are unchanged.

## Compact cookie notice correction

The latest user direction replaces the large lower-left notice with a centred bottom notice. Its redundant visual logo/title are removed; the labelled landmark, factual storage description, policy link and all three choices remain. Desktop uses a compact two-row layout; narrow phones retain safe edges and a two-column action grid. Text remains readable and all actions retain 44px targets. Consent storage, category gating, preferences dialog and reopening behavior are unchanged. Cache versions are updated on all 21 owning public/app entries.

The consent suite now has 157 checks, adding horizontal centring, compact height, target size and 320px Thai/English geometry/open/Escape coverage. The focused motion suite passes 33 checks, including completion of the entire normal-motion consultation sequence.

Final combined local gate: 611/611 checks passed (193 contract + 228 public + 157 consent + 33 motion), plus 87 translation IDs, changed JavaScript syntax and whitespace checks.

# Public-page regression repair — 27 October 2026

Baseline: gh-pages `069cf9135648af0dab988d0661e3f28a88076453`.
The original UI run failed 18 of 193 checks. This repair preserves the published redesign and unrelated local work by using a clean isolated clone.

## Repairs

- Complete public-page English copy, doctor previews, asynchronous ratings/comments, chart labels, story viewers, image descriptions and tooltips. Preserve Thai sources through language switching and control-label updates.
- Prevent an unbounded photo-loop clone operation when reduced-motion CSS hides repeated copies; keep resize filling bounded and respond to preference changes.
- Let the mobile hero grid and reassurance list shrink and wrap around longer English copy.
- Version edited public assets so previously cached files are refreshed.

## Differentiated programme storytelling

The main landing already distinguishes weight videos/tracking, hair photo check-ins and private men’s-health consultation. The standalone programme overview still reused one stock interview across categories. That panel is replaced with three distinct process stories:

- re:body: a warm connected-care orbit linking nutrition, movement and doctor follow-up; an animated trace and selectable phases explain the care loop without outcome data.
- re:hair: the supplied same-person baseline/follow-up photographs in offset frames, a comparison sweep and selectable photo phases; no invented result duration.
- re:flow: a dark private-consultation composition with a drawn shield, sequenced health-review steps and a quiet signal animation.

All three are bilingual, keyboard operable, pause when off-screen/hidden/hovered/focused, respond to reduced-motion preferences and use CSS/SVG with existing optimized images. No new medical efficacy or treatment-result data is introduced.

## Contract reconciliation

All existing 193 checks remain. Retired DOM assertions now check their current owners. Each changed rule records its supporting design commit.

- `dd16cd8` / `6bbd8e7` replaced iframe phone previews with three recorded app demonstrations. Check all three recordings and reduced-motion stills, decoded images and carousel navigation.
- `069cf91` moved the four programme choices into chapter goal cards. Check four destinations per chapter and receiving clinical category.
- `review-rhythm.js` adds separate quote cards containing the same video element. Count six original video faces and compare their distinct source IDs with all six supplied clips.
- `011b17f` removed weight comparison photos from landing; `9af7eb5` removed the requested hair interview; `0ee2f98` uses an anonymous ED testimonial. Check these chapter compositions without restoring retired layouts.
- `7162830` removed the duplicate detail video rail. Check the review tab's current ratings/comments destination, rating filtering and sorting, and the separate supplied same-person photo pairs.
- `97f9371` retired the standalone feedback screen. Shared-view QA now checks required screen membership for every category and rejects the retired screen instead of relying on an obsolete total. Its crane check waits for image decoding before validating loaded animation frames.

## Verification

- UI contract: 193/193 passed (62 screens, 45 components, 5 flows, 56 rules).
- Public redesign behavioral suite: 180/180 checks across 10 page/viewport combinations passed; included in `npm run check:ui` via `npm run check:public`.
- Header/navigation consistency: 114/114 page/viewport cases passed.
- Final branding: 20/20 passed.
- Doctor/admin route and render inventory: 50/50 passed.
- Shared views: 6/6 regressions passed.
- String catalog: 87 unique IDs; all locale placeholders match.
- Edited JavaScript syntax and `git diff --check`: passed.
- No build or lint script is configured in this static published branch. JavaScript syntax, JSON parsing, string validation and browser checks are its applicable local gates.

The public suite covers landing, doctors and weight/hair/men's-health detail pages at 390px and 1440px, English and Thai round trips, all doctor previews, programme destinations, supplied media, reduced-motion previews, story opening/Escape/sound controls, ratings filtering/sorting, horizontal page overflow and browser errors. Screenshots and machine-readable results are written to `/tmp/krane-public-qa` (or `QA_OUTPUT`).

## Scope limits

Doctor/admin inventory verifies routing and rendering, not production persistence or live clinical actions. Existing static demo identity, payment, video consultation and backend integration boundaries remain as documented in `FRONTEND-HANDOFF-READINESS.md`. This release does not establish backend production acceptance.

# Landing cleanup: isolated review branch, 17 November 2026

## Scope and status

Baseline: `gh-pages` at `1db34f9cb4a762df4fe6dde00d6a8889b1761240`.
Review branch: `refactor/landing-cleanup-20261117`.
This is source cleanup, **not a redesign, production approval, or deployment**.
The landing remains WIP and outside the previously accepted patient-app handoff.
No authentication, clinical, payment, insurance or server integration is added here.

The live landing is real HTML/CSS/JavaScript, not just a Figma image. Its existing
markup, scripts, imagery, routes, translation behavior, event handlers and shared
components are retained byte-for-byte in this change. This work does not require a
new frontend framework. A future integration can reuse those assets and behaviors.

## What changed

- Removed 802 selector branches that require one of 40 explicitly reviewed,
  retired classes. Those class names are absent from repository runtime HTML,
  JavaScript, TypeScript, JSON and SVG sources, including outside `b2c/`.
- Removed 83 exact duplicate declarations, retaining their later cascade position.
- Main landing CSS: **441,750 → 348,007 bytes**, a **93,743-byte (21.2%) reduction**.
- Added a repeatable cleanup tool, seven focused unit tests, a retired-class
  reference guard, and a baseline/candidate browser comparison script.
- Pinned the CSS parsers as development-only dependencies with a lockfile. They do
  not run in or add requests to the public website.

The explicit retired-class list is in `tools/landing-css-cleanup.mjs`. This is not
an automatic purge of everything absent from one screenshot. A selector is removed
only if a top-level class in that selector is on the reviewed list. Classes nested
inside `:not()`, `:is()`, `:has()` etc. are not used as absence evidence. Mixed
selector lists retain their active branches.

Duplicate cleanup preserves different fallback values, `!important`, selector
specificity, source order, media/supports/container conditions, animations and
shorthand/longhand relationships. It does not move rules into layers or combine
stylesheets. Dynamic state classes such as `is-current`, `is-visible` and
`motion-enabled` are retained. The landing scripts' generated class names were
reviewed; the source scan is an additional guard, not proof about arbitrary future
CMS/server-generated markup.

## Ownership: where to make the next change

| Concern | Owner |
| --- | --- |
| Landing section markup and links | `krane-b2c-landing.html` |
| Existing landing behavior/localization | `krane-b2c-landing.js` |
| Landing foundation and legacy active styles | `krane-b2c-landing.css` |
| Current release composition and its behaviors | `landing-release.css`, `landing-release.js` |
| Navigation | `site-header.css`, `site-header.js`, `site-nav.js` |
| Article cards | `article-cards.css`, shared article renderer/store |
| Footer | `site-footer.css`, `site-footer.js` |
| Design values | `design-tokens.css` |

Edit the owning rule; do not append another “final override”. Do not remove
`!important` wholesale: active competing rules still need a browser-tested
consolidation pass. Keep stylesheet order unchanged until that pass has coverage.
The remaining large stylesheet and release overrides are known debt, not described
as solved by this first cleanup. Do not restore an old class without reviewing its
styles and updating the explicit retired list.

## Verification

Passed locally:

- `npm run check:landing-css`: 7 tests, current-source reference guard, CSS parse
  and idempotence checks.
- `npm run check:strings`: existing string contract.
- Source parity: 35 IDs, 31 links, 62 images and 223 non-script text nodes unchanged; landing markup, JavaScript and assets byte-identical.
- Independent CSS comparison: 8,962 retained active declaration entries match in cascade order after removing reviewed retired branches and exact duplicates.
- Existing aggregate check: 1/9 stages passes (static privacy-envelope motion contract); 8 browser stages are blocked at Chromium startup, not product assertion failures.

**Not visually approved:** the available local browser cannot launch because its
socket operation is blocked. Thus desktop/mobile screenshots, keyboard behavior,
interactive flows, animation and language-switch rendering are pending. Existing
aggregate browser gates cannot be treated as passing. Static equivalence is not a
substitute for seeing the page. Do not merge/deploy solely on this report.

On a machine with Chromium support:

```sh
npm ci
npx playwright install chromium
npm run check:landing-css
npm run check:strings
npm run check:ui
# Preserve the original baseline outside the candidate checkout:
git worktree add --detach ../krane-landing-baseline 1db34f9cb4a762df4fe6dde00d6a8889b1761240
npm run check:landing-refactor -- ../krane-landing-baseline .
```

The comparison creates screenshots and JSON evidence at 390/768/1440 widths in
Thai and English. Review section geometry, overflow, images and screenshots, then
exercise header/dropdowns, language selection, article rails, doctor drawer open/
close and focus return, review/video controls, FAQ and all CTA receiving routes.
Test normal motion separately: comparison screenshots use reduced motion for
repeatability. Capture any pre-existing failures separately from regressions.

## Next safe integration step

Agree the developer's target stack/CMS and what will be reused before deciding on
further migration. Replace prototype APIs only where needed. Refactor one active
component at a time with visual/interaction coverage, rather than rewriting the
whole landing or adding another competing override file. Retest the accepted
patient-app flows separately before any production release.

# Landing code cleanup and locked-design handoff

Updated 17 November 2026 after the owner's latest direction.

## Approved boundary

**The landing and programme designs are confirmed. Do not change their appearance,
copy, components, interactions or behavior.** Only necessary responsive adjustments
are permitted by the latest direction, and none is included in this cleanup.
Earlier requests concerning the marquee, details-link spacing/underline, article
cards and motion controls must not be reapplied over the confirmed design.

Baseline: live `gh-pages` commit `1db34f9cb4a762df4fe6dde00d6a8889b1761240`.
Review branch: `refactor/landing-cleanup-20261117`.
This branch has **not been merged or deployed**. The live branch is untouched.
The source comparison must use the exact baseline above, not a historical Figma
composition or an older contract's implied layout.

## Current changes: maintenance only

- Main landing CSS: **441,750 → 348,007 bytes**, a **21.2% reduction**.
- Removed 802 selector branches requiring 40 explicitly audited retired classes,
  and 83 exact duplicate declarations. Active markup, JavaScript, translations,
  assets, routes and stylesheet order remain the baseline versions.
- Added reproducible cleanup, seven focused tests, a retired-class source guard,
  pinned development dependencies and a lockfile. No new public runtime package.
- Added a read-only CI baseline comparison and screenshot artifacts at
  390/768/1440 widths in Thai and English.
- Corrected two stale test expectations only: settings-left/accept-right cookie
  buttons and the existing re:hair page title. No UI was changed for those tests.

The retired-class list lives in `tools/landing-css-cleanup.mjs`. The repository
runtime-source scan includes HTML, JS/TS, JSON and SVG outside `b2c/` as well.
Only listed top-level class anchors can remove a selector branch. Classes inside
`:not()`, `:is()`, `:has()` etc. are not treated as absence evidence. Active branches
of mixed selector lists remain. Duplicate cleanup retains the final cascade
position and preserves differing fallbacks, importance, specificity, conditional
rules, shorthand/longhand interactions and animations. It does not strip all
`!important`, reorder rules or introduce cascade layers.

## Version history and explicit reversions

- `bcd64c9`: initial maintenance cleanup.
- `097344e`: cleanup plus CI/test corrections. Its browser comparison passed and
  independent comparison found all six screenshot pairs pixel-identical to the
  live baseline.
- `f5fc91a` / `3032580`: temporarily added wiring for existing English translations
  and language-roundtrip tests in this review branch only. Although their scoped
  checks passed, they changed confirmed copy. **Those runtime changes and their
  special comparison allowances have been reverted in the current branch.**
- The earlier three visual corrections and proposed review-pause control were
  stopped before publication. They are not included in the current branch.

Git history preserves the stages; their existence is not permission to restore
superseded changes. Do not merge an intermediate translation or design-fix commit
instead of the final locked-design version.

## Verification and limitations

Known evidence for the maintenance-only source:

- 7/7 CSS cleanup tests and idempotence/reference checks pass.
- Existing string contract: 87 IDs pass.
- Independent source comparison: 8,962 retained declaration entries equivalent.
- Six baseline/candidate screenshot pairs at `097344e` were pixel-identical, with
  identical section geometry, text and links; no page overflow, missing resources,
  broken images or browser runtime errors.
- Cookie consent CI passes 399 checks, with no third-party requests observed.

The newest revert commit requires its own CI result; use the commit shown on the
branch and its Actions run rather than treating an older green run as current.

**The whole legacy UI suite is not green.** Seven stages still fail after the two
safe assertion corrections. Some target retired compositions; others identify
remaining untranslated strings or historical interaction expectations. Do not
remove locked requirements or change confirmed UI just to make this suite pass.
Record a requirement decision separately before changing those tests or behavior.
Pixel parity proves preservation of the baseline, not that every baseline feature
is production-ready. New sample-review/medical English, identity, payments,
clinical APIs and other backend integrations remain outside this maintenance
change. No medical wording, credentials or patient facts have been invented.

Earlier November handoff explicitly identified the landing as unfinished at that
time. The latest direction locks its design; it does not retrospectively make the
old production/integration checklist complete.

## Reproducible review

```sh
npm ci
npx playwright install chromium
npm run check:landing-css
npm run check:strings
npm run check:ui
git worktree add --detach ../krane-landing-baseline 1db34f9cb4a762df4fe6dde00d6a8889b1761240
npm run check:landing-refactor -- ../krane-landing-baseline .
```

The comparison stores raw screenshots and JSON, normalizing only the temporary
server origin in links. It does not allow special English changes or mask content.
Review artifacts and use current-feature tests separately for normal animation,
repeated interactions, focus/keyboard, navigation and responsive edge cases.
The CI workflow has read-only repository permissions and cannot deploy.

## Source ownership

| Concern | Owner |
| --- | --- |
| Landing markup/routes | `krane-b2c-landing.html` |
| Landing behavior/localization | `krane-b2c-landing.js` |
| Landing foundations | `krane-b2c-landing.css` |
| Confirmed release composition | `landing-release.css`, `landing-release.js` |
| Navigation | `site-header.css`, `site-header.js`, `site-nav.js` |
| Article cards | `article-cards.css`, article renderer/store |
| Footer | `site-footer.css`, `site-footer.js` |
| Brand values | `design-tokens.css` |

Edit the owning component, not another “final override”. Preserve the confirmed
version; any future responsive adjustment must have narrow viewport-specific
scope and before/after evidence. Do not use this cleanup as authorization to
redesign, translate copy, migrate frameworks, merge or deploy.

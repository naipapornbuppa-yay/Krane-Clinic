# Handoff verification — 21 October 2026

Baseline: `handoff/be-dev-2026-10-11` at `3beddab450c9a6da9649c75dddce402dbc9cd39d`. Regenerated from Tin's own app; not the newer live gh-pages snapshot. Original `b2c/krane-b2c.html` and `b2c/components.css` remain byte-identical to this baseline.

## Verified on the personal Mac

- 1,186 structural checks: 62 templates, all 353 original functions unchanged, 47 ordered initializers, 397 CSS blocks; equivalent DOM and byte-identical component CSS.
- 14/14 DOM runs, 7/7 parity comparisons across 26 checkpoints; no missing local scripts or runtime exceptions.
- 28/28 real Chrome runs at 390px and 1440px, 14/14 original/modular parity comparisons, 52 modular observation checkpoints, no horizontal overflow or uncaught browser exceptions at the checkpoints.
- Hair scalp screening before photos, female questions, signup and Back; weight BMI and risk pagination; general signup guards; partner insurance and self-pay through matching/fee; separate ED heart/nitrate steps and ineligibility stop; OTP/consent; repeated category changes and browser hash Back/Forward.
- 5/5 editable-source propagation checks: page HTML, ordinary appended CSS, page JS and single shared library loading.
- Existing B2C UI contract: 170/170; string contract: 87 IDs and matching locale placeholders.
- Pinned PostCSS development tooling patched to 8.5.31; npm audit reported zero vulnerabilities.

Evidence: [structure](qa/source-structure.txt), [DOM](qa/dom-runtime.json), [Chrome](qa/browser-runtime.json), [UI contract](qa/ui-contract.txt). Screenshot samples: [mobile scalp safety](qa/handoff-390-hair-full-safety-and-back-scalp-safety-before-photos.png), [desktop photos after screening](qa/handoff-1440-hair-full-safety-and-back-photos-after-safety.png), [mobile weight risk](qa/handoff-390-weight-full-risk-and-back-risk-blocks.png), [desktop ED stop](qa/handoff-1440-guarded-deep-links-and-auth-ed-nitrate-stop.png). Full local screenshots are retained in the task QA folder.

All test answers are fictional, in isolated browser contexts. No real patient images, reviews, accounts, payment or external provider calls were submitted. The intake suite blocks external origins. This is B2C regression evidence, not a complete accessibility, CMS, provider or backend acceptance test.

## Version and implementation boundaries

Hair safety occurs before photos and ED heart/nitrate questions remain separate in this branch. The newer live app differs; its behavior and separate Pricing delivery have not been merged here.

Page HTML files are editable fragments. The shared classic-script runtime mounts all screens before initialization and keeps them mounted; independent/lazy routes require further lifecycle work. Original guards and prototype storage/auth/payment behavior are preserved. Ordinary in-app transitions use replaceState; app Back uses internal history.

The personal GitHub OAuth login cannot add workflow files without workflow scope. The attempted push was rejected atomically, so the new workflow was excluded. The browser/DOM scripts and local passing evidence are included; existing remote workflow results must be checked separately. No new token or credential scope was requested.

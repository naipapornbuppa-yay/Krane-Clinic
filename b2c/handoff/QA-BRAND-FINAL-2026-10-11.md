# Final SVG brand QA — 11 October 2026

## Result

- **20/20 targeted logo cases passed** at 390×900 and 1440×900: landing, patient home, general intake, consultation checkout, medicine checkout, video, chat, doctor login, doctor rail, and admin rail.
- Each case checks final source URLs, loaded SVG intrinsic dimensions, rendered aspect ratio, viewport bounds, favicon loading, document overflow, runtime errors, and vertical centering for branded patient app bars.
- **114/114 shared Chrome consistency cases passed** across 320, 360, 390, 768, 1100 and 1440 px.
- **170/170 UI contract checks passed**, covering 63 screens, 44 components, 5 flows and 33 rules. No contract was weakened to accept the new assets.
- All four deployed-source assets are byte-identical to the user's `Style=Final` SVG originals: logomark, logotype, lockup and stacked lockup.

## Visual inspection and fix

Inspected landing mobile, intake mobile, checkout desktop, video mobile, chat mobile before/after, doctor login mobile and doctor rail desktop screenshots. No clipping, distortion or overlap was found in these samples. Existing theme treatment is preserved: image-based logos retain the final SVG color and masked logos retain the interface accent color.

One real P2 geometry defect was found: on 390 px chat, a 40 px back button plus 24 px vertical grid padding forced the logo to y=20.5, while video/intake/checkout used y=15.5 in the same 54 px app bar. The shared chat responsive padding is now 7 px on mobile and 10 px on tablet. Retested mobile chat and video both have y=15.5 and height=23; desktop both y=19.5 and height=25.

## Reproduce

From the checkout root:

```sh
node b2c/tools/brand-final-qa.mjs
CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node b2c/tools/qa-chrome-consistency.mjs
CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node b2c/tools/contract-check.mjs
```

Targeted evidence is `qa-handoff-evidence/brand-final.json`. Regenerated screenshots are written to `/tmp/krane-brand-qa/` by default (`QA_OUTPUT` overrides this). Asset verification covers the local release candidate; deployment validation remains the publishing agent's responsibility.

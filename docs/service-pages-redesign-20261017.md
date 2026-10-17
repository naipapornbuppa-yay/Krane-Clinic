# Service detail alignment — 17 October 2026

Scope: condition-detail variants weight, hair-loss, re-flow, sexual-health, skin, hormone and sleep-stress, plus linked GLP-1 safety information. **Landing files are read-only and unchanged**, verified against saved SHA-256 hashes. Shared tokens, public-care.css, header implementation, B2C app, and BE DEV handoff were not edited.

The new scoped `b2c/service-pages.css` consumes existing public care foundations after the legacy detail base. Consistent cool canvas, neutral care plates, white cards, type scale, pill CTAs, spacing, readable FAQ and horizontal rails replace the separate visual language. Concern photographs remain unchanged. Safety-page warning content and sources are preserved; its illustration now remains separate from copy on mobile.

Fixed functional presentation defects found while inspecting:
- P2: mobile FAQ grid min-content exceeded the viewport (523px in a 390px viewport). Use a minmax(0,1fr) grid and zero child minimum width; no hiding page overflow.
- P2: non-weight variants inherited the weight overview heading, price/dose chip, coaching/exercise benefits and cold-chain example. Bind heading to existing service data, hide weight-only fields, and reuse existing general fee explanation. No new price was invented.
- P2: hero named the weight programme physician on every specialty. Replace the copied attribution with a link to the actual team directory.
- P2: non-weight care notes led to GLP-1 information. Render existing condition-specific safety/medical note inline instead; weight retains its GLP-1 information link.

Validation: 16 route/viewport cases (7 service variants plus safety, each 1440/390); tabs, native FAQ toggle, selected category and direct-entry hrefs, absence of weight-only prices on other categories, no page overflow or page errors. Actual CTA clicks entered `intake1` with `entryChannel=direct` for the six distinct service categories at both widths (12 checks). Safety copy/image bounding boxes do not overlap at either width. Visual inspection used screenshots for all concern families. Evidence in `qa-evidence/2026-10-17-services/`. Initial FAQ test incorrectly assumed all FAQs started closed; corrected to assert state toggle. Original mobile overflow failure retained in the investigation notes above.

Run `node b2c/tools/service-pages-qa.cjs` from repository root with installed Chrome (or CHROMIUM_PATH). This is frontend route/presentation QA, not clinical content reapproval or a new complete intake audit. Existing labelled review placeholders remain; no patient testimonials were fabricated. Landing remains WIP per the existing delivery scope, with no change to its accepted appearance.

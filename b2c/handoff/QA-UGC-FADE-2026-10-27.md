# Landing UGC fade polish — 27 October 2026

Baseline: cookie release `f8621d2136aee17aea31bedf11a21b80fc7e8fb9`.

The requested “UAG” section resolves to the programme video component explicitly named UGC in `programme-focus.css` and `programme-motion.js`. The inline programme captions and expanded viewer previously had dark rounded caption cards. Both now place their existing text directly over a warm, full-width gradient rising from the bottom. The viewer uses the source programme's surface colour. Larger, quieter quote typography preserves approved wording, line breaks and attribution. Descriptive captions do not acquire invented quotation marks, testimonials or claims.

Sound, playback, story navigation, Escape, keyboard focus return and the matching programme intake destination remain intact. Gradient layers ignore pointer events and sit below interactive controls. The existing reduced-motion behavior remains unchanged. The six supplied review clips, unrelated review marquee, other programme visual concepts and cookie implementation are preserved.

Verification covers desktop 1440px and mobile 390px in Thai and English, inline and expanded states. The public regression suite adds caption/attribution parity, the intake destination, unboxed caption surfaces, non-intercepting gradient, caption containment, next/previous quotation fidelity and closing focus return. Existing checks remain enabled. Screenshots are captured separately from the repo; release evidence records exact deployed file hashes and CI/Pages results.

This static branch has no separate lint/build script. The applicable gate is `npm run check:ui`, the string-ID check, JavaScript syntax, whitespace checks and the exact-revision Pages deployment. Browser viewport emulation does not constitute physical-device or backend integration verification.

Local release gate: 528/528 passed (193 contract + 198 public + 137 consent). All 87 translation IDs, changed JavaScript syntax and whitespace checks passed. No third-party requests were observed by the consent suite.

## Follow-up: lighter programme surfaces and coloured CTAs

The user subsequently requested lighter programme backgrounds and restoration of the darker coloured Start now buttons. History before `069cf91` establishes weight `--draft-weight-strong: #8e3611`, hair `#356a5f` and the default programme CTA `#111b30`. Those exact primary colours are restored. Weight and hair surfaces return to their existing lighter palette tokens (`#be7d61`, `#7ea99e`); re:flow uses a lighter related muted blue (`#8797b3`). Category-specific dark ink replaces white body text, and secondary text opacity is removed to retain contrast. Video captions keep white text over their darker tonal fades; other programme visual compositions and cookie assets are preserved.

Additional public checks compare each programme's luminance to the prior surface, require a darker primary button, and verify at least 4.5:1 body, primary-button and secondary-button text contrast at desktop and mobile widths. The final combined gate supersedes the initial 528-check UGC-only run.

Final combined local release gate: 558/558 passed (193 contract + 228 public + 137 consent), with 87 translation IDs, syntax and whitespace checks also passing.

# Landing UGC fade polish — 27 October 2026

Baseline: cookie release `f8621d2136aee17aea31bedf11a21b80fc7e8fb9`.

The requested “UAG” section resolves to the programme video component explicitly named UGC in `programme-focus.css` and `programme-motion.js`. The inline programme captions and expanded viewer previously had dark rounded caption cards. Both now place their existing text directly over a warm, full-width gradient rising from the bottom. The viewer uses the source programme's surface colour. Larger, quieter quote typography preserves approved wording, line breaks and attribution. Descriptive captions do not acquire invented quotation marks, testimonials or claims.

Sound, playback, story navigation, Escape, keyboard focus return and the matching programme intake destination remain intact. Gradient layers ignore pointer events and sit below interactive controls. The existing reduced-motion behavior remains unchanged. The six supplied review clips, unrelated review marquee, other programme visual concepts and cookie implementation are preserved.

Verification covers desktop 1440px and mobile 390px in Thai and English, inline and expanded states. The public regression suite adds caption/attribution parity, the intake destination, unboxed caption surfaces, non-intercepting gradient, caption containment, next/previous quotation fidelity and closing focus return. Existing checks remain enabled. Screenshots are captured separately from the repo; release evidence records exact deployed file hashes and CI/Pages results.

This static branch has no separate lint/build script. The applicable gate is `npm run check:ui`, the string-ID check, JavaScript syntax, whitespace checks and the exact-revision Pages deployment. Browser viewport emulation does not constitute physical-device or backend integration verification.

Local release gate: 528/528 passed (193 contract + 198 public + 137 consent). All 87 translation IDs, changed JavaScript syntax and whitespace checks passed. No third-party requests were observed by the consent suite.

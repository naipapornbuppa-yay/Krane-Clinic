# Landing carousel vertical scroll — 17 October 2026

P2, desktop Chrome, embedded B2C landing, How it works carousel. With the pointer over the carousel, wheel (deltaX 20, deltaY 140) or (50,140) left page scrollY unchanged. Pure vertical (0,140) moved it by 140. Removing horizontal overscroll containment alone did not fix it.

The carousel now routes predominantly vertical wheel input to the landing page with native delta scaling and immediate movement (no repeated smooth-scroll animation). Predominantly horizontal input, keyboard navigation, touch gestures and Ctrl-wheel zoom remain on their original paths. The listener is local to this carousel and does not consume input at the page's vertical boundaries.

Regression: `node b2c/tools/landing-scroll-qa.cjs` exercises the actual embedded page at 1440×1000. Eight up/down/diagonal gestures each begin over the carousel and must move the page in the correct direction. Keyboard carousel navigation must still move horizontally. All passed. This does not certify physical trackpad momentum or Safari; no claim of a full landing redesign/acceptance. Landing remains WIP. BE DEV handoff unchanged.

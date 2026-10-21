# BE DEV — B2C update, 13 October 2026

> **21 October 2026 — page source handoff for Tin:** Use [developer-handoff/README.md](developer-handoff/README.md) for the new editable per-page HTML/JS/CSS and shared libraries. This is regenerated from this branch's own baseline `3beddab450c9a6da9649c75dddce402dbc9cd39d`, not the newer live `gh-pages` app. The original app and styles remain unchanged. Hair scalp screening stays before photos; ED heart and nitrate screening stay in separate steps. Pricing/navigation updates on `gh-pages` are a separate delivery. All screens still mount together in the compatibility runtime; these are not independently mounted production routes. B2C-only scope and the existing backend limitations remain.


> **Current handoff scope — 13 October 2026:** B2C patient app only. Landing is included as **WIP**, not accepted/final. **Doctor and Admin portals are not part of this handoff; coming later.** Any portal files or older cross-surface descriptions below are historical reference only. No backend integration is included.

## Latest included changes

- Shared neutral modal close icon and text-link back/cancel actions; mobile-only drag handles.
- Design gallery opens only one modal at a time; closing never restores an older modal.
- Toast gallery in the left review menu, with success, information, warning, error and long-message samples using app component styles.
- Resume-treatment graphic contained within a circle; edit icon inside appointment card opens refreshed date/time controls.
- B2C frontend clinical-state dependencies for demo chat, plan acceptance, prescription requests and program state. These remain browser-only and are not production integration.

## Validation

- Fresh handoff-checkout UI contract run: all 170 checks passed (62 screens, 45 components, 5 flows, 33 rules).
- Fresh string contract: 87 unique IDs and matching locale placeholders; 145 static local references checked with no missing target. Dynamic URLs and external links are outside this static check.
- Targeted modal chrome, full gallery replacement, dismissal and preview tests passed.
- Pause/resume persistence and CSAT dismissal/submission passed at mobile and desktop sizes.
- Toast gallery: 390px and 1280px; five persistent samples, no horizontal overflow, modal/toast replacement and closing passed.
- See `b2c/tools/review-round-qa.mjs` for reproducible checks.
- This update does not claim a complete new portal audit or backend acceptance.

## Implementation boundaries

Use `b2c/UI-RULES.md`, the B2C contract and existing component files. String-ID inventories are references; not every runtime literal is bound to an ID (see SYSTEM-MAP.md). Backend appointments, clinical validation, auth, payments, fulfillment, document signing and notifications remain integration work.

Keep the existing repository link: this branch is updated in place. Doctor/Admin delivery will follow separately.

## QA follow-up — 16 October 2026

[Scheduled QA report](b2c/handoff/QA-NIGHT-2026-10-13.md): font families are now hosted with the B2C assets to avoid a blocking remote dependency. Final contract 170/170, chrome 114/114, 46 review cases after retry, 4 error/recovery cases, 3 real-entry paths and the provider-blocked font test passed. Existing B2C-only delivery scope is unchanged.

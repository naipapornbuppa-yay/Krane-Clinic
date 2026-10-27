# Cookie and browser-storage preferences — 27 October 2026

Baseline: released programme redesign `3bb3cb3c4f02a41d04ed48ca26651bca71346f78`.

## Inspected behavior

The existing cookie/storage notice already inventories language (`krane_lang`), prototype session/draft data, local prototype records/settings and IndexedDB attachments. Canonical public-page script/frame/style references are local. Source inspection found no site-written `document.cookie`, analytics/advertising SDK initialization, or third-party active script/frame tags on these pages. Fresh browser tests monitor the actual requests as well as storage. Outbound article/reference links are not automatically loaded tracking providers.

The hosting-provider section is preserved. Its server-side logging is outside these browser preferences. The existing privacy policy remains a draft; this work does not assert legal certification or invent a legal basis, provider, tracking cookie, or retention period.

## Delivered behavior

- A shared Krane banner and native preferences dialog on 21 canonical public/app entry pages, in Thai and English, with necessary-only defaults.
- Equal prominence for necessary-only and accept-all actions. Analytics and advertising are explicitly marked unused, disabled and off. Since no optional categories are implemented, every choice currently retains necessary storage only. Accept-all never adds or enables a tracker.
- A versioned record (`krane_cookie_preferences_v1`) stores the choice and timestamp in localStorage. Session storage is a fallback; if both stores are blocked the UI reports a page-only choice. Invalid/unknown records never authorize optional storage.
- Footer Manage Cookies, the policy controls section and app settings reopen preferences. The app shell owns its notice; the embedded marketing landing forwards settings to the shell and renders no duplicate notice.
- Native modal keyboard containment, Escape/backdrop/close behavior, focus return, responsive layout, 44px action/link targets, readable category status, language updates, reload/navigation persistence and cross-tab updates.
- Rejecting optional storage leaves unrelated user/prototype data intact. No addresses, drafts, clinical files or language preferences are cleared.
- Cookie/storage policy updated with the actual choice key, storage fallback and current UI behavior. No change to the released programme compositions or supplied media.

Before adding an optional provider, the owner must supply its actual purpose, inventory and policy details; implementation must revise the consent version and gate the provider before any requests. Existing accept-all records do not pre-authorize a future service.

## Release checks

Final local aggregate: 510/510 passed (193 contract + 180 public + 137 consent). All additional release suites listed below passed.

`npm run check:ui` now runs the original 193 contract checks, 180 public behaviour/motion checks and the dedicated consent suite. Existing flow/visual suites explicitly start after a necessary-only choice via `consent-test-fixture.mjs`; the separate consent suite uses genuine fresh contexts and covers the first-visit UI.

Consent cases include accept/reject/save, all optional categories remaining off, Escape without consent, focus return, Thai/English, desktop/mobile notice and settings geometry, reload/navigation, policy deep links, shell/iframe reopening, app settings, cross-tab updates, invalid records, persistent-storage denial, full storage denial, preservation of unrelated data, site cookies and request-origin inventory. Screenshots and results are written to `/tmp/krane-cookie-qa` (or `QA_OUTPUT`).

Also run: 114-case header consistency, 20 branding checks, 50 doctor/admin route inventory checks, six shared-view regressions, the 87-ID string catalog, changed JavaScript syntax and whitespace checks. This static branch has no separate lint/build command; the Pages build/deployment is verified for the exact pushed revision.

The root QA access-code entry and existing backend/demo integration boundaries remain unchanged. Verification uses Chrome viewport emulation, not physical devices or a legal compliance audit.

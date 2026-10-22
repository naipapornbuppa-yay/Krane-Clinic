# Dependency and lifecycle contract

## What changed

The handoff separates 62 screen templates with 210 page functions and 64 ordered page initializer routines. All 353 original main-script functions remain behaviorally AST-equivalent after expanding the declared extraction wrappers; some now delegate to page-owned hooks. The DOM and original CSS cascade remain unchanged.

The `045088c` package left anonymous page handlers central. `52d8aac` fixed those branches but left page renderers/lifecycles in adapters/navigation. The current inventory records 56 pages with owned code, four shared/static views and two prototype-only states. It includes all 430 authored controls, renderer/event/timer metadata, the loaded adapter audit and justified shared-component exceptions. It is conservative source evidence, not a complete dynamic call graph or backend acceptance.
This is source modularization with a working shared runtime. It does not claim fully independent/lazy-mounted components or a production backend.

## Load and initialization order

1. Shared shell loads the same existing review/clinical/select/localization assets as the original.
2. Build inserts each page's actual HTML fragment into its original shell slot, retaining global dialogs, SVG symbols and overlays.
3. Shared function libraries and page function libraries register their function declarations. They must not execute page initialization at script-load time.
4. The editorial adapter initializes the shared store and page-owned capture/search listeners after function registration and before the main router, preserving the original position. `shared/runtime.js` creates the shared lexical state and runs startup in the original order. Calls to `kraneInit_<page>_*()` are the extracted page-owned initializer routines; their position matters because some read already-created state or DOM references.
5. Deferred shared scripts retain their order. Trailing handoff adapters call profile/treatment-detail initializers and page-owned clinical functions at the original positions. Original external application scripts remain unchanged for the original app.
6. `show(id)` handles required-route checks, active-view switching, history, clinical adapters and `krane:screenchange` events. Route changes do not recreate the page or add its listeners again.

**Do not load only page.js and expect a working independent route.** Read that page's `dependencies.json`. It lists shared/global identifiers referenced by the file and the owning source. The list is conservative, includes some property-name coincidences, and supplements code review; it is not a security sandbox or a complete call graph.

## Ownership

| Concern | Source |
|---|---|
| Screen markup | `pages/<id>/index.html` |
| Screen functions and initial handlers | `pages/<id>/page.js` |
| Route-scoped CSS | `pages/<id>/page.css` |
| Auth/draft/consent/order state, bootstrap | `shared/runtime.js` |
| Guarded navigation, hash, back, active case | `shared/lib/navigation.js` |
| Shared intake rendering and validation | `shared/lib/intake.js` |
| Category question markup/order | `shared/lib/intake-templates.js` |
| Common UI, toast, fields, chrome | `shared/lib/ui.js` |
| Identity/address/order/clinical helpers | Corresponding `shared/lib/*.js` |
| Shared primitives and cascade positions | `shared/styles/components.css` |
| Tokens, fonts, icons, i18n, clinical adapters | Existing repository files referenced from `shared/shell.html` |

`pages/intake1` is a canonical view reused by service context. It must not fork separate copies of shared intake state for hair/weight/skin/etc. Some category-specific content is dynamically rendered from the shared template factory; editing the base HTML alone will not change those authored sets.

## Mount / initialize / activate / dispose

- **Mount:** compose every registered template before the runtime runs. The supplied build performs this step and validates one slot per page.
- **Initialize:** execute each ordered initializer once. Shared dispatcher selectors/order and state live centrally; page-specific branch bodies live in page files. `handler-ownership.json` records ownership. `true` consumes a matched event, even when validation fails; `false` preserves fallthrough. Never register the same page listener again on every route change.
- **Activate/deactivate:** `show()` changes the active screen and dispatches `krane:screenchange`. It invokes ordered page hooks; matching/pharmacy/rx timer cleanup and activation bodies live in the page modules. Delivery quote preserves its original active-screen guard and resets timers on re-entry. In-app Back uses the app's own history; ordinary `show()` calls use `replaceState`, preserving the original browser-history behavior.
- **Dispose:** end the whole app session/document. Removing individual screen DOM while the legacy runtime is running is not supported.

### Remaining DOM coupling (explicit)

- The `screens` array and many element variables are captured during startup.
- Some direct handlers are attached immediately to elements from several screens; global delegated handlers use shared state and cross-screen selectors.
- `show()` still chooses and orders page hooks and cross-page synchronization; route guards/state policy remain central. Moving a hook call changes lifecycle order even though its body is page-owned.
- Modal/overlay controls live in the shell and are referenced by multiple pages.
- Intake swaps a screen body according to category, then reinitializes select controls and pagination.
- Shared clinical state, localization and generic components still read the same global DOM/state contract. Page-specific article/folder/history/pause/upload and clinical-action bodies are now in page files.

To introduce lazy mounting or independent framework components: replace captured DOM references with per-mount lookup, move direct handlers into idempotent lifecycle hooks with cleanup, replace cross-screen reads with the shared state/service adapter, and run the supplied route/intake/back regression suite after each group. A DOM-emulator pass cannot validate browser layout or lifecycle timing by itself.

## Integration checklist for Tin

1. Confirm the target framework and the actual original bundle/revision being replaced.
2. Keep shared state/router/adapters central; import/render the needed screen template and its page-owned behavior.
3. Decide whether to retain initial all-screen composition temporarily or migrate a group to lazy mount with explicit cleanup.
4. Replace prototype browser-state flags with authenticated backend responses and agreed API contracts.
5. Test fresh entry, guarded direct links, direct/partner context switches, all service intake sets, validation, repeated clicks and both app/browser back behavior.
6. Run desktop/mobile browser validation before production acceptance. Do not infer clinical, payment or identity correctness from UI parity.

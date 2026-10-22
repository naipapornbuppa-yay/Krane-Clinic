# Standalone B2C page documents

Tin's Desktop reference (`pages structure example.zip`, SHA-256 `839eeb46be090789b1fade23aa004e8cbe7163c8635507eb0289595242820837`) contains complete documents such as `auth-signup-basic.html`, shared CSS/libraries, and explicit page initialization dependencies. It was inspected as data; none of its scripts or packages were executed or copied into Krane.

## Open a page

Serve the repository root with a static HTTP server. Open `developer-handoff/pages/login/index.html` for login, or `developer-handoff/index.html` for the page directory. Each page has a doctype, html/head/body, viewport metadata, its own screen markup and explicit script/style tags. Only one `.screen` is mounted. Login does not load `b2c/krane-b2c.html`, `b2c/krane-b2c-handoff.html` or the all-screen runtime.

Normal entry preserves prerequisite guards. A protected page can redirect to its first incomplete step. `?demoStage=payment` is an explicit fictional prototype checkpoint, not authentication or permission. The original all-screen application remains only as a baseline/comparison artifact; it is not a dependency of these entries.

## Source and dependencies

- `pages/<id>/index.html`: generated complete entry document, ready to serve.
- `pages/<id>/view.html`: authored page body, used by the generator; not a browser entry.
- `pages/<id>/page.js`: authored page behavior and lifecycle functions.
- `pages/<id>/page.css`: authored page-specific CSS. Shared design tokens/components remain central.
- `pages/<id>/standalone/`: generated page behavior, initialization, selected CSS and adapters.
- `pages/<id>/dependencies.json` and `standalone-dependencies.json`: exact delivered assets and source function references.
- `shared/lib/`: reusable validation, route guards, intake logic, storage, clinical/order helpers and UI primitives.
- `shared/standalone/page-state.js`: cross-document session continuity and typed treatment context.
- `shared/standalone/services/`: generated, cached groups of shared dependencies. Edit the named source files recorded in the manifest, not these generated groups.
- `tools/standalone-build.mjs`: dependency extraction and the documented compatibility adaptations for separate documents.

Run `npm ci --prefix developer-handoff` once, then `npm run build --prefix developer-handoff` after editing source. No framework or server application is required to serve the output. The common library remains a single source; generated copies are build output. Page CSS is selected from the shared cascade and page-specific additions, not the full all-screen stylesheet.

## Behavior retained across documents

The client validation, fictional OTP/password flow, intake questions and safety routing, consent, partner entry, matching, prescription/order demo state and article/treatment navigation continue to use the existing logic. Navigation now opens the destination document and the browser unloads the previous screen and timers. Internal document navigation keeps a resumed queue active; an actual reload or departure still suspends it, as in the baseline. The queue action initializer is an explicit shared dependency of waitroom and queue-resume. Native document navigation adds history entries; hash links are translated with replacement to avoid duplicate history steps.

The existing flow/consent/draft stores remain authoritative. Session continuity carries route history, current category and form selections between documents. Passwords, OTP codes and file bytes are never serialized by the page-state helper. Intake drafts merge fields from prior documents instead of deleting answers from screens no longer mounted. Treatment selection and article selection are explicit data transfers, not references to another page's DOM.

## Prototype boundaries

This is a static frontend handoff. Authentication flags, OTP acceptance, insurance lookup, matching timers, payments and clinical records are browser demonstrations, not secure backend integrations. Server authorization, real OTP/payment/insurance services, uploads, audit logging and persistence must be integrated through backend contracts. Existing account Save/Cancel navigation is preserved; it does not create backend profile persistence. `insurance-result` and settings controls retain their original prototype limitations. Static status pages legitimately have no unique event handlers.

The original clinical/copy baseline is Tin's `3beddab450c9a6da9649c75dddce402dbc9cd39d`; standalone work starts from handoff `dc71e348562ded866be35720bf4f066199404116`. The original B2C HTML, original component styles and gh-pages are not changed by this delivery. Historical migration checks apply to the retained comparison build; standalone browser and dependency checks are separate evidence.

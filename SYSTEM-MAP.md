# BE DEV — source of truth and verification

Verified 12 October 2026 against this handoff branch. **This is a structured prototype handoff, not a fully consolidated design system.** Do not assume identical names in different folders mean identical implementations.

## Canonical systems

| Surface | Entry | Tokens / components | Runtime copy |
|---|---|---|---|
| Patient app | `b2c/krane-b2c.html` | `b2c/design-tokens.css`, `b2c/components.css`; folder, modal and shared-view modules in `b2c/` | `b2c/i18n.js` plus inline literals |
| Doctor | `cms/cms-doctor.html` | `cms/design-tokens.css`, `cms/cms.css`, shared CMS select/date controls | `cms/i18n.js` |
| Admin | `cms/cms-admin.html` | Same CMS tokens/components as doctor; feature-specific modules | `cms/i18n.js` |
| Cross-surface demo | `krane-golden-fixture.js` and adapters | Shared browser fixture/state, not a UI component library | Data fixtures |
| Branding | `assets/brand-final/` | Approved logo assets; asset manifest documents legacy copies | Not applicable |

Root-level copies and `public/` are legacy/reference snapshots, **not additional canonical sources**. Keep them out of new implementation imports. B2C/CMS/root token files, translation runtimes and select implementations differ; they are not interchangeable. Do not flatten them or overwrite one with another.

## String IDs: present, but not fully wired

- `b2c/handoff/string-ids.v1.json`: API/status message contract. Validator passes **87 unique IDs** and matching locale placeholders.
- `b2c/strings/krane-strings.json`: **1,179 catalog entries**, including retired IDs. This is a reference inventory; it is not proof that every rendered label uses an ID.
- `b2c/strings/krane-strings-dynamic.json`: dynamic text inventory.
- `b2c/strings/shared-cta-ids.json`: shared CTA mapping.
- `b2c/handoff/runtime-copy-inventory.json`: known literal/runtime copy inventory.
- `b2c/strings/krane-strings-missing-en.json`: **588 entries in the missing-English catalog**. This is a catalog gap, not a claim that 588 strings fail in the browser; literal translation also exists.
- CMS and recent feature modules still contain literal labels. Stable ID binding and complete CMS coverage remain development work.

Run `npm run check:strings`. Do not rename or delete stable/retired IDs to clean the catalog. Refresh inventories deliberately after copy changes, review diffs, then bind the renderer to IDs.

## Link and asset verification

- **400 local references** in top-level B2C/CMS HTML and CSS: all targets exist. Includes static `src`/`href` and CSS `url()` references.
- **119 relative document links** in handoff entry documents, top-level B2C handoff Markdown and doctor audit: all targets exist.
- These checks do not prove external sites remain available, JavaScript-generated URLs are all reachable, every PDF is visually correct, or every component is behaviorally identical. Refer to individual QA reports for browser behavior and visual evidence.
- ZIP was generated with `git archive`: tracked code/assets/documents only; no node_modules or browser session data.

## Consolidation work still needed

1. Extract a single token source with explicit patient/CMS themes; migrate consumers incrementally with visual regressions.
2. Define shared primitives (button, field, select, modal/sheet, status, icon, document row), then replace duplicate implementations. Maintain surface-specific layouts.
3. Bind stable IDs to runtime translation across B2C and CMS; catalog coverage is not runtime adoption.
4. Introduce a component inventory/storybook or equivalent and tests for each state/breakpoint. Current HTML/CSS modules are not a typed component package.
5. Migrate away from legacy copies only after checking inbound links and deployment expectations. Their presence is documented, not silently declared clean.

**Acceptance:** current canonical paths and handoff links are identifiable and validated; full shared-component unification and complete string-ID adoption are NOT complete.

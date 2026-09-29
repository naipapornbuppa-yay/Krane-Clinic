# Shared UI consistency refactor — 28 September 2026

## Scope

Preserve the approved appearance while giving repeated controls one source for their shared properties. No flow, copy, illustration, or layout redesign is included.

- `design-tokens.css` now owns thin/strong control borders, floating-field padding, the focus ring, icon sizes/stroke, and the solid section divider.
- `components.css` and `custom-select.css` consume those properties. Inputs, date controls, enhanced selects, authentication fields, and address fields share the same focus-ring definition.
- The explicit `.btn--pill` modifier owns pill geometry; the location thumbnail button uses it with the existing primary color variant.
- Removed eight identical earlier top-level CSS rules, retaining their final cascade positions. Page adapters remain where moving them could alter specificity or the approved appearance.
- Shared stylesheet versions are updated together in the app and other HTML consumers to prevent mixed cached tokens/components.

## Component contract

| Type | Shared source | Deliberate variants |
| --- | --- | --- |
| Action button | `.btn`, control height/radius and semantic button colors | Primary, secondary, ink, small and pill; these do not all have the same geometry or color |
| Form control | Field height, control radius, border tokens and floating-field padding | Standalone native controls have a thin outline; floating shells use the strong outline and borderless inner controls |
| Focus state | `--control-focus-ring` | Invalid states retain their error treatment; inner controls defer to their shell |
| Icon | `.ui-icon` and icon-size/stroke tokens | xs/sm/default/md/lg; special artwork and brand logos retain their own geometry |
| Section divider | Divider size and color tokens | Solid section bands remain distinct from thin row separators |

Do not make every element that looks similar use one class: a button, selection option, status pill, and text link have different roles. Add an explicit variant when the role needs different properties; avoid copying shared constants into a route-specific override.

## Verification

`audit/component-consistency-check.mjs` renders all 77 app screens at 320, 390, 768, and 1440px and compares computed component properties. It also exercises normal, hover, focus, disabled and invalid field states, and compares 16 screenshots from eight representative screens at mobile/desktop widths. It freezes the clock and blocks map network requests for repeatable comparisons. Screens are activated for style inspection, not navigated through as complete user journeys.

Run a local server on port 5178, then:

```sh
KRANE_AUDIT_REF=<commit-before-refactor> node audit/component-consistency-check.mjs baseline
node audit/component-consistency-check.mjs after
```

The default report directory is `/private/tmp/krane-component-audit`; override it with `KRANE_COMPONENT_AUDIT`. `KRANE_AUDIT_REF` serves tracked HTML/CSS from that Git revision while retaining the current runtime. For a fresh working-tree baseline, omit the variable.

Results: zero changed component styles, zero changed screenshots, and zero page runtime errors. Both address-flow and address-picker suites pass. The broader legacy UI contract suite has pre-existing failures, recorded separately; this refactor does not remove assertions or change product behavior to conceal them.

The legacy contract result is unchanged: 146/164 checks pass, with the same 18 failures before and after. These include stale address assertions from the old inline map, missing entry points, legacy flow expectations and incomplete English translations. No new failure was introduced.

# Krane B2C Visual System

This document is the source of truth for public-facing Krane pages. It turns the visual language established on the landing page into reusable rules for every page reached from it.

## Design direction

Krane should feel calm, personal, and medically credible—not like a hospital portal and not like a beauty marketplace. The visual system uses generous editorial composition, restrained color, real care imagery, and a clear hierarchy. Each section communicates one idea at a time.

The signature pattern is:

1. A light neutral canvas between sections.
2. Large rounded section plates that read as distinct chapters.
3. One concern-specific color per page.
4. White or translucent cards within a colored plate.
5. Large semibold Thai display type with compact tracking.
6. High-contrast calls to action with a single arrow icon.

## Foundations

### Color

| Role | Token / value | Use |
| --- | --- | --- |
| Page canvas | `--detail-paper: #F4F4F3` | Space between section plates |
| Primary ink | `--color-ink` / `#1A1E28` | Headings, body copy, dark actions |
| Muted ink | `--color-ink-2` | Supporting copy and metadata |
| Brand blue | `--color-accent` / `#395AA4` | Links, focus, small trust accents |
| Weight | `#BE7D61` | Weight-management page and modules |
| Hair | `#7EA99E` | Hair and scalp page and modules |
| Men's health | `#1C3E56` | ED and sexual-health page and modules |
| Skin | `#AA8D94` | Skin page and modules |
| Hormone | `#7E729E` | Hormone page and modules |
| Sleep / stress | `#68758E` | Sleep and stress page and modules |

Every concern color has a deep version for contrast and a soft version for quiet sections. Do not introduce another accent inside a concern section. Blue remains reserved for links, focus, and shared Krane trust signals.

### Typography

- Display: `Prompt`, then `Noto Sans Thai`.
- Interface and body: `Noto Sans Thai`, then `Inter`.
- Display weight: 600. Avoid extra-bold weight in marketing headlines.
- Display tracking: `-0.04em` at large sizes, easing to `-0.025em` on mobile.
- Body copy: 15–17px, line-height 1.7–1.8, maximum 60–66 characters per line.
- Eyebrows: 12px, semibold. Use natural Thai casing; do not force uppercase.

### Shape and spacing

| Element | Desktop | Mobile |
| --- | --- | --- |
| Page gutter | 40px | 10–12px |
| Gap between sections | 16px | 10px |
| Section radius | 56–64px | 32–36px |
| Card radius | 26–30px | 22–24px |
| Section padding | 72–96px | 48–56px |
| Main button height | 52–56px | 50–52px |

Use space and surface color before borders. A border should clarify an interactive or nested object, not frame every section.

## Components

### Public header

The shared header is a floating white capsule. It keeps the same geometry on landing and detail pages. On small screens, secondary actions move into the menu; language and menu remain visible.

### Editorial hero

- One full-bleed real-care image inside a rounded concern-colored section.
- A concern-aware gradient protects copy without hiding the image.
- One eyebrow, one hook, one explanatory line, and one primary action.
- Trust copy sits below the action and uses a small shield icon.
- Desktop heroes are 620–720px high; mobile heroes stack copy toward the bottom.

### Section plate

Every major chapter is a rounded plate. Alternate among white, the concern's soft tint, the concern color, and dark ink. The sequence creates rhythm without adding decorative elements.

### Cards

- Cards within a colored plate use translucent white or solid white.
- Cards within a light plate use either white or the soft concern tint.
- Headings align to the same top edge; CTA alignment is independent of image dimensions.
- Product images use `object-fit: contain` and a consistent stage ratio.

### Buttons

- Primary: dark ink on light surfaces, white on dark surfaces.
- Secondary: transparent with a low-contrast border.
- Radius: 16px for editorial CTAs; fully round only for icon-only controls.
- Arrow direction follows the reading/action direction and uses the shared Lucide icon.

### Responsive behavior

- Reflow two-column compositions into a single narrative column below 760px.
- Product, journey, and article rows become horizontal snap carousels on phones; cards remain readable rather than shrinking into two narrow columns.
- Never create nested vertical scrolling inside a page section.
- Preserve safe areas and keep all interactive targets at least 44px.

### Motion

- Section entry: 420–700ms, small vertical offset, `cubic-bezier(.2,.8,.2,1)`.
- Hover: subtle image scale (maximum 1.025) and 2–3px lift.
- Respect `prefers-reduced-motion` and reveal all content immediately when enabled.

## Content and safety

- The first screen should answer: what this care is, why it is relevant, and what happens next.
- Treatment choices must remain examples subject to physician assessment.
- Keep urgency guidance visually distinct but calm; do not style it like a promotional CTA.
- Use real medicine names and matching product images where a product is shown.
- Avoid claims that imply guaranteed results.

## Code ownership

- Global semantic tokens: `b2c/design-tokens.css`
- Shared public navigation: `b2c/site-header.css`
- Landing implementation: `b2c/krane-b2c-landing.css`
- Concern detail implementation: `b2c/condition-detail.css`
- Doctor directory and profile implementation: `b2c/detail-pages.css`
- Concern content and tone selection: `b2c/condition-detail.js`

New public pages should consume the global tokens first, then define only page-specific composition variables. Do not copy landing selectors into another page; reuse the rules in this document and keep each page stylesheet scoped to its own components.

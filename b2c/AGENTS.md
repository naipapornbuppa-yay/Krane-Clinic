# B2C implementation rules

Before creating or redesigning a public page, read `../design.md`, `UI-RULES.md`, and the relevant existing implementation. Use `design-tokens.css` for brand values, `public-care.css` for shared public foundations, and `site-nav.js` / `site-header.css` for navigation. `doctors.html` with `doctors-page.css` is the current public directory example. Keep application interaction contracts intact.

Edit the owning component stylesheet; do not append another competing override for the same component. Keep real supplied content, profile IDs, links and imagery. Do not fabricate missing medical credentials or portraits. Verify desktop and mobile screenshots, overflowing rails, keyboard/focus behaviour and receiving routes before calling a redesign complete. Public page polish does not change the landing WIP or handoff scope.

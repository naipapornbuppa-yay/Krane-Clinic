# Public doctor directory — 17 October 2026

The directory previously combined a large decorative gradient hero, narrow fixed-column cards, oversized navy process sections and competing type scales. The mobile rule forced two narrow columns. These rules were independent of the current landing doctor cards.

Reorganized the introduction and directory as a single quiet care plate, with readable horizontal cards and explicit rail controls. Process content is three calm editorial steps; articles use the same hierarchy and card language. Doctor profile previews follow desktop dialog/mobile bottom sheet conventions. Full profile pages use the shared public header, colour/type scale and contextual return link. Missing portraits use initials, with no invented credentials or images.

`public-care.css` owns shared public foundations and doctor-card geometry, consumed by landing and directory. `doctors-page.css` owns the directory/profile composition after the legacy base. Updated `design.md`, `UI-RULES.md`, and `b2c/AGENTS.md` to require these sources, meaningful hierarchy, readable rails, image-led proportions and desktop/mobile review before creating a public page. Historical detail pages remain to be migrated; this is not a claim that the entire marketing site is now compliant.

Validation: Chrome 1440 and 390 widths; visual inspection with loaded images; no page overflow; horizontal next control; all four doctor preview records and full-profile destinations; close button, backdrop, Escape and focus return; mobile-only grab bar; no page errors. Landing's shared card dimensions and horizontal scroll remained unchanged. Evidence in `qa-evidence/2026-10-17-public-care/`; functional regression in `b2c/tools/doctor-directory-qa.cjs`. Physical Safari/touch momentum and clinical content reapproval were not part of this visual change.

Published only to review (`gh-pages`). BE DEV handoff remains unchanged. Landing remains WIP.

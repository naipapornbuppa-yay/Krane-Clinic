# B2C Client Review

This folder is the canonical B2C source for implementation, client review, and deployment.
Do not edit B2C copies under the workspace `Output/` or `site/` folders.

Open `krane-b2c.html` for the complete patient walkthrough. The landing page loads inside
the walkthrough and can also be opened directly from `krane-b2c-landing.html`.

Keep every file and the `assets/` and `i18n/` folders together.

## Canonical live links

Share only these stable links. The app adds its current release identifier
automatically, so neither link needs to be replaced after each deployment.

- Customer app: `https://naipapornbuppa-yay.github.io/Krane-Clinic/b2c/krane-b2c.html?public=1#landing`
- App with screen directory: `https://naipapornbuppa-yay.github.io/Krane-Clinic/b2c/krane-b2c.html?public=1&with_screen_tab=1#landing`

The retired `only-me=1` parameter is normalized to `with_screen_tab=1` so old
bookmarks continue to work without creating a third supported link.

Use Git history for superseded versions. The former workspace copy was archived at
`Output/05_Design/.archived-b2c-2026-08-14/` outside this repository.

## Customer-facing AI imagery policy

- AI-generated imagery must not show a full or recognizable human face in any customer-facing surface.
- Prefer hands, skin macro details, hair/scalp crops without a face, body crops without a head, products, and treatment objects.
- A full face is allowed only for an authentic person photo supplied by the client with confirmed provenance.
- Doctor-profile mockups are the sole exception to the generated-face restriction.

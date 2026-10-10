# Health articles: B2C fixture and later CMS handoff

The B2C article list (`#articles`), reading view (`#article`), and landing preview use four local editorial fixtures. The images under `b2c/assets/articles/editorial-v1/` represent **future admin-CMS media**, not permanent assets or user uploads. The data lives in `b2c/article-mocks.js` and is intentionally separate from the page templates.

| B2C value | Intended CMS responsibility |
| --- | --- |
| `id` | Stable article slug or public routing key |
| `title`, `summary`, `sections` | Published editorial content |
| `image`, `imageAlt` | Managed hero/thumbnail image and accessible description |
| `category`, `categoryLabel`, `tags` | Taxonomy and filtering |
| `minutes`, `byline` | Reading-time and editorial attribution metadata |
| `source` | Optional evidence/reference link |
| `status` (future) | Only published articles should appear on B2C |

Do **not** assume that B2B already has matching fields or an API. After finishing the B2C design, audit the admin CMS against this inventory, decide which fields and publishing controls are missing, then define the API response and media delivery contract. Remove the local fixture only after the CMS can supply equivalent published records. Keep article IDs stable for links from the landing page. Medical copy and attribution need editorial/clinical review before production.

Current fixture IDs: `finasteride`, `minoxidil`, `safe-weight-loss`, `healthy-hair`.

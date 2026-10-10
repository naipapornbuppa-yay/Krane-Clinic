# Health articles: B2C fixture and later CMS handoff

The B2C article list (`#articles`), reading view (`#article`), and landing preview use four local editorial fixtures. The images under `b2c/assets/articles/editorial-v1/` represent **future admin-CMS media**, not permanent assets or user uploads. The seed data lives in `b2c/article-data.js`; `b2c/article-store.js` supplies draft/published snapshots and `b2c/article-mocks.js` renders them. These are intentionally separate from the page templates.

| B2C value | Intended CMS responsibility |
| --- | --- |
| `id` | Stable article slug or public routing key |
| `title`, `summary`, `sections` | Published editorial content |
| `image`, `imageAlt` | Managed hero/thumbnail image and accessible description |
| `category`, `categoryLabel`, `tags` | Taxonomy and filtering |
| `minutes`, `byline` | Reading-time and editorial attribution metadata |
| `source` | Optional evidence/reference link |
| `status` | Draft, Pending approval and Published in the local adapter; B2C reads the published snapshot |

The current admin editor (`cms/article-editor.js`) exposes title, summary, hero image URL, image alt text, author name/photo and existing section headings/body. It does not yet establish a complete CMS: creation/deletion, adding/removing sections, taxonomy editing, media uploads, unpublishing, independent reviewer roles and revision conflict handling require scope decisions and implementation. Other seed metadata is retained when editing.

`KraneArticleStore.save` stores local draft records; only Published replaces the public snapshot. Draft and pending edits retain the prior published version. The localStorage key is `krane-editorial-demo-v1`; changes synchronize only within the same browser origin/profile. A previously published record remains visible while later edits are drafts. This is not server authorization or a production publication workflow.

Replace this browser adapter with authenticated CMS APIs after agreeing equivalent fields, media delivery, permissions and publish semantics. Keep article IDs stable for landing links. Medical copy and attribution require editorial/clinical review before production. See [the integration matrix](CROSS-SURFACE-INTEGRATION-MATRIX.md) and current QA evidence; source inspection alone does not validate the new editor.

Current fixture IDs: `finasteride`, `minoxidil`, `safe-weight-loss`, `healthy-hair`.

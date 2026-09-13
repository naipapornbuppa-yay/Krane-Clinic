# Shared client QA deployment

## One source of truth

- Production QA URL: use the latest neutral public QA link from the deployment handoff.
- Keep hosting account identity and origin details out of client-facing URLs and metadata.
- Git `main` is the only deployable source. Local ZIP files and unpushed laptop
  changes are not deployment sources.
- Keep the same approved hosting target when updating this QA app.

## Working from either laptop

1. Clone the same shared repository.
2. Pull `main` before starting.
3. Make changes on a short-lived branch and verify the complete QA app locally.
4. Merge or push the approved work to `main`.
5. Deploy only the exact pushed `main` commit to the existing Sites project.
6. Confirm the production URL opens on a phone before sending it to the client.

If a laptop cannot update the deployment, reconnect the approved hosting target
before publishing. Do not create competing client-facing QA links.

## Client access

- Hosting access should be **Public**, so anyone with the URL can reach the app.
- The app itself shows the QA password page first.
- The current client QA password is `234`.

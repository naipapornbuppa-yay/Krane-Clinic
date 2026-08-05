#!/usr/bin/env bash
# Publish public/ to the gh-pages branch that serves
# https://naipapornbuppa-yay.github.io/Krane-Clinic
#
# gh-pages holds the contents of public/ at its root, nothing else. Each run
# replaces that content with the working tree's public/ and pushes one commit,
# so the live site matches the source branch commit named in the message.
#
# Usage: ./deploy-gh-pages.sh "short description of what changed"
set -euo pipefail

cd "$(dirname "$0")"
SUBJECT="${1:-Deploy the latest patient app fixes}"
SOURCE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
SOURCE_COMMIT="$(git rev-parse --short HEAD)"
WORKTREE="$(mktemp -d)"

cleanup() { git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true; }
trap cleanup EXIT

git fetch origin gh-pages
git worktree add --detach "$WORKTREE" origin/gh-pages >/dev/null

# Mirror public/ into the branch root. Clearing first keeps removals honest: a
# file deleted from the source must disappear from the live site too. Everything
# except .git goes, then the current public/ is copied back in.
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -a public/. "$WORKTREE"/

cd "$WORKTREE"
git add -A
if git diff --cached --quiet; then
  echo "gh-pages already matches public/, nothing to deploy."
  exit 0
fi

git commit -q -m "$SUBJECT" -m "Publishes ${SOURCE_BRANCH} ${SOURCE_COMMIT}."

for attempt in 1 2 3 4; do
  if git push origin HEAD:gh-pages; then
    echo "Deployed ${SOURCE_COMMIT} to gh-pages."
    exit 0
  fi
  sleep $((2 ** attempt))
done

echo "Push to gh-pages failed after 4 attempts." >&2
exit 1

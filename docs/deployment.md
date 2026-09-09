# Deployment

> **Partially verified.** This page describes Bolt.new/bolt.host, which is what's
> actually live at `creativedigitalgrowth.bolt.host` — not the Cloudflare Pages
> mechanism this page described before (inherited unmodified from the template this repo
> was copied from, `cloudflare-blog`). The one-time import-and-publish path is confirmed
> working; the ongoing-updates path below it is not yet confirmed. See the deployment
> note in `CLAUDE.md`.

**GitHub repo:** `CreativeDigitalGrowth/lovable-blog` — public, pushed, what the CMS
commits to. **Bolt.new project:** imported from that repo via the
`https://bolt.new/~/github.com/CreativeDigitalGrowth/lovable-blog` URL, then published
from Bolt's own editor to `https://creativedigitalgrowth.bolt.host`.

## How it works

```
Confirmed:
  bolt.new/~/github.com/CreativeDigitalGrowth/lovable-blog
    └─ Bolt.new imports the repo into a WebContainer-based editor session
       └─ user clicks "Publish" inside Bolt's editor
          └─ Bolt builds and deploys the current in-editor workspace to
             https://creativedigitalgrowth.bolt.host

Unverified — pick one before relying on it:
  git push to main (including a CMS save)
    └─ (A) Bolt keeps the imported project synced to the GitHub repo and republishes
           automatically, the way Cloudflare/Netlify's Git integrations do, OR
    └─ (B) Bolt only reads the repo at import time; the workspace and the GitHub repo
           drift apart after that, and reaching bolt.host requires reopening the Bolt
           project and clicking Publish again
```

Saving a post in the CMS is a push to `main` on GitHub regardless of which of those is
true — check the live site afterward rather than assuming (A). There is no GitHub
Actions workflow and no repository secrets involved in the Bolt path either way.

### Why the npm `postbuild` hook matters

Whatever builds this project needs to run `npm run build` rather than `astro build`
directly, so the `postbuild` script fires: npm runs `pagefind --site dist` right after
Astro finishes, and the search index ends up inside `dist/` before it gets published. No
extra build step to configure, and no way to deploy a site whose search index is stale.
Whether Bolt's Publish action actually runs the full `npm run build` (postbuild
included) rather than just `astro build` has not been checked — if search ever comes up
empty on the live site, start there.

## What's configurable, and where

There is no `wrangler.toml`, no GitHub Actions workflow file, and no repository secrets
in this repo for deployment — Bolt.new's build/publish settings, if any are exposed at
all, would live inside the Bolt.new project's own UI, not in a file here. Not yet
explored; check Bolt's project settings directly if a build setting ever needs changing.

| Setting | Value here |
| --- | --- |
| Node version | unconfirmed — matches whatever Bolt's WebContainer runtime uses |
| Environment variables | none required by this project today |

## Verifying a deployment

Bolt.new's own UI (the project's Publish/deploy history, if it has one) is unexplored —
check there first if a publish ever seems to fail silently.

A smoke test against the live site is the check that actually matters — it tests what
visitors get rather than what the local build produced:

```bash
B=https://creativedigitalgrowth.bolt.host
for p in "" "blog/" "about/" "contact/" "search/" "admin/" "rss.xml" "sitemap-index.xml" "pagefind/pagefind-ui.js"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' -L "$B/$p")  /$p"
done
```

All should return `200`. Then confirm nothing leaked:

```bash
# drafts must be absent — swap in the slug of an actual draft post once one exists
curl -s -o /dev/null -w '%{http_code}\n' -L "$B/blog/<draft-slug>/"   # expect 404

# no root-absolute internal references
curl -s -L "$B/" | grep -ohE 'https?://[^"]+' | grep -v 'creativedigitalgrowth.bolt.host' | sort -u
```

## Rollback

Not yet exercised. If Bolt.new keeps a publish history the way its Deployments-style UIs
often do, an older publish may be re-selectable from inside the project — unverified.
The from-source fallback that always works regardless of what Bolt exposes: revert the
bad commit in GitHub, then re-import/re-open the Bolt project and Publish again.

```bash
git revert <sha>
git push
```

Unlike the Cloudflare/Netlify siblings, pushing this alone is **not** confirmed to
redeploy — see the unverified sync question above. Treat "revert and push" as step one
of two until that's settled, with "reopen Bolt and Publish" as the likely step two.

## Local equivalents

```bash
npm run build     # what CI runs, including Pagefind
npm run preview   # serves dist/ — the only faithful local test of search and base paths
```

`npm run dev` does **not** exercise search (no index), the `/admin/` directory index, or
draft exclusion. Use `preview` before assuming a deploy will behave.

## Access

Two independent access paths, not one.

**GitHub.** Pushing requires write access to `CreativeDigitalGrowth/lovable-blog`.
Changing repository settings — Discussions, collaborators, and which GitHub Apps are
installed — requires **admin**, held by `CreativeDigitalGrowth`. The `mohiseen-aumni`
account has Write only — same pattern as the sibling GitHub Pages repo.

```bash
gh api repos/CreativeDigitalGrowth/lovable-blog --jq '.permissions'
```

**Bolt.new.** Separately, whoever is signed into the Bolt.new account that imported and
published this project controls what's actually live — republishing, and any build/env
settings Bolt exposes. GitHub write access alone cannot make bolt.host redeploy if
pushes turn out not to sync automatically (see above); Bolt account access alone cannot
change what code exists in the GitHub repo unless that account also pushes back to it.
Both matter, independently — and which Bolt.new account holds this project hasn't been
recorded here yet.

# Working in this repository

A solo-author static blog: Astro 7 + TypeScript. Structurally copied from the sibling
Cloudflare Pages blog (`CreativeDigitalGrowth/cloudflare-blog`) on 2026-09-09 as this
family's seventh member, alongside the GitHub Pages, GitLab Pages, Netlify, Vercel
(`vzero-blog`) and Firebase Hosting siblings — not a mirror of any of them, no shared
content, no shared git history. Full detail in
[`docs/architecture.md`](docs/architecture.md).

**Hosting is not yet decided.** This repo was scaffolded and pushed to GitHub first;
unlike the other siblings, `docs/deployment.md` and `docs/setup.md` still describe the
*inherited* Cloudflare Pages mechanism from the template it was copied from — that is
stale until a real host is chosen and those docs are rewritten to match, the same way
the Firebase-hosted sibling (`firebase-blog`) rewrote its docs after moving through
Replit → Render → Firebase. The
working name "lovable-blog" reflects the platform the user asked about
(lovable.dev), but Lovable is a prompt-first React/Vite app builder, not a Git-integration
static host like Cloudflare/Netlify — whether it can adopt this existing Astro codebase
via its GitHub sync (rather than only generating new React projects) has not been
verified. Don't assume that connection works the way `vzero-blog`'s v0.app connection
did without checking.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, `astro dev logs`.

```bash
npm run dev      # localhost:4321/ — drafts visible
npm run build    # production build + Pagefind index
npm run preview  # serves dist/ — the only faithful test of search and base paths
npm run check    # TypeScript + Astro diagnostics; keep this at 0 errors
```

**On this Windows machine**, Smart App Control blocks Astro's native compiler binary.
After every `npm install` or `npm ci`:

```bash
npm install --no-save --force @astrojs/compiler-binding-wasm32-wasi
```

## Rules that are easy to get wrong

**Never write a root-absolute internal path.** It happens to work today — this is a
root-served site with `base: '/'` — but that is hosting, not design. Use the helpers in
`src/lib/url.ts` so the site can move again without a rewrite:

| Helper | For |
| --- | --- |
| `withBase(p)` | paths you author — `/about/` → `/about/` here, `/blog/about/` under a base |
| `absFromBuiltPath(p, site)` | paths Astro produced (`Astro.url.pathname`, `ImageMetadata.src`, `paginate()` URLs) — **already based** |
| `absUrl(p, site)` | absolute URL from a path you author |

Do not try to collapse these into one function that detects whether a path "already has
the base". That was tried on a sibling project and shipped two bugs: `/blog/my-post/`
is genuinely ambiguous because a `/blog/` route sits under a `/blog/` base.

**`paginate()` URLs already include the base.** Passing them through `withBase()`
doubles it the moment a base is configured. `Pagination.astro` takes them raw.

**Query posts through `getPosts()`** in `src/lib/posts.ts`, never `getCollection`
directly. That single call is where drafts are filtered out of production builds and
where date ordering happens.

**Frontmatter image paths are relative to the Markdown file** —
`../../assets/images/uploads/…` — because `image()` resolves them that way and the CMS
is configured to write exactly that. Both `media_folder` and `public_folder` in
`public/admin/config.yml` must stay in sync with wherever posts live.

**Site-wide settings live in `src/consts.ts` and nowhere else.** If you find yourself
hardcoding a title, an author name or a page size, put it there instead.

**The CMS schema and the Zod schema must match.** `public/admin/config.yml` field names
and `src/content.config.ts` are one contract; changing either alone breaks editing or
breaks the build.

**`public/admin/config.yml` is YAML.** Quote any string containing `: ` — an unquoted
colon-space silently breaks the whole CMS.

**The content repo (GitHub) and the eventual host are meant to stay two separate
systems**, bridged by whatever Git integration the chosen host offers — that's the
pattern every sibling follows (Cloudflare/Netlify's own dashboard integration, GitHub
Actions for GitHub Pages/Firebase, GitLab CI, or a v0.app→Vercel connection). Sveltia CMS
commits to the GitHub repo named in `public/admin/config.yml` regardless of which host
ends up watching it. No host is connected yet in this repo.

## Before calling a change done

```bash
npm run check    # expect 0 errors
npm run build
grep -rhoE 'https?://[^"< ]+' dist --include=*.html | grep -v 'lovable-blog.example.com' | sort -u
```

The grep must print only genuinely external URLs (giscus, google maps, unpkg). If the
change is visible in a browser, verify with `npm run preview` rather than `npm run dev`
— search, `/admin/` and draft exclusion all behave differently between the two.

## Deployment

**Not yet configured.** The repo is created and pushed; no host is connected. Once one
is chosen, wire it up the way the matching sibling did (see
[`docs/deployment.md`](docs/deployment.md), which still needs rewriting for whatever is
picked):

- A dashboard Git-integration host (Cloudflare Pages, Netlify) — connect it directly to
  `CreativeDigitalGrowth/lovable-blog`, no repo secrets needed.
- A GitHub Actions host (GitHub Pages, Firebase Hosting) — needs a workflow file and,
  for Firebase, a service-account secret; check the generated workflow's build step
  before trusting it (the `firebase-blog` sibling hit a concrete failure mode there).
- Lovable.dev itself, if its GitHub sync turns out to support importing an existing
  repo rather than only generating new ones — unverified, check before relying on it.

Local git authenticates as `mohiseen-aumni`, the same account used for every sibling.
See [`docs/setup.md`](docs/setup.md) once a host is picked and that doc is updated to
match.

## Documentation

Full docs: https://docs.astro.build

- [Routing and dynamic routes](https://docs.astro.build/en/guides/routing/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)

Cloudflare-specific: https://developers.cloudflare.com/pages/ and
https://developers.cloudflare.com/pages/configuration/git-integration/

# Lovable Blog

A static blog for a single author. Astro + TypeScript, Markdown content collections,
Sveltia CMS at `/admin`, Pagefind search, Giscus comments. **Live at
[creativedigitalgrowth.bolt.host](https://creativedigitalgrowth.bolt.host)**, hosted via
Bolt.new — see [Status](#status) below.

No server, no database, no tracking scripts, no cookie banner, no CSS framework. Three
runtime dependencies. The only client-side JavaScript is a theme toggle, a copy-link
button, the search page and the comment widget.

Sibling projects, same feature set, each with independent content and git history and a
deliberately different visual design: [`blog/`](../blog) (GitHub Pages),
[`Gitlab-blog/`](../Gitlab-blog) (GitLab Pages), [`cloudflare blog/`](../cloudflare%20blog)
(Cloudflare Pages), [`netlify-blog/`](../netlify-blog) (Netlify), [`vzero-blog/`](../vzero-blog)
(Vercel via v0.app), [`firebase-blog/`](../firebase-blog) (Firebase Hosting).

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/setup.md](docs/setup.md) | One-time setup — GitHub repo (done), Bolt.new hosting (done), CMS token, Giscus, contact form, author details |
| [docs/writing.md](docs/writing.md) | Writing and publishing posts, frontmatter reference, drafts, images |
| [docs/architecture.md](docs/architecture.md) | How the site is built and why the awkward parts are that way |
| [docs/deployment.md](docs/deployment.md) | CI/CD — Bolt.new/bolt.host, including what's still unverified about it |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Common failures, with the fix |
| [SECURITY.md](SECURITY.md) | Threat model, token hygiene, why deletion is not erasure |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Ground rules for comments |
| [CLAUDE.md](CLAUDE.md) | Conventions for anyone (or anything) editing this repository |

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:4321/ — **drafts visible** |
| `npm run build` | Production build into `dist/`, then Pagefind indexes it (`postbuild`) |
| `npm run preview` | Serve `dist/` — the only faithful test of search, `/admin/` and base paths |
| `npm run check` | TypeScript + Astro diagnostics |

### Windows: Smart App Control

If a build fails with *"An Application Control policy has blocked this file"*, Windows
Smart App Control is refusing Astro's unsigned native compiler binary. Install the WASI
fallback:

```bash
npm install --no-save --force @astrojs/compiler-binding-wasm32-wasi
```

Re-run it after every `npm install` or `npm ci`. CI on Linux is unaffected. Details in
[troubleshooting.md](docs/troubleshooting.md).

## Writing a post

Open `/admin/` → **New Post** → uncheck **Draft** → **Save**. That commits to `main` on
GitHub, but does **not** by itself update the live bolt.host site — reopen the Bolt.new
project and click **Publish** to actually ship it. See
[docs/deployment.md](docs/deployment.md).

Or write the file directly — posts are Markdown in `src/content/blog/`, and the filename
is the URL slug:

```yaml
---
title: "Post title"
description: "One or two sentences, used for cards, meta description and social."
date: "2026-09-02T09:00:00.000Z"
author: "Your Name"
featured_image: "../../assets/images/uploads/something.jpg"
category: "Engineering"
tags: [astro, performance]
draft: false
---
```

Frontmatter is validated at build time — a typo fails the build instead of shipping
broken output, and a failed build leaves the previous version live.

`draft: true` posts render in `npm run dev` and are dropped entirely from production:
no page, no feed entry, no archive listing, no search hit. Full reference in
[writing.md](docs/writing.md).

## Base-path safety

`base` is currently `/` (a guess pending an actual host) and a root-absolute `/foo/`
link happens to work. That is a coincidence of the placeholder config, not a licence to
hardcode paths: every internal link still goes through [`src/lib/url.ts`](src/lib/url.ts)
— `withBase()` for paths you author, `absFromBuiltPath()` for paths Astro produced,
`absUrl()` for absolute URLs.

To verify after any change, build and confirm every absolute URL points at this site:

```bash
grep -rhoE 'https?://[^"< ]+' dist --include=*.html --include=*.xml   | grep -v 'creativedigitalgrowth.bolt.host' | sort -u
```

## Status

This project was scaffolded from the sibling Cloudflare Pages blog's codebase on
2026-09-09, with its own visual design, then imported into Bolt.new and published:

- [x] GitHub repository created and pushed — public, `CreativeDigitalGrowth/lovable-blog`
- [x] Hosted and live — imported into Bolt.new via the repo's GitHub URL, published to
      `creativedigitalgrowth.bolt.host`. GitHub pushes do **not** keep it in sync by
      themselves — every change needs a manual republish inside Bolt.new, see
      [docs/deployment.md](docs/deployment.md)
- [x] Site URL settled and `astro.config.mjs` / `public/admin/config.yml` / `robots.txt`
      updated off the old `lovable-blog.example.com` placeholder
- [ ] CMS access token, Giscus IDs, contact form endpoint, author details in `src/consts.ts`

The site also builds and runs locally (`npm run dev` / `npm run build` / `npm run
preview`) independent of all of the above. Full checklist in
[docs/setup.md](docs/setup.md).

// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Hosting is not yet decided (see CLAUDE.md) — `site` below is a placeholder, and
// `base` is left at its default of '/' assuming a root-served host. src/lib/url.ts
// still mediates every internal link, so the site can move under a sub-path or onto a
// real domain later by changing `site`/`base` here and nothing else.
export default defineConfig({
  site: 'https://lovable-blog.example.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // /search/ is a client-side tool, not content, and is marked noindex.
      filter: (page) => !page.endsWith('/search/'),
    }),
  ],
  image: {
    // Remote featured images (a pasted stock-photo URL, say) are downloaded at
    // build time, resized and served from this origin — so they get the same
    // treatment as local uploads and cost the reader no third-party request.
    remotePatterns: [{ protocol: 'https' }],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});

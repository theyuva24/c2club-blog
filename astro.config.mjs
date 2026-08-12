// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { blogPosts } from './src/data/blogPosts.js';

// Normalization function to match paths reliably (strips slashes for internal matching)
/** @param {string} path */
const normalizePath = (path) => {
  if (!path) return '';
  return path
    .replace(/\.html$/, '') // Remove .html
    .replace(/\/$/, '')     // Remove trailing slash
    .toLowerCase();
};

// Create a lookup map of published posts and their modified dates
/** @type {Record<string, { published: boolean, lastmod: string }>} */
const postMetadataMap = {};
blogPosts.forEach(post => {
  const norm = normalizePath(post.url);
  postMetadataMap[norm] = {
    published: post.published !== false,
    lastmod: post.dateModified || '2026-05-21'
  };
});

// https://astro.build/config
export default defineConfig({
  site: 'https://c2club.in',
  // Preserve Astro 6's HTML-aware whitespace behavior during the v7 migration.
  compressHTML: true,
  
  // 1. Force trailing slashes globally to perfectly align with Cloudflare Pages
  trailingSlash: 'always',
  
  build: {
    // 2. Change 'file' to 'directory' so it builds as /path/index.html instead of /path.html
    format: 'directory'
  },
  
  integrations: [
    sitemap({
      serialize(item) {
        try {
          const parsedUrl = new URL(item.url);
          const pathname = parsedUrl.pathname;

          // Exclude templates/placeholders
          if (pathname.includes('blog-template') || pathname === '/search/' || pathname === '/404.html' || pathname === '/404/') {
            return undefined;
          }

          // If it is a blog post path
          if (pathname.startsWith('/blog/')) {
            // Keep the main blog listing page
            if (
              pathname === '/blog' ||
              pathname === '/blog/' ||
              pathname === '/blog/index.html'
            ) {
              return item;
            }

            const norm = normalizePath(pathname);
            const meta = postMetadataMap[norm];

            // If it's a draft (published is false) or not in the blogPosts list, exclude it
            if (!meta || !meta.published) {
              return undefined;
            }

            // Inject the correct lastmod date from metadata
            item.lastmod = meta.lastmod;
          }
        } catch (e) {
          console.error(`Error serializing sitemap item ${item.url}:`, e);
        }
        return item;
      }
    })
  ]
});

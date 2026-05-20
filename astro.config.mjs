// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://c2club.in',
  build: {
    format: 'file'
  },
  integrations: [sitemap()]
});

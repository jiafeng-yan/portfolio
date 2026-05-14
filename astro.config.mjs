import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jiafeng-yan.github.io',
  base: '/portfolio',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild'
    }
  }
});

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://jiafeng-yan.github.io',
  base: '/portfolio',
  output: 'static',
  integrations: [react()],
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild'
    }
  }
});

// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.cheetahgroups.in',
  output: 'server',
  adapter: vercel(),

  server: {
    host: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
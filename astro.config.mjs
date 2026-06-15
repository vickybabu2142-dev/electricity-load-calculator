// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://electricityloadcalculator.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'server',
  trailingSlash: 'never',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      filter: (page) => page !== `${SITE_URL}/404`,
    }),
  ],

  adapter: cloudflare(),
});
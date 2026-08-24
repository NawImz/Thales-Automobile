import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Le domaine figure sur la banderole de la devanture (« thales-auto.fr »).
// À faire confirmer par Nabil — voir TODO-CLIENT.md.
const SITE = 'https://thales-auto.fr';

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'never' },
  image: { responsiveStyles: true },
});

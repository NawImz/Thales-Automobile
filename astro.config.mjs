import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// site: à renseigner avant la mise en ligne (canonical, sitemap, OG absolus)
export default defineConfig({
  site: 'https://example.com', // [À COMPLÉTER] domaine réel
  vite: {
    // Tailwind 4 : plugin Vite, plus d'intégration @astrojs/tailwind,
    // plus de tailwind.config.mjs. Le thème vit dans src/styles/global.css
    // sous @theme, et le scan des sources est automatique.
    plugins: [tailwindcss()],
  },
});

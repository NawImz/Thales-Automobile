import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'node:url';

// site: à renseigner avant la mise en ligne (canonical, sitemap, OG absolus)
export default defineConfig({
  site: 'https://example.com', // [À COMPLÉTER] domaine réel
  integrations: [
    tailwind({
      // Piège Windows : Tailwind résout sa config depuis le cwd.
      // Chemin absolu = pas de « couleurs fantômes » quand le projet
      // vit dans un dossier contenant des espaces.
      configFile: fileURLToPath(new URL('./tailwind.config.mjs', import.meta.url)),
      applyBaseStyles: false,
    }),
  ],
});

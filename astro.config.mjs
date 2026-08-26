import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * Deux cibles possibles, choisies par une variable d'environnement.
 *
 * · Par défaut : le domaine du client. Le site est alors servi à la racine,
 *   et `base` vaut « / ».
 * · `DEPLOIEMENT=pages` : GitHub Pages, qui sert le site sous le nom du dépôt.
 *   ⚠️ C'est ce sous-chemin qui casse tous les liens écrits en dur — d'où le
 *   helper `lien()` dans src/lib/garage.ts, par lequel passe toute navigation
 *   interne.
 *
 * Le domaine figure sur la banderole de la devanture (« thales-auto.fr »),
 * il reste à confirmer par Nabil — voir TODO-CLIENT.md.
 */
const SUR_PAGES = process.env.DEPLOIEMENT === 'pages';
const SITE = SUR_PAGES ? 'https://nawimz.github.io' : 'https://thales-auto.fr';
const BASE = SUR_PAGES ? '/Thales-Automobile' : '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'never' },
  image: { responsiveStyles: true },
});

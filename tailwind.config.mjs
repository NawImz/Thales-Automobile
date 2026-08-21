/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // ─────────────────────────────────────────────────────────────
      // PALETTE — [À COMPLÉTER EN PHASE 2]
      // Extraite du logo au pixel près (histogramme sharp), jamais
      // inventée. Chaque paire texte/fond vérifiée en WCAG AA (4,5:1)
      // AVANT d'écrire la moindre ligne de markup.
      // Interdits sauf s'ils viennent de l'identité réelle : dégradés
      // violet/bleu, crème + serif + terracotta, dark mode gratuit.
      // ⚠️ Toute modif de ce fichier = redémarrage du serveur dev.
      // ─────────────────────────────────────────────────────────────
      colors: {},

      // TYPO — [À COMPLÉTER EN PHASE 2] : 1 display + 1 sans, via Fontsource.
      // Les @import Fontsource vont AVANT les @tailwind dans global.css.
      fontFamily: {},

      // Échelle typographique du starter (corps >= 16px sur mobile)
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.5' }],   // 14
        base: ['1rem', { lineHeight: '1.65' }],    // 16
        lg: ['1.25rem', { lineHeight: '1.55' }],   // 20
        xl: ['1.5rem', { lineHeight: '1.35' }],    // 24
        '2xl': ['2rem', { lineHeight: '1.2' }],    // 32
        '3xl': ['3rem', { lineHeight: '1.08' }],   // 48
        '4xl': ['3.5rem', { lineHeight: '1.04' }], // 56 — hero desktop
        '5xl': ['4rem', { lineHeight: '1' }],      // 64 — hero desktop
      },
    },
  },
  plugins: [],
};

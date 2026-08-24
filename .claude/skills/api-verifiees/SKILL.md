---
name: api-verifiees
description: Surface d'API vérifiée pour Astro, Tailwind v4, GSAP et Lenis tels qu'INSTALLÉS dans ce dépôt. À consulter avant d'écrire une ligne qui touche à l'une de ces bibliothèques — l'egress web est bloqué, la doc en ligne n'est pas consultable, et écrire une API de mémoire est la première cause de bug silencieux.
---

# API vérifiées — lues dans `node_modules`, pas de mémoire

⚠️ **L'egress web est bloqué dans ce conteneur** (`docs.astro.build` → `EGRESS_BLOCKED`).
Seuls les registres de paquets passent. La doc en ligne n'est donc pas consultable.

**Le substitut est plus sûr, pas moins** : on lit les `.d.ts` du paquet réellement
installé. C'est la version qu'on livre, pas celle d'une page potentiellement en retard
ou en avance sur notre `package.json`.

## Comment vérifier, à refaire à chaque montée de version

```bash
node -e "console.log(require('astro/package.json').version)"
ls node_modules/astro/dist/content/loaders/          # loaders disponibles
sed -n '1,60p' node_modules/gsap/types/scroll-trigger.d.ts
grep -rhoE '"@(theme|utility|custom-variant|source|variant)"' node_modules/tailwindcss/dist/lib.js | sort -u
```

## Constats au 24/08/2026

| Paquet | Version installée |
|---|---|
| astro | 7.2.4 (majeures publiées : 5.18.2, 6.4.8, 7.2.4) |
| tailwindcss + @tailwindcss/vite | 4.3.3 |
| gsap | 3.15.0 |
| lenis | 1.3.26 |

### Astro — content collections

- Le fichier de config est **`src/content.config.ts`**, à la racine de `src/`.
  ⚠️ `src/content/config.ts` est l'emplacement **hérité**. Chaîne trouvée dans
  `astro/dist/content/utils.js:461`.
- `astro/loaders` exporte exactement deux loaders : **`file`** et **`glob`**.
- `glob({ pattern, base?, generateId?, retainBody?, deferRender? })` —
  `pattern: string | string[]`, `base: string | URL` relatif à la racine.
- Les données non-Markdown (JSON de barème, avis, config) passent par `file()`.

### Tailwind v4 — at-rules reconnues

`@theme` · `@utility` · `@custom-variant` · `@variant` · `@source` · `@apply` ·
`@layer` · `@plugin` · `@reference` · `@config`

- Les tokens vivent dans `@theme` ; **pas de `tailwind.config.mjs`**.
- Un utilitaire maison passe par **`@utility`**, jamais par `@layer utilities`
  (il n'y serait pas traité comme un utilitaire).
- ⚠️ Tous les `@import` doivent précéder toute autre règle (spec CSS) : les imports
  de polices se placent **avant** `@import 'tailwindcss'`.

### GSAP — ScrollTrigger

- `scrub?: boolean | number` (`scroll-trigger.d.ts:756`). Un nombre = inertie en
  secondes. **`scrub: 1` ≠ `scrub: true`** : `true` colle à la molette sans lissage.
- Autres champs confirmés : `start`, `end`, `pin`, `snap`, `toggleActions`,
  `fastScrollEnd`, `anticipatePin`, `invalidateOnRefresh`, `markers`.
- Pas de plugin Club (MorphSVG, DrawSVG…) : ils sont payants et absents. Toute
  métamorphose de path doit donc se faire à structure de commandes identique —
  voir le skill `animation-cliquet`.

### Lenis

- Synchronisation obligatoire avec ScrollTrigger, sinon désync au scroll rapide :
  `lenis.on('scroll', ScrollTrigger.update)` +
  `gsap.ticker.add(t => lenis.raf(t * 1000))` + `gsap.ticker.lagSmoothing(0)`.
- ⚠️ Lenis écrase les ancres natives : intercepter `a[href^="#"]`.

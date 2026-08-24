---
name: budget-performance
description: Budget de performance de ce site et méthode de mesure. Les chiffres se mesurent, ils ne s'estiment pas. À lire avant d'ajouter une dépendance et avant de déclarer la Phase 5 terminée.
---

# Budget — à mesurer, jamais à estimer

| Poste | Plafond |
|---|---|
| Lighthouse mobile, 4 catégories | ≥ 95 |
| LCP | ≤ 1,5 s |
| CLS | ≤ 0,02 |
| INP | ≤ 150 ms |
| JavaScript de l'accueil | ≤ 60 Ko gzip |
| Poids total de l'accueil | ≤ 600 Ko |

## Mesurer le JS réellement livré

```bash
npm run build
find dist/_astro -name '*.js' -exec gzip -c {} \; | wc -c   # borne haute
for f in dist/_astro/*.js; do printf '%8d  %s\n' $(gzip -c "$f" | wc -c) "$f"; done | sort -rn
```

Ne compter que les chunks **réellement référencés par l'accueil** : un chunk chargé
à la demande sur `/tarifs` ne pèse pas sur le budget de `/`.

## ⚠️ L'environnement de test ment

Ce conteneur rend en **SwiftShader** (aucun GPU) : une page saine y tourne à
1 image/s contre 61 sur page blanche. **Aucun chiffre de FPS ni de Lighthouse
Performance mesuré ici n'est transposable.** Vérifier avec :

```js
const gl = document.createElement('canvas').getContext('webgl2');
const d = gl.getExtension('WEBGL_debug_renderer_info');
gl.getParameter(d.UNMASKED_RENDERER_WEBGL);   // "SwiftShader" => chiffre non valable
```

Ce qui **reste mesurable ici** et doit l'être : poids des bundles, nombre de
requêtes, CLS, structure du DOM, résultats axe-core, absence d'erreurs console.
Ce qui **ne l'est pas** : FPS, LCP réel, score Lighthouse Performance. Ces
derniers se mesurent sur une vraie machine et les chiffres vont dans le README
avec la machine qui les a produits.

## Règles qui protègent le budget

- Aucune dépendance sans justification écrite dans `SETUP.md`.
- GSAP et ScrollTrigger en **import dynamique**, jamais dans le bundle initial.
- Polices auto-hébergées, woff2, sous-ensemblées au latin.
- Images via `astro:assets` en AVIF + WebP, dimensions explicites (CLS = 0),
  `fetchpriority="high"` sur le seul LCP.

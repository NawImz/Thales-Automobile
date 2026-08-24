# SETUP — outillage de la reconstruction

Ce que j'ai installé, créé ou écarté, et pourquoi. Phase 0 du brief.

---

## 1. Ce qui était déjà là et que je garde

Huit skills vivent dans `.claude/skills/` — **dans le dépôt**, pas dans
`~/.claude/skills/` : les sessions web tournent dans un conteneur éphémère, seul
ce qui est versionné survit d'une session à l'autre.

| Skill | Ce qu'il apporte ici |
|---|---|
| `frontend-design` | direction visuelle, sortir des défauts de gabarit |
| `ui-ux-pro-max` | palettes, appariements typographiques, presets GSAP |
| `web-design-guidelines` | revue de code d'interface |
| `responsive-design` | 390 / 768 / 1440, typo fluide |
| `theme-factory` | cohérence des tokens |
| `design-system-generator` | structure du système de design |
| `design-review` | revue visuelle avec captures |
| `task-observer` | journal des corrections et des motifs réutilisables |

Le **MCP Playwright** est déjà configuré dans `.mcp.json` et vérifié en marche
cette session (Chromium préinstallé, `--executable-path` renseigné). Rien à
installer.

## 2. Ce que j'ai créé, parce que ça manquait

Le brief demande design front-end, animation web, accessibilité, SEO et audit de
performance. Les quatre derniers n'existaient pas. Recherche faite dans la
marketplace (`SearchPlugins`) : rien de pertinent pour l'animation web,
l'accessibilité ou la performance front. J'ai donc écrit les skills.

| Skill créé | Pourquoi |
|---|---|
| `.claude/skills/api-verifiees` | **le plus important.** L'egress web est bloqué : la doc en ligne est inaccessible. Ce skill consigne l'API lue dans `node_modules`, avec les commandes pour la revérifier. |
| `.claude/skills/animation-cliquet` | le langage de mouvement du site : le cliquet, la ligne signature, les compteurs, le plancher `reduced-motion`, et les trois garde-fous du `steps()`. |
| `.claude/skills/accessibilite-aa` | WCAG 2.2 AA : méthode de mesure des contrastes, focus à double anneau, cibles ≥ 44 px. |
| `.claude/skills/seo-local-garage` | JSON-LD `AutoRepair`, et l'interdiction `aggregateRating` qui expose à une sanction manuelle. |
| `.claude/skills/budget-performance` | les plafonds chiffrés, comment les mesurer, et ce que ce conteneur **ne peut pas** mesurer. |

Deux scripts, pour que le plan soit vérifiable et non déclaratif :

- **`scripts/echantillonner-logo.mjs`** — pipette le logo et sort les hex exacts
  (quantification puis re-moyenne, sinon on obtient un hex arrondi donc faux).
- **`scripts/contraste.mjs`** — vérifie chaque paire réellement utilisée, sort en
  code 1 si une paire échoue. Branché sur `design/palette.json`.

## 3. La documentation à jour — et pourquoi ce n'est pas un MCP

Le brief demande un accès à la doc d'Astro, Tailwind v4 et GSAP, avec la consigne
« n'écris pas d'API de mémoire, vérifie ». J'ai essayé la voie directe :

```
WebFetch https://docs.astro.build/…  →  EGRESS_BLOCKED
```

Le proxy de sortie n'autorise que les registres de paquets (npm, PyPI, crates,
Go). **Aucune doc en ligne n'est atteignable, et aucun MCP de documentation ne le
serait davantage** — il passerait par le même proxy.

La substitution retenue est plus fiable que la doc en ligne : on lit les `.d.ts`
du paquet **réellement installé**. C'est la version qu'on livre, pas celle d'une
page qui peut être en retard ou en avance sur notre `package.json`.

Vérifications faites, et consignées dans `api-verifiees` :

| Point vérifié | Constat | Source |
|---|---|---|
| Emplacement de la config des collections | **`src/content.config.ts`** — `src/content/config.ts` est l'emplacement hérité | `astro/dist/content/utils.js:461` |
| Loaders disponibles | `glob` et `file`, exactement | `require('astro/loaders')` |
| Signature de `glob` | `{ pattern, base?, generateId?, retainBody?, deferRender? }` | `loaders/glob.d.ts` |
| At-rules Tailwind v4 | `@theme` `@utility` `@custom-variant` `@variant` `@source` `@apply` `@layer` `@plugin` `@reference` `@config` | `tailwindcss/dist/lib.js` |
| Type de `scrub` | `boolean \| number` — donc `scrub: 1` est bien valide et ≠ `true` | `gsap/types/scroll-trigger.d.ts:756` |
| Plugins GSAP Club | absents (payants) — **aucun MorphSVG** | `ls node_modules/gsap` |

Cette dernière ligne a une conséquence directe sur la ligne signature : voir
`DESIGN-PLAN.md` §5.

## 4. Ce que je n'ai pas installé, et pourquoi

- **Plugins de la marketplace.** `searchfit-seo` et `design` (audit
  d'accessibilité) sont pertinents sur le papier. Je ne les ai pas activés :
  `CLAUDE.md` interdit de lancer un installateur tiers sans votre accord au
  moment même. Dites-le si vous les voulez, c'est une minute.
- **Plausible / Umami.** Le brief les demande. Les deux exigent un compte et un
  script servi depuis leur domaine — donc une entrée CSP et une décision qui vous
  appartient. Consigné dans `TODO-CLIENT.md`, à brancher en fin de parcours.

## 5. Versions

| Paquet | Installé | Note |
|---|---|---|
| astro | **7.2.4** | ⚠️ le brief dit « Astro 5 ». Voir ci-dessous. |
| tailwindcss / @tailwindcss/vite | 4.3.3 | conforme au brief |
| gsap | 3.15.0 | core + ScrollTrigger, import dynamique |
| lenis | 1.3.26 | `lerp` 0.09 |
| sharp | 0.35.3 | pipette du logo, images, OG |

### ⚠️ Astro 5 ou Astro 7 — arbitrage à valider

Le brief demande Astro 5. Astro **7.2.4** est installé, et vous m'aviez dit de le
garder lors de la session précédente. Les majeures publiées sont 5.18.2, 6.4.8 et
7.2.4.

**Ma recommandation : rester en 7.** Tout ce que le brief exige de la 5 —
content collections avec loaders `glob`/`file`, `astro:assets`, sortie statique —
existe à l'identique en 7. Redescendre de deux majeures ne rapporte rien et coûte
les correctifs de sécurité. Le seul argument pour la 5 serait une contrainte
d'hébergement, et Cloudflare Pages comme Netlify servent du statique sans se
soucier de la version d'Astro.

Dites un mot si vous voulez la 5 quand même : `npm i astro@5` et le plan tient.

## 6. Ce qui bloque, et ce qui ne bloque pas

**Bloquant, une seule chose : le fichier du logo.** `/public/brand/` n'existe pas.
Le logo est visible dans votre message, mais une image de conversation n'est pas
un fichier : je ne peux pas la pipetter. Or le brief dit, à raison, « ne devine
pas les hex ».

Je n'ai donc rien deviné. `design/palette.json` porte des **valeurs de travail**
explicitement marquées `"_echantillonne": false`. La structure de la palette, les
rôles et les seuils sont arrêtés et vérifiés ; seules les valeurs numériques de
l'accent attendent le fichier. Dès qu'il arrive :

```bash
node scripts/echantillonner-logo.mjs public/brand/logo.png
# reporter les hex dans design/palette.json
node scripts/contraste.mjs
```

Tout le reste du plan est indépendant de cette valeur et se lit dès maintenant.

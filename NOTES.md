# NOTES — journal d'itération

Ce que j'ai essayé, ce que j'ai gardé, ce que j'ai jeté. Tenu au fil de la
construction, le plus récent en bas.

---

## Phase 3 · Étape 1 — dépendances, tokens, polices

### Les polices : 172 Ko → 57,7 Ko

**Essayé d'abord :** importer les CSS Fontsource tels quels. Ça marche, mais
ça embarque 172 Ko de woff2, dont 88 Ko pour le seul Archivo variable — alors
qu'on n'utilise **qu'une** chasse (118 %) et deux graisses.

**Gardé :** instanciation avec `fontTools.varLib.instancer` (chasse figée à 118,
graisse réduite à 600–800) puis sous-ensemble au jeu français. L'Archivo tombe
à 15,7 Ko, soit 82 % de moins. Les woff2 vont dans `public/fonts/`, avec des
`@font-face` écrits à la main : c'est la seule façon d'avoir une URL stable
pour le `<link rel="preload">` du hero.

**Découvert au passage :** `→ ★ ▸ ▣ ▢` ne sont dans **aucune** des trois
polices. Ce n'est pas le sous-ensemble qui les a perdus, ils n'y étaient pas.
Les flèches, étoiles et cases à cocher sont donc forcément des SVG inline —
ce que le brief demandait déjà, mais la contrainte l'a rendu obligatoire plutôt
que discutable.

### `@fontsource/archivo-expanded` n'existe pas

Le paquet est absent du registre. Mais `@fontsource-variable/archivo` livre
`font-weight: 100 900` **et** `font-stretch: 62% 125%` dans un seul woff2
latin. L'« Expanded » du brief est donc une chasse, pas une famille.

### Le statut d'ouverture

**Jeté :** une première version qui formatait l'heure par
`'09:00'.replace(':', ' h ')` — sortait « 09 h », avec le zéro initial.
**Gardé :** un `heureEnTexte()` exporté, testé sur sept cas dont un changement
de fuseau (7h30 UTC = 9h30 Paris) et le passage de samedi soir à lundi matin.
Réutilisé dans le pied de page, où le même bug s'était glissé.

---

## Phase 3 · Étape 2 — socle et hero

### Le hero est en CSS, pas en GSAP — et c'était le bon choix deux fois

**Raisonnement :** la séquence d'arrivée doit tenir sous 900 ms. Impossible si
elle attend le téléchargement de 43 Ko de GSAP. Elle est donc en CSS pur
(masques par ligne, `translateY(110%) → 0`, cascade à 0/80/160 ms, total 820 ms).

**Conséquence mesurée :** GSAP et ScrollTrigger ne partent qu'au moment où une
zone révélable approche du viewport. Vérifié dans le navigateur — pas déduit :
**GSAP n'est pas téléchargé avant le premier scroll.**

Au chargement de l'accueil : **129,9 Ko** au total (budget 600), dont 25,4 Ko
de JavaScript. Le CSS est à 7,2 Ko gzip (budget 25).

### Trois échecs de la grille de critique, corrigés

**1. Débordement horizontal à 390 px.** Deux causes cumulées :
- `-mx-1` sur un élément en `w-full` : 8 px de trop, systématiquement.
- Surtout : `class="hidden … lg:inline-flex"` passé en prop à `BoutonAppel`,
  dont la classe de base contient déjà `inline-flex`. **L'ordre dans l'attribut
  ne décide de rien** — c'est l'ordre dans la feuille de style qui tranche, et
  `inline-flex` gagnait. Le bouton d'appel de l'en-tête s'affichait donc en
  mobile et poussait la page de 23 px.
  **Correction :** le masquage passe par un conteneur (`<div class="hidden
  lg:block">`), jamais par une classe qui entre en collision avec le `display`
  du composant. C'est la séparation boîte externe / rendu interne.

**2. Deux rouges à l'écran** en 390 et 768. Le CTA du hero et le bouton
« Appeler » de la barre d'urgence.
**Arbitrage :** en mobile, c'est la barre qui garde le rouge — appeler est
l'intention n°1 d'un automobiliste en panne. Le CTA du hero passe en
`--cambouis` et ne redevient rouge qu'en desktop, où la barre disparaît.
Effet secondaire heureux : la hiérarchie devient plus nette sur téléphone.

**3. Mon propre contrôle était trop faible.** Il ne comptait que les
`background-color` rouges. L'étoile de notation, en `color`, passait au travers.
Contrôle durci aux couleurs de texte et de remplissage sur les éléments
feuilles — et l'étoile est passée en `--bleu-port` : une note n'est pas une
action, elle n'a pas droit à l'accent.

### Deux défauts vus à l'œil, invisibles aux mesures

- **« Épinay-sur-Seine.20 ans »** — Astro absorbe le saut de ligne entre deux
  expressions. Corrigé par un littéral de gabarit unique.
- **Le titre cassait en 5 lignes ragged à 1440 px** alors que les masques sont
  posés par phrase : la séquence d'arrivée révélait donc des fragments
  arbitraires. Descendu d'un cran (`--text-4xl`, 72 px en desktop) : **3 lignes
  pleines à 1440**, une phrase par masque. En 390 et 768 les phrases se
  replient sur 2 lignes, ce qui reste cohérent puisque le bloc entier monte
  d'un seul tenant.

### Ce que je surveille pour la suite

- Le mécanisme de révélation au scroll n'a pas encore pu être vérifié : il n'y
  a aucun `[data-revele]` sur la page tant que les sections suivantes ne sont
  pas construites. À tester dès la première.
- Le budget JS remontera quand GSAP se chargera vraiment : 51,1 Ko gzip au
  total si le visiteur scrolle. Sous les 60 Ko, mais sans marge confortable.
  Si une section future réclame davantage de JavaScript, c'est GSAP qu'il
  faudra remettre en question — le vocabulaire de mouvement du brief (une
  seule révélation, 16 px et une opacité) tient en une trentaine de lignes de
  CSS.

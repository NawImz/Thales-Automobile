# NOTES — journal d'itération

Ce que j'ai essayé, gardé, jeté. Le plus récent en bas.

---

## Reconstruction — Phase 0 et 1

Le site précédent est rejeté. On repart de zéro sur brief complet.
Le code de l'ancienne version reste en place tant que le feu vert n'est pas donné :
il ne sera démonté qu'au premier pas de la Phase 3, pour que le retour arrière
reste possible en un `git checkout`.

### Ce que la reconnaissance a donné

- **`/public/brand/` n'existe pas.** Le logo n'est nulle part sur le disque :
  `/mnt/attach` est vide, `uploads/` ne contient que les trois GLB de la session
  précédente. Les images du message sont visibles mais ne sont pas des fichiers.
  → Seul point réellement bloquant. Tout le reste du plan a été fait sans.
- **L'egress web est bloqué** (`docs.astro.build` → `EGRESS_BLOCKED`). Le proxy
  n'autorise que les registres de paquets. Aucun MCP de documentation n'y
  changerait rien : il passerait par le même proxy.
  → Substitution : lire les `.d.ts` du paquet installé. Plus fiable que la doc en
  ligne, puisque c'est la version qu'on livre.

### Ce que la vérification d'API a corrigé par rapport à l'ancien projet

- La config des collections va dans **`src/content.config.ts`** et non
  `src/content/config.ts` — l'ancien projet utilisait l'emplacement hérité.
- `astro/loaders` n'exporte que `glob` et `file`.
- `scrub?: boolean | number` : `scrub: 1` est bien distinct de `true`.
- **Aucun plugin GSAP Club** dans le projet : MorphSVG n'est pas disponible.
  Conséquence directe sur la ligne signature — voir `DESIGN-PLAN.md` §5.

### La palette, en deux temps

Premier jet avec un turquoise de travail à `#17A2A2` : **4 paires sur 9 en
échec**. En cherchant la profondeur qui les sauve, un fait dur est apparu :

> Il faut ≥ `#0E7C7C` pour porter du texte blanc en AA, et ≤ `#128F8F` pour
> porter du texte encre. **Les deux plages ne se croisent pas.**

Donc aucun turquoise unique ne peut servir aux deux traitements de bouton. Retenu :
`#0E7C7C`, bouton plein à libellé blanc, jamais d'encre sur turquoise. Palette
converge à **9 paires, 0 échec**.

C'est le genre de contrainte qu'on ne voit pas à l'œil et qui aurait fait rater
l'audit d'accessibilité en fin de parcours, quand tout est déjà construit.

### Écarts assumés par rapport au brief

Trois, tous réversibles, tous soumis au client : Astro 7 plutôt que 5, palette à
6 tokens plutôt que 5 (conditionnellement), bouton blanc sur turquoise.

### Ce que la critique de Phase 2 a changé

Quatre corrections issues de la question « aurais-je écrit ça pour n'importe quel
garage ? » : compteurs limités aux entiers, trois raisons sans icônes, la ligne
signature devient l'aiguille du manomètre, hiérarchie à trois arrêts pour tenir
la lisibilité en dix secondes malgré sept blocs.

---

## Phase 3 · Étape 1 — socle, en-tête, hero

Feu vert reçu : Astro 7, palette à 6. Ancien site démonté (tag
`avant-reconstruction` posé avant, le retour arrière tient en un `git checkout`).

**Dépendances ramenées au strict nécessaire** : `three`, `@types/three`,
`@gltf-transform/cli` et les trois anciennes polices sont retirés. Il reste
astro, tailwind, gsap, lenis, sitemap, trois polices, sharp. Rien d'autre.

**Une seule source de vérité pour les couleurs.** `design/palette.json` est lu à
la fois par `scripts/generer-tokens.mjs` (qui écrit `src/styles/tokens.css`) et
par `scripts/contraste.mjs`. Impossible que le CSS et le contrôle d'accessibilité
divergent — c'est le même fichier.

### Deux pièges payés

1. **`@utility` ne peut pas être imbriqué dans un `@media`.** J'avais écrit
   `@media { @utility section { … } }` pour la variante desktop : le build échoue
   sur « `@utility` cannot be nested ». C'est le média qui va **dans**
   l'utilitaire. Consigné dans le skill `api-verifiees`.

2. **Le turquoise apparaissait trois fois sur le premier écran mobile** :
   bouton du hero, barre d'action fixe, et le statut « Ouvert ». Le brief dit
   d'en retirer dès qu'il y en a deux — attrapé par la boucle de Phase 4, pas
   par relecture du code.

   Règle posée, et elle vaut pour tout le site : **la barre fixe porte l'accent
   sur mobile** (elle est toujours visible et porte la conversion n°1), donc le
   bouton principal du contenu reste au trait sous `lg` et ne prend l'accent
   qu'à partir de `lg`, là où la barre disparaît. D'où la variante
   `accent-desktop`. Et **un statut n'est jamais accentué** : c'est une
   information, pas une action.

   ⚠️ Cette variante vit dans l'objet `variantes` du composant, pas dans un
   override passé par `class` : l'ordre des classes dans l'attribut ne décide de
   rien, c'est l'ordre de la feuille de style. Piège déjà payé deux fois sur la
   version précédente.

### Vérifié

Build propre, 390 et 1440 contrôlés. Promesse et moyen d'appeler visibles sans
défiler aux deux largeurs. Une seule erreur console : le 404 de `favicon.ico`,
qui viendra du logo.

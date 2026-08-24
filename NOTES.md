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

---

## Phase 3 · Étape 2 — trois raisons, ce qu'on répare, compteurs

**Le compteur odomètre est fait, et il refuse les décimales.** Le composant
*lève une erreur au build* si on lui passe autre chose qu'un entier — un
odomètre compte des entiers, le voir s'arrêter sur « 4,6 » est un contresens
mécanique. La note Google s'affiche donc fixe, ailleurs. La contrainte est dans
le code, pas dans un commentaire qu'on oublie.

Position finale posée par défaut en CSS : sans JavaScript, ou en mouvement
réduit, le bon chiffre est déjà affiché. Le décalage de 90 ms d'une molette à
l'autre est ce qui fait « mécanique » plutôt que « chiffre qui change ».

**Les trois raisons n'ont aucune icône**, comme décidé en critique de Phase 2, et
la raison n°2 porte un vrai prix tiré du barème.

### Deux fautes attrapées par la boucle, pas par relecture

1. **`getCollection` trie par identifiant, pas par ordre du fichier.** Les
   prestations sortaient dans le désordre — la vidange, qui est la porte
   d'entrée du garage, se retrouvait en dernier. Corrigé par un champ `ordre`
   **obligatoire dans le schéma** : un oubli casse désormais le build au lieu de
   passer inaperçu à l'affichage.

2. **Six cibles tactiles sous 44 px** — liens de section, liens légaux du pied,
   téléphone du pied, mot-symbole. Un lien de texte fait ~22 px de haut, soit la
   moitié du minimum exigé.

   Corrigé par un utilitaire `cible` unique plutôt que six rustines. ⚠️ Il étend
   la zone cliquable par un **pseudo-élément**, pas par du padding : du padding
   aurait décalé tout le rythme vertical pour un problème qui n'est pas de mise
   en page.

   Vérifié après correction : **0 cible restante sous 44 px, 0 débordement**.

### Structure vérifiée à 390 px

Un seul `<h1>`, hiérarchie de titres sans saut de niveau (H1 › H2 › H3 › H2),
aucun débordement horizontal.

---

## Phase 3 · Étape 3 — le logo arrive, et il corrige le plan

Reçu par push direct sur la branche, après trois tentatives infructueuses par la
conversation. **Constat à retenir : une image collée dans un message n'atteint
jamais le disque du conteneur** ; un fichier joint, si. Les trois GLB de la
session précédente le prouvaient, ils étaient bien arrivés.

### L'échantillonnage a demandé une autre méthode

Le tri par fréquence — celui que le starter recommande — **n'a pas trouvé le
turquoise**. Le trait de la voiture est fin : il pèse ~3 % des pixels et se fait
écraser par le lettrage et par l'anticrénelage. Les huit clusters dominants
étaient tous des gris.

Il a fallu trier par **chromie** et prendre la moyenne des 30 pixels les plus
chromatiques — le cœur du trait, là où la couleur n'est pas mélangée au fond.

```
accent : #2A7687   (bleu-canard, pas le turquoise vif attendu)
encre  : #0E1015
```

### Le sixième token est mort de sa belle mort

J'avais fait valider une palette à 6 en écrivant que si l'accent réel passait les
seuils, on reviendrait à 5. **C'est ce qui est arrivé** : `#2A7687` donne 4,85 en
texte sur fond clair et 5,20 en libellé blanc. Le token de secours est supprimé.
Palette finale : **5 tokens, 9 paires, 0 échec** — conforme au brief d'origine.

### ⚠️ La vraie correction : le lettrage n'est pas un grotesque

Mon plan disait « grotesque géométrique » et retenait Familjen Grotesk. Je
reprenais la caractérisation du brief, que ma lecture d'une petite image
confirmait. **Le fichier montre un slab serif.**

Vérifié par calage plutôt que par intuition : le mot du logo rendu côte à côte
avec Roboto Slab, Bitter, Rokkitt et Familjen. L'absence totale d'empattement de
Familjen saute aux yeux. Retenu : **Roboto Slab**, dont la chasse et la graisse
collent le mieux au « AUTOMOBILE » large et lourd du logo.

Limite assumée : à 100 × 100 px le mot ne fait que ~84 × 36 px. Assez pour
trancher « slab, lourd, large », pas pour identifier la fonte exacte. Un
vectoriel est demandé en « important », pas en bloquant.

### `<Image>` n'accepte pas `formats`

Écrit `formats={['avif','webp']}` sur `<Image>` : ignoré en silence, seul du WebP
sortait. `formats` est une prop de **`<Picture>`**, pas de `<Image>`. Vérifié
dans `astro/components/Picture.astro:35`. Après bascule : 3 AVIF + 4 WebP
générés, `type="image/avif"` présent dans le HTML.

### Une incohérence que la photo révèle

La banderole de la devanture porte **09 86 36 04 01**. Le site affiche
**06 69 68 63 84**. Un visiteur qui voit les deux ne sait pas lequel appeler —
et c'est la conversion n°1. Passé en tête des points bloquants de
`TODO-CLIENT.md`.

---

## Phase 3 · Étape 4 — les quatre derniers blocs de l'accueil

Nautique, confiance, venir. L'accueil a ses sept blocs (l'estimateur reste à
faire, il vient ensuite).

**Une seule inversion chromatique sur tout le site**, dans le bloc nautique :
fond encre, texte clair. Elle marque le changement d'univers sans ajouter de
couleur. Le brief interdit les aplats décoratifs — une inversion n'est pas une
décoration, c'est une ponctuation, et elle ne vaut que si elle n'a lieu qu'une
fois.

**Pas de plan géographique.** Le brief interdit l'iframe Google Maps, et les
coordonnées GPS ne sont pas fournies : je ne dessine donc aucune géométrie de
rue, ce serait inventer. Le bandeau porte le repère réel — « portail bleu, à
côté de Michel Marine » — et ouvre l'itinéraire.

**Trois avis, pas quatre.** Le brief en demande quatre, je n'en ai que trois de
réels. Aucun quatrième n'est inventé ; la grille est dimensionnée pour trois et
s'étendra sans toucher au code.

### Trois fautes attrapées, dont une grave

1. **⚠️ GRAVE — les compteurs affichaient « 00 » sous le pli.** Je posais le
   zéro sur *tous* les compteurs au chargement, puis j'attendais l'observateur
   d'intersection. Conséquence : tout compteur pas encore atteint restait figé
   sur zéro. Une capture pleine page montrait « Nabil tient l'atelier depuis
   **00** ans » et « 4,6 sur **00** avis ».

   Pire que laid : si le script échoue entre les deux moments, le faux chiffre
   devient définitif. Un garage qui annonce zéro an d'ancienneté.

   Corrigé : **le zéro n'est posé qu'au moment d'animer**, et la cible est
   rétablie dans la foulée sur deux `requestAnimationFrame`. Aucune image
   n'affiche un chiffre faux. Vérifié : avant défilement, tous les compteurs
   sont sur la valeur rendue côté serveur ; après, sur leur cible.

   Leçon générale : **une animation ne doit jamais poser son état de départ
   avant d'être sûre de jouer.** L'état par défaut doit rester l'état vrai.

2. **Le tri par identifiant, encore.** Même piège que pour les prestations, à un
   endroit qui compte plus : Pierre F. — « client depuis 4 ou 5 ans », la preuve
   la plus forte du garage — passait derrière Brahh par ordre alphabétique
   d'identifiant. Champ `ordre` rendu obligatoire dans le schéma des avis.

3. **Deux turquoises dans « Venir »** — le lien d'itinéraire et le bouton
   téléphone. Règle posée et consignée dans le skill `accessibilite-aa` :
   **l'accent marque l'action principale de la section, une seule fois.** Ni un
   statut, ni une preuve, ni un fait remarquable. Vérifié section par section :
   hero 1, réparer 0, nautique 0, confiance 0, venir 1.

### Vérifié à 390 px

Aucun débordement, aucun débordement interne, aucune cible sous 44 px.

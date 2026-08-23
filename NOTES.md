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

---

## Phase 3 · Étape 3 — les deux sections stratégiques

### Trois affirmations, pas trois cartes

Appliqué la révision décidée en critique du plan : pas d'icône, pas de carte.
Trois phrases en Archivo, chacune suivie d'une ligne de preuve en mono
capitales. Le contenu vient des thèmes réels des avis, pas de mon clavier.

### La grille de tarifs, et deux bugs qu'elle a révélés

**1. Les lignes de prix s'arrêtaient au milieu de la page.** Le point de
conduite partait dans le vide et le prix flottait à mi-largeur. Cause : ma
règle globale `p, li { max-width: 68ch }`. La mesure de 68 caractères est une
règle de **prose** ; appliquée à tous les `li`, elle bride les grilles et les
listes de mise en page.
**Correction :** la mesure reste sur `p`, et sur les `li` uniquement dans un
contexte `.prose`. C'est le même genre de piège que la collision de classes de
l'étape 2 : une règle correcte, posée trop large.

**2. L'ondulation était invisible.** `--tole-ombre` sur `--tole` ne fait que
1,2:1 de contraste — les filets existaient dans le DOM mais ne se voyaient pas,
et le séparateur ressemblait à un blanc de mise en page. Passé à `--beton` à
55 % : la corrugation se lit enfin comme une corrugation.

### Le chargement paresseux, enfin vérifiable

Il n'y avait aucun `[data-revele]` sur la page jusqu'ici, donc rien ne
déclenchait l'import de GSAP. Avec ces deux sections, le mécanisme est
mesuré et confirmé :

- avant scroll : GSAP absent
- après scroll : GSAP (68 Ko) + ScrollTrigger (42 Ko) arrivent
- 11 éléments révélés, **0 visible-mais-transparent** en fin de course
- **sans JavaScript** : 0 élément invisible, 8 prix lisibles, téléphone présent

Chargement de l'accueil : 137,0 Ko (budget 600).

---

## Phase 3 · Étape 4 — avis réels, ambiance atelier, menu mobile

### Trois avis réels remplacent les emplacements

Reçus du client. Traités selon les règles du brief : aucun extrait ne dépasse
15 mots (13, 11 et 12), aucun avis inventé.

**Décision de rigueur :** le champ `note` reste `null` quand l'auteur n'annonce
pas de note dans son texte. Seul Brahh écrit explicitement donner une note
parfaite — lui seul affiche 5/5. Deviner les deux autres reviendrait à inventer
une donnée. Consigné dans `TODO-CLIENT.md`.

**Et l'argument que personne n'exploite devient réel :** Pierre F. écrit « ça va
faire 4 ou 5 ans que j'utilise leurs services ». Sa carte porte donc
« CLIENT DEPUIS 4 OU 5 ANS » — **ses mots, pas une année calculée à sa place**.
Les avis sont triés par ancienneté déclarée, et il passe en tête.

Noms réduits au prénom + initiale. Les avis Google sont publics, mais c'est à
Nabil de décider s'il préfère les noms complets.

### L'ambiance : l'atelier vu de l'intérieur

Demande client : plus « voiture / garage ». Le fond crème seul lisait trop
éditorial.

**Ce que je n'ai pas fait :** coller une photo de voiture. La vue catalogue
fournie est une image constructeur détourée sur fond blanc — elle n'a aucune
ambiance d'atelier, c'est l'inverse. L'ambiance vient du langage visuel.

**Ce que j'ai fait :** le hero et l'en-tête basculent sur `--cambouis` avec une
nervure de tôle en surface (`@utility tole-nervuree`, deux nervures par pas,
très basse amplitude). Les sections de contenu gardent le crème. La logique
tient au bâtiment : on regarde la façade crème depuis la rue, on entre, il fait
sombre. Contrastes revérifiés sur fond sombre — tole 14,31 · beton-clair 6,83 ·
blanc sur rouge 5,88.

Première version des nervures trop marquée, elle tirait vers le code-barres.
Descendue à 0,03 / 0,09 d'opacité et pas élargi à 30 px.

### Menu mobile en `<details>`

La nav qui défilait horizontalement était le point faible du responsive.
Remplacée par un `<details>`, donc **ouvrable sans JavaScript** et accessible
au clavier par construction. Burger dessiné en CSS (trois traits, pas d'icône
importée) qui se transforme en croix. Cibles de 52 px.

### Deux bugs, dont un récidiviste

**1. Le piège de collision de classes est revenu.** Le badge de statut devait
disparaître sous 640 px : il s'affichait. Son `hidden` reperdait contre le
`inline-flex` de la classe de base du composant — exactement le bug corrigé à
l'étape 2 sur `BoutonAppel`.
**Correction à la racine, cette fois :** plus aucun composant ne pose son
`display` dans sa classe de base. C'est le conteneur qui le porte. Un correctif
au cas par cas ne suffisait pas, le piège revenait à chaque nouveau composant.

**2. Le panneau de menu était peint sous le hero.** Il existait bel et bien
(390 × 452 px, sept liens, `visibility: visible`) mais restait invisible.
L'en-tête et la section suivante créaient chacun leur contexte d'empilement, et
à z-index égal c'est l'ordre du DOM qui gagne. `z-40` sur l'en-tête, et le
panneau ancré en `top: 100%` au lieu de sa position statique.
Diagnostiqué en mesurant le rectangle et les styles calculés, pas en tâtonnant
sur des valeurs de z-index.

### La photo de Clio n'a pas pu être récupérée

Elle a été collée dans la conversation, pas déposée en fichier : je la vois mais
je ne peux pas l'extraire sur le disque. À déposer dans le dépôt pour être
utilisée. Elle irait dans la future section « véhicules d'occasion » — une Clio
est justement la « citadine » du barème — et non en ambiance.

---

## Phase 3 · Étape 5 — l'élément signature et le pôle nautique

Retour client : le site est trop classique, les animations banales. Il demande
des animations « comme on n'a jamais vu », des voitures détourées qui roulent,
des outils qui flottent.

### Ce que je n'ai pas fait, et pourquoi

Des PNG de voitures qui traversent l'écran. C'est exactement ce que fait un
template, et sur un site dont l'argument central est l'honnêteté, du clipart
décoratif dessert le propos. Les images fournies ne sont de toute façon pas
récupérables : collées dans la conversation, pas déposées en fichier.

### Le trait continu

Un seul trait qui dessine un profil de voiture, puis **se transforme en coque
de bateau** au scroll. C'est le métier en un geste — auto ET nautique — et
c'est la charnière qui introduit le pôle nautique.

**Technique :** deux tracés SVG à structure de commandes rigoureusement
identique (M + 10 × C, 62 nombres chacun), interpolés coordonnée par
coordonnée. Un contrôle automatique vérifie l'égalité des structures : sans
elle le morph est impossible.

**Sans GSAP.** Le scrub est un rAF maison de quarante lignes. GSAP aurait coûté
43 Ko gzip pour interpoler soixante-deux nombres. Résultat mesuré : le budget
JS ne bouge pas d'un octet — 51,1 Ko avant comme après.

**Trois itérations avant que ça ressemble à quelque chose.** Les coordonnées de
Bézier écrites à la main ne pardonnent pas : je les ai rendues en PNG à chaque
passe plutôt que de les imaginer.
1. Premier jet : la voiture passait, le bateau lisait « semelle de chaussure ».
   Pas de tableau arrière, ligne de fond interrompue.
2. Deuxième : le bateau devenait lisible mais la voiture avait un **bec** —
   le soubassement rejoignait le museau sous un angle rasant.
3. Troisième : premier point de contrôle placé à la verticale sous la fin du
   segment précédent, la courbe repart droit vers le bas et donne un angle de
   pare-chocs arrondi. Et franc-bord relevé sur la coque, qui lisait « canoë ».

Réglage de rythme : le scrub courait sur 2,2 écrans, ramené à 1,5. Une
animation ne doit pas retenir le visiteur en otage.

### Trois bugs de débordement en cascade, tous à 390 px

Le contrôle disait « débordement » sans dire où. Diagnostiqué en remontant la
chaîne des ancêtres, jamais en tâtonnant.

**1. Les icônes se faisaient écraser à 0.** En contexte flex, un `<svg>` sans
largeur intrinsèque peut être réduit à zéro pendant que son tracé continue de
peindre à sa géométrie d'origine — et déborde. Corrigé dans le composant
`Icone` : `shrink-0` est désormais dans sa base. Une icône ne rétrécit jamais.

**2. Un `<details>` FERMÉ reçoit une containment de layout du navigateur.**
Il devient alors le bloc conteneur de tout descendant en position absolue : le
panneau de menu se retrouvait large de 44 px — la taille du burger — avec son
contenu débordant hors de l'écran. Rien de visible, onze pixels de
`scrollWidth` en trop. Corrigé en retirant le panneau du flux à la fermeture,
plutôt qu'en bricolant le positionnement.

**3. `shrink-0` sur le libellé ET sur le prix** d'une ligne de conduite : rien
ne pouvait céder. Seul le prix doit être insécable. Le même piège dormait dans
la grille de tarifs principale, corrigé aussi.

### Le pôle nautique

La seule inversion chromatique de la page, sur `--bleu-port`, bord à bord.
Contrainte respectée : le rouge est à 2,04:1 sur ce fond, l'action principale
est donc un bouton **plein** à libellé blanc (5,88:1), jamais du texte rouge.

---

## Phase 3 · Étape 6 — refonte en quatre actes

Retour client : « le site n'a pas changé, trop basique, trop le fouillis, fais
le moins de parties possible ».

Il a raison, et le diagnostic est précis : **j'empilais des bandes**. Sept
blocs pleine largeur qui se suivaient tous de la même façon — titre, contenu,
séparateur, titre, contenu. Ce n'est pas le contenu qui était en trop, c'est la
structure qui était plate.

### De sept bandes à quatre actes

| Avant | Après |
|---|---|
| Hero · Trois affirmations · Ondulation · Grille de tarifs · Trait · Pôle nautique · Ondulation · Avis | **1.** L'arrivée · **2.** Les deux métiers · **3.** Les prix · **4.** La confiance |

Chaque acte répond à **une** question du visiteur, et à une seule :

1. **L'arrivée** (cambouis) — la promesse et le téléphone.
2. **Les deux métiers** (cambouis → bleu-port) — le trait devient coque, et le
   nautique enchaîne sans respiration. C'était deux sections, c'est un geste.
3. **Les prix** (tôle) — le seul moment clair de la page. Le contraste fait
   l'événement : on allume la lumière au-dessus de la facture.
4. **La confiance** (cambouis) — avis, accès, horaires et appel d'un souffle.
   Trois blocs séparés auparavant, alors qu'ils répondent tous à la même
   question : « est-ce que je peux y aller ? »

**Supprimés :** `TroisAffirmations` (absorbée dans le hero, en trois lignes
sous la promesse — c'était un argument, pas un chapitre), `SectionAvis` et
`CarteAvis` (fondus dans l'acte 4), et les deux ondulations qui séparaient des
blocs qui n'avaient plus besoin d'être séparés.

### Deux fautes que je me suis faites à moi-même

**Sept rouges à l'écran.** Les trois coches du hero étaient en
`--rouge-yamaha`. Une coche n'est pas une action. Ramené à un rouge par écran —
et la mention d'ancienneté client de l'acte 4, elle aussi en rouge, est passée
en blanc : c'est une donnée, pas un bouton.

**Zéro rouge en desktop**, ensuite. En corrigeant j'avais retiré l'accent à
l'action principale : sur grand écran la barre d'urgence disparaît, c'est donc
le bouton d'appel du hero qui doit le porter. Exactement un rouge par écran, à
toutes les largeurs.

### Le pli, mesuré à trois hauteurs

À 1440 × 760 — un portable de 13 pouces — **le bouton d'appel tombait sous la
ligne de flottaison**. La promesse était visible, la conversion n°1 non. Une
media query sur la *hauteur* fait céder le titre : l'effet typographique passe
après le téléphone. Contrôlé à 900, 760 et 844 px de haut : promesse, appel et
preuve tiennent au-dessus du pli partout.

---

## Phase 3 · Étape 7 — la 3D temps réel

Le client précise ce qu'il entend par « site à 10 000 € » : trois références
Webflow/Spline. Elles parlent toutes la même langue — un objet 3D temps réel qui
tourne, une micro-typo monospace en HUD dans les coins, des repères en croix et
des filets verticaux, du display géant recouvert par l'objet.

### Le sujet : un disque de frein, pas une blob

La forme vient du métier. C'est la pièce que le garage change le plus, et son
vocabulaire — acier usiné, perçages, rainures radiales, stries concentriques —
porte l'ambiance mieux qu'une forme abstraite iridescente.

### Trois erreurs de rendu, dans l'ordre où je les ai payées

**1. Métal noir.** Un `MeshStandardMaterial` à `metalness: 0.92` **sans carte
d'environnement rend quasi noir** : un métal ne fait que réfléchir, s'il n'a
rien à réfléchir il reste éteint. Erreur three.js classique.

**2. Environnement procédural insuffisant.** J'ai fabriqué un environnement
d'atelier — dégradé vertical, néons au plafond, sol sombre — via `CanvasTexture`
+ `PMREMGenerator`, sans importer de fichier HDR. Mieux, mais toujours sombre.

**3. La carte de rugosité a tout aggravé.** Je l'avais dessinée en gris moyen,
or three **multiplie** `roughnessMap` par `material.roughness` : 0,3 × 0,42 a
donné un miroir parfait, qui ne reflétait que du noir. Base repassée en clair.

**Conclusion retenue :** sans vraie carte HDR, un métal pur est ingérable.
Passé en acier revêtu (`metalness: 0.55`, `roughness: 0.42`) où les lumières
directes shadent réellement la surface. Prévisible, et ça se lit enfin.

### Le budget, mesuré et arbitré

three.js pèse **180 Ko gzip**. C'est trois fois le poste « JS ≤ 60 Ko » du brief.

La parade : trois conditions cumulatives avant de le télécharger — grand écran,
mouvement non réduit, WebGL disponible — et un `IntersectionObserver` par-dessus.
Vérifié dans le navigateur, pas déduit :

| | three téléchargé | scène | repli |
|---|---|---|---|
| desktop 1440 | **oui** | active | masqué |
| mobile 390 | **non** | — | affiché |
| reduced-motion | **non** | — | affiché |

Poids réel, **compressé** (le serveur d'aperçu ne compresse pas, sa mesure de
876 Ko était trompeuse) :

- **mobile, page entière parcourue : 128 Ko** — budget 600 respecté
- **desktop, page entière parcourue : 308 Ko** — budget 600 respecté

Le seul poste encore dépassé est « JS ≤ 60 Ko gzip » : 52 Ko en mobile (tenu),
232 Ko en desktop (dépassé). C'est le prix de la 3D, et il n'est payé que par
les visiteurs qui la voient.

### Le pli, encore

Le titre passé en `text-5xl` a fait retomber le bouton d'appel sous la ligne de
flottaison à 1440 × 900. Ramené à `text-4xl`. Troisième fois que la taille du
display menace la conversion n°1 : c'est le compromis permanent de ce hero.

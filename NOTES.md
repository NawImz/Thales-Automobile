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

---

## Phase 3 · Étape 5 — estimateur, ligne signature, pages internes, artefact

La v1 est complète : six pages, l'estimateur, la ligne signature.

### L'estimateur

Entièrement côté client, aucune requête réseau, barème sérialisé dans la page.
Vérifié : 120 + 180 = 300 × 1,3 (SUV) = 390 → fourchette 310-470 €, et le
message WhatsApp part avec le récapitulatif encodé.

⚠️ Le repli sans JavaScript est **dans le HTML dès le départ**, et c'est le
script qui le retire. L'inverse — l'injecter quand JS manque — ne marche jamais,
puisqu'il n'y a alors personne pour l'injecter. Vérifié dans le HTML livré : le
tableau des 12 prix et le numéro y sont.

### La ligne signature — ce que la mesure a imposé

Les cinq formes partagent la signature `M` + 12×`C`, **par construction** : chacune
est décrite par 12 points et convertie par le même code. La structure ne peut pas
diverger, elle n'a pas à être surveillée.

Trois corrections, toutes venues d'un rendu, jamais d'une intuition :

1. **La voiture se lisait comme un nuage.** La tension classique de
   Catmull-Rom (6) arrondit tout. Portée à 11, et le profil redessiné avec une
   vraie « serre » (capot bas, montant incliné, pavillon court), elle se lit.
2. **Le disque devenait alors un hexagone** — un écrou, pas un disque de frein.
   Une tension unique ne peut pas servir les deux extrêmes.
   → **La tension est propre à chaque forme**, et interpolée avec les points
   pendant le morph. La signature de commandes reste identique.
3. **L'emblème mordait de 8 px sur le contenu.** Le seuil de bascule vers la
   gouttière avait été choisi au jugé (88rem). Il se calcule : contenu 80rem +
   2 × (96px d'emblème + 16px de marge) = **96rem**. Écart vérifié après
   correction : 16 px exactement.

### L'artefact

⚠️ **Le HTML des pages contient des `</script>`** — Astro y inline les petits
scripts. Une chaîne JSON qui les embarque referme le script du routeur au
milieu : 187 erreurs console, aucune parlante. Échapper `</` en `<\/` suffit.

⚠️ **Republier depuis le même chemin de fichier redéploie sur la MÊME URL.**
L'artefact est reparti sur celle du site rejeté. Pour en créer un nouveau, il
faut un chemin différent.

`inlineStylesheets: 'never'` dans la config supprime par ailleurs, **par
configuration**, le piège des styles cachés dans le `<head>` qui avait coûté
le bug « ON VOUS DITCE » sur la version précédente.

### Contrôles finaux

| Contrôle | Résultat |
|---|---|
| JSON-LD parsé depuis la page rendue | `AutoRepair`, 11 champs, 6 horaires, 9 zones |
| `aggregateRating` | **absent** — correct, Google l'interdit sur des avis non collectés |
| `geo` inventé | absent — les GPS ne sont pas fournis |
| `null`/`undefined` sérialisés | aucun |
| Liens `tel:` | 6, tous au format `tel:+33XXXXXXXXX` |
| `<h1>` par page | 1 |
| Images sans `alt` | 0 |
| Liens sans intitulé accessible | 0 |
| Cibles tactiles < 44 px | 0 |
| Débordement horizontal à 390 px | aucun |
| Turquoise par section | 1 au maximum |
| JS initial (gzip) | **1,6 Ko** + 44 Ko de GSAP à la demande — plafond 60 |
| CSS (gzip) | **14,6 Ko** — plafond 25 |
| Poids initial de l'accueil | **151 Ko** — plafond 600 |

⚠️ Lighthouse et les FPS **ne sont pas mesurables ici** (SwiftShader, pas de GPU).
Ils restent à relever sur une vraie machine avant de figurer au README.

---

## Retour client — lenteur, prix, décor animé

### 1. « Ça rame » — la cause, mesurée

L'emblème signature recalculait et réécrivait son chemin **à chaque image de
défilement**. Le calcul lui-même ne coûtait que **9,7 µs** — ce n'était pas lui.
Le coût était `setAttribute('d')` : le navigateur reparse le tracé et repeint
une couche `position: fixed` soixante fois par seconde.

**Corrigé** : 90 états sont précalculés une seule fois au chargement (8,6 ms), et
le défilement ne réécrit que lorsque l'indice change vraiment.
Mesuré sur un défilement complet : **180 écritures DOM** (3 pièces × 60 paliers)
là où l'ancienne approche en faisait une par pièce et par image.

Ajouts : `will-change: transform` et `translateZ(0)` sur l'emblème pour lui
donner sa propre couche, `contain: strict` sur le décor.

**Leçon** : quand une animation rame, profiler le calcul ne suffit pas. Ici le
JavaScript était 60 fois moins cher que l'écriture DOM qu'il provoquait.

### 2. Tous les prix retirés

Le client n'en a communiqué aucun. Tout montant a donc disparu :

- `prixDepart` retiré des services, et **interdit dans le schéma**
  (`z.never().optional()`) : toute réintroduction casse le build.
- Le barème devient une simple liste d'interventions, sans prix ni coefficient.
- **L'estimateur devient un préparateur de devis.** Même mécanique de conversion
  — on coche, on envoie par WhatsApp — mais ce qui part est une DEMANDE, pas une
  estimation. Le manomètre est remplacé par un « bon d'atelier » qui se remplit.
- `/tarifs` supprimée, la nav pointe vers le devis.
- La raison n°2 était « les prix sont affichés » : remplacée par **« on vous
  montre la pièce »** — une preuve tout aussi vérifiable, qui n'engage aucun
  montant.

Audit du rendu : **0 symbole €**. Deux occurrences du mot restent, assumées :
le bandeau de l'aperçu (« aucun prix n'est affiché ») et **l'avis de Pierre F.**,
qui écrit « ni par leurs connaissances ni par leurs tarifs ». Ce sont ses mots,
il ne publie aucun montant, et retoucher un avis réel serait une falsification.
Consigné dans `avis.json`, à supprimer sur demande explicite seulement.

### 3. Le décor animé

Route qui serpente dans la gouttière droite, trois voitures qui la descendent,
outils qui flottent à gauche, garagiste qui traverse la marge.

**Tout est en `transform` et `opacity`, exclusivement** — les deux seules
propriétés composées par le GPU sans repasser par la mise en page. Aucune ligne
de JavaScript. Vu la plainte sur la lenteur, c'était non négociable.

⚠️ **Deux fautes attrapées à la mesure**, pas à l'œil :
- première version, une voiture traversait le titre : je balayais `-92vw`. Le
  décor ne doit jamais croiser le texte. Les voitures **descendent la route**
  au lieu de traverser l'écran ;
- même après correction, une voiture mordait encore de **24 px**. Le corridor
  se calcule : gouttière = (100vw − 80rem)/2, et une voiture de 44 px avec son
  balancement en demande 80, soit une fenêtre d'au moins **90rem**. En dessous,
  les voitures sont masquées.

Vérifié sur un cycle complet de 48 échantillons : **0 collision, 0 px
d'empiétement**.

### 4. L'emblème redessiné

Un contour unique ne pouvait pas porter de roues — et une voiture sans roues ne
se lit pas. Chaque forme compte désormais **3 pièces de 12 points** :
- voiture : carrosserie + deux roues ;
- disque de frein : trois cercles concentriques ;
- **bateau à moteur** : coque + cabine + hors-bord à l'arrière ;
- hélice : trois pales + moyeu.

La structure reste identique par construction, donc morphable sans plugin payant.

---

## Fluidité, deuxième passe — GSAP retiré

Le client signale toujours que « ça rame ». Ma première correction avait traité
le symptôme le plus visible (la réécriture du chemin à chaque image) mais laissé
la cause de fond en place.

**GSAP + ScrollTrigger pesaient 44 Ko gzip, téléchargés et exécutés à chaque
visite, pour une seule chose : lire une progression entre 0 et 1.**

Et surtout : **le ticker de GSAP ne s'arrête jamais.** Page immobile, onglet au
repos, il continue de tourner et ScrollTrigger relit la géométrie du document.
C'est du travail permanent pour un site qui, la plupart du temps, ne bouge pas.

**Remplacé par** un écouteur de défilement passif et une boucle
`requestAnimationFrame` qui **s'éteint d'elle-même** dès que l'inertie est
retombée. L'inertie du `scrub: 1` est reproduite par un lissage exponentiel de
trois lignes. La hauteur du document est mise en cache et relue seulement au
redimensionnement — la relire à chaque événement de défilement force un
recalcul de mise en page, exactement le coût qu'on cherchait à supprimer.

### Mesuré, avant/après

| | Avant | Après |
|---|---|---|
| JavaScript externe | 44 Ko gzip (gsap + ScrollTrigger) | **0 — aucun fichier** |
| Écritures DOM, défilement complet | une par pièce et par image | **156** |
| Travail JS page immobile | ticker GSAP en continu | **0 écriture en 2 s** |
| Dépendances du projet | 9 | **7** (`gsap` et `lenis` désinstallés) |

`lenis` n'avait en réalité jamais été utilisé — il traînait dans le
`package.json` depuis le socle.

Chaque élément animé du décor a par ailleurs reçu `will-change` et
`backface-visibility: hidden` : sans sa propre couche de composition, animer une
voiture forçait le compositeur à repeindre toute la couche fixe, route comprise.

### Une fausse alerte, pour mémoire

J'ai cru voir une régression en trouvant Roboto Slab en police d'affichage alors
que le plan initial annonçait Familjen Grotesk. Vérification faite dans
`DESIGN-PLAN.md` §4 : c'est une **correction documentée**, prise après réception
du logo — le lettrage est un slab serif, pas un grotesque. Rien à réparer.
Le réflexe reste bon : vérifier avant de « corriger ».

---

## Retour client — hero saccadé, épuration, étoiles

### La cause de la saccade du hero

Deux fautes cumulées, toutes deux dans l'entrée :

1. **`clip-path` n'est pas composé par le GPU.** Le « rideau d'atelier »
   l'animait, ce qui forçait le navigateur à **repeindre tout le hero — photo
   de 126 Ko comprise — à chaque palier**. C'était la cause principale.
2. **`steps()` produit un mouvement haché par construction.** C'était l'idée du
   « cliquet », mais à l'arrivée sur la page ça ne se lit pas comme une
   intention : ça se lit comme un bug. Le client l'a signalé trois fois.

**Refait en `transform` et `opacity` uniquement**, en courbe lisse
(`cubic-bezier(.22,.61,.36,1)`), avec `will-change` posé le temps de l'entrée.
Ce sont les deux seules propriétés que le navigateur anime sans repeindre.

⚠️ Leçon : le cliquet reste valable au survol, où l'utilisateur provoque le
mouvement et le lit comme une texture. **À l'arrivée sur une page, il n'a rien
provoqué : tout hachage est interprété comme une panne.**

### Épuration demandée

Retirés : durées de réparation (champ interdit dans le schéma, comme les prix),
bloc « Préparez votre passage », page mentions légales, bandeau du repère,
outils flottants.

⚠️ **Les mentions légales sont retirées à la demande du client. Elles restent
juridiquement obligatoires avant une mise en ligne** — c'est consigné en tête de
`TODO-CLIENT.md`, ce n'est pas un oubli.

### Les fonds blancs qui masquaient la route

La grille en filets reposait sur `gap-px` + fond plein : le trait n'était que le
fond du parent vu à travers un écart d'un pixel. Les cellules **devaient** donc
être opaques — et c'est exactement ce qui recouvrait le décor d'aplats blancs.

Remplacé par un utilitaire `grille-trait` à vraies bordures. Le trait est
identique, les cellules ne peignent plus rien, la route passe derrière.

### Deux routes, cinq voitures

Les outils sont remplacés par une seconde route, à gauche, qui serpente en sens
inverse. Cinq voitures désormais, réparties sur les deux gouttières.

### Étoiles or et compteurs progressifs

⚠️ **Arbitrage de contraste.** Mesuré : l'or vif `#F5A800` ne fait que **1,87:1**
sur le fond clair. Un or assez foncé pour passer seul (`#B87A0A`, 3,36:1) n'est
plus jaune.

Résolu par le statut : la note « 4,6 » et le nombre d'avis sont **toujours
écrits en toutes lettres à côté**, donc les étoiles ne portent aucune
information exclusive — elles sont décoratives, et le critère 1.4.11 ne
s'applique pas. Leur lisibilité vient d'un **contour** `#B87A0A`, qui lui passe
le seuil. Les deux tokens sont dans la palette, la vérification passe 10 paires
sur 10.

La cinquième étoile se remplit à 60 % pour représenter 4,6 — dégradé à deux
arrêts, pas une demi-étoile approximative.

Les molettes d'odomètre sont remplacées par une **montée progressive depuis 0**,
en `requestAnimationFrame` avec sortie en douceur. ⚠️ Même précaution que
précédemment : **le zéro n'est posé qu'au moment d'animer**, la valeur rendue
par le serveur reste affichée tant que le compteur n'est pas atteint.

### Un bug d'espace, de la même famille que « DITCE »

Astro minifie l'espace entre un mot et un composant placé à la ligne suivante :
« depuis\n<Compteur/> » sortait **« depuis20 ans »**. Corrigé par des entités
insécables explicites — qui sont de toute façon la bonne typographie française
devant un nombre.

---

## Retour client — logo, routes libres, épuration du décor

### Le logo entre, le mot composé sort

Le fichier a été analysé avant découpage : profil de densité d'encre ligne par
ligne. **Creux vide mesuré à y = 54** — le pictogramme occupe y 10-53, le mot
commence à y 58. Le favicon est donc borné à cette mesure, pas à un pourcentage
choisi au jugé. Premier essai à `top: 6, height: 50` : le haut de « THALES »
apparaissait encore. Corrigé à `left 13, top 5, 60 × 50`, puis carré **par ajout
de transparent** — élargir le découpage aurait forcément ramené le texte.

⚠️ **Le logo est livré sur fond BLANC, pas transparent.** Posé sur le crème de
l'atelier (#F7F7F5) il dessinait un carré clair nettement visible. Détouré par
seuil (blanc franc > 242 uniquement, pour ne toucher ni au turquoise ni au
noir) : **74 % des pixels rendus transparents**.

⚠️ **Taille en en-tête.** Le logo est carré avec deux lignes de texte occupant
42 % de sa hauteur : à 44 px, le mot tombait sous 10 px et devenait illisible.
Porté à 56 px, 64 sur grand écran. Un logo qu'on ne peut pas lire n'est plus un
logo.

Sur le pied de page, sombre, un `invert` seul virait le turquoise au rouge. La
chaîne `grayscale → invert → brightness` préserve la lisibilité sans inventer
de couleur.

### Les routes ne sont plus un miroir

Elles avaient les mêmes courbes inversées : l'œil repérait l'axe et la page se
lisait comme une grille. Elles diffèrent maintenant **de caractère**, pas
seulement de coordonnées — à droite de longues courbes amples, à gauche des
inflexions deux fois plus courtes — et surtout **elles sont décalées d'un tiers
d'écran en hauteur** (34vh contre −6vh). À quelques pour cent près, l'œil
apparie encore ; il faut un décalage franc.

### Les voitures passent rarement

Le passage dure ~14 % du cycle, et les cycles font 61, 67, 71, 79 et 89
secondes. **Durées premières entre elles**, pour que les passages ne se
resynchronisent pas : deux voitures côte à côte au même instant, ça se remarque
immédiatement et ça trahit la boucle.

### Retirés

Le bandeau d'aperçu (le tampon de build passe en commentaire HTML, invisible
mais toujours lisible dans le source) et l'emblème voiture→bateau, avec tout
son système de formes morphables.

---

## Retour client — épuration et voiture seule sur l'onglet

Retirés : le badge « Ouvert le samedi » du hero, le garagiste qui marche, la
page confidentialité et son lien.

⚠️ Deux occurrences de « samedi » subsistent volontairement : la ligne de
l'horaire réel dans le tableau, et la description SEO « ouvert du lundi au
samedi ». Le client visait le badge, pas le fait d'ouvrir le samedi — le
supprimer partout aurait caché une information commerciale utile.

### La voiture seule pour l'onglet

Le favicon portait la voiture ET la clé. Pour n'isoler que la voiture, j'ai
détecté les pixels turquoise (bleu et vert nettement au-dessus du rouge) : la
carrosserie occupe **x 28-69, y 22-47**, alors que la clé, neutre et sombre,
est entièrement à gauche de x=28.

Le découpage se borne donc sur cette mesure, en descendant sous y=47 pour
garder les roues, qui sont sombres et n'apparaissent pas dans la boîte
turquoise. Le manche de la clé mordait encore dans le coin haut-gauche : effacé
sur un triangle de 10 × 10 px, zone où la voiture n'a aucun pixel — vérifié sur
le rendu avant d'effacer quoi que ce soit.

### PROMPTS-IMAGES.md

Prompts fournis pour les deux emplacements vides, avec les réglages communs
(désaturé, lumière naturelle, aspect reportage) qui évitent qu'une image
générée jure avec un site aussi blanc.

⚠️ **Un avertissement inscrit dans le document** : l'emplacement « Nabil au
travail » ne doit pas recevoir un visage généré. Présenter un inconnu
synthétique comme le gérant à des clients qui viendront le rencontrer se
retourne mal. Deux options honnêtes proposées — un cadrage sur les mains, sans
visage, ou une vraie photo prise au téléphone. Si le cadrage mains est retenu,
l'emplacement sera renommé pour que le site ne prétende rien.

---

## Retour client — apparitions au défilement

Cadre « Nabil au travail » retiré.

### Les apparitions, sans rien qui rame

Ce site a saccadé trois fois de suite, toujours pour la même raison : du
travail exécuté à chaque image de défilement. Les apparitions sont donc bâties
pour n'en produire **aucun**.

Un IntersectionObserver pose un attribut **une seule fois**, puis
`unobserve()` décroche l'élément. Le CSS fait le reste en `transform` et
`opacity`. Après le premier passage, plus rien ne tourne.

Mesuré : **0 mutation du DOM en 2,5 s page immobile**, 0 script externe,
22 éléments apparus, aucun resté invisible.

### Le garde-fou qui compte

⚠️ L'état masqué n'est appliqué **que si le script a démarré** —
`html[data-anime]`, posé par le script lui-même. Vérifié dans le CSS compilé :
l'unique règle qui pose `opacity: 0` sur `[data-apparition]` est bien préfixée.

Sans JavaScript, ou si le script échoue, **rien n'est jamais caché**. C'est la
leçon des compteurs figés à « 00 », appliquée d'avance cette fois : une
animation ne doit jamais poser son état de départ avant d'être certaine de
pouvoir jouer.

Le tout vit sous `prefers-reduced-motion: no-preference` : en mouvement réduit,
la règle n'existe pas du tout.

### Un défaut de mise en page attrapé au passage

L'encadré de la note Google se disloquait à 390 px — étoiles en `text-2xl` et
ligne « 4,6 sur 61 avis » côte à côte, le lien passant à la ligne mot par mot.
Passé en colonne sous `sm`, étoiles réduites. Vérifié : aucun débordement.

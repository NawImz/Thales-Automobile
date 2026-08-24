# DESIGN-PLAN — Thalès Automobile

Phase 1 (le plan) et Phase 2 (sa critique). Rien n'est codé avant votre feu vert.

---

## 1. Le brief ramené à une seule décision

Une phrase gouverne tout : **on vous dit ce qu'il faut réparer, et ce qu'il ne
faut pas.** Ce n'est pas un slogan que j'invente, c'est le thème n°1 des avis.

La conséquence est plus radicale qu'il n'y paraît : **la preuve de cette phrase,
c'est la grille de prix.** Un garage qui publie ses tarifs se rend vérifiable.
Aucun concurrent du 93 ne le fait. Donc :

> Le site n'est pas une vitrine avec une page tarifs. C'est **une grille de prix
> avec ce qu'il faut autour pour qu'on appelle.**

Cela réordonne les priorités : le bloc « combien ça va vous coûter » n'est pas le
quatrième bloc, c'est **le produit**. Le hero existe pour y mener, les avis pour
le crédibiliser, le nautique pour élargir. Je construirai dans cet ordre.

---

## 2. Analyse du logo

### ✅ Logo reçu et échantillonné le 24/08/2026

Fichier : `public/brand/logo.webp`, **100 × 100 px**, WebP sans couche alpha.
Arrivé par un push direct sur la branche — les images collées dans la
conversation n'atteignent jamais le disque du conteneur.

Les hex ci-dessous sont **mesurés**, pas estimés.

### Ce que j'observe, et qui ne dépend pas d'une pipette

| Trait | Observation |
|---|---|
| Nature du dessin | dessin **au trait**, contour ouvert, épaisseur constante |
| Sujet | profil de voiture simplifié + clé plate et tournevis croisés |
| Terminaisons | arrondies, jonctions douces — pas d'angles vifs |
| Aplats | **aucun** : le mark est entièrement en contour |
| Chromie | deux valeurs seulement — un turquoise pour le mark, un noir pour le mot |
| Lettrage | `THALES AUTOMOBILE`, capitales, deux lignes, grotesque géométrique, graisse haute, chasse serrée, interlettrage resserré |
| Composition | mark au-dessus, mot en dessous, axe centré, ensemble presque carré |

**La conclusion de cette analyse ne dépend d'aucun hex** : l'identité de ce logo,
c'est **une ligne d'épaisseur constante**. Tout le vocabulaire du site en découle,
et c'est déjà décidable aujourd'hui.

### Comment l'accent a été mesuré

Le tri par fréquence n'a **pas** trouvé le turquoise : le trait de la voiture est
fin, il pèse à peine 3 % des pixels et se fait écraser par le lettrage et par
l'anticrénelage. Il a fallu trier par **chromie** plutôt que par fréquence.

L'accent est la moyenne des **30 pixels les plus chromatiques** — le cœur du
trait, là où la couleur n'est pas mélangée au blanc du fond. L'encre est la
moyenne des 200 pixels les plus sombres et peu chromatiques, soit le lettrage.

| | Valeur mesurée |
|---|---|
| Accent (trait de la voiture) | **`#2A7687`** — un bleu-canard, pas le turquoise vif attendu |
| Encre (lettrage et clé) | **`#0E1015`** — un noir très légèrement froid |

⚠️ **Le fichier ne fait que 100 × 100 px.** C'est suffisant pour la couleur, qui
est un fait par pixel. Ce n'est pas suffisant pour juger le détail des
empattements — voir §4.

---

## 3. Palette — 5 tokens, contrastes mesurés

`design/palette.json` est la source unique : `generer-tokens.mjs` en écrit le
CSS, `contraste.mjs` le vérifie. Il porte désormais `"_echantillonne": true`.

| Token | Valeur | Rôle |
|---|---|---|
| `--encre` | `#0E1015` | titres, corps, traits porteurs de sens |
| `--turquoise` | `#2A7687` | **l'unique accent** : action principale, liens |
| `--blanc-atelier` | `#F7F7F5` | le fond |
| `--gris-texte` | `#5A605E` | texte secondaire |
| `--gris-trait` | `#7E847F` | cadres et filets de composants |

### Le sixième token n'existe plus

J'avais proposé de scinder l'accent en deux — une teinte de marque et une teinte
conforme — en écrivant : « si l'échantillonnage montre que le turquoise du logo
passe déjà les seuils, les deux tokens fusionnent et on revient à cinq ».

**C'est exactement ce qui s'est passé.** L'accent réel `#2A7687` est nettement
plus profond que ma valeur de travail, et il passe seul :

| Usage | Ratio | Seuil |
|---|---|---|
| accent en texte sur fond clair | **4,85** | 4,5 ✓ |
| libellé blanc sur bouton accent | **5,20** | 4,5 ✓ |
| libellé encre sur bouton accent | 3,66 | 4,5 ✗ |

La dernière ligne échoue, mais on ne fait jamais d'encre sur accent : le bouton
principal est turquoise plein à libellé blanc, règle unique et sans exception.

**Palette finale : 5 tokens, 9 paires, 0 échec.** Conforme au brief d'origine.


---

## 4. Typographie

### ⚠️ Correction : le lettrage n'est pas un grotesque

Mon plan annonçait « grotesque géométrique » et retenait Familjen Grotesk. Je
reprenais la caractérisation du brief, confirmée par ma lecture d'une petite
image. **Le fichier montre autre chose : le lettrage est un slab serif** — des
empattements rectangulaires francs, un contraste marqué entre les fûts et les
barres.

Vérifié par calage : le mot du logo rendu côte à côte avec quatre candidats.
Familjen Grotesk n'a aucun empattement — l'écart saute aux yeux.

| Emploi | Police | Graisses |
|---|---|---|
| Affichage | **Roboto Slab Variable** | 700–800 |
| Corps | **Public Sans Variable** | 400–600 |
| Données, prix, horaires, compteurs | **JetBrains Mono Variable** | 400–700 |

**Roboto Slab** retenu après comparaison avec Bitter et Rokkitt : c'est celui
dont la chasse et la graisse correspondent le mieux au « AUTOMOBILE » du logo,
large et lourd. Rokkitt a des empattements plus fins mais une chasse trop
resserrée ; Bitter est intermédiaire.

⚠️ **Limite honnête de ce calage** : à 100 × 100 px, le mot du logo ne fait que
~84 × 36 px. C'est assez pour trancher « slab, lourd, large » — pas pour
identifier la fonte exacte. Un logo en vectoriel ou en haute définition
permettrait d'affiner. Consigné en « important » dans `TODO-CLIENT.md`, pas en
bloquant : Roboto Slab tient parfaitement le rôle.

**Public Sans** pour le corps : neutre par conception, elle doit disparaître
derrière l'affichage. **JetBrains Mono** pour les données : chiffres tabulaires,
`0` barré, `1` à empattement — trois chiffres qu'on ne confond pas dans une
molette d'odomètre qui tourne.

### Échelle — fluide, et jamais décroissante

`clamp()` du mobile au desktop. ⚠️ Piège payé : appliquer un ratio naïf fait
**rétrécir** les petites tailles quand la fenêtre grandit. Les ratios ne
s'appliquent que **vers le haut**.

| Rôle | Mobile → Desktop |
|---|---|
| `--pas-xs` | 13 → 13,5 px |
| `--pas-sm` | 14 → 15 px |
| `--pas-base` | 16 → 17 px |
| `--pas-lg` | 20 → 23 px |
| `--pas-xl` | 25 → 30 px |
| `--pas-2xl` | 31 → 40 px |
| `--pas-3xl` | 39 → 54 px |
| `--pas-hero` | 44 → 86 px |

Corps ≥ 16 px sur mobile. Mesure de lecture 68 caractères — ⚠️ appliquée aux `p`
seulement, et aux `li` **uniquement dans `.prose`** : posée sur tous les `li`,
elle étrangle la grille de tarifs (vécu).

### Espacement

Base 4 px, échelle `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
Rythme vertical de section : `96px` mobile, `128px` desktop, **une seule source**
— une classe `.section`, jamais de marge posée à la main, pour éviter les doubles
marges que la Phase 4 doit traquer.

---

## 5. La ligne signature — « le plan d'atelier »

### Le parcours

```
en-tête        le trait sort du logo
   │
   ├── hero              descend en marge droite, presque droit
   │
   ├── trois raisons     s'infléchit, marque trois crans (un par raison)
   │
   ├── ce qu'on répare   ► devient PROFIL DE VOITURE, puis DISQUE DE FREIN,
   │                       puis FILTRE À HUILE
   │
   ├── combien ça coûte  ► devient l'aiguille du MANOMÈTRE de l'estimateur
   │
   ├── auto et bateau    ► bascule en PROFIL DE COQUE, puis HÉLICE
   │
   ├── confiance         se calme, redevient un trait simple
   │
   └── venir             ► se referme sur LA FORME DU LOGO
```

Un seul `<svg>` `position: sticky`, un seul `<path>`, `stroke-dashoffset` piloté
par un ScrollTrigger en **`scrub: 1`** (vérifié : `scrub?: boolean | number` —
`1` donne l'inertie, `true` colle à la molette). `vector-effect:
non-scaling-stroke` pour l'épaisseur constante.

### ⚠️ La contrainte technique qui décide de tout

**GSAP MorphSVG est un plugin Club, payant, absent du projet.** Vérifié.

La seule interpolation honnête d'un attribut `d` sans plugin exige que **toutes
les formes clés partagent une structure de commandes strictement identique** :
même nombre de commandes, mêmes types, même ordre. On interpole alors les nombres
deux à deux.

Concrètement : voiture, disque, filtre, coque, hélice et logo s'écrivent tous
`M` + **N×`C`**, avec le même N (je vise N = 12). C'est une contrainte de dessin
sévère, et c'est la raison pour laquelle ce genre d'effet est presque toujours
bâclé en superposition de calques.

**Garde-fou :** un validateur au build compare la signature de commandes de chaque
forme et **fait échouer la compilation** si deux divergent. Sans lui, une forme
mal dessinée part en vrille silencieusement — pas d'erreur console, juste un
gribouillis.

### Ce que la ligne ne fait pas

- Elle ne passe **jamais** derrière du corps de texte. Elle vit dans la gouttière.
- Elle est `aria-hidden` et ne porte aucune information absente du texte.
- Sur mobile : tracé **simplifié** (N points réduit, parcours plus court), pas
  supprimé.
- En `reduced-motion` : affichée d'emblée en état final, `stroke-dashoffset: 0`.

---

## 6. Inventaire des micro-interactions

Une règle : **rien ne glisse, tout s'encliquette.** `steps(4, end)` sur ~120 ms.

| Élément | Comportement | Garde-fou |
|---|---|---|
| Puces de liste | tête de vis six pans, pivot d'exactement 30° au survol de la ligne | rotation seule, pas de déplacement |
| Compteurs | molettes d'odomètre, chiffres décalés, mono tabulaire, `once: true` | **entiers uniquement** — voir critique §10 |
| Cartes de prestation | le cadre se resserre d'un cran, le prix roule | pas d'ombre, pas d'élévation, pas d'agrandissement |
| Boutons | remplissage turquoise par paliers, de gauche à droite | le libellé ne bouge pas |
| Séparateurs | filet interrompu par un motif d'outil, jamais deux fois le même | **aucune numérotation 01/02/03** |
| Liens de nav | soulignement qui se pose par paliers, origine gauche | — |
| Focus | **instantané**, double anneau clair + foncé | jamais de `steps()` ici |

**Les trois garde-fous du cliquet** (consignés dans le skill) : jamais sur un
anneau de focus, jamais sur un déplacement > ~8 px, jamais sur l'opacité seule —
un fondu par paliers se lit comme un bug d'affichage.

### L'arrivée, < 900 ms, une seule fois

```
0 ms     le rideau d'atelier commence à monter        (4 paliers nets)
120 ms   le logo commence à se dessiner au trait
520 ms   le rideau est levé
560 ms   titre, ligne 1
640 ms   titre, ligne 2
720 ms   titre, ligne 3
820 ms   boutons et bande de preuve
```

⚠️ **En CSS pur, pas en GSAP.** GSAP est en import dynamique : attendre son
chargement ferait rater le budget de 900 ms. Rien d'autre ne bouge tant que ce
n'est pas fini.

---

## 7. Structure

```
/                    accueil, sept blocs
/tarifs              la grille complète — la page qui fait la différence
/bateaux-jet-ski     le pôle nautique
/mentions-legales    /confidentialite    /404
```

Navigation : **quatre entrées** — Tarifs · Bateaux · Le garage · Venir — plus le
téléphone, traité en bouton et non en lien.

---

## 8. Wireframes

### Hero — 390 px

```
┌───────────────────────────────┐
│ ▛ THALES        09 86 36 04 01│  ← tél toujours visible, jamais en image
│   AUTOMOBILE              ☰   │
├───────────────────────────────┤
│                             ╷ │  ← la ligne signature entre par la gouttière
│  ┌─────────────────────────┐╷ │
│  │  [PHOTO hangar :        │╷ │
│  │   voiture sur pont +    │╷ │
│  │   moteur hors-bord]     │╷ │
│  └─────────────────────────┘╷ │
│                             ╷ │
│  ON VOUS DIT                ╷ │  ← 3 lignes, masques, 44→86px
│  CE QU'IL FAUT              ╷ │
│  RÉPARER.                   ╷ │
│                             ╷ │
│  Et ce qu'il ne faut pas.   ╷ │
│  20 ans à Épinay, auto et   ╷ │
│  bateau.                    ╷ │
│                             ╷ │
│  ┌───────────────────────┐  ╷ │
│  │ Estimer ma réparation │  ╷ │  ← turquoise plein, libellé blanc
│  └───────────────────────┘  ╷ │
│  ┌───────────────────────┐  ╷ │
│  │ 09 86 36 04 01        │  ╷ │  ← cadre au trait
│  └───────────────────────┘  ╷ │
│                             ╷ │
│  4,6 ★ · 61 avis · samedi   ╷ │
├───────────────────────────────┤
│  Appeler │ WhatsApp │ Y aller│  ← barre fixe, ≥44px, la conversion n°1
└───────────────────────────────┘
```

### « Combien ça va vous coûter » — 1440 px

```
┌──────────────────────────────────────────────────────────────────┐
│  COMBIEN ÇA VA VOUS COÛTER                                       │
│  ────────────────────────────────────⟨clé⟩──────────────────     │
│                                                                  │
│  ┌────────────────────────────┐   ┌───────────────────────────┐  │
│  │ VOTRE VÉHICULE             │   │        ╭─────────╮        │  │
│  │ ┌────┐ ┌────┐ ┌────┐       │   │      ╱      ╷     ╲      │  │
│  │ │citad│ │berl│ │ SUV│       │   │     │    ╲  ╷      │     │  │
│  │ └────┘ └────┘ └────┘       │   │     │      ╲╷      │     │  │  ← manomètre au trait,
│  │                            │   │      ╲            ╱      │  │    aiguille = la ligne
│  │ CE QU'IL FAUT FAIRE        │   │        ╰─────────╯        │  │    signature
│  │ ☐ Vidange + filtre         │   │                           │  │
│  │ ☑ Plaquettes avant         │   │      ┌─┬─┬─┐ ┌─┬─┬─┐      │  │
│  │ ☑ Disques avant            │   │      │2│4│0│–│3│6│0│ €    │  │  ← molettes d'odomètre
│  │ ☐ Distribution             │   │      └─┴─┴─┘ └─┴─┴─┘      │  │
│  │ ☐ Embrayage                │   │                           │  │
│  │ ☐ Climatisation            │   │  Estimation indicative,   │  │
│  │ ☐ Diagnostic électronique  │   │  hors pièces spécifiques. │  │  ← en clair, jamais
│  │ ☐ Pneus (x2)               │   │  Le devis exact est       │  │    en petit
│  │ ☐ Révision complète        │   │  gratuit et sans          │  │
│  │ ☐ Courroie accessoires     │   │  engagement.              │  │
│  │ ☐ Amortisseurs             │   │                           │  │
│  │ ☐ Batterie                 │   │  ┌──────────┐ ┌─────────┐ │  │
│  │                            │   │  │ WhatsApp │ │ Appeler │ │  │
│  └────────────────────────────┘   │  └──────────┘ └─────────┘ │  │
│                                   └───────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

Sans JavaScript : les cases deviennent un **tableau de prix lisible** suivi du
numéro. Le bloc ne disparaît pas, il se dégrade.

### « Auto et bateau » — 768 px

```
┌────────────────────────────────────────────┐
│                                            │
│   ╌╌╌╌╌╌╌╌ la ligne bascule ╌╌╌╌╌╌╌╌╌╌╌    │
│      profil voiture ──► profil coque       │  ← la métamorphose EST la
│                                            │     transition de section
│   LE MÊME ATELIER                          │
│   Ce qui roule. Ce qui flotte.             │
│                                            │
│   ┌──────────────────┐  ┌───────────────┐  │
│   │ [PHOTO hors-bord │  │ Hors-bord,    │  │
│   │  démonté]        │  │ in-board,     │  │
│   │                  │  │ jet-ski.      │  │
│   └──────────────────┘  │ Entretien,    │  │
│                         │ hivernage,    │  │
│                         │ dépannage.    │  │
│                         │               │  │
│                         │ Voir le pôle  │  │
│                         │ nautique →    │  │
│                         └───────────────┘  │
└────────────────────────────────────────────┘
```

---

## 9. L'estimateur

Barème dans `src/content/tarifs/bareme.json`, chargé par le loader `file()`
(vérifié). Chaque ligne marquée **`"statut": "À VALIDER"`**.

```
prix_final = base_intervention × coefficient_gabarit
fourchette = [prix × 0,8 , prix × 1,2]
```

Entièrement côté client, **aucune requête réseau**. L'aiguille dépasse d'un cran
puis revient. Le récapitulatif part encodé dans le lien `wa.me`.

⚠️ Les prix sont des **placeholders**. Ils n'ont aucune valeur tant que Nabil ne
les a pas validés, et le JSON le dit ligne par ligne.

---

## 10. Phase 2 — Critique du plan

**La question : si on m'avait donné le brief d'un autre garage, aurais-je produit
à peu près la même chose ?** Voici les endroits où la réponse était oui.

### ① Les compteurs sur « 4,6 » — corrigé

J'allais faire rouler toutes les données en odomètre, y compris la note Google.
Or **un odomètre est un compteur d'entiers** : le voir s'arrêter sur « 4,6 » est
un contresens mécanique, et l'animation d'une décimale est illisible.

→ **Molettes sur les entiers seulement** : 20 ans, 61 avis, les prix. La note 4,6
s'affiche fixe, avec ses étoiles. Détail minuscule, mais c'est ce genre de détail
qui sépare un site conçu d'un site paramétré.

### ② Les « trois raisons » partaient en grille d'icônes — corrigé

Trois blocs avec une icône, un titre, une phrase : c'est le motif le plus
générique du web. Je l'aurais écrit à l'identique pour un plombier.

→ **Aucune icône.** Les trois raisons sont composées en typographie seule, et la
ligne signature marque **trois crans physiques** en les traversant — un par
raison. La raison n°2 (« les prix sont affichés ») porte **un vrai prix tiré du
barème**, pas une illustration : la preuve est le contenu.

### ③ La ligne signature aurait pu n'être qu'un gribouillis décoratif — corrigé

« Une ligne qui se dessine au scroll » est une technique connue, faite mille fois.
Rien ne la rendait propre à ce client dans ma première rédaction.

→ Deux choses la rendent non transposable. D'abord ses métamorphoses sont les
**objets réels de cet atelier** (disque, filtre, coque, hélice) et pas des formes
abstraites. Ensuite — c'est l'ajout — **elle devient l'aiguille du manomètre de
l'estimateur**. La décoration se transforme en instrument de mesure au moment
précis où le site parle d'argent. Ça, on ne peut pas le recopier sur un autre
brief : ça n'a de sens que parce que ce garage affiche ses prix.

### ④ Sept blocs contre « lisible en dix secondes » — tension assumée

Le brief demande les deux, et ils se contredisent. Sept blocs ne se lisent pas en
dix secondes.

→ Je ne retire pas de bloc — ils répondent chacun à une vraie question. Mais je
pose une règle de hiérarchie : **seuls trois blocs ont un titre de niveau 2 en
taille d'affichage** (ce qu'on répare, combien ça coûte, auto et bateau). Les
quatre autres sont composés en retrait. La page se parcourt donc en trois arrêts,
et les dix secondes tiennent.

### ⑤ La palette frôlait le « propre générique » — surveillé

Blanc, noir, un accent : c'est aussi la recette de n'importe quelle landing SaaS.
Le brief interdit trois esthétiques ; celle-là n'y figure pas, mais elle guette.

→ Ce qui l'en sauve doit être tenu sans exception : **zéro aplat décoratif**. Pas
un seul rectangle de couleur qui ne soit un bouton. Le site est blanc, du trait,
et un accent. C'est un **plan technique**, pas une page d'atterrissage. Si en
Phase 4 je vois apparaître un bloc de fond coloré « pour aérer », c'est le signe
que j'ai dérivé.

### ⑥ Ce que j'ai décidé contre le brief, et qui vous appartient

Trois points où je m'écarte de vos instructions. Chacun est réversible.

| Point | Le brief dit | Je propose | Pourquoi |
|---|---|---|---|
| Astro | version 5 | **rester en 7.2.4** | tout ce que le brief exige existe à l'identique ; redescendre de deux majeures coûte les correctifs de sécurité et ne rapporte rien |
| Palette | 4 à 5 valeurs | **6, conditionnellement** | aucun turquoise unique ne passe AA en blanc **et** en encre ; si l'échantillonnage montre que celui du logo suffit, on revient à 5 |
| Bouton accent | non précisé | **turquoise plein, libellé blanc** | l'inverse (encre sur turquoise) échoue à 3,69 sur la teinte retenue |

### ⑦ Le risque que je n'ai pas résolu

**Le site est conçu pour de bonnes photos, et je n'en ai aucune.** Un hero au
trait, très blanc, avec un rectangle gris à la place du cliché du hangar, peut
paraître vide plutôt que sobre.

→ Les blocs de remplacement porteront le **nom du cliché attendu** et respecteront
les proportions exactes. Et la Phase 4 aura une question dédiée : *une photo
manquante casse-t-elle la mise en page ?* Mais je préfère le dire maintenant :
**tant que les photos ne sont pas là, le site ne pourra pas être jugé sur son
allure finale.** C'est le premier point bloquant de `TODO-CLIENT.md`.

---

## 11. Ce qu'il me faut pour démarrer la Phase 3

1. **Le logo dans `/public/brand/`** — le seul vrai bloquant. PNG haute
   définition ou SVG, peu importe.
2. **Votre arbitrage sur les trois écarts du §10 ⑥** — Astro 7, palette à 6,
   bouton blanc sur turquoise.
3. Le feu vert.

Les photos peuvent suivre : je construis avec les blocs de remplacement et je les
remplace en une passe.

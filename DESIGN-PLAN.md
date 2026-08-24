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

### ⚠️ Ce que je n'ai pas pu faire, et pourquoi

`/public/brand/` **n'existe pas dans le dépôt.** Le logo est visible dans votre
message, mais une image de conversation n'est pas un fichier sur disque : je ne
peux pas la pipetter. J'ai cherché (`/mnt/attach` vide, `uploads/` ne contient que
les trois GLB de la session précédente).

Le brief dit « ne devine pas les hex ». **Je n'ai donc rien deviné.** Ce qui suit
sépare strictement l'observé du provisoire.

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

### Ce qui attend le fichier

Uniquement les **valeurs numériques** de l'accent et de l'encre. Dès réception :

```bash
node scripts/echantillonner-logo.mjs public/brand/logo.png
node scripts/contraste.mjs
```

Le script quantifie par pas de 16 pour regrouper, puis **re-moyenne les pixels de
chaque cluster** — sans cette seconde passe on obtient un hex arrondi, donc faux.

---

## 3. Palette — 5 rôles, contrastes mesurés

`design/palette.json` porte la palette. Il est marqué `"_echantillonne": false`
tant que le logo n'est pas là.

| Token | Valeur | Rôle | Statut |
|---|---|---|---|
| `--encre` | `#111417` | titres, corps, traits porteurs de sens | provisoire |
| `--turquoise` | `#0E7C7C` | **l'unique accent** : action principale, liens | dérivé, voir ci-dessous |
| `--turquoise-signature` | `#17A2A2` | ligne signature **uniquement** (décorative) | provisoire |
| `--blanc-atelier` | `#F7F7F5` | le fond | arrêté |
| `--gris-texte` | `#5A605E` | texte secondaire | arrêté |
| `--gris-trait` | `#7E847F` | cadres et filets de composants | arrêté |

### La contrainte que la mesure a révélée

En partant d'un turquoise de travail à `#17A2A2`, **quatre paires sur neuf
échouaient**. En cherchant la profondeur qui les sauve, un fait dur apparaît :

| Turquoise | texte sur clair | blanc dessus | encre dessus |
|---|---|---|---|
| `#17A2A2` | 2,91 ✗ | 3,12 ✗ | 5,92 ✓ |
| `#128F8F` | 3,66 ✗ | 3,92 ✗ | 4,71 ✓ |
| **`#0E7C7C`** | **4,67 ✓** | **5,01 ✓** | 3,69 ✗ |
| `#0C6E6E` | 5,64 ✓ | 6,05 ✓ | 3,05 ✗ |

> **Aucun turquoise unique ne peut à la fois porter du texte blanc et du texte
> encre en AA.** Il faut ≥ `#0E7C7C` pour le blanc, ≤ `#128F8F` pour l'encre. Les
> deux plages ne se croisent pas.

Décision : **`#0E7C7C`, et le bouton principal est turquoise plein à libellé
blanc.** Jamais d'encre sur turquoise. Une seule règle, pas d'exception à retenir.

### Pourquoi six tokens et non cinq

Le brief plafonne à cinq. J'en propose six, et je veux que ce soit un choix
conscient, pas une dérive.

Le turquoise du logo est une couleur de **marque**, pas nécessairement une couleur
d'**interface**. S'il s'avère clair (comme ma valeur de travail), il ne pourra pas
porter de sens sans échouer en AA. D'où la scission :

- `--turquoise-signature` = la teinte exacte du logo, réservée à la ligne
  signature, qui est **décorative et `aria-hidden`** — donc hors du champ du
  critère 1.4.11.
- `--turquoise` = la variante conforme, pour tout usage porteur de sens.

**Si l'échantillonnage montre que le turquoise du logo passe déjà les seuils, les
deux tokens fusionnent et on revient à cinq.** Je le saurai en une commande.

### Contrôle, tel qu'il sort du script

```
titres et corps sur clair        #111417  #F7F7F5   17,23  ≥4,5  ok
texte secondaire sur clair       #5A605E  #F7F7F5    5,99  ≥4,5  ok
lien turquoise sur clair         #0E7C7C  #F7F7F5    4,67  ≥4,5  ok
icone porteuse de sens           #0E7C7C  #F7F7F5    4,67  ≥3    ok
libelle blanc sur bouton accent  #FFFFFF  #0E7C7C    5,01  ≥4,5  ok
cadre de composant               #7E847F  #F7F7F5    3,56  ≥3    ok
texte clair sur encre (pied)     #F7F7F5  #111417   17,23  ≥4,5  ok
turquoise sur encre (pied)       #0E7C7C  #111417    3,69  ≥3    ok
anneau de focus                  #111417  #F7F7F5   17,23  ≥3    ok
                                          9 paires, 0 echec
```

---

## 4. Typographie

### Le choix, et ce qui reste à confirmer

| Emploi | Police | Graisses |
|---|---|---|
| Affichage | **Familjen Grotesk Variable** | 600–700 |
| Corps | **Public Sans Variable** | 400–600 |
| Données, prix, horaires, compteurs | **JetBrains Mono Variable** | 400–700 |

Les trois existent sur Fontsource en variable (vérifié : `5.3.0`), donc
auto-hébergeables en woff2 sous-ensemblé au latin.

**Familjen Grotesk** pour l'affichage : grotesque géométrique, capitales à
terminaisons plates, et — c'est le point décisif — une **chasse naturellement plus
serrée qu'Archivo à graisse égale**, ce que le lettrage du logo demande. Archivo,
que le brief cite, est le choix par défaut de tout le monde ; c'est aussi celui du
site que vous venez de rejeter. Familjen Grotesk s'en approche autant et n'a pas
cette empreinte.

**Public Sans** pour le corps : neutre par conception (elle vient d'un système de
design d'État, où la personnalité est un défaut). Elle doit disparaître pour que
l'affichage et la ligne portent seuls le caractère.

**JetBrains Mono** pour les données : chiffres tabulaires, `0` barré, `1` à
empattement — trois chiffres qu'on ne confond pas dans une molette d'odomètre qui
tourne. C'est le point où une mono choisie pour le style échouerait.

> ⚠️ **Confirmation nécessaire.** Un appariement typographique avec un logo se
> tranche par **superposition**, pas au jugé. Sans le fichier je ne peux pas
> comparer les formes. Ce choix est donc argumenté mais provisoire : je vérifierai
> par calage dès réception, et si Familjen Grotesk ne tient pas, je le dirai.

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

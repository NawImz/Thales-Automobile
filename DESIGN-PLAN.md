# DESIGN-PLAN — Thalès Automobile

Phase 1 du protocole. Aucune ligne de code du site n'est écrite avant votre feu vert.
La critique du plan (Phase 2 du protocole) est en fin de document, section 8.

---

## 1. Écarts au brief, justifiés par écrit

Le brief impose une justification écrite pour toute dépendance ou déviation.
Voici les six, avec les preuves.

### 1.1 Astro 7 au lieu d'Astro 5 — à trancher par vous

Astro 7.2.4 est déjà installé et le build passe. Vous aviez explicitement
demandé « les dernières versions » au tour précédent ; le brief dit Astro 5.

`output: 'static'`, les content collections, `astro:assets` et `@astrojs/sitemap`
se comportent de façon identique. Je recommande de **garder Astro 7** : rétrograder
coûte une réinstallation et ne gagne rien.

⚠️ **Si une contrainte d'hébergement ou d'outillage vous impose Astro 5, dites-le
maintenant** : le changement coûte deux minutes aujourd'hui, une journée après la
Phase 3.

### 1.2 `@fontsource/archivo-expanded` n'existe pas

Vérifié sur le registre npm : le paquet est absent. Mais
`@fontsource-variable/archivo@5.3.0` livre **les deux axes dans un seul fichier
woff2 déjà sous-ensemblé au latin** :

```
/* archivo-latin-wdth-normal */
@font-face {
  font-family: 'Archivo Variable';
  font-weight: 100 900;
  font-stretch: 62% 125%;      ← l'axe de chasse est bien là
  src: url(./files/archivo-latin-wdth-normal.woff2) format('woff2-variations');
}
```

L'« Archivo Expanded » du brief s'obtient donc par `font-stretch: 118%` sur
`@fontsource-variable/archivo/wdth.css`. Un seul fichier, un seul téléchargement,
les deux axes. Import : `@fontsource-variable/archivo/wdth.css` (pas `index.css`,
qui n'a que la graisse).

### 1.3 Il n'y a pas de MCP Playwright dans cette session

Le paquet npm `playwright@1.56.1` et Chromium sont préinstallés
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). Je pilote le navigateur **par script**
et non par MCP. La boucle de critique de la Phase 4 est opérationnelle — c'est ainsi
que j'ai déjà mesuré les largeurs de police et détecté un fallback muet. La seule
différence est que je ne peux pas « cliquer » interactivement : je scripte les
interactions.

### 1.4 Dépendances à retirer

| Paquet | Motif |
|---|---|
| `three` | Le WebGL est hors sujet : la section Mouvement du brief exclut ce registre. |
| `postprocessing` | Idem. |
| `lucide-static` | Le brief impose 12 à 15 SVG inline dessinés à la main, à trait constant. |

### 1.5 Dépendances à ajouter

| Paquet | Justification |
|---|---|
| `@astrojs/sitemap` | Imposé §11. Aucune peer dependency, compatible Astro 7. |
| `@fontsource-variable/archivo` | Display. Axes chasse + graisse, latin sous-ensemblé. |
| `@fontsource-variable/instrument-sans` | Corps. |
| `@fontsource/ibm-plex-mono` | Données. `@fontsource-variable/ibm-plex-mono` n'existe pas ; la version statique suffit (400/500/600). |

`sharp` est déjà présent pour `astro:assets`. **Rien d'autre.** Pas de librairie de
carrousel, de dates, d'icônes, ni d'utilitaires.

### 1.6 Deux couleurs du brief échouent en WCAG et sont corrigées

Détail chiffré en 2.1. En résumé : `--beton` était à 2,67:1 sur `--tole` alors qu'il
sert de texte secondaire, et **aucune** encre de la palette ne passait sur le fond
`--bleu-port` du pôle nautique.

---

## 2. Système de tokens

### 2.1 Couleur

Sept tokens du brief, deux corrigés, un ajouté. Les corrections ne bougent que la
clarté : la teinte d'origine, tirée de la façade, est préservée au degré près.

```css
@theme {
  --color-bleu-port:    #16375F;  /* lettrage MICHEL MARINE, portail        */
  --color-bleu-cadran:  #2B5A94;  /* CORRIGÉ depuis #2C5B96                 */
  --color-tole:         #E9E4D8;  /* tôle ondulée crème — fond principal    */
  --color-tole-ombre:   #D6D0C2;  /* creux de l'ondulation, séparateurs     */
  --color-cambouis:     #131619;  /* noir cambouis — texte, pied de page    */
  --color-beton:        #595955;  /* CORRIGÉ depuis #8C8C86                 */
  --color-beton-clair:  #9F9F9A;  /* AJOUTÉ — secondaire sur fonds sombres  */
  --color-rouge-yamaha: #C8102E;  /* action principale, UNE fois par écran  */
}
```

**Pourquoi `--beton` passe de #8C8C86 à #595955.** Le brief lui donne le rôle de
texte secondaire. Mesuré sur les deux fonds clairs :

| | #8C8C86 (brief) | #595955 (corrigé) | seuil |
|---|---|---|---|
| sur `--tole` | **2,67:1** ✗ | 5,55:1 ✓ | 4,5 |
| sur `--tole-ombre` | **2,20:1** ✗ | 4,58:1 ✓ | 4,5 |

À 2,67:1 il échoue même le seuil 3:1 des composants d'interface. Ce n'est pas
rattrapable en agrandissant le texte. Teinte conservée (gris légèrement vert).

**Pourquoi `--beton-clair` est nécessaire.** Sur le fond `--bleu-port` du pôle
nautique, la palette du brief n'offrait aucune encre secondaire valide :
`beton` 3,56 · `bleu-cadran` 1,74 · `rouge-yamaha` 2,04. Tout échouait. `#9F9F9A`
est la dérivée claire du béton, à 4,53:1 sur `--bleu-port` et 6,83:1 sur
`--cambouis`.

**Pourquoi `--bleu-cadran` bouge d'un cheveu.** #2C5B96 donnait 4,49:1 sur
`--tole-ombre` — sous le seuil de 0,01. #2B5A94 donne 4,56:1. La différence est
invisible à l'œil ; elle fait passer la conformité.

**Les quinze usages prévus, mesurés par luminance relative :**

| Usage | Encre / fond | Ratio | Seuil |
|---|---|---|---|
| Corps sur fond principal | cambouis / tole | 14,31 | 4,5 ✓ |
| Corps sur surface creusée | cambouis / tole-ombre | 11,81 | 4,5 ✓ |
| Titre display sur fond | bleu-port / tole | 9,48 | 4,5 ✓ |
| Texte secondaire sur fond | beton / tole | 5,55 | 4,5 ✓ |
| Texte secondaire sur creux | beton / tole-ombre | 4,58 | 4,5 ✓ |
| Lien, donnée sur fond | bleu-cadran / tole | 5,53 | 4,5 ✓ |
| Lien, donnée sur creux | bleu-cadran / tole-ombre | 4,56 | 4,5 ✓ |
| Accent rouge en texte | rouge-yamaha / tole | 4,64 | 4,5 ✓ |
| Bordure de champ | beton / tole | 5,55 | 3,0 ✓ |
| Corps sur pôle nautique | tole / bleu-port | 9,48 | 4,5 ✓ |
| Secondaire sur nautique | beton-clair / bleu-port | 4,53 | 4,5 ✓ |
| Titre sur nautique | blanc / bleu-port | 12,03 | 4,5 ✓ |
| **Libellé du bouton rouge** | **blanc / rouge-yamaha** | **5,88** | 4,5 ✓ |
| Corps sur pied de page | tole / cambouis | 14,31 | 4,5 ✓ |
| Secondaire sur pied de page | beton-clair / cambouis | 6,83 | 4,5 ✓ |

**Zéro échec sur quinze.**

⚠️ Deux interdits qui découlent des mesures, à respecter en construction :
- **Le libellé du bouton rouge est blanc, jamais `--cambouis`** (3,09:1, insuffisant).
- **`--rouge-yamaha` ne s'utilise jamais sur `--bleu-port`** (2,04:1) ni sur
  `--tole-ombre` en texte courant (3,83:1). Sur le pôle nautique, l'action principale
  est un bouton rouge **plein** avec libellé blanc, pas du texte rouge.

### 2.2 Typographie

Trois rôles, trois familles, aucune ambiguïté sur qui fait quoi.

| Rôle | Famille | Réglage |
|---|---|---|
| **Display** | Archivo Variable | `font-stretch: 118%`, graisse 700–800, capitales, `letter-spacing: -0.02em`, `line-height: 1.15` |
| **Corps** | Instrument Sans Variable | graisse 400–600, `line-height: 1.6`, `max-width: 68ch` |
| **Données** | IBM Plex Mono | 400/500/600, `font-variant-numeric: tabular-nums` |

**Ce que porte chaque famille.** Le display ne sort que pour le titre du hero et les
titres de section — c'est le lettrage peint sur le hangar, il doit rester rare pour
rester impressionnant. Le mono porte **tout ce qui est une donnée vérifiable** :
prix, horaires, numéros de téléphone, références de pièces, kilométrages, champs de
l'estimateur, statut d'ouverture. C'est ce qui fait qu'un prix affiché a l'air d'un
relevé et non d'une promesse marketing — exactement l'effet recherché, puisque
publier des prix est l'argument central du site.

**Échelle fluide**, base 16 px, ratio 1,25 en mobile et 1,333 en desktop, appliqué
**uniquement vers le haut** : les crans sous la base grandissent doucement au lieu
de rétrécir (le calcul naïf faisait passer `sm` de 13 à 12 px quand l'écran
s'agrandit — corrigé).

```css
--pas-xs:   clamp(0.75rem,   0.728rem  + 0.0939vw, 0.8125rem);  /* 12 → 13 */
--pas-sm:   clamp(0.875rem,  0.853rem  + 0.0939vw, 0.9375rem);  /* 14 → 15 */
--pas-base: clamp(1rem,      0.978rem  + 0.0939vw, 1.0625rem);  /* 16 → 17 */
--pas-lg:   clamp(1.25rem,   1.184rem  + 0.2817vw, 1.4375rem);  /* 20 → 23 */
--pas-xl:   clamp(1.5625rem, 1.4525rem + 0.4695vw, 1.875rem);   /* 25 → 30 */
--pas-2xl:  clamp(1.9375rem, 1.7394rem + 0.8451vw, 2.5rem);     /* 31 → 40 */
--pas-3xl:  clamp(2.4375rem, 2.1074rem + 1.4085vw, 3.375rem);   /* 39 → 54 */
--pas-4xl:  clamp(3.0625rem, 2.5563rem + 2.1596vw, 4.5rem);     /* 49 → 72 */
--pas-5xl:  clamp(3.8125rem, 3.0643rem + 3.1925vw, 5.9375rem);  /* 61 → 95 */
```

Plancher à 12 px, réservé aux étiquettes mono en capitales espacées. Corps jamais
sous 16 px. Contrôlé à 768 px : aucun cran ne décroche.

### 2.3 Espacement

Trame de 4 px. Le rythme vertical des sections n'a que **trois** valeurs, pour que
la page ait une respiration régulière et non un empilement de marges négociées
section par section.

```css
--espace-1: 0.25rem;  --espace-2: 0.5rem;   --espace-3: 0.75rem;
--espace-4: 1rem;     --espace-6: 1.5rem;   --espace-8: 2rem;
--espace-12: 3rem;    --espace-16: 4rem;    --espace-24: 6rem;

--section-serree: clamp(2.5rem, 6vw, 4rem);
--section-normal: clamp(4rem, 9vw, 7rem);
--section-ample:  clamp(5rem, 12vw, 10rem);
```

Règle de construction, pour éviter le piège de spécificité que le brief signale :
**l'espacement vertical entre sections est porté par `padding-block` sur la section
elle-même, jamais par des marges sur ses enfants.** Les enfants sont disposés en
`flex`/`grid` avec `gap`. Aucune marge négative.

### 2.4 Rayons

Le brief interdit le `border-radius` uniforme. Le bâtiment est fait d'angles droits :
tôle, portail, établi. Donc **0 par défaut**, deux exceptions justifiées.

```css
--rayon-0: 0;        /* panneaux, cartes, sections, le bon d'atelier   */
--rayon-1: 2px;      /* boutons et champs — l'arête d'une pièce estampée */
--rayon-plaque: 4px; /* UNIQUEMENT le champ d'immatriculation           */
```

Le `--rayon-plaque` vient de la vraie plaque française, dont les coins sont
légèrement arrondis. Il n'apparaît nulle part ailleurs.

### 2.5 Élévation

Le brief interdit les ombres portées diffuses. Aucune ombre floue sur le site.
L'élévation est un **décalage plein**, comme une copie carbone de bon d'atelier :

```css
--ombre-carbone: 3px 3px 0 var(--color-tole-ombre);
```

Deux usages seulement : le bon d'atelier, et le bouton principal au survol (le
décalage passe à `1px 1px 0` — le bouton s'enfonce, comme un tampon).

### 2.6 Mouvement

```css
--duree-revele: 400ms;
--duree-hero:   900ms;   /* budget total de la séquence d'arrivée */
--courbe:       cubic-bezier(0.16, 1, 0.3, 1);   /* power2.out */
--decalage:     60ms;    /* stagger */
```

Un seul type de révélation au scroll : translation verticale de 16 px + opacité,
400 ms, décalage de 60 ms. Réutilisé partout, sans variante. Lenis en `lerp: 0.09`.

`prefers-reduced-motion: reduce` **détruit** Lenis (pas de `new Lenis()` du tout) et
n'enregistre aucun ScrollTrigger : les états finaux sont posés directement en CSS.
Pas de « version réduite » des animations — leur absence.

---

## 3. Concept de mise en page

**Le site est le bâtiment : un lettrage peint en haut, l'atelier ouvert en dessous,
et une porte au fond qui donne sur l'eau.**

Trois conséquences concrètes.

**Le titre est peint sur le mur, pas posé sur une photo.** Le réflexe par défaut
serait une photo pleine largeur avec du texte blanc centré dessus. Ce garage a un
lettrage de deux mètres peint à même la tôle : le hero met donc le titre en Archivo
Expanded `--bleu-port` **sur le fond crème**, et la photo vient en bandeau
au-dessous, comme le hangar qui s'ouvre sous le pignon. Bénéfice secondaire non
négligeable : l'élément LCP devient du texte, pas une image de 200 Ko — le budget
LCP ≤ 1,5 s devient atteignable par construction et non par optimisation.

**Le séparateur de section est l'ondulation de la tôle.** Une trame de filets
verticaux fins en `--tole-ombre`, au pas de l'ondulation, haute de 12 px. C'est le
seul ornement du site, il vient directement de la façade, et il ne se répète jamais
en fond de bloc.

**Le pôle nautique est la seule inversion.** Tout le site vit sur `--tole` crème.
La section bateaux bascule en `--bleu-port` plein, bord à bord. C'est le moment
mémorable, et il est mérité : c'est littéralement un autre monde et un autre client.
Une seule inversion dans toute la page d'accueil — si une deuxième apparaît, elle
saute.

---

## 4. Wireframes

### 4.1 Hero — 1440 px

```
┌────────────────────────────────────────────────────────────────────────┐
│ THALÈS AUTO·BATEAUX    auto  bateaux  tarifs  devis  le garage         │
│                        ▐OUVERT · FERME À 18 H▌   06 69 68 63 84        │  mono
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ON VOUS DIT CE QU'IL FAUT                                            │  Archivo
│   RÉPARER, ET CE QU'IL                                                 │  118%, 95px
│   NE FAUT PAS.                                                         │  bleu-port
│                                                                        │
│   Garage auto et moteurs de bateau à Épinay-sur-Seine.                 │  Instrument
│   Vingt ans d'atelier. Devis gratuit, prix affichés.                   │  17px, 68ch
│                                                                        │
│   ┌──────────────────────────┐  ┌───────────────────────────┐          │
│   │ Estimer ma réparation  → │  │ 06 69 68 63 84            │          │  rouge plein
│   └──────────────────────────┘  └───────────────────────────┘          │  + contour
│                                                                        │
│   4,6★ 61 avis Google  ·  depuis 2005  ·  ouvert le samedi             │  mono 13px
│                                                                        │
├─│││││││││││││││││││││││││││││││││││││││││││││││││││││││││││││││││││││──┤  ondulation
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓ photo : voiture sur pont + hors-bord au premier plan, 16:9 ▓▓▓▓▓▓▓▓▓▓│  lazy
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└────────────────────────────────────────────────────────────────────────┘
```

En 390 px : même ordre, titre à 61 px, les deux boutons pleine largeur empilés,
le bandeau de preuve passe sur deux lignes, la photo garde son ratio. La barre
d'urgence collante (Appeler · WhatsApp · Itinéraire) est fixée en bas.

### 4.2 Grille de tarifs — le différenciateur

Traitée comme le tableau de tarifs vissé au mur de l'atelier : libellé, points de
conduite, prix en mono aligné à droite. Aucune carte, aucune ombre, aucun « à partir
de » en gros et le vrai prix en petit.

```
┌────────────────────────────────────────────────────────────────────────┐
│ CE QUE ÇA COÛTE                                                        │  étiquette mono
│                                                                        │
│ Nos prix sont affichés.                                                │  Archivo 54px
│ Personne d'autre ne le fait dans le coin.                              │
│                                                                        │
│ Fourchettes constatées, main-d'œuvre comprise. Le devis exact est       │  corps
│ gratuit : on regarde d'abord, on chiffre ensuite.                      │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Vidange + filtre à huile ·············································  86 – 110 € │ │  mono
│ │ Plaquettes de frein avant ···········································  120 – 160 € │ │  tabular
│ │ Disques + plaquettes avant ·········································  210 – 260 € │ │
│ │ Kit de distribution ·····················································  480 – 720 € │ │
│ │ Embrayage ·································································  550 – 900 € │ │
│ │ Diagnostic électronique ················································  45 – 60 € │ │
│ │ Révision moteur hors-bord ············································  180 – 340 € │ │  ← bleu-cadran
│ │ Hivernage bateau ························································  150 – 280 € │ │  ← bleu-cadran
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ Voir tous les tarifs →      À VALIDER PAR NABIL avant mise en ligne     │
└────────────────────────────────────────────────────────────────────────┘
```

Les deux lignes nautiques sont teintées `--bleu-cadran` : le tableau annonce
discrètement que ce garage ne fait pas que des voitures, avant même qu'on arrive à
la section bateaux.

### 4.3 Pôle nautique — l'inversion

```
├────────────────────────────────────────────────────────────────────────┤
│████████████████████ fond --bleu-port, bord à bord ██████████████████████│
│██                                                                    ██│
│██  ET AUSSI CE QUI FLOTTE                                            ██│  mono, beton-clair
│██                                                                    ██│
│██  Moteurs hors-bord,                          ┌──────────────────┐  ██│  Archivo blanc
│██  in-board, jet-skis.                         │                  │  ██│
│██                                              │  photo hors-bord │  ██│
│██  Le même atelier, les mêmes mains. Il y a    │  démonté, plan   │  ██│  tole 17px
│██  une poignée d'ateliers hors-bord en         │  serré           │  ██│
│██  Île-de-France, et la Seine est à cent       │                  │  ██│
│██  mètres.                                     └──────────────────┘  ██│
│██                                                                    ██│
│██  ▸ Entretien et réparation toutes marques                          ██│
│██  ▸ Hivernage                                                       ██│
│██  ▸ Jet-skis et remorques                                           ██│
│██  ▸ Dépannage sur place                                             ██│
│██                                                                    ██│
│██  ┌────────────────────────────┐                                    ██│
│██  │ Voir le pôle nautique   →  │   ← bouton rouge PLEIN, libellé    ██│
│██  └────────────────────────────┘     blanc (jamais de texte rouge   ██│
│██                                     sur ce fond : 2,04:1)          ██│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Élément signature — le bon d'atelier

L'estimateur, traité comme un vrai bon de commande d'atelier. C'est le seul endroit
où le site prend un risque graphique.

```
┌────────────────────────────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════════════════════════════╗  │
│  ║  THALÈS AUTOMOBILE          BON D'ATELIER N° 2 4 1 8             ║  │  en-tête tamponné
│  ║  20 rue du Port · 93800 Épinay-sur-Seine        ÉTAPE 2 / 3      ║  │  mono
│  ╠══════════════════════════════════════════════════════════════════╣  │
│  ║                                                                  ║  │
│  ║  VÉHICULE      ┌─────────────────────┐                           ║  │
│  ║                │  AB-123-CD          │  ← plaque française,      ║  │  rayon-plaque
│  ║                └─────────────────────┘    liserés bleus, mono    ║  │
│  ║                ▣ citadine   ▢ berline   ▢ SUV / utilitaire       ║  │  cases carrées
│  ║                                                                  ║  │
│  ║  BESOIN        ▣ Vidange + filtre ······················  86 – 110 € ║  │
│  ║                ▢ Plaquettes avant ····················  120 – 160 € ║  │
│  ║                ▣ Diagnostic ····························  45 – 60 € ║  │
│  ║                ▢ Distribution ·························  480 – 720 € ║  │
│  ║                                                                  ║  │
│  ╟──────────────────────────────────────────────────────────────────╢  │
│  ║  ESTIMATION                                     131 – 170 €      ║  │  mono, animé
│  ║  Indicative, hors pièces spécifiques. Devis exact gratuit.       ║  │
│  ╠══════════════════════════════════════════════════════════════════╣  │
│  ║  ┌──────────────────────────┐  ┌──────────────────────────┐      ║  │
│  ║  │ Envoyer par WhatsApp     │  │ Appeler maintenant       │      ║  │  rouge / contour
│  ║  └──────────────────────────┘  └──────────────────────────┘      ║  │
│  ╚══════════════════════════════════════════════════════════════════╝  │
│     └─ ombre carbone 3px 3px 0, pas de flou                            │
└────────────────────────────────────────────────────────────────────────┘
```

**Le numéro de bon est le seul « 01/02/03 » légitime du site.** L'estimateur est
une vraie séquence en trois étapes : la numérotation y encode une information que
l'utilisateur a besoin de lire. Elle n'apparaît nulle part ailleurs.

**Sans JavaScript**, le composant se dégrade en tableau de tarifs lisible suivi du
numéro de téléphone — pas en formulaire mort. L'état vit dans le fragment d'URL,
donc partageable. Aucune requête réseau : le barème vient de
`src/content/tarifs/bareme.json`, prix de base × coefficient de gabarit, fourchette
± 20 %.

⚠️ **Tous les prix du barème sont des placeholders `À VALIDER`.**

---

## 6. Arborescence des composants

```
src/
├── styles/global.css              @import fontsource → @import tailwindcss → @theme
├── layouts/
│   ├── Base.astro                 <head>, JSON-LD, skip link, barre d'urgence
│   └── Page.astro                 Base + fil d'Ariane + bandeau CTA + pied de page
├── components/
│   ├── socle/
│   │   ├── EnTete.astro           nav, statut d'ouverture, téléphone
│   │   ├── PiedDePage.astro
│   │   ├── BarreUrgence.astro     collante mobile : appeler · WhatsApp · itinéraire
│   │   ├── Ondulation.astro       séparateur de section
│   │   └── Icone.astro            12–15 SVG inline, trait 1,5 px constant
│   ├── conversion/
│   │   ├── BoutonAppel.astro      tel:, data-event
│   │   ├── BoutonWhatsApp.astro   wa.me + message pré-rempli encodé
│   │   └── FormulaireCourt.astro  4 champs, honeypot, aria-live
│   ├── bon-atelier/
│   │   ├── BonAtelier.astro       coque + en-tête tamponné + repli sans JS
│   │   ├── ChampPlaque.astro
│   │   ├── CaseIntervention.astro
│   │   └── estimateur.ts          barème, état, encodage du fragment d'URL
│   ├── preuve/
│   │   ├── CarteAvis.astro        note, extrait, « CLIENT DEPUIS 2014 »
│   │   ├── BandeauPreuve.astro
│   │   └── GrilleTarifs.astro     lignes de conduite, mono tabulaire
│   └── contenu/
│       ├── CarteService.astro
│       ├── PoleNautique.astro     l'inversion bleu-port
│       ├── CarteVehicule.astro
│       └── Acces.astro            plan statique cliquable, pas d'iframe
├── content/                       services · tarifs · avis · vehicules · villes · config
├── scripts/
│   ├── mouvement.ts               Lenis + GSAP, import dynamique sur IntersectionObserver
│   └── horaires.ts                statut ouvert/fermé, Europe/Paris, repli sans JS
└── pages/                         voir §7 du brief
```

---

## 7. Ordre de construction (Phase 3, après votre feu vert)

1. Dépendances (retraits et ajouts du §1), tokens, `global.css`, socle de layout
2. Composants partagés : en-tête, statut d'ouverture, barre d'urgence, ondulation, icônes
3. Page d'accueil complète, section par section, avec critique Playwright à chaque section
4. Le bon d'atelier
5. Pages internes, dont les pages de ville
6. SEO, JSON-LD, sitemap, en-têtes de sécurité
7. Mesures de performance et d'accessibilité, chiffres collés dans le README

---

## 8. CRITIQUE DU PLAN (Phase 2 du protocole)

La question imposée : **si on m'avait donné le brief d'un autre garage, est-ce que
j'aurais produit à peu près la même chose ?** Quatre fois la réponse était oui.

### 8.1 « Les trois raisons » en trois cartes à icône — RÉVISÉ

**Le défaut.** Trois cartes avec une icône, un titre, deux lignes de texte. C'est
exactement ce que produirait n'importe quel générateur pour n'importe quel commerce.
Le brief impose bien trois blocs, mais rien ne dit qu'ils doivent être des cartes.

**Ce que je change.** Pas de cartes, pas d'icônes. Trois **affirmations à la première
personne du pluriel**, en Archivo à `--pas-xl`, séparées par des filets, chacune
suivie d'une seule ligne de preuve en mono. La formulation vient des avis, pas de
mon clavier :

```
On ne change pas une pièce qui peut tenir.
                              THÈME N°1 DES 61 AVIS GOOGLE

On vous appelle avant toute intervention non prévue.
                              ZÉRO MAUVAISE SURPRISE SUR LE DEVIS

Une voiture et un moteur de bateau, même atelier.
                              PERSONNE D'AUTRE À ÉPINAY
```

C'est du texte, pas des cartes. Ça se lit en quatre secondes et ça ne ressemble à
aucun site de garage.

### 8.2 Le hero photo pleine largeur avec titre en surimpression — DÉJÀ ÉCARTÉ

C'était mon premier réflexe et c'est le hero de tous les concurrents. Remplacé par
le titre peint sur fond crème et la photo en bandeau (§3). Je le note ici parce que
c'est le point où le plan aurait pu basculer dans le générique, et parce que le
bénéfice de performance (LCP textuel) n'est arrivé qu'après coup : le bon choix de
DA était aussi le bon choix technique.

### 8.3 La section avis en carrousel de trois cartes — RÉVISÉ

**Le défaut.** Un carrousel d'avis avec cinq étoiles dorées, c'est le composant le
plus cloné du web local. Et le brief signale que **la fidélité longue** — « client
depuis plus de 10 ans » — est la preuve sociale la plus forte disponible et que
personne ne l'exploite.

**Ce que je change.** Les avis ne sont ni triés par date ni par note, mais **par
ancienneté du client**, et chaque avis porte une ligne mono `CLIENT DEPUIS 2014`.
Pas de carrousel : une grille statique de six, lisible d'un coup, sans JavaScript.
La structure encode alors quelque chose de vrai — c'est un classement par
ancienneté, pas une décoration. Quand un garage aligne quatre clients de plus de
dix ans, l'argument se passe de commentaire.

*(Réserve honnête : l'ancienneté n'est pas toujours déductible d'un avis Google.
Là où elle est absente, la ligne mono disparaît, elle n'est pas inventée. Consigné
dans `TODO-CLIENT.md`.)*

### 8.4 Le pôle nautique traité comme une section de service parmi d'autres — RÉVISÉ

**Le défaut.** Dans mon premier jet, les bateaux étaient une carte de plus dans la
grille des services. C'est enterrer le seul argument que la concurrence ne peut pas
copier.

**Ce que je change.** Le pôle nautique devient la seule inversion chromatique de la
page (§4.3), à pleine largeur, et il déborde en amont : deux lignes nautiques
teintées dans la grille de tarifs, et le mot « bateaux » dans la navigation
principale. Le visiteur doit comprendre avant le premier scroll que cet endroit n'est
pas un garage ordinaire.

### 8.5 Ce que je garde sans le réviser, et pourquoi

- **Le mono pour toutes les données.** Ce n'est pas un tic de style : le site vend
  la transparence des prix, et le mono tabulaire fait lire un prix comme un relevé.
- **Le séparateur en ondulation.** Il vient d'une photo de la façade. Aucun autre
  garage n'a ce séparateur parce qu'aucun autre n'a ce hangar.
- **Zéro `border-radius`, zéro ombre floue.** Le vocabulaire est celui de la tôle
  pliée et du papier carbone.

### 8.6 Le risque assumé

Le bon d'atelier. Un estimateur qui ressemble à un formulaire papier tamponné, avec
un numéro de bon qui s'incrémente et une saisie en plaque d'immatriculation, ça peut
passer pour un gadget. Je l'assume pour trois raisons : c'est le seul endroit du site
où l'on dépense de l'audace, il répond à la question n°1 du visiteur (« ça va me
coûter combien ? »), et il produit un message WhatsApp pré-rempli — donc une
conversion mesurable, pas une figure de style.

**Garde-fou :** si à la Phase 4 le bon d'atelier ralentit le parcours au lieu de le
servir, il redevient un formulaire sobre et je le dis. La règle Chanel s'applique :
avant de livrer, on retire un effet.

---

## 9. Ce que j'attends de vous pour démarrer la Phase 3

1. **Le feu vert sur ce plan** (ou vos amendements).
2. **La version d'Astro** — 7 comme installé, ou 5 comme au brief (§1.1).
3. Le reste peut attendre : photos, barème, avis réels et mentions légales partiront
   en placeholders marqués, consignés dans `TODO-CLIENT.md`.

# TODO CLIENT — ce que Nabil doit fournir ou valider

Classé par ce qui bloque, ce qui compte, ce qui améliore.
Mis à jour à chaque phase.

---

## 🔴 BLOQUANT — avant toute mise en ligne

| # | Élément | Pourquoi |
|---|---|---|
| 0 | **Les mentions légales ont été retirées du site à votre demande.** | Elles restent **juridiquement obligatoires** : SIRET, forme juridique, TVA, assurance RC pro et médiateur de la consommation (art. L.612-1 du code de la consommation). Le site ne peut pas être publié sans. Dites-moi quand vous avez les informations, je remets la page en dix minutes. |
| 0b | **Quel numéro affiche-t-on ?** | La banderole dit 09 86 36 04 01, le site affiche 06 69 68 63 84. Sur la photo du hero, un visiteur voit littéralement les deux. |

## 🔴 Anciennement bloquant — la Phase 3 ne pouvait pas démarrer sans

| # | Élément | Pourquoi ça bloque |
|---|---|---|
| # | Élément | Pourquoi ça bloque |
|---|---|---|
| 1 | **Quel numéro affiche-t-on ?** | La banderole de la devanture porte **09 86 36 04 01**, le site affiche **06 69 68 63 84**. Un visiteur qui voit les deux ne sait pas lequel appeler — et c'est la conversion n°1. Les deux sont dans `garage.json`, dites-moi lequel est le principal. |

**Résolus depuis :** le logo est reçu et échantillonné (`#2A7687` / `#0E1015`) ;
Astro 7 et la palette sont arbitrés. La palette est d'ailleurs **revenue à
5 tokens** : l'accent réel passe AA seul, le sixième est devenu inutile.

## 🟠 IMPORTANT — à remplacer avant la mise en ligne

### Le lien des avis Google va expirer

L'URL fournie est une **adresse de recherche liée à votre session** : elle
contient `sxsrf` (un horodatage), `ved`, `si`, `uds`, `rlz`, ainsi que la taille
de votre écran (`biw`, `bih`, `dpr`). Ces liens cessent de fonctionner au bout
d'un moment.

Elle est en place et fonctionne aujourd'hui, mais il faut la remplacer par un
lien durable :

1. Ouvrez votre **fiche Google Business** (depuis votre compte, pas depuis une
   recherche).
2. Bouton **« Partager »** → vous obtenez un lien court du type `g.page/…`.
3. Envoyez-le-moi, je le remplace dans `garage.json` — une ligne.

## 🟠 AUTRES POINTS IMPORTANTS — le site fonctionnera, mais incomplet ou juridiquement exposé

### Le logo en haute définition ou en vectoriel

Le fichier reçu fait **100 × 100 px**. C'est suffisant pour la couleur — un pixel
est un fait — mais pas pour le reste :

- le mot du logo n'y fait que ~84 × 36 px, trop grossier pour identifier la fonte
  exacte du lettrage (j'ai retenu Roboto Slab par comparaison, voir
  `DESIGN-PLAN.md` §4) ;
- il est inexploitable pour les favicons, l'image Open Graph et l'en-tête en
  écran haute densité ;
- la ligne signature doit se refermer sur la forme du logo : il me faut un tracé
  net pour la dessiner.

**Un SVG serait idéal.** À défaut, un PNG d'au moins 1000 px de côté.

### Photos (le site vit ou meurt dessus)

| Cliché | Usage |
|---|---|
| **Le hangar : une voiture sur pont ET un moteur hors-bord dans le même cadre** | **le hero.** C'est le cliché qui raconte tout le positionnement en une image. Le plus important des sept. ⚠️ En attendant, le hero affiche la façade — ce n'est pas le bon cliché, il tient la place. |
| ~~La façade avec le portail bleu~~ | ✅ **reçue**, en place dans le hero à titre provisoire |
| Nabil au travail | bloc « Pourquoi on nous fait confiance » |
| Plan serré de mains sur un moteur | bloc « Ce qu'on répare » |
| Le mur de pièces détachées | page `/tarifs` |
| Un jet-ski ou un hors-bord démonté | bloc nautique et page `/bateaux-jet-ski` |
| Une texture d'atelier | fonds et OG images |

En attendant : blocs de remplacement aux proportions exactes, portant le nom du
cliché attendu.

### Mentions légales — obligatoires, actuellement absentes

- **SIRET**
- **Forme juridique** (SARL, EI, auto-entrepreneur…)
- **Numéro de TVA intracommunautaire**, ou la mention « TVA non applicable, art.
  293 B du CGI »
- **Assurance responsabilité civile professionnelle** : assureur et couverture
  géographique
- **Médiateur de la consommation** : nom et coordonnées.
  ⚠️ Obligatoire pour tout professionnel vendant à des particuliers
  (art. L.612-1 du Code de la consommation). Son absence est sanctionnable.

### Données commerciales

- **Le barème complet.** Tous les prix du site sont des placeholders marqués
  `À VALIDER` dans `bareme.json`. **Aucun ne doit être publié sans votre
  validation** — un prix faux affiché engage le garage.
- **E-mail professionnel** (le formulaire et les mentions légales en ont besoin).
- **Le périmètre nautique exact** : quelles marques, quels types de moteurs,
  hivernage ou non, manutention ou non.
- **Dépannage / remorquage** : rayon d'intervention et tarif.
- **Coordonnées GPS exactes** de l'entrée (pour le JSON-LD et le plan statique).

### Décision de service

- **Analytics** : Plausible ou Umami — les deux demandent un compte payant.
  Sans cookie, donc **pas de bandeau cookies** : c'est un gain de conversion et de
  performance. Dites-moi lequel, ou si on s'en passe en v1.

## 🟢 CONFORT — améliore, ne bloque pas

- Photos avant/après d'une réparation marquante.
- Deux ou trois avis supplémentaires (j'en ai trois de vérifiés).
- Logo Yamaha / OMC si vous êtes agréé : à confirmer, car afficher une marque sans
  accord expose.
- Horaires de fermeture annuelle.
- Une page « véhicules d'occasion » si vous en vendez régulièrement.

---

## Ce que je n'inventerai jamais

Aucune valeur de ce site n'est devinée. Tout ce qui manque apparaît comme
`[À COMPLÉTER]` visible dans les pages, et se retrouve dans cette liste. Un site
de garage qui affiche un faux numéro ou un faux prix coûte plus cher qu'un site
incomplet.

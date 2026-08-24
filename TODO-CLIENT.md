# TODO CLIENT — ce que Nabil doit fournir ou valider

Classé par ce qui bloque, ce qui compte, ce qui améliore.
Mis à jour à chaque phase.

---

## 🔴 BLOQUANT — la Phase 3 ne peut pas démarrer sans

| # | Élément | Pourquoi ça bloque |
|---|---|---|
| 1 | **Le fichier du logo**, dans `/public/brand/` (PNG haute définition ou SVG) | Tout le langage visuel en découle. Sans le fichier je ne peux pas pipetter les hex, et le brief interdit — à raison — de les deviner. La palette entière et le calage typographique en dépendent. |
| 2 | **Arbitrage : Astro 7 ou Astro 5** | Le brief dit 5, la 7.2.4 est installée et vous m'aviez dit de la garder. Ma recommandation : rester en 7 (voir `SETUP.md` §5). |
| 3 | **Arbitrage : palette à 6 valeurs** | Aucun turquoise unique ne passe WCAG AA à la fois en libellé blanc et en libellé encre. Détail chiffré dans `DESIGN-PLAN.md` §3. |

## 🟠 IMPORTANT — le site fonctionnera, mais incomplet ou juridiquement exposé

### Photos (le site vit ou meurt dessus)

| Cliché | Usage |
|---|---|
| **Le hangar : une voiture sur pont ET un moteur hors-bord dans le même cadre** | **le hero.** C'est le cliché qui raconte tout le positionnement en une image. Le plus important des sept. |
| La façade avec le portail bleu | bloc « Venir », repère pour trouver l'entrée |
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

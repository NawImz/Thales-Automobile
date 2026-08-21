# TODO CLIENT — ce qu'il faut réunir

Classé par urgence réelle. Les éléments **bloquants** empêchent la mise en ligne ;
les **importants** dégradent sérieusement le site s'ils manquent ; le **confort**
peut arriver en v1.1.

Tant qu'un élément n'est pas fourni, il apparaît sur le site sous forme de
placeholder explicitement marqué. **Rien n'est inventé** — ni un avis, ni un prix,
ni un chiffre, ni une photo.

---

## 🔴 BLOQUANT — pas de mise en ligne sans ça

### Mentions légales (obligation légale, pas une préférence)
- [ ] **SIRET** et forme juridique exacte
- [ ] Capital social (si société)
- [ ] Numéro de TVA intracommunautaire
- [ ] Assurance RC professionnelle : nom de l'assureur et zone de couverture
- [ ] **Médiateur de la consommation** : nom et adresse. Obligatoire pour tout
      professionnel vendant à des particuliers (art. L.612-1 du code de la
      consommation). C'est celui qu'on oublie et qui coûte cher.
- [ ] Directeur de la publication
- [ ] Hébergeur du site (je le remplis une fois l'hébergement choisi)

### Le barème de prix
- [ ] **Validation de chaque ligne du barème par Nabil.**
      Le fichier `src/content/tarifs/bareme.json` est intégralement marqué
      `À VALIDER`. Les ordres de grandeur de départ viennent de Vroomly
      (vidange ≈ 86 €, disques de frein ≈ 232 €) — ce sont des moyennes
      publiées, **pas les prix de Thalès**.

      ⚠️ C'est le point le plus sensible du projet. Publier des prix est
      l'argument central du site ; publier des prix faux serait pire que
      ne rien publier. Il faut une fourchette basse et une fourchette haute
      pour chaque intervention, main-d'œuvre comprise ou non — à préciser.

- [ ] Les tarifs nautiques (révision hors-bord, hivernage) : y a-t-il une grille,
      ou est-ce systématiquement sur devis ?

### L'identité affichée
- [ ] **Le nom exact tel qu'il doit apparaître** : « Thalès Automobile »,
      « Thales Auto·Bateaux », avec ou sans accent ? Le panneau de la rue dit
      « THALES AUTO / BATEAUX ».
- [ ] Confirmation des trois numéros et de leur rôle :
      06 69 68 63 84 (principal) · 09 86 36 04 01 (atelier) · 01 72 89 53 89
      (dépannage). Lequel met-on en avant sur mobile ?
- [ ] **Le numéro WhatsApp** — je pars sur le 06 69 68 63 84. À confirmer :
      est-il bien sur WhatsApp, et qui répond ?
- [ ] Adresse e-mail professionnelle

---

## 🟠 IMPORTANT — le site fonctionne, mais nettement moins bien

### Les photos
**Le site vit ou meurt là-dessus.** Aucune image de banque, aucune image générée :
tant que les vraies photos ne sont pas là, ce sont des blocs de couleur au bon
ratio portant le nom du cliché attendu.

- [ ] **1. Façade depuis la rue**, portail bleu ouvert, fin d'après-midi
- [ ] **2. Le cliché du hero** — une voiture sur pont ET un moteur hors-bord dans
      le même plan. C'est la photo qui raconte toute l'histoire du site. Si une
      seule photo doit être réussie, c'est celle-là.
- [ ] **3. Nabil au travail**, dans l'atelier, pas posé face caméra
- [ ] **4. Mains sur un moteur**, plan serré, lumière rasante
- [ ] **5. Le mur de pièces détachées**
- [ ] **6. Un jet-ski ou un hors-bord démonté**
- [ ] **7. Deux ou trois véhicules du parc**, trois-quarts avant, fond propre
- [ ] **8. Un détail de texture** : tôle ondulée, établi, clé dynamométrique

Format : 3:2 ou 16:9, la plus grande définition disponible (je génère les
déclinaisons AVIF/WebP en 640/1024/1600/2400). **Photos de téléphone acceptées**
si elles sont nettes et prises en lumière naturelle — mieux vaut un vrai atelier
au smartphone qu'une image de banque.

### Les avis
- [ ] **Export des 61 avis Google** (auteur, note, date, texte).
      En attendant, six emplacements `PLACEHOLDER-AVIS` occupent la page.
- [ ] **L'ancienneté des clients quand elle est connue.** Le plan trie les avis
      par ancienneté et affiche « CLIENT DEPUIS 2014 » — c'est l'argument le plus
      fort du garage et personne dans le coin ne l'exploite. Là où l'avis ne le
      dit pas, la ligne disparaît : elle n'est pas devinée.

### Le périmètre nautique
- [ ] Marques de moteurs réellement travaillées (Yamaha seulement, ou toutes ?)
- [ ] **Hivernage : proposé ou non ?** Le plan lui donne une ligne dans la grille
      de tarifs et une puce dans le pôle nautique.
- [ ] Capacité de levage / de manutention (jusqu'à quelle taille de bateau ?)
- [ ] Jet-skis : entretien seulement, ou aussi vente et location ?

### Le dépannage
- [ ] **Rayon d'intervention** en km ou en communes
- [ ] Tarification : forfait de déplacement, prix au km, majoration de nuit ?
- [ ] Amplitude horaire réelle du 01 72 89 53 89 — est-ce du 24/7 ou les horaires
      de l'atelier ? À ne pas promettre à tort.

### Les véhicules d'occasion
- [ ] Lien exact de la boutique leboncoin
- [ ] Le stock à afficher, ou bien renvoie-t-on uniquement vers leboncoin ?
      (Deux stratégies : le stock sur le site est meilleur pour le SEO mais
      demande une mise à jour ; le renvoi est sans entretien.)
- [ ] Y a-t-il une garantie sur les véhicules vendus, et de quelle durée ?

---

## 🟡 CONFORT — améliore le site, ne le bloque pas

- [ ] **Faut-il citer Michel Marine** dans le repère d'accès (« portail bleu, à
      côté de Michel Marine ») ? C'est un excellent repère pour trouver l'entrée,
      mais ça dépend de votre relation commerciale. À confirmer avant publication.
- [ ] Le prénom de la personne qui répond au téléphone — plusieurs avis la
      trouvent agréable, c'est un atout humain et il est anonyme aujourd'hui.
      Ne rien publier sans son accord.
- [ ] Photo et prénom d'Azzedine, second mécanicien cité dans les avis
      (même réserve : son accord).
- [ ] L'année exacte de création. Le brief dit « 20 ans d'expérience » ; le site
      affiche « depuis 2005 ». À confirmer : est-ce l'expérience de Nabil ou
      l'ancienneté du garage à cette adresse ?
- [ ] Certification Vroomly : avez-vous un logo ou un lien de profil à afficher ?
- [ ] Réseaux sociaux, s'il y en a
- [ ] Y a-t-il un véhicule de courtoisie ou de prêt ? C'est un argument fort et
      il n'apparaît nulle part.
- [ ] Acceptez-vous le paiement en plusieurs fois ? (paiement : espèces et CB
      confirmés)

---

## Notes de méthode

**Sur les avis.** Aucun avis n'est cité mot pour mot au-delà d'une quinzaine de
mots, et aucun avis n'est inventé. La note 4,6/5 sur 61 avis s'affiche avec
attribution claire à Google et lien vers la fiche, **mais n'est pas balisée en
`aggregateRating` dans le JSON-LD** : Google interdit de marquer ainsi des avis
qu'on n'a pas collectés soi-même, et c'est un motif de sanction manuelle.

**Sur les délais.** Plusieurs avis signalent une attente longue quand il y a du
monde, et un délai annoncé non tenu. Le site ne promet donc **jamais** de durée
d'intervention. La formulation retenue est « on vous rappelle avec un créneau »,
jamais « réparé en une heure ». Une promesse non tenue coûte un avis à une étoile.

**Sur les prix Vroomly.** Ce sont des moyennes publiées par une plateforme tierce.
Elles servent d'ordre de grandeur pour amorcer la discussion avec Nabil, et
**rien d'autre**. Elles ne seront jamais mises en ligne telles quelles.

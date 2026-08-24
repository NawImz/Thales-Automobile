---
name: seo-local-garage
description: SEO local pour un garage — JSON-LD AutoRepair, interdiction d'aggregateRating sur des avis non collectés, pages à intention unique. À lire avant d'écrire le moindre balisage structuré ou title.
---

# SEO local — garage auto et nautique

## ⚠️ L'interdiction qui coûte cher

**Ne jamais baliser `aggregateRating` avec la note Google.** Les consignes de Google
interdisent de marquer en `AggregateRating` des avis qu'on n'a pas collectés
soi-même — c'est un motif de **sanction manuelle**, pas un simple avertissement.

La note se montre **visuellement**, attribuée à Google, avec un lien vers la fiche.
C'est tout aussi convaincant pour l'humain et sans risque.

## JSON-LD `AutoRepair`

Type `AutoRepair` (sous-type de `AutomotiveBusiness` et `LocalBusiness`). Champs à
renseigner depuis `garage.json`, **jamais en dur** :

`name` · `address` (PostalAddress complète) · `geo` (GeoCoordinates) ·
`telephone` · `openingHoursSpecification` · `areaServed` · `makesOffer` /
`hasOfferCatalog` pour les prestations · `url` · `image` · `priceRange`

- `FAQPage` **uniquement là où une FAQ est réellement visible** à l'écran. Baliser
  une FAQ absente est du contenu masqué.
- `BreadcrumbList` sur les pages internes.
- Vérifier le balisage **en le parsant depuis la page rendue**, pas en relisant le
  code source — c'est là qu'on voit les valeurs `undefined` sérialisées.

## Structure

Une page = une intention. `/tarifs` et `/bateaux-jet-ski` existent parce qu'on
cherche « prix vidange Épinay » et « réparation hors-bord 93 », pas parce qu'il
faut remplir un menu.

- `title` et `description` uniques par page, canoniques **absolues**.
- Open Graph par page, image 1200×630 générée depuis la photo de la page.
- Sitemap via `@astrojs/sitemap`.

## L'angle stratégique de ce client

Deux différenciateurs mesurés, à exploiter dans les titres et le contenu :

1. **Les prix affichés.** Aucun concurrent du 93 n'en publie. La page `/tarifs`
   est la page qui rapporte.
2. **Auto ET nautique dans le même atelier.** Quasiment unique en Île-de-France,
   et un champ sémantique que personne ne dispute localement.

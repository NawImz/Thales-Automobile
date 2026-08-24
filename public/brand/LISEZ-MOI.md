# /public/brand/ — le logo va ici

**Ce dossier est vide, et c'est bloquant.**

Le logo n'a pas pu être récupéré : collé dans un message de conversation, il
m'est montré mais n'est **jamais écrit sur le disque** du conteneur. Les trois
modèles 3D de la session précédente, eux, étaient bien arrivés — ils avaient été
joints **en tant que fichiers**, pas collés dans le texte.

## Comment le fournir

Joignez-le **en pièce jointe / fichier** (comme un `.glb` ou un `.pdf`), pas en
image collée dans le message. Format : PNG haute définition ou SVG.

## Ce qui se débloque à ce moment-là

```bash
node scripts/echantillonner-logo.mjs public/brand/logo.png   # les hex exacts
# reporter les valeurs dans design/palette.json, puis :
node scripts/generer-tokens.mjs                              # régénère le CSS
node scripts/contraste.mjs                                   # revalide les paires
```

1. **La palette réelle.** Les valeurs actuelles sont provisoires et marquées
   `"_echantillonne": false` dans `design/palette.json`.
2. **Le calage typographique.** L'appariement avec Familjen Grotesk se tranche
   par superposition, pas au jugé.
3. **Le mot-symbole de l'en-tête**, aujourd'hui composé en typographie.
4. **Les favicons et l'image Open Graph**, dérivés de l'élément signature.
5. **La forme de fermeture de la ligne signature**, qui doit retomber sur le logo.

## Pourquoi il n'y a pas de faux logo ici

Un placeholder graphique finit toujours par être pris pour la charte. Le nom est
donc composé en typographie dans l'en-tête — c'est honnête, ça tient visuellement,
et le remplacement ne touchera qu'un seul composant.

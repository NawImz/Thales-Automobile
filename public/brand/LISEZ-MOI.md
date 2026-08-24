# /public/brand/

| Fichier | Contenu | État |
|---|---|---|
| `logo.webp` | le logo, 100 × 100 px | ✅ reçu le 24/08/2026, échantillonné |
| `facade-portail-bleu.webp` | la devanture, 1360 × 765 px | ✅ reçue |

## Ce qui a été extrait du logo

```
accent (trait de la voiture) : #2A7687
encre  (lettrage et clé)     : #0E1015
```

Mesurés par `scripts/echantillonner-logo.mjs`, puis propagés dans
`design/palette.json` → `scripts/generer-tokens.mjs` → `src/styles/tokens.css`.

⚠️ Le tri par fréquence ne trouve **pas** le turquoise : le trait est fin, il
pèse ~3 % des pixels. Il faut trier par **chromie**. Si vous refaites la mesure
un jour, c'est le piège.

## Ce qui manque encore

**Un logo en vectoriel ou en haute définition.** 100 × 100 px suffit pour la
couleur, pas pour les favicons, l'image Open Graph, ni pour dessiner la forme sur
laquelle la ligne signature doit se refermer.

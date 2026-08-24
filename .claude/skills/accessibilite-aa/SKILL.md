---
name: accessibilite-aa
description: WCAG 2.2 AA appliqué à ce site — méthode de vérification des contrastes paire par paire, focus visible sur fond clair ET sombre, cibles tactiles, zoom 200%. À lire avant toute décision de couleur et avant de déclarer un bloc terminé.
---

# WCAG 2.2 AA — non négociable

## Contrastes : on mesure, on ne juge pas à l'œil

`node scripts/contraste.mjs` calcule les ratios de toutes les paires réellement
utilisées et sort un tableau. **Il s'exécute à nouveau après tout changement de
palette** — une teinte déplacée de deux points casse une paire sans prévenir.

Seuils : **4,5:1** texte normal · **3:1** texte ≥ 24 px ou ≥ 19 px gras, et
composants d'interface (bordures de champs, icônes porteuses de sens).

⚠️ Piège payé sur le projet précédent : un gris de charte donné par le client
comme « texte secondaire » plafonnait à 2,67:1 — sous le seuil de 3:1 réservé aux
composants, donc inutilisable même pour une bordure. La charte du client n'est pas
une autorisation : elle se vérifie.

## Focus visible

Double anneau `box-shadow` — un trait clair **et** un trait foncé — jamais une
couleur unique. Une couleur unique disparaît sur l'un des deux fonds ; vécu.

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--blanc-atelier), 0 0 0 4px var(--encre);
}
```

Le focus est **instantané** : aucun `steps()`, aucune transition (voir
`animation-cliquet`).

## Le reste de la liste

- Cibles tactiles **≥ 44 px** partout — burger, fermeture de lightbox, cases de
  l'estimateur, barre d'action mobile.
- **Un seul `<h1>` par page**, hiérarchie de titres sans saut de niveau.
- Navigation clavier intégrale, ordre de tabulation conforme à l'ordre visuel,
  lien d'évitement en tête de document.
- Champs étiquetés (`<label for>`), erreurs annoncées en `aria-live="polite"`.
- Lisible à **200 % de zoom** sans défilement horizontal.
- `alt` partout ; `aria-hidden` sur le décoratif (ligne signature comprise).
- La ligne signature est décorative : elle ne doit jamais porter d'information
  qui n'existe pas aussi en texte.

## Vérification finale

`axe-core` sur les trois pages principales, plus un passage clavier manuel :
on tabule du haut de la page jusqu'au pied sans jamais perdre le focus de vue.

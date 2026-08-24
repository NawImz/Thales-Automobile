---
name: animation-cliquet
description: Le langage de mouvement de ce site — tout s'encliquette, rien ne glisse. Règles du cliquet (steps), de la ligne signature en stroke-dashoffset, des compteurs odomètre, et le plancher reduced-motion. À lire avant d'écrire la moindre animation.
---

# Le langage du cliquet

Règle unique dont tout découle : **rien ne glisse en douceur, tout s'encliquette.**
On ne sait pas nommer l'effet quand on le voit, on le sent. C'est la texture d'une
clé à cliquet, et c'est ce qui sépare un site cher d'un site propre.

## La fonction de transition

```css
--cliquet: steps(4, end);
--duree-cliquet: 120ms;
```

Appliquée aux survols et aux changements d'état. **Trois garde-fous :**

1. **Jamais sur un anneau de focus.** Un focus qui apparaît par paliers paraît
   cassé et nuit à l'accessibilité. Le focus est instantané.
2. **Jamais sur un déplacement supérieur à un cran.** `steps(4)` sur 40 px se voit
   comme du saccadé, pas comme de la mécanique. Plafond : ~8 px, ou une rotation
   de 30°.
3. **Jamais sur l'opacité seule.** Un fondu par paliers ressemble à un bug de
   rafraîchissement. Le cliquet s'applique aux `transform` et aux fonds.

## La ligne signature — métamorphoses sans plugin payant

Un seul `<svg>` en `sticky`, un seul `<path>`, `stroke-dashoffset` piloté par
ScrollTrigger en `scrub: 1`.

⚠️ **GSAP MorphSVG est un plugin Club, absent de ce projet.** La seule façon
honnête d'interpoler un `d` est donc que **toutes les formes clés partagent une
structure de commandes strictement identique** : même nombre de commandes, mêmes
types, dans le même ordre. On interpole alors les nombres deux à deux.

Conséquence pratique : chaque forme (voiture, disque de frein, coque, hélice, logo)
s'écrit `M` + N×`C`, avec le **même N**. Un validateur doit faire échouer le build
si deux formes divergent — sinon la métamorphose part en vrille silencieusement.

```
vector-effect: non-scaling-stroke   /* épaisseur constante quel que soit le viewBox */
```

## Compteurs odomètre

Molettes verticales, chiffres en monospace à chasse tabulaire, déclenchées **une
seule fois** à l'entrée dans le viewport (`once: true`).
⚠️ Jamais de compteur sur un chiffre inventé : 20 ans, 61 avis, 4,6 et les prix
viennent tous de `garage.json` ou du barème.

## Plancher `prefers-reduced-motion: reduce`

Pas de version « réduite » : une version **sans mouvement**.

- Lenis n'est pas instancié du tout (pas « ralenti »).
- La ligne signature s'affiche d'emblée dans son état final (`stroke-dashoffset: 0`).
- Les cliquets deviennent des changements instantanés.
- Les compteurs affichent directement la valeur finale.

Chaque script commence par le `matchMedia`. Les animations CSS ont leur bloc
`@media (prefers-reduced-motion: reduce)`.

## Interdits (brief client, non négociables)

Parallaxe généralisée · fondu de chaque paragraphe · curseur personnalisé · texte
réassemblé lettre par lettre · sections collées au scroll · effets sonores ·
particules · tout ce qui bouge en permanence sans déclenchement.

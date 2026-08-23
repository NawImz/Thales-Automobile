/**
 * Les deux profils du trait signature : ce qui roule, ce qui flotte.
 *
 * Contrainte absolue : structure de commandes IDENTIQUE (M + 10 × C).
 * C'est ce qui permet d'interpoler les deux tracés sans plugin de
 * morphing — on lerp les coordonnées une à une. Toute modification doit
 * conserver dix segments cubiques de chaque côté, et une correspondance
 * de topologie : les deux partent en bas à gauche, montent, passent par
 * le haut, redescendent à droite et referment par le dessous.
 */

export const VOITURE =
  'M 80 240 ' +
  'C 62 238 52 226 56 208 ' +    // pare-chocs arrière
  'C 60 192 84 186 112 183 ' +   // coffre
  'C 152 179 176 146 208 128 ' + // custode
  'C 250 110 300 102 350 101 ' + // pavillon arrière
  'C 400 100 448 104 486 113 ' + // pavillon avant
  'C 512 120 532 132 556 148 ' + // montant de pare-brise
  'C 586 168 612 180 650 186 ' + // bas de pare-brise
  'C 712 192 764 193 812 196 ' + // capot
  'C 852 199 886 208 892 240 ' + // museau, descente au pare-chocs
  'C 892 256 700 256 96 244';    // soubassement, retour au départ

export const BATEAU =
  'M 80 246 ' +
  'C 74 224 76 200 82 176 ' +    // tableau arrière
  'C 84 168 88 163 98 160 ' +    // livet arrière
  'C 180 154 260 149 342 143 ' + // liston arrière
  'C 432 137 522 129 604 118 ' + // liston milieu
  'C 686 106 756 92 816 78 ' +   // liston avant
  'C 856 68 884 62 904 58 ' +    // tête d'étrave
  'C 912 78 912 118 902 152 ' +  // étrave élancée
  'C 890 190 862 220 824 238 ' + // brion
  'C 736 254 596 260 416 259 ' + // carène
  'C 298 258 176 254 96 248';    // retour au tableau

/** Extrait les nombres d'un tracé, dans l'ordre. */
export function nombres(d: string): number[] {
  return d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
}

/** Reconstruit un tracé de même structure à partir d'une liste de nombres. */
export function reconstruire(gabarit: string, valeurs: number[]): string {
  let i = 0;
  return gabarit.replace(/-?\d+(?:\.\d+)?/g, () => String(Math.round(valeurs[i++] * 100) / 100));
}

const A = nombres(VOITURE);
const B = nombres(BATEAU);

/** Interpole les deux profils. t = 0 → voiture, t = 1 → bateau. */
export function melanger(t: number): string {
  return reconstruire(VOITURE, A.map((v, i) => v + (B[i] - v) * t));
}

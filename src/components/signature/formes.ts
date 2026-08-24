/**
 * Les formes de la ligne signature, et la garantie qu'elles sont morphables.
 *
 * ⚠️ CONTRAINTE FONDATRICE : GSAP MorphSVG est un plugin Club, payant, absent
 * du projet (vérifié). La seule interpolation honnête d'un attribut `d` exige
 * donc que TOUTES les formes partagent une structure de commandes strictement
 * identique — même nombre, mêmes types, même ordre. On interpole alors les
 * nombres deux à deux.
 *
 * Plutôt que d'écrire ces `d` à la main et d'espérer qu'ils concordent, chaque
 * forme est décrite par exactement N points et convertie en courbes par le même
 * code. La structure est identique PAR CONSTRUCTION, pas par discipline.
 */

/** Nombre de points par forme. Toute forme en a exactement autant. */
export const N = 12;

type Point = [number, number];

/**
 * Profil de voiture, vu de côté.
 *
 * ⚠️ Une silhouette de voiture en UN seul contour fermé n'a ni roues ni
 * vitres : tout se joue sur la « serre » — capot bas, montant de pare-brise
 * incliné, pavillon court, custode qui retombe. Première version trop lissée :
 * elle se lisait comme un nuage (vérifié en la rendant, pas en l'imaginant).
 */
const VOITURE: Point[] = [
  [6, 66], [6, 54], [20, 50], [34, 48], [48, 30], [70, 28],
  [84, 46], [100, 50], [106, 56], [106, 66], [72, 70], [36, 70],
];

/**
 * Disque de frein.
 * Un cercle nu serait quelconque : le disque se reconnaît à ses perçages, donc
 * le rayon ondule légèrement — assez pour évoquer un disque ventilé, pas assez
 * pour bruiter la silhouette.
 */
const DISQUE: Point[] = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return [56 + Math.cos(a) * 34, 46 + Math.sin(a) * 34] as Point;
});

/** Filtre à huile : cylindre à col, en silhouette. */
const FILTRE: Point[] = [
  [40, 14], [72, 14], [76, 22], [76, 34], [78, 46], [78, 64],
  [72, 74], [40, 74], [34, 64], [34, 46], [36, 34], [36, 22],
];

/** Coque de bateau, vue de côté. */
const COQUE: Point[] = [
  [10, 44], [30, 44], [52, 44], [74, 44], [96, 44], [104, 46],
  [98, 60], [86, 70], [62, 74], [40, 74], [24, 68], [14, 54],
];

/** Hélice : trois pales autour d'un moyeu. */
const HELICE: Point[] = Array.from({ length: N }, (_, i) => {
  const t = i / N;
  const a = t * Math.PI * 2 - Math.PI / 2;
  // Rayon modulé trois fois par tour : trois pales.
  const r = 16 + 22 * Math.abs(Math.sin(t * Math.PI * 3));
  return [56 + Math.cos(a) * r, 46 + Math.sin(a) * r] as Point;
});

/**
 * ⚠️ La tension est PROPRE À CHAQUE FORME, et c'est nécessaire.
 * Une tension unique ne peut pas servir les deux extrêmes : à 11 la voiture se
 * lit enfin, mais le disque devient un hexagone — il ressemble à un écrou, pas
 * à un disque de frein. Mesuré en rendant les formes, pas en les imaginant.
 * Elle est interpolée avec les points pendant le morph, donc la structure de
 * commandes reste identique : `M` + N×`C`, quoi qu'il arrive.
 */
export const FORMES = {
  voiture: { points: VOITURE, tension: 11 },
  disque:  { points: DISQUE,  tension: 5.6 },
  filtre:  { points: FILTRE,  tension: 9 },
  coque:   { points: COQUE,   tension: 8 },
  helice:  { points: HELICE,  tension: 7 },
} as const;

export type NomForme = keyof typeof FORMES;
export type Forme = { points: readonly Point[]; tension: number };

/**
 * Convertit N points en un chemin fermé de N courbes cubiques, par
 * Catmull-Rom. Le résultat a TOUJOURS la signature `M` + N×`C`.
 */
export function versChemin(points: readonly Point[], t = 8): string {
  const p = points;
  const n = p.length;
  let d = `M${p[0][0].toFixed(2)},${p[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / t, p1[1] + (p2[1] - p0[1]) / t];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / t, p2[1] - (p3[1] - p1[1]) / t];
    d += `C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

/**
 * Interpole deux formes — points ET tension. Structure identique garantie,
 * puisque les deux formes ont N points et passent par le même convertisseur.
 */
export function melanger(a: Forme, b: Forme, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const points = a.points.map((pa, i) => [
    pa[0] + (b.points[i][0] - pa[0]) * k,
    pa[1] + (b.points[i][1] - pa[1]) * k,
  ] as Point);
  return versChemin(points, a.tension + (b.tension - a.tension) * k);
}

/**
 * Garde-fou de build : toutes les formes ont-elles bien N points ?
 * Sans lui, une forme mal dessinée part en vrille SANS erreur console —
 * juste un gribouillis qu'on met une heure à diagnostiquer.
 */
export function verifierFormes(): void {
  const fautives = Object.entries(FORMES)
    .filter(([, f]) => f.points.length !== N)
    .map(([nom, f]) => `${nom} (${f.points.length} points au lieu de ${N})`);
  if (fautives.length) {
    throw new Error(
      'Formes de la ligne signature non morphables : ' + fautives.join(', ') +
      '. Toutes doivent avoir exactement ' + N + ' points.',
    );
  }
}

/**
 * Les formes de l'emblème signature.
 *
 * ⚠️ CONTRAINTE FONDATRICE : GSAP MorphSVG est un plugin Club, payant, absent
 * du projet. La seule interpolation honnête d'un `d` exige que toutes les
 * formes partagent une structure de commandes identique. Chaque forme est donc
 * décrite par un nombre FIXE de pièces, chacune d'un nombre FIXE de points, et
 * converties par le même code : la structure est identique par construction.
 *
 * Chaque forme compte PIECES dessins — une carrosserie plus ses deux roues, une
 * coque plus sa cabine et son moteur. Un contour unique ne pouvait pas porter
 * de roues, et une voiture sans roues ne se lit pas.
 */

export const N = 12;      // points par pièce
export const PIECES = 3;  // pièces par forme

type Point = [number, number];
type Piece = { points: Point[]; tension: number; fermee: boolean };

/** Cercle échantillonné sur N points. */
function cercle(cx: number, cy: number, r: number): Point[] {
  return Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Point;
  });
}

/** Répartit des points le long d'une polyligne, pour atteindre exactement N. */
function eEchantillonner(sommets: Point[]): Point[] {
  const longueurs: number[] = [];
  let total = 0;
  for (let i = 0; i < sommets.length - 1; i++) {
    const d = Math.hypot(sommets[i + 1][0] - sommets[i][0], sommets[i + 1][1] - sommets[i][1]);
    longueurs.push(d);
    total += d;
  }
  const sortie: Point[] = [];
  for (let k = 0; k < N; k++) {
    let cible = (k / N) * total;
    let i = 0;
    while (i < longueurs.length - 1 && cible > longueurs[i]) { cible -= longueurs[i]; i++; }
    const t = longueurs[i] ? cible / longueurs[i] : 0;
    sortie.push([
      sommets[i][0] + (sommets[i + 1][0] - sommets[i][0]) * t,
      sommets[i][1] + (sommets[i + 1][1] - sommets[i][1]) * t,
    ]);
  }
  return sortie;
}

// ── LA VOITURE ────────────────────────────────────────────────────────────
// Une berline de profil : capot bas, montant incliné, pavillon court, custode
// qui retombe. Et surtout DEUX ROUES — sans elles, ça ne se lit pas.
const VOITURE: Piece[] = [
  { points: eEchantillonner([
      [6, 60], [8, 48], [24, 44], [38, 42], [50, 26], [70, 25],
      [82, 42], [100, 46], [106, 52], [106, 60], [6, 60],
    ]), tension: 13, fermee: true },
  { points: cercle(28, 62, 9), tension: 5.6, fermee: true },
  { points: cercle(86, 62, 9), tension: 5.6, fermee: true },
];

// ── LE DISQUE DE FREIN ────────────────────────────────────────────────────
const DISQUE: Piece[] = [
  { points: cercle(56, 46, 34), tension: 5.6, fermee: true },
  { points: cercle(56, 46, 19), tension: 5.6, fermee: true },
  { points: cercle(56, 46, 7), tension: 5.6, fermee: true },
];

// ── LE BATEAU À MOTEUR ────────────────────────────────────────────────────
// Coque, cabine, et le hors-bord à l'arrière — c'est lui qui fait « bateau à
// moteur » plutôt que « barque ».
const BATEAU: Piece[] = [
  { points: eEchantillonner([
      [8, 46], [104, 46], [96, 62], [82, 70], [40, 72], [22, 66], [8, 46],
    ]), tension: 12, fermee: true },
  { points: eEchantillonner([
      [36, 46], [42, 30], [70, 30], [76, 46], [36, 46],
    ]), tension: 13, fermee: true },
  { points: eEchantillonner([
      [104, 40], [112, 40], [112, 52], [108, 60], [104, 52], [104, 40],
    ]), tension: 13, fermee: true },
];

// ── L'HÉLICE ──────────────────────────────────────────────────────────────
const HELICE: Piece[] = [
  { points: Array.from({ length: N }, (_, i) => {
      const t = i / N;
      const a = t * Math.PI * 2 - Math.PI / 2;
      const r = 14 + 24 * Math.abs(Math.sin(t * Math.PI * 3));
      return [56 + Math.cos(a) * r, 46 + Math.sin(a) * r] as Point;
    }), tension: 7, fermee: true },
  { points: cercle(56, 46, 11), tension: 5.6, fermee: true },
  { points: cercle(56, 46, 4), tension: 5.6, fermee: true },
];

export const FORMES = { voiture: VOITURE, disque: DISQUE, bateau: BATEAU, helice: HELICE } as const;
export type NomForme = keyof typeof FORMES;

/** Une pièce en un chemin fermé de N cubiques. Signature : `M` + N×`C`. */
export function versChemin(points: readonly Point[], t = 8): string {
  const p = points;
  const n = p.length;
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / t, p1[1] + (p2[1] - p0[1]) / t];
    const c2 = [p2[0] - (p3[0] - p1[0]) / t, p2[1] - (p3[1] - p1[1]) / t];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Interpole deux formes, pièce à pièce. Renvoie PIECES chemins. */
export function melanger(a: Piece[], b: Piece[], k: number): string[] {
  const t = Math.max(0, Math.min(1, k));
  return a.map((pa, i) => {
    const pb = b[i];
    const pts = pa.points.map((p, j) => [
      p[0] + (pb.points[j][0] - p[0]) * t,
      p[1] + (pb.points[j][1] - p[1]) * t,
    ] as Point);
    return versChemin(pts, pa.tension + (pb.tension - pa.tension) * t);
  });
}

/**
 * ⚠️ LE POINT DE PERFORMANCE.
 * Recalculer les chemins à chaque image de défilement oblige le navigateur à
 * reparser le tracé et à repeindre une couche fixe 60 fois par seconde : c'est
 * ce qui faisait ramer le site. On précalcule donc `pas` états une seule fois,
 * au chargement, et le défilement ne fait plus qu'un `setAttribute` — et
 * seulement quand l'indice change réellement.
 */
export function precalculer(etapes: Piece[][], pas = 90): string[][] {
  const table: string[][] = [];
  for (let i = 0; i < pas; i++) {
    const p = (i / (pas - 1)) * (etapes.length - 1);
    const j = Math.min(etapes.length - 2, Math.floor(p));
    const t = p - j;
    // Palier : la forme se stabilise entre deux étapes au lieu de muter en
    // permanence — sinon la page entière a l'air de frétiller.
    const lisse = t < 0.3 ? 0 : t > 0.8 ? 1 : (t - 0.3) / 0.5;
    table.push(melanger(etapes[j], etapes[j + 1], lisse));
  }
  return table;
}

/** Garde-fou de build : structure identique, sinon la métamorphose part en vrille. */
export function verifierFormes(): void {
  const fautes: string[] = [];
  for (const [nom, pieces] of Object.entries(FORMES)) {
    if (pieces.length !== PIECES) fautes.push(`${nom} : ${pieces.length} pièces au lieu de ${PIECES}`);
    pieces.forEach((p, i) => {
      if (p.points.length !== N) fautes.push(`${nom}[${i}] : ${p.points.length} points au lieu de ${N}`);
    });
  }
  if (fautes.length) throw new Error('Formes non morphables — ' + fautes.join(' ; '));
}

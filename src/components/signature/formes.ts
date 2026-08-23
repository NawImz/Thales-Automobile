/**
 * Les deux profils, convertis en volumes 3D.
 *
 * On ne modélise pas la voiture avec des primitives — ça ferait jouet.
 * On extrude les deux tracés déjà validés (10 cubiques chacun, structure
 * identique) en volumes biseautés. Même nombre de segments de courbe des
 * deux côtés, donc même nombre de sommets : la déformation voiture →
 * coque devient une simple interpolation d'attribut de position.
 */
import type * as THREE_NS from 'three';
import { nombres, melanger, VOITURE, BATEAU } from './traces';

/** Segments par courbe. Identique pour les deux formes, non négociable. */
export const SEGMENTS = 16;

/** Boîte du tracé source, pour recentrer et mettre à l'échelle. */
const LARGEUR = 1000;
const HAUTEUR = 320;
const ECHELLE = 6 / LARGEUR;
/**
 * Le tracé n'occupe que la moitié basse de sa boîte : brut, le volume
 * sort à 5,4:1 et se lit « chausson » plutôt que voiture. On étire donc
 * la hauteur pour retrouver des proportions d'automobile (~3:1).
 */
const ETIREMENT_Y = 1.45;

/**
 * Construit une Shape à partir des 62 nombres d'un tracé.
 * L'axe Y du SVG descend, celui de three monte : on inverse.
 */
export function versShape(THREE: typeof THREE_NS, d: string): THREE_NS.Shape {
  const n = nombres(d);
  const X = (v: number) => (v - LARGEUR / 2) * ECHELLE;
  const Y = (v: number) => -(v - HAUTEUR / 2) * ECHELLE * ETIREMENT_Y;

  const shape = new THREE.Shape();
  shape.curves.length = 0;
  shape.moveTo(X(n[0]), Y(n[1]));
  for (let i = 0; i < 10; i++) {
    const o = 2 + i * 6;
    shape.bezierCurveTo(X(n[o]), Y(n[o + 1]), X(n[o + 2]), Y(n[o + 3]), X(n[o + 4]), Y(n[o + 5]));
  }
  shape.closePath();
  return shape;
}

export const REGLAGES_EXTRUSION_Z = 1.35;

export const REGLAGES_EXTRUSION = {
  depth: REGLAGES_EXTRUSION_Z,
  bevelEnabled: true,
  bevelThickness: 0.11,
  bevelSize: 0.11,
  bevelOffset: 0,
  bevelSegments: 4,
  curveSegments: SEGMENTS,
};

/** Roues, déduites des cercles du tracé source (cx 285 et 735, cy 240, r 48). */
export const ROUES = {
  x: [(285 - LARGEUR / 2) * ECHELLE, (735 - LARGEUR / 2) * ECHELLE] as const,
  y: -(240 - HAUTEUR / 2) * ECHELLE * ETIREMENT_Y,
  rayon: 48 * ECHELLE * 1.15,
  /** Demi-épaisseur du volume : les roues doivent dépasser, pas s'enfouir. */
  z: REGLAGES_EXTRUSION_Z / 2 + 0.1,
};

function extruder(THREE: typeof THREE_NS, d: string) {
  const g = new THREE.ExtrudeGeometry(versShape(THREE, d), REGLAGES_EXTRUSION);
  // L'extrusion part de z = 0 vers +Z : sans recentrage, le volume
  // tournerait autour d'un axe décalé d'une demi-épaisseur.
  g.translate(0, 0, -REGLAGES_EXTRUSION_Z / 2);
  return g;
}

export function geometrieVoiture(THREE: typeof THREE_NS) {
  return extruder(THREE, VOITURE);
}

export function geometrieBateau(THREE: typeof THREE_NS) {
  return extruder(THREE, BATEAU);
}

/**
 * Volume d'un profil interpolé.
 *
 * ⚠️ On RECONSTRUIT plutôt que de déplacer les sommets d'une géométrie
 * existante : ExtrudeGeometry triangule les faces d'about pour la forme
 * de départ, et déplacer ces sommets vers un autre contour replie les
 * triangles sur eux-mêmes — la coque se déchirait en éclats noirs.
 * Mesuré à ~1,6 ms par reconstruction, largement dans le budget d'une
 * frame.
 */
export function geometrieMelangee(THREE: typeof THREE_NS, t: number) {
  return extruder(THREE, melanger(t));
}

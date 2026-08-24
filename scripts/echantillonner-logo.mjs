/**
 * Pipette le logo et sort les hex EXACTS de ses couleurs dominantes.
 *
 *   node scripts/echantillonner-logo.mjs public/brand/logo.png
 *   node scripts/echantillonner-logo.mjs public/brand/logo.svg   (rasterise d'abord)
 *
 * Méthode : quantification par pas de 16 pour regrouper, tri par fréquence,
 * puis re-moyenne des pixels proches de chaque cluster pour retrouver la valeur
 * exacte — quantifier seul donnerait un hex arrondi, donc faux.
 *
 * Les pixels transparents et le fond blanc pur sont écartés : ils dominent
 * toujours un logo et masqueraient l'accent qu'on cherche.
 */
import sharp from 'sharp';

const fichier = process.argv[2];
if (!fichier) {
  console.error('usage : node scripts/echantillonner-logo.mjs <chemin du logo>');
  process.exit(1);
}

const LARGEUR = 200;
const { data, info } = await sharp(fichier)
  .resize(LARGEUR, null, { fit: 'inside' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = [];
for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 200) continue;                     // transparent
  if (r > 246 && g > 246 && b > 246) continue; // fond blanc
  px.push([r, g, b]);
}
if (!px.length) { console.error('aucun pixel exploitable'); process.exit(1); }

const paquets = new Map();
for (const [r, g, b] of px) {
  const cle = [r, g, b].map((v) => Math.round(v / 16) * 16).join(',');
  (paquets.get(cle) ?? paquets.set(cle, []).get(cle)).push([r, g, b]);
}

const hex = (n) => n.toString(16).padStart(2, '0');
const lum = (c) => {
  const [r, g, b] = c.map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const clusters = [...paquets.entries()]
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 8)
  .map(([, membres]) => {
    const moy = [0, 1, 2].map((k) => Math.round(membres.reduce((s, m) => s + m[k], 0) / membres.length));
    return { hex: '#' + moy.map(hex).join(''), rgb: moy, part: membres.length / px.length, lum: lum(moy) };
  });

console.log(`\n  ${fichier} — ${px.length} pixels retenus sur ${LARGEUR}px de large\n`);
console.log('  part     hex        rgb                luminance');
for (const c of clusters) {
  console.log(
    `  ${(c.part * 100).toFixed(1).padStart(5)}%   ${c.hex}   ${String(c.rgb.join(',')).padEnd(16)} ${c.lum.toFixed(4)}`,
  );
}
console.log('\n  → l\'encre est le cluster le plus sombre, l\'accent le plus saturé.');
console.log('  → reporter ces hex dans DESIGN-PLAN.md §2, puis relancer scripts/contraste.mjs\n');

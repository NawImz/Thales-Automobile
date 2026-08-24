/**
 * Vérifie chaque paire texte/fond réellement utilisée, en WCAG 2.2.
 *
 *   node scripts/contraste.mjs
 *
 * À relancer après TOUT changement de palette : une teinte déplacée de deux
 * points casse une paire sans prévenir. Sort en code 1 si une paire échoue,
 * pour pouvoir brancher le script sur le build.
 */
import { readFileSync } from 'node:fs';

const palette = JSON.parse(readFileSync(new URL('../design/palette.json', import.meta.url)));

const lum = (h) => {
  const c = h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const SEUILS = { corps: 4.5, grand: 3, interface: 3 };

let echecs = 0;
console.log('\n  usage                            devant     derriere   ratio   seuil  ');
console.log('  ' + '-'.repeat(74));
for (const u of palette.usages) {
  const devant = palette.couleurs[u.devant] ?? u.devant;
  const derriere = palette.couleurs[u.derriere] ?? u.derriere;
  const r = ratio(devant, derriere);
  const seuil = SEUILS[u.type];
  const ok = r >= seuil;
  if (!ok) echecs++;
  console.log(
    `  ${u.nom.padEnd(32)} ${devant.padEnd(10)} ${derriere.padEnd(10)} ${r.toFixed(2).padStart(6)}  ${String(seuil).padStart(4)}  ${ok ? 'ok' : 'ECHEC'}`,
  );
}
console.log('  ' + '-'.repeat(74));
console.log(`  ${palette.usages.length} paires, ${echecs} echec(s)\n`);
process.exit(echecs ? 1 : 0);

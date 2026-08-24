/**
 * Génère src/styles/tokens.css depuis design/palette.json.
 *
 *   node scripts/generer-tokens.mjs
 *
 * Pourquoi une génération plutôt qu'un fichier écrit à la main : le brief exige
 * qu'aucun hex ne vive en dur dans un composant, et que la palette reste
 * vérifiable. `design/palette.json` est donc la source unique — le CSS et le
 * contrôle de contraste lisent le MÊME fichier. Impossible qu'ils divergent.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const palette = JSON.parse(readFileSync(new URL('../design/palette.json', import.meta.url)));
const { couleurs, _echantillonne } = palette;

const avertissement = _echantillonne
  ? ''
  : `\n  /* ⚠️ Palette NON échantillonnée : le fichier du logo manque encore.\n`
    + `     Voir TODO-CLIENT.md. Regénérer après réception :\n`
    + `       node scripts/echantillonner-logo.mjs public/brand/<logo>\n`
    + `       node scripts/generer-tokens.mjs && node scripts/contraste.mjs */\n`;

const css = `/* ─────────────────────────────────────────────────────────────
   GÉNÉRÉ PAR scripts/generer-tokens.mjs — NE PAS ÉDITER À LA MAIN.
   La source est design/palette.json.
   ───────────────────────────────────────────────────────────── */
${avertissement}
@theme {
${Object.entries(couleurs).map(([n, v]) => `  --color-${n}: ${v};`).join('\n')}
}
`;

writeFileSync(new URL('../src/styles/tokens.css', import.meta.url), css);
console.log(`  tokens.css régénéré — ${Object.keys(couleurs).length} couleurs`
  + (_echantillonne ? '' : '  ⚠️ palette provisoire'));

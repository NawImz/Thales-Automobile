"""
Assemble un aperçu autonome de l'accueil, publiable en artefact.

    npm run build
    npx esbuild src/scripts/artefact.ts --bundle --format=iife --minify \
      --outfile=.apercu/artefact.js
    python3 scripts/assembler-apercu.py

Pourquoi un fichier unique : la CSP des artefacts bloque tout hôte externe.
CSS inliné, quatre polices en data: URI, JS bundlé en IIFE (dans un fichier
unique il n'y a pas de chunk à charger à la demande, esbuild résout donc les
imports dynamiques sur place).

Les liens WhatsApp et itinéraire restent externes : ce sont des liens de
navigation, pas des chargements de ressources. La CSP ne les bloque pas.
"""

import base64, pathlib, re, glob, os

SP = pathlib.Path('.apercu')
SP.mkdir(exist_ok=True)
html = pathlib.Path('dist/index.html').read_text()
css = pathlib.Path(glob.glob('dist/_astro/*.css')[0]).read_text()
js = (SP / 'artefact.js').read_text()

for f in sorted(glob.glob('public/fonts/*.woff2')):
    nom = os.path.basename(f)
    b64 = base64.b64encode(pathlib.Path(f).read_bytes()).decode()
    avant = css
    css = css.replace('/fonts/' + nom, 'data:font/woff2;base64,' + b64)
    assert css != avant, 'police non referencee dans le CSS : ' + nom
    print('  embarque  %-34s %6.1f Ko base64' % (nom, len(b64)/1024))

corps = re.search(r'<body[^>]*>(.*)</body>', html, re.S).group(1)
corps = re.sub(r'<script type="module" src="[^"]*"></script>', '', corps)
corps = re.sub(r"<script>\s*document\.documentElement\.classList\.remove\(.sans-js.\);\s*</script>", '', corps)

bandeau = (
 '<div style="background:#131619;color:#E9E4D8;font:600 13px/1.5 system-ui,sans-serif;'
 'padding:10px 16px;text-align:center;letter-spacing:.02em">'
 'Aperçu de travail — Phase 3 en cours. Photos, avis et prix sont des emplacements marqués.'
 '</div>'
)

sortie = (
 '<title>Thalès Auto · Bateaux</title>\n<style>\n' + css +
 '\n/* L\'artefact enveloppe la page : on repeint le fond explicitement,\n'
 '   sinon elle emprunte celui de l\'hote selon son theme. */\n'
 ':root, html, body { background-color: #E9E4D8; }\n</style>\n'
 + bandeau + '\n' + corps +
 "\n<script>\ndocument.documentElement.classList.remove('sans-js');\n" + js + '\n</script>\n'
)

cible = SP / 'apercu-thales.html'
cible.write_text(sortie)
print('\n  fichier autonome : %.0f Ko' % (len(sortie)/1024))
externe = re.search(r'(src|href)="https?://', sortie)
print('  aucune URL externe   :', 'oui' if not externe else 'NON -> ' + externe.group(0))
print('  aucun /_astro/       :', 'oui' if '/_astro/' not in sortie else 'NON')
print('  aucun /fonts/        :', 'oui' if '/fonts/' not in sortie else 'NON')
print('  balise title         :', 'oui' if sortie.startswith('<title>') else 'NON')

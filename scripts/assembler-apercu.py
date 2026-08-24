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

# ⚠️ Astro n'écrit PAS tout le CSS dans dist/_astro/. Par défaut
# (`inlineStylesheets: 'auto'`) il inline dans le <head> les feuilles
# plus petites que la limite Vite — c'est le cas des styles scopés des
# composants. Ne ramasser que dist/_astro/*.css les perdait en silence :
# le titre du hero s'affichait « On vous ditce qu'il faut » parce que la
# règle `.ligne { display: block }` était restée dans le <head>. On prend
# donc les DEUX sources, feuilles liées puis styles inlinés, dans l'ordre.
css = '\n'.join(pathlib.Path(f).read_text() for f in sorted(glob.glob('dist/_astro/*.css')))
tete = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
inlines = re.findall(r'<style[^>]*>(.*?)</style>', tete, re.S)
for bloc in inlines:
    css += '\n' + bloc
print('  CSS : %d feuille(s) liee(s) + %d bloc(s) inline(s)'
      % (len(glob.glob('dist/_astro/*.css')), len(inlines)))
js = (SP / 'artefact.js').read_text()

for f in sorted(glob.glob('public/fonts/*.woff2')):
    nom = os.path.basename(f)
    b64 = base64.b64encode(pathlib.Path(f).read_bytes()).decode()
    avant = css
    css = css.replace('/fonts/' + nom, 'data:font/woff2;base64,' + b64)
    assert css != avant, 'police non referencee dans le CSS : ' + nom
    print('  embarque  %-34s %6.1f Ko base64' % (nom, len(b64)/1024))

# Modèles 3D en data: URI — l'artefact n'a pas de serveur de fichiers.
modeles = {}
for f in sorted(glob.glob('public/modeles/*.glb')):
    cle = os.path.splitext(os.path.basename(f))[0]
    b64 = base64.b64encode(pathlib.Path(f).read_bytes()).decode()
    modeles[cle] = 'data:model/gltf-binary;base64,' + b64
    print('  embarque  %-34s %6.1f Mo base64' % (cle + '.glb', len(b64) / 1048576))
injection = '<script>window.__MODELES=' + __import__('json').dumps(modeles) + ';</script>' if modeles else ''

corps = re.search(r'<body[^>]*>(.*)</body>', html, re.S).group(1)
corps = re.sub(r'<script type="module" src="[^"]*"></script>', '', corps)
corps = re.sub(r"<script>\s*document\.documentElement\.classList\.remove\(.sans-js.\);\s*</script>", '', corps)

# Tampon de version : sans lui, impossible de distinguer d'un coup d'oeil
# une page rechargee d'une page servie depuis le cache du navigateur — on
# se retrouve a debattre de correctifs deja publies.
version = __import__('datetime').datetime.now().strftime('%d/%m %Hh%M')

bandeau = (
 '<div style="background:#131619;color:#E9E4D8;font:600 13px/1.5 system-ui,sans-serif;'
 'padding:10px 16px;text-align:center;letter-spacing:.02em">'
 'Aperçu de travail — Phase 3 en cours. Photos, avis et prix sont des emplacements marqués.'
 '<span style="opacity:.55;font-weight:400"> · build ' + version + '</span>'
 '</div>'
)

sortie = (
 '<meta charset="utf-8">\n'
 '<title>Thalès Auto · Bateaux</title>\n<style>\n' + css +
 '\n/* L\'artefact enveloppe la page : on repeint le fond explicitement,\n'
 '   sinon elle emprunte celui de l\'hote selon son theme. */\n'
 ':root, html, body { background-color: #E9E4D8; }\n</style>\n'
 + bandeau + '\n' + injection + '\n' + corps +
 "\n<script>\ndocument.documentElement.classList.remove('sans-js');\n" + js + '\n</script>\n'
)

cible = SP / 'apercu-thales.html'
cible.write_text(sortie, encoding='utf-8')
print('\n  fichier autonome : %.0f Ko' % (len(sortie)/1024))
externe = re.search(r'(src|href)="https?://', sortie)
print('  aucune URL externe   :', 'oui' if not externe else 'NON -> ' + externe.group(0))
print('  aucun /_astro/       :', 'oui' if '/_astro/' not in sortie else 'NON')
print('  aucun /fonts/        :', 'oui' if '/fonts/' not in sortie else 'NON')
cids = set(re.findall(r'data-astro-cid-([a-z0-9]+)', corps))
manquants = sorted(c for c in cids if c not in css)
print('  styles scopes        :', 'oui' if not manquants
      else 'NON -> cid sans CSS : ' + ', '.join(manquants))
assert not manquants, 'CSS scope manquant pour : ' + ', '.join(manquants)
print('  meta charset         :', 'oui' if sortie.startswith('<meta charset="utf-8">') else 'NON')
print('  balise title         :', 'oui' if '<title>' in sortie[:200] else 'NON')

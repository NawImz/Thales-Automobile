"""
Assemble un aperçu autonome du site, publiable en artefact.

    npm run build
    npx esbuild <chunk signature> --bundle --format=iife --minify --outfile=.apercu/signature.js
    python3 scripts/assembler-apercu.py

Pourquoi un fichier unique : la CSP des artefacts bloque tout hôte externe.
CSS inliné, polices et images en data: URI, scripts bundlés.

Les six pages sont embarquées et commutées par un routeur minimal, pour que le
client puisse cliquer « Tarifs » et voir la page au lieu d'une erreur.

Pièges déjà payés, tous vérifiés en fin de script :
  · sans <meta charset>, le fichier retombe en windows-1252 et tous les
    accents cassent (« ThalÈs ») ;
  · un tampon de build visible, sans quoi une page servie depuis le cache du
    navigateur est indiscernable d'une page rechargée ;
  · le CSS scopé d'Astro : ici `inlineStylesheets: 'never'` garantit que tout
    est dans les feuilles liées, mais on vérifie quand même qu'aucun
    data-astro-cid du HTML n'est sans règle.
"""

import base64, datetime, glob, os, pathlib, re, json

SP = pathlib.Path('.apercu'); SP.mkdir(exist_ok=True)

PAGES = [
    ('/',                 'dist/index.html'),
    ('/bateaux-jet-ski',  'dist/bateaux-jet-ski/index.html'),
    ('/confidentialite',  'dist/confidentialite/index.html'),
]

# ── CSS : toutes les feuilles liées, dédupliquées ────────────────────────
css = ''
for f in sorted(glob.glob('dist/_astro/*.css')):
    css += pathlib.Path(f).read_text() + '\n'

# ── Polices en data: URI ─────────────────────────────────────────────────
polices = 0
for f in sorted(glob.glob('dist/_astro/*.woff2')):
    nom = os.path.basename(f)
    if nom not in css:
        continue
    b64 = base64.b64encode(pathlib.Path(f).read_bytes()).decode()
    css = css.replace('/_astro/' + nom, 'data:font/woff2;base64,' + b64)
    polices += 1
print('  %d police(s) embarquée(s)' % polices)

# ── Images en data: URI ──────────────────────────────────────────────────
images = {}
for f in (glob.glob('dist/_astro/*.webp') + glob.glob('dist/_astro/*.avif')
          + glob.glob('dist/_astro/*.png')):
    nom = os.path.basename(f)
    mime = ('image/avif' if nom.endswith('.avif')
            else 'image/png' if nom.endswith('.png') else 'image/webp')
    images['/_astro/' + nom] = 'data:%s;base64,%s' % (
        mime, base64.b64encode(pathlib.Path(f).read_bytes()).decode())
print('  %d image(s) embarquée(s)' % len(images))

# ── Corps des pages ──────────────────────────────────────────────────────
def corps(chemin):
    html = pathlib.Path(chemin).read_text()
    c = re.search(r'<body[^>]*>(.*)</body>', html, re.S).group(1)
    c = re.sub(r'<script type="module" src="[^"]*"></script>', '', c)
    for url, data in images.items():
        c = c.replace(url, data)
    return c

pages = {ruta: corps(f) for ruta, f in PAGES}
cids = set()
for c in pages.values():
    cids |= set(re.findall(r'data-astro-cid-([a-z0-9]+)', c))

# ⚠️ GSAP a été retiré : il n'y a plus AUCUN script externe, tout est inliné
# par Astro dans le HTML des pages. L'assembleur n'a donc plus de bundle à
# produire — les scripts voyagent avec le corps des pages.
signature = ''
version = datetime.datetime.now().strftime('%d/%m %Hh%M')

# ⚠️ Le bandeau d'aperçu est retiré à la demande du client : il voulait voir
# le site tel qu'il sera, sans surcouche. Le tampon de build reste utile pour
# distinguer une page rechargée d'une page en cache — il passe donc en
# commentaire HTML, invisible à l'écran mais lisible dans le source.
bandeau = '<!-- Thalès Automobile — aperçu de travail — build ' + version + ' -->'

# Routeur minimal : les liens internes commutent la page au lieu de naviguer.
routeur = """
<script>
(function () {
  var pages = %s;
  var hote = document.getElementById('pages');
  function afficher(route) {
    var cible = pages[route] ? route : '/';
    hote.innerHTML = pages[cible];
    window.scrollTo(0, 0);
    document.querySelectorAll('[data-route]').forEach(function (a) {
      a.setAttribute('aria-current', a.dataset.route === cible ? 'page' : 'false');
    });
    // Les scripts injectés par innerHTML ne s'exécutent pas : on les rejoue.
    hote.querySelectorAll('script').forEach(function (vieux) {
      var neuf = document.createElement('script');
      if (vieux.type) neuf.type = vieux.type;
      neuf.textContent = vieux.textContent;
      vieux.replaceWith(neuf);
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="/"]');
    if (!a) return;
    var href = a.getAttribute('href').split('#')[0].replace(/\\/$/, '') || '/';
    if (!pages[href]) return;
    e.preventDefault();
    a.dataset.route = href;
    afficher(href);
  });
  afficher('/');
})();
</script>
""" % (
    # ⚠️ Le HTML des pages contient des <script>…</script> (Astro y inline les
    # petits scripts). Une chaîne JSON contenant « </script> » referme le script
    # du routeur AU MILIEU : le reste du fichier est alors parsé comme du HTML
    # et tout casse — 187 erreurs console, aucune évidente. On échappe donc la
    # séquence, ce que JSON accepte sans changer la valeur de la chaîne.
    json.dumps(pages, ensure_ascii=False).replace('</', '<\\/')
)

sortie = (
 '<meta charset="utf-8">\n'
 '<title>Thalès Automobile · Épinay-sur-Seine</title>\n'
 '<style>\n' + css +
 '\n/* L\'artefact enveloppe la page : on repeint le fond explicitement,\n'
 '   sinon elle emprunte celui de l\'hôte selon son thème. */\n'
 ':root, html, body { background-color: #F7F7F5; }\n</style>\n'
 + bandeau
 + '\n<div id="pages"></div>\n'
 + routeur
 + '\n<script>\n' + signature + '\n</script>\n'
)

cible = SP / 'apercu-thales.html'
cible.write_text(sortie, encoding='utf-8')

print('\n  fichier autonome : %.0f Ko' % (len(sortie.encode()) / 1024))
print('  pages embarquées     :', len(pages))
externe = re.search(r'(src|href)="https?://(?!wa\.me|www\.google\.com)', sortie)
print('  aucune ressource externe :', 'oui' if not externe else 'NON -> ' + externe.group(0))
print('  aucun /_astro/       :', 'oui' if '/_astro/' not in sortie else 'NON')
manquants = sorted(c for c in cids if c not in css)
print('  styles scopés        :', 'oui' if not manquants else 'NON -> ' + ', '.join(manquants))
assert not manquants, 'CSS scopé manquant : ' + ', '.join(manquants)
print('  meta charset         :', 'oui' if sortie.startswith('<meta charset="utf-8">') else 'NON')
print('  tampon de build      :', version)

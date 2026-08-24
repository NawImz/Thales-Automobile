/**
 * Scène d'atelier, sur modèles 3D réels.
 *
 * Acte 1  — la BMW tourne lentement.
 * Charnière — la Volvo se désintègre pendant que le yacht se matérialise.
 *
 * On ne peut pas déformer une voiture en bateau : maillages et topologies
 * différents. La transition passe donc par une dissolution croisée, avec
 * un front incandescent — c'est le geste juste pour ce cas, et c'est ce
 * qu'utilisent les studios.
 *
 * Chargement conditionnel : appelée seulement si grand écran, mouvement
 * non réduit et WebGL disponible. Sur mobile, ni three ni les modèles ne
 * sont téléchargés.
 */
import { rendreDissolvable, type Dissolvable } from './dissolution';
import { geometrieBateau } from './formes';

export type Options = {
  mode: 'rotation' | 'scrub';
  /** Longueur cible du véhicule dans la scène, en unités monde. */
  taille?: number;
};

/**
 * Chemins des modèles. L'aperçu autonome publié en artefact n'a pas de
 * serveur de fichiers : il injecte des data: URI dans window.__MODELES,
 * qui prennent alors le pas.
 */
/** Bleu marine du lettrage de la devanture (charte, §2.1 du plan). */
const TEINTE_CARROSSERIE = '#16375f';

const MODELES = {
  bmw: '/modeles/bmw.glb',
  volvo: '/modeles/volvo.glb',
} as const;

function urlModele(cle: keyof typeof MODELES) {
  const injectes = (globalThis as any).__MODELES;
  return injectes?.[cle] ?? MODELES[cle];
}

export async function monterScene(toile: HTMLCanvasElement, options: Options) {
  const [THREE, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
  ]);

  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2));
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.7;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

  /**
   * ⚠️ Sans carte d'environnement, un matériau métallique rend quasi
   * noir : un métal ne fait que réfléchir. On fabrique donc un atelier —
   * dégradé vertical, néons au plafond, sol sombre — plutôt que
   * d'importer un fichier HDR de plusieurs mégaoctets.
   */
  function environnementAtelier() {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0.0, '#141a20');
    g.addColorStop(0.22, '#f4f8fc');
    g.addColorStop(0.34, '#ffffff');
    g.addColorStop(0.5, '#9fadba');
    g.addColorStop(0.62, '#ffffff');
    g.addColorStop(0.78, '#59656f');
    g.addColorStop(1.0, '#171c21');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(rendu);
    const env = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose();
    tex.dispose();
    return env;
  }
  scene.environment = environnementAtelier();

  // ── Lumières : clé froide d'atelier, contre-jour rouge Yamaha ────────
  scene.add(new THREE.AmbientLight(0xc6d2de, 0.9));
  const cle = new THREE.DirectionalLight(0xf4f8fc, 5.5);
  cle.position.set(4, 7, 8);
  scene.add(cle);
  const contre = new THREE.DirectionalLight(0xc8102e, 5.0);
  contre.position.set(-8, 1, -5);
  scene.add(contre);
  const appoint = new THREE.DirectionalLight(0xa8bccf, 3.0);
  appoint.position.set(-6, 4, 4);
  scene.add(appoint);
  // Bandeau de néons au-dessus : c'est lui qui dessine le filé de
  // lumière sur le capot et le pavillon.
  const neon = new THREE.DirectionalLight(0xffffff, 2.6);
  neon.position.set(0, 10, 1);
  scene.add(neon);

  // ── Chargement ───────────────────────────────────────────────────────
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);


  /**
   * Les matériaux d'un glTF arrivent avec envMapIntensity à 1 : sur une
   * carrosserie sombre, l'environnement ne se voit pas. On le remonte,
   * et on garantit une rugosité minimale pour que les reflets restent
   * lisibles plutôt que spéculaires ponctuels.
   */
  /**
   * Remet d'aplomb les matériaux du GLB, puis pose une vraie peinture.
   *
   * ⚠️ La compression `gltf-transform` fusionne les matériaux dans un
   * atlas et laisse derrière elle des « PaletteMaterial » réglés à
   * `metalness: 1, roughness: 1` — un métal parfaitement rugueux, qui ne
   * réfléchit rien et rend donc quasi noir. Mesuré sur la BMW : 4 des 9
   * matériaux dans cet état, les 5 autres en `metalness: 0,
   * roughness: 0.82`, soit du plastique mat. D'où la voiture grise et
   * plate. On ne peut pas se fier aux noms de meshes pour distinguer la
   * carrosserie : on trie sur ces signatures numériques.
   */
  function accorderMateriaux(objet: THREE.Object3D) {
    const teinte = new THREE.Color(TEINTE_CARROSSERIE);
    objet.traverse((n) => {
      const mesh = n as THREE.Mesh;
      if (!mesh.isMesh) return;
      const liste = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of liste) {
        const mat = m as THREE.MeshStandardMaterial & { clearcoat?: number };
        if (!mat.isMeshStandardMaterial) continue;
        mat.envMapIntensity = 2.4;

        if (mat.metalness >= 0.95 && mat.roughness >= 0.95) {
          // Le gros des surfaces peintes : vernis automobile teinté.
          mat.color.copy(teinte);
          mat.metalness = 0.6;
          mat.roughness = 0.25;
        } else if (mat.metalness <= 0.05 && mat.roughness >= 0.6) {
          // Habitacle, plastiques, joints : mats, sans reflet parasite.
          mat.roughness = 0.55;
        }
        mat.needsUpdate = true;
      }
    });
  }

  /**
   * Met l'objet à l'échelle et le centre sur l'origine.
   *
   * On borne sur la PLUS GRANDE des trois dimensions, pas sur la
   * longueur : le yacht mesurait 7,1 d'élévation contre 1,9 pour la
   * voiture, il sortait du cadre par le haut. Et on centre sur les trois
   * axes plutôt que de poser sur y = 0, pour que les deux modèles
   * occupent la même place à l'écran.
   */
  function normaliser(objet: THREE.Object3D, cibleMax: number) {
    objet.updateMatrixWorld(true);
    /**
     * ⚠️ `setFromObject(objet)` se contente des `boundingBox` mises en
     * cache par chaque géométrie. Après passage de `gltf-transform`
     * (`--simplify`, fusion en atlas), ces caches sont périmés et
     * largement surdimensionnés : la BMW annonçait 7,44 × 1,37 × 6,82
     * alors qu'elle n'occupait que 39 % de la largeur du cadre, décalée
     * de 163 px vers la gauche. Le second argument force le parcours des
     * sommets réels — c'est plus lent, mais on ne le fait qu'une fois par
     * modèle, au chargement.
     */
    const boite = new THREE.Box3().setFromObject(objet, true);
    const taille = new THREE.Vector3();
    const centre = new THREE.Vector3();
    boite.getSize(taille);
    boite.getCenter(centre);
    const facteur = cibleMax / Math.max(taille.x, taille.y, taille.z);

    /**
     * ⚠️ Piège three.js payé cher : on transforme l'ENVELOPPE, jamais le
     * modèle. Poser une échelle ou une position sur la racine d'un modèle
     * riggé casse la liaison au squelette d'un SkinnedMesh — le yacht,
     * dont 47 meshes sur 47 sont skinnés, ne rendait plus que ses
     * quelques pièces non riggées.
     */
    const enveloppe = new THREE.Group();
    enveloppe.add(objet);
    enveloppe.scale.setScalar(facteur);
    enveloppe.position.set(-centre.x * facteur, -centre.y * facteur, -centre.z * facteur);
    return enveloppe;
  }

  const cible = options.taille ?? 6;
  // Renseignés par le mode, consommés par `cadrer()`.
  let elevation = 0.16;
  let aisance = 1.06;
  const groupe = new THREE.Group();
  scene.add(groupe);

  let coqueEnveloppe: THREE.Group | null = null;
  let dissoutVoiture: Dissolvable | null = null;
  let dissoutBateau: Dissolvable | null = null;
  let eau: THREE.Mesh | null = null;

  if (options.mode === 'rotation') {
    const gltf = await loader.loadAsync(urlModele('bmw'));
    accorderMateriaux(gltf.scene);
    groupe.add(normaliser(gltf.scene, cible));
    elevation = 0.16;
    aisance = 1.06;
  } else {
    const voiture = await loader.loadAsync(urlModele('volvo'));

    /**
     * ⚠️ Le yacht fourni est inexploitable en l'état : ses 47 meshes sont
     * skinnés et aucun ne rend dans three — vérifié sur le fichier
     * d'origine, avant toute compression. En attendant un modèle statique,
     * l'aboutissement est la coque d'acier extrudée, qui tient le propos.
     */
    const coque = new THREE.Mesh(
      geometrieBateau(THREE),
      new THREE.MeshStandardMaterial({
        color: 0xb9c2cb, metalness: 0.58, roughness: 0.32, envMapIntensity: 1.4,
      })
    );
    const bateau = { scene: coque as unknown as THREE.Object3D };

    accorderMateriaux(voiture.scene);
    const encVoiture = normaliser(voiture.scene, cible);
    const encBateau = normaliser(bateau.scene, cible);
    groupe.add(encVoiture, encBateau);

    // Drapeau de débogage : ?sansdissolution laisse les deux modèles
    // pleinement visibles, pour isoler shader et géométrie.
    const sansDissolution = location.search.includes('sansdissolution');
    if (location.search.includes('soloyacht')) encVoiture.visible = false;
    if (location.search.includes('solovolvo')) encBateau.visible = false;
    if (!sansDissolution) {
      dissoutVoiture = rendreDissolvable(THREE, voiture.scene, +1);
      dissoutBateau = rendreDissolvable(THREE, bateau.scene, -1);
      dissoutBateau.seuil.value = 0; // caché au départ
    }

    // Le squelette est figé : l'animation du glTF n'a plus rien à
    // piloter. Le roulis est refait sur l'enveloppe, plus bas.
    coqueEnveloppe = encBateau;

    /** Plan d'eau, en halo pour ne pas couper l'écran d'un trait net. */
    function fonduRadial() {
      const n = 256;
      const c = document.createElement('canvas');
      c.width = c.height = n;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.45, '#b4b4b4');
      g.addColorStop(1, '#000000');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, n, n);
      return new THREE.CanvasTexture(c);
    }
    eau = new THREE.Mesh(
      new THREE.PlaneGeometry(cible * 4, cible * 3),
      new THREE.MeshStandardMaterial({
        color: 0x16375f, metalness: 0.9, roughness: 0.1,
        envMapIntensity: 1.6, transparent: true, opacity: 0,
        alphaMap: fonduRadial(), depthWrite: false,
      })
    );
    eau.rotation.x = -Math.PI / 2;
    eau.position.y = -cible * 0.17;
    groupe.add(eau);

    // Plus d'aisance : la scène porte aussi le plan d'eau et la coque.
    elevation = 0.12;
    aisance = 1.5;
  }

  // ── Cadrage ──────────────────────────────────────────────────────────
  /**
   * Rayon de la sphère englobante, mesuré une fois les modèles chargés.
   * Invariant par rotation : c'est la bonne mesure pour une scène qui tourne.
   */
  const sphere = new THREE.Box3().setFromObject(groupe, true).getBoundingSphere(new THREE.Sphere());
  const rayon = Math.max(sphere.radius, 0.001);

  /**
   * ⚠️ Une distance de caméra en dur ne cadre QUE l'aspect pour lequel on
   * l'a réglée. Le champ vertical d'une PerspectiveCamera est fixe : quand
   * la toile se resserre, c'est le champ HORIZONTAL qui rétrécit, et une
   * voiture — objet large — sort du cadre par les côtés. Vécu : la BMW
   * coupée en deux dans un panneau de 860 px. On déduit donc la distance
   * du plus contraignant des deux champs, à chaque redimensionnement.
   */
  /** Point visé par la caméra. Corrigé empiriquement par `ajusterSurRendu`. */
  const mire = new THREE.Vector3(0, 0, 0);
  let distance = (rayon * aisance) / Math.sin((camera.fov * Math.PI) / 360);

  function cadrer() {
    camera.position.set(mire.x, mire.y + distance * elevation, mire.z + distance);
    camera.lookAt(mire);
  }

  /**
   * Cadre sur ce qui s'affiche réellement, pas sur ce que le fichier
   * prétend mesurer.
   *
   * ⚠️ Les bornes géométriques de ces GLB sont inexploitables : après
   * compression, chaque pièce partage un même tampon de sommets et
   * annonce donc la boîte de la voiture entière — un étrier de frein se
   * déclarait large de 3,65 unités. Résultat, la BMW se retrouvait
   * décalée de 163 px et n'occupait que 41 % du cadre. `precise: true`
   * n'y change rien, le tampon est réellement de cette taille.
   *
   * On mesure donc la silhouette rendue : rendu dans une cible de 192 px,
   * lecture du canal alpha (le renderer est en `alpha: true`, le fond est
   * donc vide), puis correction du point visé et de la distance. On prend
   * l'union de quatre angles pour que la voiture ne sorte jamais du cadre
   * en tournant. Une quinzaine de rendus à 192 px, une seule fois au
   * chargement — invisible à l'usage.
   */
  const N_SONDE = 192;
  const cibleSonde = new THREE.WebGLRenderTarget(N_SONDE, N_SONDE);
  const pixelsSonde = new Uint8Array(N_SONDE * N_SONDE * 4);

  /**
   * Boîte de la silhouette RENDUE, en coordonnées normalisées (-1..1).
   *
   * ⚠️ Les bornes géométriques de ces GLB sont inexploitables : après
   * compression, les pièces partagent un même tampon de sommets et
   * annoncent toutes la boîte du véhicule entier — un étrier de frein se
   * déclarait large de 3,65 unités. `precise: true` n'y change rien, le
   * tampon fait réellement cette taille. On mesure donc ce qui s'affiche :
   * le renderer est en `alpha: true`, le canal alpha donne la silhouette.
   */
  function mesurerSilhouette() {
    rendu.setRenderTarget(cibleSonde);
    rendu.clear();
    rendu.render(scene, camera);
    rendu.readRenderTargetPixels(cibleSonde, 0, 0, N_SONDE, N_SONDE, pixelsSonde);
    rendu.setRenderTarget(null);

    let minX = 1, maxX = -1, minY = 1, maxY = -1, vus = 0;
    for (let ligne = 0; ligne < N_SONDE; ligne++) {
      for (let col = 0; col < N_SONDE; col++) {
        if (pixelsSonde[(ligne * N_SONDE + col) * 4 + 3] < 24) continue;
        vus++;
        const x = ((col + 0.5) / N_SONDE) * 2 - 1;
        const y = ((ligne + 0.5) / N_SONDE) * 2 - 1; // lu de bas en haut
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (!vus) return null;
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2,
             etendue: Math.max(maxX - minX, maxY - minY) / 2 };
  }

  /** Vecteur monde correspondant à un écart mesuré à l'écran. */
  function ecartMonde(cx: number, cy: number) {
    const demiHauteur = Math.tan((camera.fov * Math.PI) / 360) * distance;
    const droite = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const haut = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    return new THREE.Vector3()
      .addScaledVector(droite, cx * demiHauteur * camera.aspect)
      .addScaledVector(haut, cy * demiHauteur);
  }

  /**
   * Pose le sujet SUR l'axe de rotation.
   *
   * ⚠️ Recentrer la caméra ne suffit pas : si le modèle est décalé par
   * rapport à l'origine du groupe, il ne tourne pas sur lui-même, il
   * ORBITE autour d'elle — et paraît décentré, d'un côté puis de l'autre.
   * Vécu : la BMW à 121 px du centre après un cadrage pourtant juste.
   * On mesure donc l'écart de face (x, y) puis de profil (z), et on
   * déplace l'enveloppe — jamais le modèle, dont le squelette casserait.
   */
  function recentrerSurRendu() {
    const angleInitial = groupe.rotation.y;
    const axeY = new THREE.Vector3(0, 1, 0);
    for (const theta of [0, Math.PI / 2, 0]) {
      groupe.rotation.y = theta;
      groupe.updateMatrixWorld(true);
      const s = mesurerSilhouette();
      if (!s) break;
      const corrige = ecartMonde(s.cx, s.cy).applyAxisAngle(axeY, -theta);
      for (const enfant of groupe.children) enfant.position.sub(corrige);
    }
    groupe.rotation.y = angleInitial;
    groupe.updateMatrixWorld(true);
  }

  /** Amène la silhouette à occuper `remplissage` du cadre, sans jamais la couper. */
  function ajusterSurRendu(remplissage: number) {
    const angleInitial = groupe.rotation.y;
    for (let passe = 0; passe < 3; passe++) {
      let pire = 0;
      for (let a = 0; a < 4; a++) {
        groupe.rotation.y = angleInitial + (a * Math.PI) / 2;
        groupe.updateMatrixWorld(true);
        const s = mesurerSilhouette();
        if (s && s.etendue > pire) pire = s.etendue;
      }
      groupe.rotation.y = angleInitial;
      groupe.updateMatrixWorld(true);
      if (pire < 0.01) return;
      distance *= pire / remplissage;
      cadrer();
      camera.updateMatrixWorld(true);
    }
  }

  function dimensionner() {
    const r = toile.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    rendu.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    cadrer();
  }
  dimensionner();
  // Le remplissage voulu : serré en rotation (la voiture est le sujet),
  // plus lâche en défilement où la scène porte aussi l'eau et la coque.
  const REMPLISSAGE = options.mode === 'rotation' ? 0.8 : 0.6;
  recentrerSurRendu();
  ajusterSurRendu(REMPLISSAGE);
  addEventListener('resize', () => {
    dimensionner();
    ajusterSurRendu(REMPLISSAGE);
  }, { passive: true });

  // ── Pilotage ─────────────────────────────────────────────────────────
  let viseX = 0, viseY = 0, lisseX = 0, lisseY = 0;
  addEventListener('pointermove', (e) => {
    viseX = (e.clientX / innerWidth - 0.5) * 0.5;
    viseY = (e.clientY / innerHeight - 0.5) * 0.14;
  }, { passive: true });

  let cibleAvance = 0;
  let lisseAvance = 0;
  const api = { setMelange: (t: number) => { cibleAvance = Math.min(1, Math.max(0, t)); } };

  let actif = true;
  new IntersectionObserver((e) => { actif = e[0].isIntersecting; }, { threshold: 0 }).observe(toile);

  let precedent = performance.now();
  let angle = -0.6;

  function boucle(t: number) {
    requestAnimationFrame(boucle);
    const dt = Math.min((t - precedent) / 1000, 0.05);
    precedent = t;
    if (!actif || document.hidden) return;

    lisseX += (viseX - lisseX) * 0.05;
    lisseY += (viseY - lisseY) * 0.05;

    if (options.mode === 'rotation') {
      angle += dt * 0.24;
      groupe.rotation.y = angle + lisseX;
      groupe.rotation.x = lisseY * 0.5;
      groupe.position.y = Math.sin(t * 0.0007) * cible * 0.012;
    } else {
      lisseAvance += (cibleAvance - lisseAvance) * 0.08;
      // Roulis de la coque : lent, faible amplitude, jamais du sautillement.
      if (coqueEnveloppe) {
        coqueEnveloppe.rotation.z = Math.sin(t * 0.00045) * 0.035;
        coqueEnveloppe.position.y = Math.sin(t * 0.0006) * cible * 0.012;
      }

      // La voiture se dissout sur la première moitié, le bateau se
      // matérialise sur la seconde : elles ne coexistent qu'un instant.
      if (dissoutVoiture) dissoutVoiture.seuil.value = Math.min(1, lisseAvance * 1.7);
      if (dissoutBateau) dissoutBateau.seuil.value = Math.max(0, (lisseAvance - 0.32) / 0.68);
      if (eau) (eau.material as THREE.MeshStandardMaterial).opacity = Math.max(0, (lisseAvance - 0.55) / 0.45) * 0.8;

      groupe.rotation.y = -0.6 + lisseAvance * 0.7 + lisseX * 0.3;
      groupe.rotation.x = lisseY * 0.4;
    }

    rendu.render(scene, camera);
  }
  requestAnimationFrame(boucle);

  toile.dataset.pret = 'oui';
  // Diagnostic de cadrage, lu par les contrôles automatisés.
  (toile as any).__materiaux = () => {
    const vus = new Set<string>();
    const out: any[] = [];
    groupe.traverse((n) => {
      const m = n as THREE.Mesh;
      if (!m.isMesh) return;
      const liste = Array.isArray(m.material) ? m.material : [m.material];
      for (const mm of liste) {
        const mat = mm as any;
        if (vus.has(mat.uuid)) continue;
        vus.add(mat.uuid);
        out.push({
          type: mat.type,
          nom: mat.name,
          couleur: mat.color ? '#' + mat.color.getHexString() : null,
          opacite: mat.opacity,
          transparent: mat.transparent,
          transmission: mat.transmission ?? null,
          metalness: mat.metalness ?? null,
          roughness: mat.roughness ?? null,
          visible: mat.visible,
          side: mat.side,
        });
      }
    });
    return out.slice(0, 14);
  };
  // Sonde de cadrage : où le centre du modèle tombe-t-il À L'ÉCRAN ?
  // Mesurer la projection évite de déduire un décentrement d'une capture.
  // Inventaire des meshes : taille et centre de chacun, pour repérer
  // l'intrus qui gonfle la boîte englobante.
  // Contrôle de cadrage sans capture d'écran : la silhouette rendue,
  // en coordonnées normalisées. Bien moins coûteux qu'un screenshot —
  // décisif dans un conteneur sans GPU, où le plein écran rampe.
  (toile as any).__silhouette = (angle?: number) => {
    const initial = groupe.rotation.y;
    if (typeof angle === 'number') { groupe.rotation.y = angle; groupe.updateMatrixWorld(true); }
    const s = mesurerSilhouette();
    groupe.rotation.y = initial;
    groupe.updateMatrixWorld(true);
    return s && { centre: [+s.cx.toFixed(3), +s.cy.toFixed(3)], remplissage: +s.etendue.toFixed(3) };
  };
  (toile as any).__meshes = () => {
    const out: any[] = [];
    groupe.traverse((n) => {
      const m = n as THREE.Mesh;
      if (!m.isMesh) return;
      const b = new THREE.Box3().setFromObject(m);
      const t = b.getSize(new THREE.Vector3());
      const c = b.getCenter(new THREE.Vector3());
      out.push({
        nom: m.name || m.type,
        taille: [t.x, t.y, t.z].map((v) => +v.toFixed(2)),
        centre: [c.x, c.y, c.z].map((v) => +v.toFixed(2)),
        visible: m.visible,
        sommets: (m.geometry as any)?.attributes?.position?.count ?? 0,
      });
    });
    return out.sort((a, b) => b.taille[0] * b.taille[2] - a.taille[0] * a.taille[2]);
  };
  (toile as any).__cadrage = () => {
    const p = new THREE.Vector3(0, 0, 0).project(camera);
    const boite = new THREE.Box3().setFromObject(groupe);
    const coins: THREE.Vector3[] = [];
    for (const x of [boite.min.x, boite.max.x])
      for (const y of [boite.min.y, boite.max.y])
        for (const z of [boite.min.z, boite.max.z])
          coins.push(new THREE.Vector3(x, y, z).project(camera));
    const xs = coins.map((c) => c.x), ys = coins.map((c) => c.y);
    const r = toile.getBoundingClientRect();
    const versPx = (n: number) => Math.round(((n + 1) / 2) * r.width);
    return {
      toileCSS: [Math.round(r.width), Math.round(r.height)],
      tampon: [toile.width, toile.height],
      camera: [camera.position.x, camera.position.y, camera.position.z].map((v) => +v.toFixed(2)),
      aspect: +camera.aspect.toFixed(3),
      centreProjetePx: [versPx(p.x), Math.round(((1 - p.y) / 2) * r.height)],
      etendueXPx: [versPx(Math.min(...xs)), versPx(Math.max(...xs))],
      etendueYNorm: [+Math.min(...ys).toFixed(2), +Math.max(...ys).toFixed(2)],
      rotationY: +groupe.rotation.y.toFixed(2),
      groupePos: [groupe.position.x, groupe.position.y, groupe.position.z].map((v) => +v.toFixed(2)),
    };
  };
  (toile as any).__diag = () => {
    const infos: Record<string, unknown> = {};
    for (const enfant of groupe.children) {
      const b = new THREE.Box3().setFromObject(enfant);
      const t = new THREE.Vector3();
      const c = new THREE.Vector3();
      b.getSize(t);
      b.getCenter(c);
      let meshes = 0;
      enfant.traverse((n) => { if ((n as THREE.Mesh).isMesh) meshes++; });
      infos[enfant.name || enfant.type + '#' + enfant.id] = {
        taille: [t.x, t.y, t.z].map((v) => +v.toFixed(2)),
        centre: [c.x, c.y, c.z].map((v) => +v.toFixed(2)),
        meshes,
      };
    }
    return infos;
  };
  return api;
}

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
  function accorderMateriaux(objet: THREE.Object3D) {
    objet.traverse((n) => {
      const mesh = n as THREE.Mesh;
      if (!mesh.isMesh) return;
      const liste = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of liste) {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          mat.envMapIntensity = 2.4;
          mat.needsUpdate = true;
        }
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
    const boite = new THREE.Box3().setFromObject(objet);
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
    camera.position.set(0, cible * 0.16, cible * 1.35);
    camera.lookAt(0, 0, 0);
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

    camera.position.set(0, cible * 0.12, cible * 2.05);
    camera.lookAt(0, 0, 0);
  }

  // ── Cadrage ──────────────────────────────────────────────────────────
  function dimensionner() {
    const r = toile.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    rendu.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  dimensionner();
  addEventListener('resize', dimensionner, { passive: true });

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

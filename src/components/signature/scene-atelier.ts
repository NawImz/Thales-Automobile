/**
 * Scène d'atelier : le volume qui roule, et qui devient celui qui flotte.
 *
 * On n'assemble pas une voiture avec des primitives — ça ferait jouet.
 * Les deux profils déjà validés sont extrudés en volumes biseautés, avec
 * un nombre de sommets rigoureusement identique. La transformation est
 * alors une interpolation d'attribut de position, en temps réel.
 *
 * Chargement conditionnel : appelée seulement si grand écran, mouvement
 * non réduit et WebGL disponible. Sur mobile, three.js ne part jamais.
 */
import { geometrieVoiture, geometrieMelangee, ROUES } from './formes';

export type Options = {
  /** 'rotation' : le volume tourne sur lui-même (hero).
   *  'scrub'    : la déformation suit le défilement (charnière). */
  mode: 'rotation' | 'scrub';
};

export async function monterScene(toile: HTMLCanvasElement, options: Options) {
  const THREE = await import('three');

  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2));
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.55, 9.6);
  camera.lookAt(0, 0, 0);

  /**
   * ⚠️ Un matériau très métallique SANS carte d'environnement rend quasi
   * noir : un métal ne fait que réfléchir. On lui fabrique un atelier —
   * dégradé vertical, néons au plafond, sol sombre — plutôt que
   * d'importer un fichier HDR.
   */
  function environnementAtelier() {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0.0, '#141a20');
    g.addColorStop(0.24, '#f4f8fc');
    g.addColorStop(0.36, '#ffffff');
    g.addColorStop(0.5, '#9fadba');
    g.addColorStop(0.62, '#ffffff');
    g.addColorStop(0.76, '#59656f');
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

  // ── Le volume ────────────────────────────────────────────────────────
  let geo = geometrieVoiture(THREE);

  /**
   * Acier revêtu, pas métal pur : sans HDR réelle, un metalness proche de
   * 1 ne reflète presque rien et rend noir. À 0,58 les lumières directes
   * shadent vraiment la surface.
   */
  const materiau = new THREE.MeshStandardMaterial({
    color: 0xb9c2cb,
    metalness: 0.58,
    roughness: 0.34,
    envMapIntensity: 1.25,
  });

  const volume = new THREE.Mesh(geo, materiau);
  const groupe = new THREE.Group();
  groupe.add(volume);

  // Roues : elles s'effacent quand la voiture devient coque.
  const materiauRoue = new THREE.MeshStandardMaterial({
    color: 0x161b20, metalness: 0.35, roughness: 0.62, envMapIntensity: 0.8,
    transparent: true,
  });
  const roues: THREE.Mesh[] = [];
  const geoRoue = new THREE.TorusGeometry(ROUES.rayon, ROUES.rayon * 0.42, 16, 44);
  for (const x of ROUES.x) {
    for (const z of [ROUES.z, -ROUES.z]) {
      const r = new THREE.Mesh(geoRoue, materiauRoue);
      r.position.set(x, ROUES.y, z);
      roues.push(r);
      groupe.add(r);
    }
  }

  /**
   * Plan d'eau. Sans dégradé alpha il coupait l'écran d'un bord à
   * l'autre par un trait net — ça lisait « rectangle », pas « eau ».
   */
  function fonduRadial() {
    const n = 256;
    const c = document.createElement('canvas');
    c.width = c.height = n;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.42, '#c8c8c8');
    g.addColorStop(1, '#000000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, n, n);
    return new THREE.CanvasTexture(c);
  }

  const eau = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 16, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0x16375f, metalness: 0.9, roughness: 0.12,
      envMapIntensity: 1.6, transparent: true, opacity: 0,
      alphaMap: fonduRadial(), depthWrite: false,
    })
  );
  eau.rotation.x = -Math.PI / 2;
  eau.position.y = ROUES.y - 0.28;
  groupe.add(eau);

  scene.add(groupe);

  // ── Lumières : clé froide d'atelier, contre-jour rouge Yamaha ────────
  scene.add(new THREE.AmbientLight(0xbcc7d2, 0.42));
  const cle = new THREE.DirectionalLight(0xeef3f8, 3.4);
  cle.position.set(3, 6, 8);
  scene.add(cle);
  const contre = new THREE.DirectionalLight(0xc8102e, 3.6);
  contre.position.set(-7, -1, -4);
  scene.add(contre);
  const appoint = new THREE.DirectionalLight(0x8fa3b8, 1.5);
  appoint.position.set(-5, 4, 3);
  scene.add(appoint);

  // ── Déformation ──────────────────────────────────────────────────────
  let melangeApplique = -1;
  function appliquerMelange(t: number) {
    // Seuil de reconstruction : inutile de refaire la géométrie pour un
    // millième de course, et ça évite la pression sur le ramasse-miettes.
    if (Math.abs(t - melangeApplique) > 0.006) {
      melangeApplique = t;
      const ancienne = geo;
      geo = geometrieMelangee(THREE, t);
      volume.geometry = geo;
      ancienne.dispose();
    }

    const opaciteRoues = Math.max(0, 1 - t / 0.45);
    for (const r of roues) {
      materiauRoue.opacity = opaciteRoues;
      r.visible = opaciteRoues > 0.01;
      r.scale.setScalar(0.4 + 0.6 * opaciteRoues);
    }
    (eau.material as THREE.MeshStandardMaterial).opacity = Math.max(0, (t - 0.55) / 0.45) * 0.75;
  }
  appliquerMelange(0);

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
    viseY = (e.clientY / innerHeight - 0.5) * 0.18;
  }, { passive: true });

  let cibleMelange = 0;
  let lisseMelange = 0;
  const api = { setMelange: (t: number) => { cibleMelange = Math.min(1, Math.max(0, t)); } };

  let actif = true;
  new IntersectionObserver((e) => { actif = e[0].isIntersecting; }, { threshold: 0 }).observe(toile);

  let precedent = performance.now();
  let angle = options.mode === 'rotation' ? -0.55 : -0.62;

  function boucle(t: number) {
    requestAnimationFrame(boucle);
    const dt = Math.min((t - precedent) / 1000, 0.05);
    precedent = t;
    if (!actif || document.hidden) return;

    if (options.mode === 'rotation') {
      angle += dt * 0.28;
      lisseX += (viseX - lisseX) * 0.05;
      lisseY += (viseY - lisseY) * 0.05;
      groupe.rotation.y = angle + lisseX;
      groupe.rotation.x = 0.06 + lisseY;
      // Flottement très léger : le volume respire, il ne sautille pas.
      groupe.position.y = Math.sin(t * 0.0007) * 0.14;
    } else {
      lisseMelange += (cibleMelange - lisseMelange) * 0.09;
      appliquerMelange(lisseMelange);
      lisseX += (viseX - lisseX) * 0.05;
      // Trois quarts arrière au départ, profil pur à l'arrivée.
      groupe.rotation.y = -0.62 + lisseMelange * 0.62 + lisseX * 0.25;
      groupe.rotation.x = 0.09 - lisseMelange * 0.09;
      groupe.position.y = -lisseMelange * 0.18;
    }

    rendu.render(scene, camera);
  }
  requestAnimationFrame(boucle);

  toile.dataset.pret = 'oui';
  return api;
}

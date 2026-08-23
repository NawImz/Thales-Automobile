/**
 * Scène d'atelier : un disque de frein qui tourne, en temps réel.
 *
 * Le sujet vient du métier, pas d'une banque de formes : c'est la pièce
 * que Nabil change le plus, et son vocabulaire — acier usiné, perçages,
 * rainures — porte l'ambiance mieux qu'une blob iridescente.
 *
 * Chargement conditionnel : cette fonction n'est appelée que si le
 * visiteur est sur grand écran, sans « prefers-reduced-motion », et que
 * WebGL répond. Sur mobile, three.js n'est jamais téléchargé.
 */
export async function monterScene(toile: HTMLCanvasElement) {
  const THREE = await import('three');

  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2));
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.5, 13.5);

  const ACIER = 0x9aa3ab;
  const SOMBRE = 0x14181c;
  const ROUGE = 0xc8102e;

  /**
   * ⚠️ Un MeshStandardMaterial très métallique SANS carte d'environnement
   * rend quasi noir : un métal ne fait que réfléchir, s'il n'a rien à
   * réfléchir il reste éteint. On lui fabrique donc un environnement
   * d'atelier — un dégradé vertical, sol sombre et néon au plafond —
   * plutôt que d'importer un fichier HDR.
   */
  function environnementAtelier() {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0.0, '#141a20');   // plafond
    g.addColorStop(0.26, '#f2f6fa');  // premier bandeau de néons
    g.addColorStop(0.38, '#ffffff');
    g.addColorStop(0.5, '#aab6c2');
    g.addColorStop(0.62, '#ffffff');  // second bandeau, reflet de tôle
    g.addColorStop(0.74, '#5d6a76');
    g.addColorStop(1.0, '#171c21');   // sol d'atelier
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

  const disque = new THREE.Group();

  /** Stries concentriques d'usinage, en carte de rugosité. */
  function striesUsinage() {
    const n = 512;
    const c = document.createElement('canvas');
    c.width = c.height = n;
    const ctx = c.getContext('2d')!;
    // Base claire : la carte est MULTIPLIÉE par material.roughness.
    // Une base grise donnait un miroir parfait, qui ne reflétait que du noir.
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, n, n);
    ctx.lineWidth = 1;
    for (let r = 6; r < n / 2; r += 2) {
      const v = 170 + Math.round(Math.random() * 78);
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
      ctx.beginPath();
      ctx.arc(n / 2, n / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }

  /**
   * Acier revêtu plutôt que métal pur : sans carte HDR réelle, un
   * metalness proche de 1 ne reflète presque rien et rend noir. À 0,55
   * les lumières directes shadent vraiment la surface, et le résultat
   * est prévisible.
   */
  const materiauAcier = new THREE.MeshStandardMaterial({
    color: 0xb9c2cb,
    metalness: 0.55,
    roughness: 0.42,
    roughnessMap: striesUsinage(),
    envMapIntensity: 1.0,
  });
  const materiauSombre = new THREE.MeshStandardMaterial({
    color: 0x1b2126, metalness: 0.35, roughness: 0.78, envMapIntensity: 0.7,
  });

  // Piste de freinage
  const piste = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 0.34, 128), materiauAcier);
  piste.rotation.x = Math.PI / 2;
  disque.add(piste);

  // Bol central, en retrait
  const bol = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.95, 64), materiauSombre);
  bol.rotation.x = Math.PI / 2;
  disque.add(bol);

  // Perçages : deux couronnes, décalées
  const percage = new THREE.CylinderGeometry(0.155, 0.155, 0.42, 20);
  for (const [rayon, nombre, decalage] of [[2.62, 14, 0], [2.06, 11, 0.22]] as const) {
    for (let i = 0; i < nombre; i++) {
      const a = (i / nombre) * Math.PI * 2 + decalage;
      const t = new THREE.Mesh(percage, materiauSombre);
      t.position.set(Math.cos(a) * rayon, Math.sin(a) * rayon, 0);
      t.rotation.x = Math.PI / 2;
      disque.add(t);
    }
  }

  // Rainures radiales
  const rainure = new THREE.BoxGeometry(0.11, 1.05, 0.4);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.4;
    const r = new THREE.Mesh(rainure, materiauSombre);
    r.position.set(Math.cos(a) * 2.35, Math.sin(a) * 2.35, 0);
    r.rotation.z = a - Math.PI / 2;
    disque.add(r);
  }

  // Voile extérieur : la tranche du disque
  const tranche = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.17, 16, 128), materiauAcier);
  disque.add(tranche);

  disque.rotation.x = -0.42;
  disque.rotation.z = 0.14;
  disque.scale.setScalar(0.92);
  scene.add(disque);

  // Lumières : une clé froide d'atelier, un contre-jour rouge Yamaha.
  scene.add(new THREE.AmbientLight(0xbcc7d2, 0.5));
  const cle = new THREE.DirectionalLight(0xeef3f8, 4.2);
  cle.position.set(3, 5, 9);
  scene.add(cle);
  const rim = new THREE.DirectionalLight(ROUGE, 4.2);
  rim.position.set(-6, -2, -3);
  scene.add(rim);
  const appoint = new THREE.DirectionalLight(0x8fa3b8, 1.8);
  appoint.position.set(-5, 4, 2);
  scene.add(appoint);

  // ⚠️ Un canvas ne s'étire pas tout seul : dimensions explicites.
  function dimensionner() {
    const r = toile.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    rendu.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  dimensionner();
  addEventListener('resize', dimensionner, { passive: true });

  // Parallaxe de pointeur, très contenue : 4 degrés au maximum.
  let viseX = 0, viseY = 0, lisseX = 0, lisseY = 0;
  addEventListener('pointermove', (e) => {
    viseX = (e.clientX / innerWidth - 0.5) * 0.14;
    viseY = (e.clientY / innerHeight - 0.5) * 0.09;
  }, { passive: true });

  let actif = true;
  const guetteur = new IntersectionObserver((e) => { actif = e[0].isIntersecting; }, { threshold: 0 });
  guetteur.observe(toile);

  let precedent = performance.now();
  function boucle(t: number) {
    requestAnimationFrame(boucle);
    const dt = Math.min((t - precedent) / 1000, 0.05);
    precedent = t;
    if (!actif || document.hidden) return;

    disque.rotation.y += dt * 0.42;
    lisseX += (viseX - lisseX) * 0.05;
    lisseY += (viseY - lisseY) * 0.05;
    disque.rotation.z = 0.14 + lisseX;
    disque.rotation.x = -0.42 + lisseY;
    rendu.render(scene, camera);
  }
  requestAnimationFrame(boucle);

  toile.dataset.pret = 'oui';
}

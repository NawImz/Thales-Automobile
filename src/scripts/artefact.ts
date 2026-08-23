// Point d'entrée réservé à l'aperçu autonome : mêmes scripts que le site,
// bundlés en un seul fichier (pas de chunk à charger à la demande).
// La scène 3D y est incluse pour que l'aperçu montre le vrai hero.
import './horaires';
import './mouvement';
import { monterScene } from '../components/signature/scene-atelier';

const toile = document.querySelector<HTMLCanvasElement>('[data-scene-atelier]');
const repli = document.querySelector<SVGElement>('[data-repli]');
const webgl = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();

if (toile && webgl && matchMedia('(min-width: 64rem)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  monterScene(toile).then(() => repli?.style.setProperty('opacity', '0')).catch(() => {});
}

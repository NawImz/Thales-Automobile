// Point d'entrée réservé à l'aperçu autonome : mêmes scripts que le site,
// bundlés en un seul fichier (pas de chunk à charger à la demande).
// Les deux scènes 3D y sont incluses pour que l'aperçu montre le vrai site.
import './horaires';
import './mouvement';
import { monterScene } from '../components/signature/scene-atelier';

const grand = matchMedia('(min-width: 64rem)').matches;
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const webgl = (() => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
})();

if (grand && !reduit && webgl) {
  const heroToile = document.querySelector<HTMLCanvasElement>('[data-scene-atelier]');
  const heroRepli = document.querySelector<SVGElement>('[data-repli]');
  if (heroToile) {
    monterScene(heroToile, { mode: 'rotation' })
      .then(() => heroRepli?.style.setProperty('opacity', '0'))
      .catch(() => {});
  }

  const section = document.querySelector<HTMLElement>('[data-trait]');
  const toile = section?.querySelector<HTMLCanvasElement>('[data-scene-charniere]');
  const repli = section?.querySelector<HTMLElement>('[data-repli-charniere]');
  if (section && toile) {
    monterScene(toile, { mode: 'scrub' }).then((api) => {
      repli?.style.setProperty('opacity', '0');
      const mesurer = () => {
        const r = section.getBoundingClientRect();
        const course = r.height - innerHeight;
        return course <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / course));
      };
      // Le basculement des textes vit dans le script du composant, absent
      // de ce bundle : on le refait ici pour que l'aperçu soit fidèle.
      const motRoule = section.querySelector<HTMLElement>('[data-mot="roule"]');
      const motFlotte = section.querySelector<HTMLElement>('[data-mot="flotte"]');
      const legende = section.querySelector<HTMLElement>('[data-legende]');
      const etat = section.querySelector<HTMLElement>('[data-etat]');
      const TEXTE_AUTO = 'Mécanique toutes marques, freinage, distribution, embrayage.';
      const TEXTE_NAUTIQUE = 'Hors-bord, in-board, jet-ski. Entretien, hivernage, dépannage.';

      const relancer = () => {
        const t = mesurer();
        api.setMelange(t);
        const versLeau = t > 0.5;
        if (motRoule) motRoule.style.color = versLeau ? 'var(--color-beton-clair)' : 'var(--color-tole)';
        if (motFlotte) motFlotte.style.color = versLeau ? 'var(--color-tole)' : 'var(--color-beton-clair)';
        if (legende) legende.textContent = versLeau ? TEXTE_NAUTIQUE : TEXTE_AUTO;
        if (etat) etat.textContent = versLeau ? 'Coque acier' : 'Volvo V50';
      };
      addEventListener('scroll', relancer, { passive: true });
      addEventListener('resize', relancer, { passive: true });
      relancer();
    }).catch(() => {});
  }
}

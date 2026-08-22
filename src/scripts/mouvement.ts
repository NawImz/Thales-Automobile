/**
 * Mouvement du site. Un seul type de révélation, réutilisé partout.
 *
 * prefers-reduced-motion ne « réduit » rien : il empêche Lenis d'exister
 * et n'enregistre aucun ScrollTrigger. Les états finaux sont déjà posés
 * en CSS, il n'y a donc rien à faire.
 *
 * La séquence d'arrivée du hero est en CSS pur, pas en GSAP : elle doit
 * tenir sous 900 ms, ce qui est impossible si elle attend le
 * téléchargement d'une librairie.
 */
const REDUIT = matchMedia('(prefers-reduced-motion: reduce)');

if (!REDUIT.matches) {
  demarrerScrollFluide();
  observerRevelations();
}

/** Lenis, chargé sans bloquer le rendu. Jamais sur les zones de saisie. */
async function demarrerScrollFluide() {
  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  (window as any).lenis = lenis;

  let id = requestAnimationFrame(function boucle(t) {
    lenis.raf(t);
    id = requestAnimationFrame(boucle);
  });

  // Lenis écrase les ancres natives : on les réimplémente.
  document.addEventListener('click', (e) => {
    const lien = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!lien) return;
    const hash = lien.getAttribute('href');
    if (!hash || hash === '#') return;
    const cible = document.querySelector(hash);
    if (!cible) return;
    e.preventDefault();
    const entete = document.querySelector('header')?.offsetHeight ?? 0;
    lenis.scrollTo(cible as HTMLElement, { offset: -entete - 16 });
    history.pushState(null, '', hash);
  });

  REDUIT.addEventListener('change', (ev) => {
    if (ev.matches) {
      cancelAnimationFrame(id);
      lenis.destroy();
      delete (window as any).lenis;
    }
  });
}

/**
 * GSAP + ScrollTrigger ne sont téléchargés qu'au moment où une zone
 * révélable approche du viewport. Tant qu'on n'a pas scrollé, ils ne
 * coûtent rien.
 */
function observerRevelations() {
  const zones = document.querySelectorAll<HTMLElement>('[data-revele-groupe], [data-revele]');
  if (!zones.length) return;

  let charge = false;
  const guetteur = new IntersectionObserver(
    (entrees) => {
      if (charge || !entrees.some((e) => e.isIntersecting)) return;
      charge = true;
      guetteur.disconnect();
      void brancherGsap();
    },
    { rootMargin: '300px 0px' }
  );
  zones.forEach((z) => guetteur.observe(z));

  // Filet de sécurité : si l'import échoue (réseau coupé, blocage),
  // on affiche tout plutôt que de laisser une page vide.
  setTimeout(() => {
    if (!charge) return;
    document.querySelectorAll<HTMLElement>('[data-revele]').forEach((el) => {
      if (getComputedStyle(el).opacity === '0') {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 4000);
}

async function brancherGsap() {
  try {
    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);
    }

    const commun = { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' } as const;

    // Un seul trigger par groupe + stagger : sinon l'ordre d'apparition
    // suit la position visuelle et paraît aléatoire.
    document.querySelectorAll<HTMLElement>('[data-revele-groupe]').forEach((groupe) => {
      const enfants = groupe.querySelectorAll('[data-revele]');
      if (!enfants.length) return;
      gsap.to(enfants, {
        ...commun,
        stagger: 0.06,
        scrollTrigger: { trigger: groupe, start: 'top 88%', once: true },
      });
    });

    document.querySelectorAll<HTMLElement>('[data-revele]').forEach((el) => {
      if (el.closest('[data-revele-groupe]')) return;
      gsap.to(el, { ...commun, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });

    ScrollTrigger.refresh();
  } catch {
    // Import impossible : on montre tout, on ne laisse jamais une page vide.
    document.querySelectorAll<HTMLElement>('[data-revele]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}

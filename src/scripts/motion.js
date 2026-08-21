/**
 * Socle d'animation — patterns éprouvés du starter.
 * Rien de décoratif ici : uniquement la plomberie scroll + reveals +
 * compteurs, valable quel que soit le projet.
 */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const headerOffset = () => document.querySelector('[data-header]')?.offsetHeight ?? 0;

/* ── reduced-motion : états finaux, aucune boucle ─────────────────────── */
if (REDUCED) {
  gsap.set('[data-reveal]', { opacity: 1, y: 0, clearProps: 'transform' });
  document.querySelectorAll('[data-counter]').forEach((el) => {
    el.textContent = formatFr(Number(el.dataset.counter));
  });
} else {
  initSmoothScroll();
  initReveals();
  initCounters();
}

initAnchors(); // les ancres doivent marcher dans les deux cas

/* ── Lenis ⇄ ScrollTrigger ────────────────────────────────────────────── */
function initSmoothScroll() {
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  window.lenis = lenis; // exposé pour les tests / le debug

  // Sync obligatoire : sans ça, désync visible au scroll rapide.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ── Ancres : Lenis écrase le comportement natif ──────────────────────── */
function initAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    const offset = -headerOffset();
    if (window.lenis) window.lenis.scrollTo(target, { offset });
    else target.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', hash);
  });
}

/* ── Reveals ──────────────────────────────────────────────────────────── */
function initReveals() {
  const opts = {
    duration: 0.65,
    ease: 'power2.out',
    opacity: 1,
    y: 0,
  };

  // Groupes : UN trigger sur le conteneur + stagger sur les enfants.
  // Sinon l'ordre d'apparition suit la position visuelle et paraît aléatoire.
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    gsap.to(items, {
      ...opts,
      stagger: 0.08,
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play reverse play reverse',
        fastScrollEnd: true,
      },
    });
  });

  // Reveals isolés (hors groupe)
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (el.closest('[data-reveal-group]')) return;
    gsap.to(el, {
      ...opts,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play reverse play reverse',
        fastScrollEnd: true,
      },
    });
  });

  startRevealSafetyNet();
}

/**
 * Filet de sécurité — non négociable.
 * Toutes les 200 ms : si un [data-reveal] est réellement dans le viewport
 * mais encore transparent (ou l'inverse), on recale de force.
 * Garantit « visible à l'écran = affiché », quoi qu'il arrive au scroll.
 */
function startRevealSafetyNet() {
  const check = () => {
    const vh = window.innerHeight;
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const visible = r.top < vh * 0.92 && r.bottom > 0;
      const opacity = Number(getComputedStyle(el).opacity);
      if (visible && opacity < 0.98) {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
      }
    });
  };
  setInterval(check, 200);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ── Compteurs ────────────────────────────────────────────────────────── */
function formatFr(n) {
  return Number.isInteger(n)
    ? n.toLocaleString('fr-FR')
    : n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function initCounters() {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const end = Number(el.dataset.counter);
    if (Number.isNaN(end)) return;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = formatFr(Number.isInteger(end) ? Math.round(obj.v) : Number(obj.v.toFixed(1)));
      },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

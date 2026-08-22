import { statutOuverture } from '../lib/garage';

/**
 * Le statut est rendu au build ; il peut donc dater. On le recalcule
 * à l'affichage, puis toutes les minutes. Sans JS, la valeur du build
 * reste affichée et les horaires écrits sont dans le pied de page.
 */
function rafraichir() {
  const etat = statutOuverture(new Date());
  document.querySelectorAll<HTMLElement>('[data-statut]').forEach((noeud) => {
    const libelle = noeud.querySelector('[data-statut-libelle]');
    const pastille = noeud.querySelector('[data-pastille]');
    if (libelle) libelle.textContent = etat.libelle;

    noeud.classList.toggle('border-bleu-port/30', etat.ouvert);
    noeud.classList.toggle('text-bleu-port', etat.ouvert);
    noeud.classList.toggle('border-beton/40', !etat.ouvert);
    noeud.classList.toggle('text-beton', !etat.ouvert);
    pastille?.classList.toggle('bg-bleu-port', etat.ouvert);
    pastille?.classList.toggle('bg-beton', !etat.ouvert);
  });
}

rafraichir();
setInterval(rafraichir, 60_000);

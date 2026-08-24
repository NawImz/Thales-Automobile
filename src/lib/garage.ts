/**
 * Accès unique aux données du garage.
 *
 * ⚠️ Règle du projet : aucun numéro, horaire ou adresse n'est écrit en dur
 * ailleurs. Tout passe par ici, qui lit `src/content/config/garage.json`.
 * Changer le téléphone sur tout le site = une ligne dans le JSON.
 */
import donnees from '../content/config/garage.json';

export const garage = donnees;
export const a = donnees.adresse;
export const tel = donnees.telephones.principal;

/** `tel:` en format international — jamais en image, jamais en JavaScript. */
export function lienTel(numero: string): string {
  return 'tel:+33' + numero.replace(/\D/g, '').replace(/^0/, '');
}

/** Lien wa.me avec message pré-rempli contextuel. */
export function lienWhatsApp(message: string): string {
  const n = donnees.whatsapp.numeroInternational;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

/**
 * Itinéraire. Tant que les coordonnées GPS ne sont pas fournies, on tombe sur
 * une recherche par adresse — qui fonctionne — plutôt que d'inventer un point.
 */
export function lienItineraire(): string {
  const g = donnees.geo;
  const cible =
    g.latitude !== null && g.longitude !== null
      ? `${g.latitude},${g.longitude}`
      : `${a.rue}, ${a.codePostal} ${a.ville}`;
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(cible);
}

export const adresseComplete = `${a.rue}, ${a.codePostal} ${a.ville}`;

/** « 09:00 » → « 9 h ». Format français, sans zéro inutile. */
export function heureEnTexte(h: string | null): string {
  if (!h) return 'fermé';
  const [heures, minutes] = h.split(':');
  const n = parseInt(heures, 10);
  return minutes === '00' ? `${n} h` : `${n} h ${minutes}`;
}

export type Statut = { ouvert: boolean; texte: string };

/**
 * Ouvert ou fermé, calculé en direct dans le fuseau du garage.
 * Utilise `Intl` plutôt que l'heure locale du visiteur : un client à
 * l'étranger doit voir l'état réel de l'atelier, pas le sien.
 */
export function statutOuverture(maintenant = new Date()): Statut {
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: donnees.fuseau,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(maintenant).map((p) => [p.type, p.value]));
  const jours = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
  const jourIndex = jours.findIndex((j) => (parts.weekday ?? '').toLowerCase().startsWith(j));
  const minutesMaintenant = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);

  const aujourdhui = donnees.horaires.find((h) => h.jour === jourIndex);
  const enMinutes = (t: string) => parseInt(t.slice(0, 2), 10) * 60 + parseInt(t.slice(3), 10);

  if (aujourdhui?.ouvre && aujourdhui.ferme) {
    const debut = enMinutes(aujourdhui.ouvre);
    const fin = enMinutes(aujourdhui.ferme);
    if (minutesMaintenant >= debut && minutesMaintenant < fin) {
      return { ouvert: true, texte: `Ouvert · ferme à ${heureEnTexte(aujourdhui.ferme)}` };
    }
    if (minutesMaintenant < debut) {
      return { ouvert: false, texte: `Fermé · ouvre à ${heureEnTexte(aujourdhui.ouvre)}` };
    }
  }

  // Prochain jour ouvré.
  for (let i = 1; i <= 7; i++) {
    const suivant = donnees.horaires.find((h) => h.jour === (jourIndex + i) % 7);
    if (suivant?.ouvre) {
      const quand = i === 1 ? 'demain' : suivant.nom;
      return { ouvert: false, texte: `Fermé · ouvre ${quand} à ${heureEnTexte(suivant.ouvre)}` };
    }
  }
  return { ouvert: false, texte: 'Fermé' };
}

import donnees from '../content/config/garage.json';

export const garage = donnees;

/** Lien tel: à partir du numéro brut. Le numéro n'est jamais en image ni en JS. */
export const lienTel = (numero: string) => `tel:+33${numero.replace(/^0/, '')}`;

/**
 * Lien WhatsApp avec message pré-rempli, correctement encodé.
 * Le message est contextualisé par page ou par sélection de l'estimateur.
 */
export function lienWhatsApp(message: string): string {
  return `https://wa.me/${garage.whatsapp.numeroInternational}?text=${encodeURIComponent(message)}`;
}

/**
 * Itinéraire. Les coordonnées GPS n'ont pas été fournies et ne sont pas
 * inventées : tant qu'elles sont nulles, on interroge Maps par adresse,
 * ce qui fonctionne parfaitement.
 */
export function lienItineraire(): string {
  const { latitude, longitude } = garage.geo;
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  const a = garage.adresse;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${a.rue}, ${a.codePostal} ${a.ville}`
  )}`;
}

/** « 09:00 » → « 9 h », « 18:30 » → « 18 h 30 ». Jamais de zéro initial. */
export function heureEnTexte(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}

export type Etat = { ouvert: boolean; libelle: string };

/**
 * Statut d'ouverture, calculé en Europe/Paris.
 * Rendu côté serveur au build pour que la page soit correcte sans JS,
 * puis rafraîchi côté client. Aucune promesse de délai n'est faite ici.
 */
export function statutOuverture(maintenant: Date = new Date()): Etat {
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: garage.fuseau,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(maintenant).map((p) => [p.type, p.value]));
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);

  // Jour de la semaine en Europe/Paris, indépendant du fuseau du serveur.
  const jourParis = new Date(maintenant.toLocaleString('en-US', { timeZone: garage.fuseau })).getDay();
  const aujourdhui = garage.horaires.find((h) => h.jour === jourParis);

  const enMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const enTexte = heureEnTexte;

  if (aujourdhui?.ouvre && aujourdhui.ferme) {
    const debut = enMinutes(aujourdhui.ouvre);
    const fin = enMinutes(aujourdhui.ferme);
    if (minutes >= debut && minutes < fin) {
      return { ouvert: true, libelle: `Ouvert · ferme à ${enTexte(aujourdhui.ferme)}` };
    }
    if (minutes < debut) {
      return { ouvert: false, libelle: `Fermé · ouvre à ${enTexte(aujourdhui.ouvre)}` };
    }
  }

  // Fermé : on cherche la prochaine ouverture, jusqu'à sept jours devant.
  for (let d = 1; d <= 7; d++) {
    const j = (jourParis + d) % 7;
    const suivant = garage.horaires.find((h) => h.jour === j);
    if (suivant?.ouvre) {
      const quand = d === 1 ? 'demain' : suivant.nom;
      return { ouvert: false, libelle: `Fermé · ouvre ${quand} à ${enTexte(suivant.ouvre)}` };
    }
  }
  return { ouvert: false, libelle: 'Fermé' };
}

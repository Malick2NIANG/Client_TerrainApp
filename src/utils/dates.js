// Le complexe est a Dakar (UTC+0, sans heure d'ete) : toutes les dates sont
// affichees et choisies a l'heure de Dakar, quel que soit le telephone.
const FUSEAU = 'Africa/Dakar';

const fmt = (options) => new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, ...options });
const HEURE = fmt({ hour: '2-digit', minute: '2-digit' });
const JOUR_COURT = fmt({ weekday: 'short' });
const NUM_JOUR = fmt({ day: 'numeric' });
const MOIS_COURT = fmt({ month: 'short' });
const DATE_LONGUE = fmt({ weekday: 'long', day: 'numeric', month: 'long' });

/** "YYYY-MM-DD" du jour a Dakar. */
export function jourISO(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

/** Les n prochains jours a partir d'aujourd'hui. */
export function prochainsJours(n, depuis = new Date()) {
  const base = Date.UTC(depuis.getUTCFullYear(), depuis.getUTCMonth(), depuis.getUTCDate());
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base + i * 86400000);
    return {
      iso: jourISO(d),
      jourCourt: i === 0 ? 'Auj.' : i === 1 ? 'Dem.' : sansPoint(JOUR_COURT.format(d)),
      numero: NUM_JOUR.format(d),
      mois: sansPoint(MOIS_COURT.format(d)),
    };
  });
}

const sansPoint = (s) => s.replace('.', '');

export const heure = (instant) => HEURE.format(new Date(instant));

/** "samedi 21 novembre" */
export const dateLongue = (instant) => DATE_LONGUE.format(new Date(instant));

/** "19:00 – 20:00" */
export const plage = (debut, fin) => `${heure(debut)} – ${heure(fin)}`;

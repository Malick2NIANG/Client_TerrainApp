/** Le joueur peut noter : match joue (ticket scanne, ou creneau paye termine) et pas encore note. */
export function peutNoter(r, maintenant = Date.now()) {
  if (!r || r.avisNote) return false;
  return r.statut === 'HONOREE' || (r.statut === 'CONFIRMEE' && new Date(r.fin).getTime() < maintenant);
}

/** 4.8 -> "4,8" */
export const noteLisible = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const LIBELLES_NOTE = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];

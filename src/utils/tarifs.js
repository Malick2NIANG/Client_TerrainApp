const COURTS = ['', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

/** Jours d'une plage tarifaire, en clair : "Tous les jours", "Week-end", "lun, mer". */
export function joursEnClair(jours = []) {
  const j = [...jours].sort();
  const cle = j.join();
  if (cle === '1,2,3,4,5,6,7') return 'Tous les jours';
  if (cle === '6,7') return 'Week-end';
  if (cle === '1,2,3,4,5') return 'En semaine';
  return j.map((n) => COURTS[n]).join(', ');
}

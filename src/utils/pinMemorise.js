// Code PIN retenu sur CE telephone, par numero : le client le choisit une
// fois, il est pre-rempli (masque) aux reservations suivantes, et toutes
// ses reservations gardent le meme PIN. Jamais envoye ailleurs qu'a l'API.
const CLE = 'terrainapp_pins_v1';

function lire() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

/** PIN retenu pour ce numero (+221...), ou ''. */
export function pinRetenu(telephone) {
  return (telephone && lire()[telephone]) || '';
}

export function retenirPin(telephone, pin) {
  if (!telephone || !/^\d{4}$/.test(pin || '')) return;
  try {
    localStorage.setItem(CLE, JSON.stringify({ ...lire(), [telephone]: pin }));
  } catch {
    // stockage indisponible : le client retapera son PIN
  }
}

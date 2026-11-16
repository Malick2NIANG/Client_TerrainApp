// Code PIN du client : 4 chiffres, pour retrouver ses reservations depuis un
// autre telephone. Les codes trop evidents sont refuses.
const EVIDENTS = new Set(['1234', '4321', '0123', '9876', '1212', '2580', '0852']);

/** Raison du refus, ou null si le code convient. */
export function refusPin(pin) {
  if (!/^\d{4}$/.test(pin || '')) return 'Le code PIN fait 4 chiffres.';
  if (/^(\d)\1{3}$/.test(pin) || EVIDENTS.has(pin)) return 'Code trop facile à deviner : choisissez-en un autre.';
  return null;
}

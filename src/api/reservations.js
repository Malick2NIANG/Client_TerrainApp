import client from './client';

const JETON = 'X-Jeton-Suivi';

/** Reserve un creneau. La cle evite une double reservation si l'envoi est repete. */
export const reserver = (saisie, cle) =>
  client.post('/reservations', saisie, { headers: { 'Idempotency-Key': cle }, timeout: 20000 }).then((r) => r.data);

export const getReservation = (id, jeton) =>
  client.get(`/reservations/${id}`, { headers: { [JETON]: jeton } }).then((r) => r.data);

/** Autre telephone : envoie un code a 6 chiffres par SMS au numero. */
export const demanderCodeSms = (telephone) =>
  client.post('/reservations/retrouver/code', { telephone }).then(() => true);

/**
 * Numero + code recu par SMS. Renvoie [{ reservation, jetonAcces }] : le
 * jeton d'acces ouvre le detail et le ticket (comme le jeton de suivi).
 */
export const retrouverReservations = (telephone, code) =>
  client.post('/reservations/retrouver', { telephone, code }).then((r) => r.data);

export const relancerPaiement = (reservationId, jeton) =>
  client.post('/paiements/init', { reservationId }, { headers: { [JETON]: jeton } }).then((r) => r.data);

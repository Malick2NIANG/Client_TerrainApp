import client from './client';

const JETON = 'X-Jeton-Suivi';

/** Reserve un creneau. La cle evite une double reservation si l'envoi est repete. */
export const reserver = (saisie, cle) =>
  client.post('/reservations', saisie, { headers: { 'Idempotency-Key': cle }, timeout: 20000 }).then((r) => r.data);

export const getReservation = (id, jeton) =>
  client.get(`/reservations/${id}`, { headers: { [JETON]: jeton } }).then((r) => r.data);

/**
 * Autre telephone : numero + code PIN. Renvoie [{ reservation, jetonAcces }] :
 * le jeton d'acces ouvre le detail et le ticket (comme le jeton de suivi).
 */
export const retrouverReservations = (telephone, pin) =>
  client.post('/reservations/retrouver', { telephone, pin }).then((r) => r.data);

/** PIN oublie : code de recuperation envoye par SMS. */
export const demanderCodeRecuperation = (telephone) =>
  client.post('/reservations/pin-oublie', { telephone }).then(() => true);

/** Code recu par SMS + nouveau PIN : renvoie les reservations retrouvees. */
export const changerPin = (telephone, code, nouveauPin) =>
  client.post('/reservations/pin-oublie/verifier', { telephone, code, nouveauPin }).then((r) => r.data);

export const relancerPaiement = (reservationId, jeton) =>
  client.post('/paiements/init', { reservationId }, { headers: { [JETON]: jeton } }).then((r) => r.data);

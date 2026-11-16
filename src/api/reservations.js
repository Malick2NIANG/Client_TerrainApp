import client from './client';

const JETON = 'X-Jeton-Suivi';

/** Reserve un creneau. La cle evite une double reservation si l'envoi est repete. */
export const reserver = (saisie, cle) =>
  client.post('/reservations', saisie, { headers: { 'Idempotency-Key': cle }, timeout: 20000 }).then((r) => r.data);

export const getReservation = (id, jeton) =>
  client.get(`/reservations/${id}`, { headers: { [JETON]: jeton } }).then((r) => r.data);

/** Historique d'un numero (vue reduite, sans ticket). */
export const getHistorique = (telephone) =>
  client.get('/reservations', { params: { telephone } }).then((r) => r.data);

export const relancerPaiement = (reservationId, jeton) =>
  client.post('/paiements/init', { reservationId }, { headers: { [JETON]: jeton } }).then((r) => r.data);

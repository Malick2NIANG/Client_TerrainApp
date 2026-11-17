import client from './client';

/** Noter le terrain apres le match (jeton de suivi ou d'acces de la reservation). */
export const deposerAvis = (reservationId, jeton, note, commentaire) =>
  client.post(`/reservations/${reservationId}/avis`, { note, commentaire: commentaire?.trim() || null },
    { headers: { 'X-Jeton-Suivi': jeton } }).then((r) => r.data);

/** Avis visibles d'un terrain, les plus recents d'abord. */
export const getAvisTerrain = (terrainId, frais) => client.get(`/terrains/${terrainId}/avis`, frais ? { params: { _: Date.now() } } : undefined).then((r) => r.data);

import client from './client';

export const getSports = () => client.get('/sports').then((r) => r.data);
export const getTerrains = () => client.get('/terrains').then((r) => r.data);
export const getTerrain = (id) => client.get(`/terrains/${id}`).then((r) => r.data);
export const getHoraires = () => client.get('/horaires').then((r) => r.data);

/** Creneaux d'un jour (YYYY-MM-DD) : tous les terrains, ou un seul. */
export const getDisponibilites = (date, terrainId) =>
  client.get('/disponibilites', { params: { date, terrainId } }).then((r) => r.data);

/** Terrains les plus reserves des 30 derniers jours (accueil). */
export const getTendances = (nombre = 4) => client.get('/terrains/tendances', { params: { nombre } }).then((r) => r.data);

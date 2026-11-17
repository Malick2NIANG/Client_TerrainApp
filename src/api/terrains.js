import client from './client';

// Lectures publiques gardees 30 s en cache par le navigateur. Apres un
// changement annonce en temps reel (frais = true), on contourne ce cache :
// l'adresse change, le serveur repond l'etat reel tout de suite.
const opts = (frais, params) => ({ params: frais ? { ...params, _: Date.now() } : params });

export const getSports = (frais) => client.get('/sports', opts(frais)).then((r) => r.data);
export const getTerrains = (frais) => client.get('/terrains', opts(frais)).then((r) => r.data);
export const getTerrain = (id, frais) => client.get(`/terrains/${id}`, opts(frais)).then((r) => r.data);
export const getHoraires = (frais) => client.get('/horaires', opts(frais)).then((r) => r.data);

/** Creneaux d'un jour (YYYY-MM-DD) : tous les terrains, ou un seul. */
export const getDisponibilites = (date, terrainId) =>
  client.get('/disponibilites', { params: { date, terrainId } }).then((r) => r.data);

/** Terrains les plus reserves des 30 derniers jours (accueil). */
export const getTendances = (nombre = 4, frais) => client.get('/terrains/tendances', opts(frais, { nombre })).then((r) => r.data);

import axios from 'axios';
import { signalerRequete } from '../utils/reseau';
import { configuration } from '../config/runtime';

// VITE_API_BASE_URL (.env) ; en Docker : API_BASE_URL dans /config.js (voir config/runtime.js).
export const BASE_URL = configuration('API_BASE_URL', import.meta.env.VITE_API_BASE_URL, '/api/v1');

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Duree de chaque appel transmise a la surveillance reseau (utils/reseau.js).
client.interceptors.request.use((config) => {
  config.debutRequete = performance.now();
  return config;
});

const dureeDepuis = (config) => (config?.debutRequete ? performance.now() - config.debutRequete : 0);

client.interceptors.response.use(
  (response) => {
    signalerRequete({ ok: true, duree: dureeDepuis(response.config) });
    return response;
  },
  (error) => {
    // Pas de reponse = probleme de reseau (une erreur HTTP prouve au
    // contraire que le serveur est joignable).
    signalerRequete({ ok: Boolean(error.response), duree: dureeDepuis(error.config) });
    // L'API renvoie { code, message, field } sur une erreur : les trois sont
    // gardes sur l'Error rejetee (cibler un champ, distinguer les cas).
    const data = error.response?.data;
    // Pas de reponse du tout (reseau coupe, serveur arrete, timeout) : message
    // lisible plutot que "Network Error" / "timeout of 10000ms exceeded".
    // 429 : trop de tentatives, le serveur indique dans combien de secondes
    // reessayer (en-tete Retry-After).
    const retryApres = Number(error.response?.headers?.['retry-after']) || null;
    const message = !error.response
      ? 'Connexion impossible. Vérifiez votre réseau puis réessayez.'
      : error.response.status === 429
        ? `Trop de tentatives. Réessayez dans ${retryApres || 60} secondes.`
        : data?.message || `Erreur du serveur (${error.response.status})`;
    const erreur = new Error(message);
    erreur.code = data?.code;
    erreur.field = data?.field;
    erreur.status = error.response?.status;
    erreur.retryApres = retryApres;
    return Promise.reject(erreur);
  }
);

export default client;
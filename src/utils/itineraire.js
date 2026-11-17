import { marque } from '../config/marque';

/**
 * Lien d'itineraire Google Maps vers le terrain : position GPS du terrain si
 * le gerant l'a renseignee, sinon son quartier, sinon l'adresse du complexe.
 * Ouvre l'appli Maps du telephone (ou le site sur ordinateur).
 */
export function lienItineraire(lieu = {}, m = marque) {
  const { latitude, longitude, localite } = lieu;
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  const texte = [m.adresse || localite, m.adresse ? null : m.nom].filter(Boolean).join(', ');
  return texte ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(texte)}` : null;
}

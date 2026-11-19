// Fiche marque du complexe sportif : nom, monogramme ou logo, couleurs,
// slogan, coordonnees, moyens de paiement, regles de reservation.
//
// La meme application sert plusieurs complexes : rien de la marque n'est
// ecrit dans les ecrans. Tout vient de la configuration, dans cet ordre :
//   1. identite complete du dossier du complexe (MARQUE_COMPLETE dans
//      /config.js, injectee au demarrage du conteneur depuis /marque/marque.json,
//      produite par `npm run client` ; memes champs que GET /api/v1/marque) ;
//   2. variables MARQUE_* (/config.js en Docker, VITE_MARQUE_* du .env) ;
//   3. valeurs par defaut (TerrainApp, comportement d'origine).
import { configuration, configurationObjet } from './runtime';

const env = import.meta.env;

const DEFAUT = {
  nom: 'TerrainApp',
  accent: 'App',
  slogan: 'Votre terrain, réservé en une minute.',
  sousTitre: 'Réservation en ligne · Dakar',
  couleur: '#1F7A4D',
  // Teinte claire d'accent (nom et slogan sur fond sombre) de la marque par defaut.
  couleurClaire: '#6FD39E',
  // Moyens en ligne proposes sans dossier de complexe.
  moyensPaiement: ['wave', 'orange-money', 'mixx-yas', 'carte'],
  margeEntreeMinutes: 30,
};

/** Identite complete du complexe (objet), ou {} sans dossier. */
const complete = configurationObjet('MARQUE_COMPLETE');
const texte = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : '');

/** Valeur du dossier du complexe, sinon variable MARQUE_* / VITE_MARQUE_*, sinon defaut. */
const valeur = (duDossier, cle, valeurVite, defaut) => texte(duDossier) || configuration(cle, valeurVite, defaut);

const nom = valeur(complete.nom, 'MARQUE_NOM', env.VITE_MARQUE_NOM, DEFAUT.nom);
// L'accent par defaut ("App") ne vaut que pour le nom par defaut.
const accentParDefaut = nom === DEFAUT.nom ? DEFAUT.accent : '';

/** Initiales du monogramme : majuscules du nom ("TerrainApp" -> "TA"), sinon 2 premieres lettres. */
export function initialesDe(texteNom) {
  const mots = String(texteNom).trim().split(/\s+/).filter(Boolean);
  const majuscules = String(texteNom).replace(/[^A-ZÀ-Ý]/g, '');
  if (mots.length > 1) return mots.slice(0, 2).map((m) => m[0]).join('').toUpperCase();
  if (majuscules.length >= 2) return majuscules.slice(0, 2);
  return String(texteNom).trim().slice(0, 2).toUpperCase();
}

/** "#A6192E" ou "A6192E" ou "#a19" -> [166, 25, 46] ; null si invalide. */
export function rgbDe(hex) {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** Melange d'une couleur avec du blanc (part > 0) ou du noir (part < 0). */
export function nuance(rgb, part) {
  const cible = part > 0 ? 255 : 0;
  const p = Math.abs(part);
  return rgb.map((c) => Math.round(c + (cible - c) * p));
}

const couleurs = complete.couleurs || {};
const couleurSaisie = valeur(couleurs.principale, 'MARQUE_COULEUR', env.VITE_MARQUE_COULEUR, DEFAUT.couleur);
const couleurRgb = rgbDe(couleurSaisie) || rgbDe(DEFAUT.couleur);
const couleurParDefaut = couleurRgb.join() === rgbDe(DEFAUT.couleur).join();
// Teinte claire : fixee (dossier ou MARQUE_COULEUR_CLAIRE), celle de la
// marque par defaut, ou calculee depuis la couleur principale.
const couleurClaireRgb =
  rgbDe(valeur(couleurs.claire, 'MARQUE_COULEUR_CLAIRE', env.VITE_MARQUE_COULEUR_CLAIRE, '')) ||
  (couleurParDefaut ? rgbDe(DEFAUT.couleurClaire) : nuance(couleurRgb, 0.45));
// Teinte foncee (survol, boutons appuyes) : fixee par le dossier, sinon calculee.
const couleurFonceeRgb = rgbDe(couleurs.foncee) || nuance(couleurRgb, -0.17);

const moyens = Array.isArray(complete.moyensPaiement) && complete.moyensPaiement.length
  ? complete.moyensPaiement.filter((m) => DEFAUT.moyensPaiement.includes(m))
  : DEFAUT.moyensPaiement;
const regles = complete.regles || {};
const gps = complete.gps && Number.isFinite(complete.gps.latitude) && Number.isFinite(complete.gps.longitude)
  ? { latitude: complete.gps.latitude, longitude: complete.gps.longitude }
  : null;

export const marque = Object.freeze({
  nom,
  // Vrai si un dossier de complexe est applique (npm run client).
  personnalise: complete.personnalise === true,
  // Partie du nom mise en couleur (fin du nom) : "TerrainApp" -> TERRAIN + APP.
  accent: valeur(complete.nomAccent, 'MARQUE_NOM_ACCENT', env.VITE_MARQUE_NOM_ACCENT, accentParDefaut),
  initiales: valeur(complete.initiales, 'MARQUE_INITIALES', env.VITE_MARQUE_INITIALES, initialesDe(nom)),
  // URL d'un logo (carre, fond transparent ou plein) : remplace le monogramme.
  logo: valeur(complete.logoUrl, 'MARQUE_LOGO_URL', env.VITE_MARQUE_LOGO_URL, ''),
  // Icone PNG (toujours produite par npm run client) : logo du recu PDF.
  logoPng: complete.personnalise ? '/icons/icon-192.png' : '',
  nomComplexe: texte(complete.nomComplexe) || nom,
  slogan: valeur(complete.slogan, 'MARQUE_SLOGAN', env.VITE_MARQUE_SLOGAN, DEFAUT.slogan),
  sousTitre: valeur(complete.sousTitre, 'MARQUE_SOUS_TITRE', env.VITE_MARQUE_SOUS_TITRE, DEFAUT.sousTitre),
  // Adresse du complexe (ticket, accueil, recu) et contacts.
  adresse: texte([complete.adresse, complete.ville].filter(Boolean).join(', '))
    || configuration('MARQUE_ADRESSE', env.VITE_MARQUE_ADRESSE, ''),
  telephone: texte(complete.telephone),
  email: texte(complete.email),
  whatsapp: valeur(complete.whatsapp, 'MARQUE_WHATSAPP', env.VITE_MARQUE_WHATSAPP, ''),
  gps,
  reseauxSociaux: complete.reseauxSociaux || {},
  imageAccueil: texte(complete.imageAccueilUrl),
  splash: texte(complete.splashUrl),
  // Moyens de paiement en ligne proposes, dans l'ordre du complexe.
  moyensPaiement: Object.freeze(moyens),
  margeEntreeMinutes: Number.isInteger(regles.margeEntreeMinutes) ? regles.margeEntreeMinutes : DEFAUT.margeEntreeMinutes,
  delaiAnnulationHeures: Number.isInteger(regles.delaiAnnulationHeures) ? regles.delaiAnnulationHeures : null,
  // Nom en tete des tickets et recus PDF, et phrase de pied du recu.
  etablissement: texte(complete.documents?.nomSurTickets),
  piedDeRecu: texte(complete.documents?.piedDeRecu) || 'Merci et bon match !',
  accueilTitre: texte(complete.textes?.accueilTitre),
  accueilSousTitre: texte(complete.textes?.accueilSousTitre),
  aPropos: texte(complete.textes?.aPropos),
  couleur: `#${couleurRgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase(),
  couleurRgb,
  couleurFonceeRgb,
  couleurClaireRgb,
});

/** Nom decoupe pour l'affichage en deux tons : { debut, accent }. */
export function nomEnDeuxTons(m = marque) {
  const { nom: n, accent } = m;
  if (accent && n.toLowerCase().endsWith(accent.toLowerCase()) && accent.length < n.length) {
    return { debut: n.slice(0, n.length - accent.length), accent: n.slice(n.length - accent.length) };
  }
  return { debut: n, accent: '' };
}

/** Slogan en deux lignes, coupe a la premiere virgule : { ligne1, ligne2 }. */
export function sloganEnDeuxLignes(s = marque.accueilTitre || marque.slogan) {
  const i = s.indexOf(',');
  if (i < 0) return { ligne1: s, ligne2: '' };
  return { ligne1: s.slice(0, i + 1), ligne2: s.slice(i + 1).trim() };
}

/** Moyens de paiement en ligne en toutes lettres : "Wave, Orange Money ou carte". */
export function moyensEnToutesLettres(moyens = marque.moyensPaiement) {
  const noms = { wave: 'Wave', 'orange-money': 'Orange Money', 'mixx-yas': 'Mixx', carte: 'carte' };
  const l = moyens.map((m) => noms[m]).filter(Boolean);
  return l.length > 1 ? `${l.slice(0, -1).join(', ')} ou ${l[l.length - 1]}` : l[0] || '';
}

/**
 * Applique la marque a la page, avant le premier rendu : variables CSS de
 * couleur (utilisees par Tailwind : bg-primary, text-primary...), titre de
 * l'onglet et couleur de la barre du navigateur.
 */
export function appliquerMarque(m = marque, doc = document) {
  const racine = doc.documentElement.style;
  const triplet = (rgb) => rgb.join(' ');
  racine.setProperty('--marque', triplet(m.couleurRgb));
  racine.setProperty('--marque-fonce', triplet(m.couleurFonceeRgb || nuance(m.couleurRgb, -0.17)));
  racine.setProperty('--marque-clair', triplet(m.couleurClaireRgb));
  racine.setProperty('--marque-sombre', triplet(nuance(m.couleurRgb, -0.45)));
  racine.setProperty('--marque-nuit', triplet(nuance(m.couleurRgb, -0.75)));
  doc.title = m.nom;
  // Barre du navigateur : la teinte nuit de la marque (en-tete sombre de l'app).
  const theme = doc.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', `rgb(${nuance(m.couleurRgb, -0.75).join(',')})`);
}

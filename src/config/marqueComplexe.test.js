import { afterEach, describe, expect, it, vi } from 'vitest';

// Identite complete du dossier du complexe (MARQUE_COMPLETE dans /config.js,
// produite par npm run client) : appliquee aux ecrans, au ticket et au recu.

afterEach(() => {
  delete window.__TERRAINAPP_CONFIG__;
  vi.resetModules();
  document.title = '';
});

const COMPLEXE = {
  nom: 'Arena Teranga',
  nomAccent: 'Teranga',
  nomComplexe: 'Complexe Arena Teranga',
  slogan: 'Jouez chez vous, réservez en un clic.',
  adresse: 'Corniche Ouest',
  ville: 'Saly',
  whatsapp: '+221 77 111 22 33',
  personnalise: true,
  couleurs: { principale: '#C2410C', foncee: '#7C2D12' },
  logoUrl: '/marque/logo.png',
  imageAccueilUrl: '/marque/accueil.jpg',
  gps: { latitude: 14.4458, longitude: -17.0058 },
  reseauxSociaux: { instagram: 'https://instagram.com/teranga' },
  moyensPaiement: ['orange-money', 'wave'],
  regles: { pasCreneauMinutes: 30, delaiAnnulationHeures: 24, margeEntreeMinutes: 15 },
  documents: { nomSurTickets: 'ARENA TERANGA', piedDeRecu: 'À bientôt sur nos terrains !' },
  textes: { accueilTitre: 'Le foot, côté plage.', accueilSousTitre: 'Deux terrains face à la mer' },
};

const charger = async (config) => {
  window.__TERRAINAPP_CONFIG__ = config;
  return import('./marque');
};

describe('dossier du complexe', () => {
  it('nom, logo, couleurs, textes et regles', async () => {
    const { marque, nomEnDeuxTons, sloganEnDeuxLignes } = await charger({ MARQUE_COMPLETE: COMPLEXE });
    expect(marque.nom).toBe('Arena Teranga');
    expect(marque.personnalise).toBe(true);
    expect(nomEnDeuxTons()).toEqual({ debut: 'Arena ', accent: 'Teranga' });
    expect(marque.logo).toBe('/marque/logo.png');
    expect(marque.logoPng).toBe('/icons/icon-192.png');
    expect(marque.couleur).toBe('#C2410C');
    expect(marque.couleurFonceeRgb).toEqual([124, 45, 18]);
    expect(marque.adresse).toBe('Corniche Ouest, Saly');
    expect(marque.imageAccueil).toBe('/marque/accueil.jpg');
    expect(marque.etablissement).toBe('ARENA TERANGA');
    expect(marque.piedDeRecu).toBe('À bientôt sur nos terrains !');
    expect(marque.margeEntreeMinutes).toBe(15);
    expect(marque.delaiAnnulationHeures).toBe(24);
    expect(sloganEnDeuxLignes()).toEqual({ ligne1: 'Le foot,', ligne2: 'côté plage.' });
  });

  it('prime sur les variables MARQUE_*', async () => {
    const { marque } = await charger({ MARQUE_COMPLETE: COMPLEXE, MARQUE_NOM: 'Autre', MARQUE_COULEUR: '#000000' });
    expect(marque.nom).toBe('Arena Teranga');
    expect(marque.couleur).toBe('#C2410C');
  });

  it('moyens de paiement du complexe, dans son ordre', async () => {
    const { marque, moyensEnToutesLettres } = await charger({ MARQUE_COMPLETE: COMPLEXE });
    expect(marque.moyensPaiement).toEqual(['orange-money', 'wave']);
    expect(moyensEnToutesLettres()).toBe('Orange Money ou Wave');
    const { MOYENS_PAIEMENT } = await import('../components/MoyensPaiement');
    expect(MOYENS_PAIEMENT.map((m) => m.id)).toEqual(['orange-money', 'wave']);
  });

  it('itineraire : GPS du complexe quand le terrain n en a pas', async () => {
    await charger({ MARQUE_COMPLETE: COMPLEXE });
    const { lienItineraire } = await import('../utils/itineraire');
    expect(lienItineraire({})).toBe('https://www.google.com/maps/dir/?api=1&destination=14.4458,-17.0058');
    expect(lienItineraire({ latitude: 1, longitude: 2 })).toContain('destination=1,2');
  });

  it('appliquee a la page : titre, couleur principale et foncee', async () => {
    const { marque, appliquerMarque } = await charger({ MARQUE_COMPLETE: COMPLEXE });
    appliquerMarque(marque, document);
    expect(document.title).toBe('Arena Teranga');
    expect(document.documentElement.style.getPropertyValue('--marque')).toBe('194 65 12');
    expect(document.documentElement.style.getPropertyValue('--marque-fonce')).toBe('124 45 18');
  });

  it('sans dossier : comportement d origine (TerrainApp, tous les moyens, 30 min)', async () => {
    const { marque } = await charger({});
    expect(marque.nom).toBe('TerrainApp');
    expect(marque.personnalise).toBe(false);
    expect(marque.moyensPaiement).toEqual(['wave', 'orange-money', 'mixx-yas', 'carte']);
    expect(marque.margeEntreeMinutes).toBe(30);
    expect(marque.delaiAnnulationHeures).toBeNull();
    expect(marque.piedDeRecu).toBe('Merci et bon match !');
    expect(marque.logoPng).toBe('');
  });

  it('identite invalide (pas un objet) ignoree', async () => {
    const { marque } = await charger({ MARQUE_COMPLETE: 'pas un objet', MARQUE_NOM: 'Chez Fatou' });
    expect(marque.nom).toBe('Chez Fatou');
  });
});

import { describe, expect, it } from 'vitest';
import { lancementDeLApp } from './splash';

describe('ecran de demarrage', () => {
  it('seulement au vrai lancement de l app', () => {
    expect(lancementDeLApp({ chemin: '/', typeNavigation: 'navigate', dejaJoue: false })).toBe(true);
    // Retour du paiement, lien partage : pas d'animation.
    expect(lancementDeLApp({ chemin: '/reservations/12', typeNavigation: 'navigate', dejaJoue: false })).toBe(false);
    expect(lancementDeLApp({ chemin: '/terrains/3', typeNavigation: 'navigate', dejaJoue: false })).toBe(false);
    // Rechargement, bouton retour, deja vu dans la session.
    expect(lancementDeLApp({ chemin: '/', typeNavigation: 'reload', dejaJoue: false })).toBe(false);
    expect(lancementDeLApp({ chemin: '/', typeNavigation: 'back_forward', dejaJoue: false })).toBe(false);
    expect(lancementDeLApp({ chemin: '/', typeNavigation: 'navigate', dejaJoue: true })).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { lienItineraire } from './itineraire';

describe('itineraire', () => {
  it('GPS du terrain en priorite', () => {
    expect(lienItineraire({ latitude: 14.7256, longitude: -17.4569 }, { adresse: 'X' }))
      .toBe('https://www.google.com/maps/dir/?api=1&destination=14.7256,-17.4569');
  });
  it('sinon adresse du complexe, sinon quartier', () => {
    expect(lienItineraire({}, { adresse: 'Route de Ngor, Dakar' })).toContain(encodeURIComponent('Route de Ngor, Dakar'));
    expect(lienItineraire({ localite: 'Mermoz, Dakar' }, { nom: 'TerrainApp', adresse: '' }))
      .toContain(encodeURIComponent('Mermoz, Dakar, TerrainApp'));
    expect(lienItineraire({}, { nom: '', adresse: '' })).toBeNull();
  });
});

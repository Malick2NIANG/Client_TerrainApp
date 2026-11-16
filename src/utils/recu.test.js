import { describe, expect, it } from 'vitest';
import { lignesRecu, pdfTexte, telephoneMasque } from './recu';

describe('recu PDF', () => {
  it('masque le numero et nettoie le texte pour le PDF', () => {
    expect(telephoneMasque('+221771234567')).toBe('77 *** ** 67');
    expect(pdfTexte('15 000 F CFA – d’accord')).toBe("15 000 F CFA - d'accord");
  });
  it('lignes du recu', () => {
    const l = lignesRecu({ reference: 'RABC234', terrain: 'Terrain A', sport: 'Football 5', localite: 'Liberté 6',
      debut: '2026-11-20T18:00:00Z', fin: '2026-11-20T19:00:00Z', clientNom: 'Awa', clientTelephone: '+221771234567',
      moyenPaiement: 'wave', payeeLe: '2026-11-16T10:00:00Z' });
    expect(Object.fromEntries(l)).toMatchObject({ Référence: 'RABC234', Lieu: 'Liberté 6', Paiement: 'Wave', Téléphone: '77 *** ** 67' });
    expect(l.find(([k]) => k === 'Créneau')[1]).toBe('18:00 – 19:00');
  });
});

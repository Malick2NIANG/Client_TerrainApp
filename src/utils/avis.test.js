import { describe, expect, it } from 'vitest';
import { noteLisible, peutNoter } from './avis';

describe('avis', () => {
  const fin = '2026-11-20T20:00:00Z';
  it('noter apres le match, une seule fois', () => {
    expect(peutNoter({ statut: 'HONOREE', fin }, Date.parse('2026-11-20T19:00:00Z'))).toBe(true);
    expect(peutNoter({ statut: 'CONFIRMEE', fin }, Date.parse('2026-11-20T21:00:00Z'))).toBe(true);
    expect(peutNoter({ statut: 'CONFIRMEE', fin }, Date.parse('2026-11-20T19:00:00Z'))).toBe(false);
    expect(peutNoter({ statut: 'HONOREE', fin, avisNote: 4 })).toBe(false);
    expect(peutNoter({ statut: 'ANNULEE', fin }, Date.parse('2026-11-21T00:00:00Z'))).toBe(false);
  });
  it('note a la francaise', () => {
    expect(noteLisible(4.8)).toBe('4,8');
    expect(noteLisible(4)).toBe('4,0');
  });
});

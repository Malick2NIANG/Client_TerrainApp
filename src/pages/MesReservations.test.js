import { describe, expect, it } from 'vitest';
import { correspond, estAVenir } from './MesReservations';

const r = { terrain: 'Grand terrain', sport: 'Football 7', reference: 'RABC234', debut: '2026-11-20T18:00:00Z',
  fin: '2026-11-20T19:30:00Z', statut: 'CONFIRMEE', localite: 'Mermoz, Dakar' };

describe('mes reservations', () => {
  it('a venir : payee ou en attente, pas terminee', () => {
    expect(estAVenir(r, Date.parse('2026-11-20T19:00:00Z'))).toBe(true);
    expect(estAVenir(r, Date.parse('2026-11-20T20:00:00Z'))).toBe(false);
    expect(estAVenir({ ...r, statut: 'ANNULEE' }, Date.parse('2026-11-01T00:00:00Z'))).toBe(false);
  });
  it('recherche dans l historique', () => {
    expect(correspond(r, 'grand')).toBe(true);
    expect(correspond(r, 'rabc')).toBe(true);
    expect(correspond(r, 'mermoz foot')).toBe(true);
    expect(correspond(r, 'padel')).toBe(false);
  });
});

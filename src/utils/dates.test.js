import { describe, expect, it } from 'vitest';
import { heure, jourISO, plage, prochainsJours } from './dates';

describe('dates a l heure de Dakar', () => {
  it('jour et heures', () => {
    expect(jourISO(new Date('2026-11-20T23:30:00Z'))).toBe('2026-11-20');
    expect(heure('2026-11-20T19:00:00Z')).toBe('19:00');
    expect(plage('2026-11-20T19:00:00Z', '2026-11-20T20:30:00Z')).toBe('19:00 – 20:30');
  });

  it('prochains jours : aujourd hui puis demain', () => {
    const j = prochainsJours(3, new Date('2026-11-20T10:00:00Z'));
    expect(j.map((x) => x.iso)).toEqual(['2026-11-20', '2026-11-21', '2026-11-22']);
    expect(j[0].jourCourt).toBe('Auj.');
    expect(j[1].jourCourt).toBe('Dem.');
    expect(j[2].numero).toBe('22');
  });
});

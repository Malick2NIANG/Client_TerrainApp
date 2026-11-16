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

describe('horaires du complexe', () => {
  it('jour de la semaine a Dakar, lundi = 1', async () => {
    const { jourSemaine, horaireDuJour } = await import('./dates');
    expect(jourSemaine(new Date('2026-11-16T10:00:00Z'))).toBe(1);
    expect(jourSemaine(new Date('2026-11-22T23:30:00Z'))).toBe(7);
    const horaires = [{ jour: 1, ouvert: true, ouverture: '08:00:00', fermeture: '01:00:00' }, { jour: 7, ouvert: false }];
    expect(horaireDuJour(horaires, new Date('2026-11-16T10:00:00Z'))).toBe('08:00 – 01:00');
    expect(horaireDuJour(horaires, new Date('2026-11-22T10:00:00Z'))).toBeNull();
  });
});

describe('telephone en deux cases', () => {
  it('met en forme le numero local et refuse l indicatif tape', async () => {
    const { formaterSaisieLocale, telephoneDepuisLocal } = await import('./telephone');
    expect(formaterSaisieLocale('771234567')).toBe('77 123 45 67');
    expect(formaterSaisieLocale('77 1234')).toBe('77 123 4');
    expect(formaterSaisieLocale('+221 77 123 45 67')).toBe('77 123 45 67');
    expect(formaterSaisieLocale('7712345678899')).toBe('77 123 45 67');
    expect(telephoneDepuisLocal('77 123 45 67')).toBe('+221771234567');
    expect(telephoneDepuisLocal('12 345 67 89')).toBeNull();
  });
});

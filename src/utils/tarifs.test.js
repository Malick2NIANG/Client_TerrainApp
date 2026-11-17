import { describe, expect, it } from 'vitest';
import { joursEnClair } from './tarifs';

describe('tarifs', () => {
  it('jours en clair', () => {
    expect(joursEnClair([7, 1, 2, 3, 4, 5, 6])).toBe('Tous les jours');
    expect(joursEnClair([6, 7])).toBe('Week-end');
    expect(joursEnClair([1, 2, 3, 4, 5])).toBe('En semaine');
    expect(joursEnClair([3, 1])).toBe('lun, mer');
  });
});

import { describe, expect, it } from 'vitest';
import { refusPin } from './pin';

describe('code PIN', () => {
  it('4 chiffres, pas trop evident', () => {
    expect(refusPin('8642')).toBeNull();
    expect(refusPin('12')).toMatch(/4 chiffres/);
    expect(refusPin('12a4')).toMatch(/4 chiffres/);
    expect(refusPin('0000')).toMatch(/deviner/);
    expect(refusPin('1234')).toMatch(/deviner/);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { pinRetenu, retenirPin } from './pinMemorise';

describe('PIN retenu sur le telephone', () => {
  beforeEach(() => localStorage.clear());
  it('par numero, 4 chiffres seulement', () => {
    expect(pinRetenu('+221771234567')).toBe('');
    retenirPin('+221771234567', '8642');
    retenirPin('+221701112233', '12');
    expect(pinRetenu('+221771234567')).toBe('8642');
    expect(pinRetenu('+221701112233')).toBe('');
  });
});

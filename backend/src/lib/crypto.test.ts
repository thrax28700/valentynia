import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, mask, sha256 } from './crypto';

describe('crypto — AES-256-GCM', () => {
  it('déchiffre ce qu’il a chiffré (aller-retour)', () => {
    const clair = 'FR7630006000011234567890189';
    const chiffre = encrypt(clair);
    expect(chiffre).not.toBe(clair);
    expect(decrypt(chiffre)).toBe(clair);
  });

  it('produit un chiffré différent à chaque appel (IV aléatoire)', () => {
    expect(encrypt('secret')).not.toBe(encrypt('secret'));
  });

  it('échoue si le chiffré est altéré (authenticité GCM)', () => {
    const c = encrypt('donnée sensible');
    const buf = Buffer.from(c, 'base64');
    buf[buf.length - 1] ^= 0x01; // flip d’un bit
    expect(() => decrypt(buf.toString('base64'))).toThrow();
  });
});

describe('mask', () => {
  it('ne laisse visibles que les 4 derniers caractères', () => {
    const m = mask('FR7630006000011234567890189');
    expect(m.endsWith('0189')).toBe(true);
    expect(m).not.toContain('7630');
  });
});

describe('sha256', () => {
  it('est déterministe et de longueur 64 hex', () => {
    const a = sha256('abc');
    expect(a).toBe(sha256('abc'));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

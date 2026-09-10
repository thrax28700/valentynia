import crypto from 'node:crypto';
import { env } from '../config/env';

/**
 * Chiffrement symétrique AES-256-GCM des données sensibles au repos
 * (IBAN, numéro de sécurité sociale...).
 *
 * Format de sortie : base64( iv(12) | authTag(16) | ciphertext ).
 */
const KEY = Buffer.from(env.AES_KEY, 'hex'); // 32 octets
const IV_LEN = 12;
const TAG_LEN = 16;

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, IV_LEN);
  const tag = raw.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const data = raw.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

/** Masque une donnée déchiffrée pour l'affichage (ex. IBAN). */
export function mask(value: string, visible = 4): string {
  const clean = value.replace(/\s+/g, '');
  if (clean.length <= visible) return '•'.repeat(clean.length);
  return '•••• •••• •••• ' + clean.slice(-visible);
}

export const sha256 = (input: string | Buffer): string =>
  crypto.createHash('sha256').update(input).digest('hex');

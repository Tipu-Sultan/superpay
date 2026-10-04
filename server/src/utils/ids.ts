import { randomBytes, randomInt } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Public transaction id, e.g. SP7K2M9XQ4T8LD3B. Not guessable, easy to read out loud. */
export function generateTransactionId(): string {
  const bytes = randomBytes(14);
  let out = 'SP';
  for (let i = 0; i < 14; i += 1) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

/** 12 digit bank-style reference number (simulated). */
export function generateReferenceNo(): string {
  let out = '';
  for (let i = 0; i < 12; i += 1) out += randomInt(0, 10).toString();
  return out;
}

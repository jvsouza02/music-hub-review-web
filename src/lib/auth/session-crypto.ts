import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET is not configured.');
  }

  const key = Buffer.from(secret, 'base64');

  if (key.length !== 32 || key.toString('base64') !== secret) {
    throw new Error('SESSION_SECRET must be a valid base64-encoded 32-byte key.');
  }

  return key;
}

export function encryptSession(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [
    'v1',
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptSession(payload: string): string {
  const key = getEncryptionKey();

  const parts = payload.split('.');

  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('Invalid encrypted session format.');
  }

  const [, encodedIv, encodedAuthTag, encodedData] = parts;

  const iv = Buffer.from(encodedIv, 'base64url');
  const authTag = Buffer.from(encodedAuthTag, 'base64url');
  const encrypted = Buffer.from(encodedData, 'base64url');

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH || encrypted.length === 0) {
    throw new Error('Invalid encrypted session payload.');
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}

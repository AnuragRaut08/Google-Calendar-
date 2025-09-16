// src/lib/encrypt.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY || 'replace_with_env_ENCRYPTION_KEY';

function getKeyBuffer() {
  return crypto.createHash('sha256').update(String(KEY)).digest();
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(data: string) {
  const raw = Buffer.from(data, 'base64');
  const iv = raw.slice(0, 12);
  const tag = raw.slice(12, 28);
  const encrypted = raw.slice(28);
  const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

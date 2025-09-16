// src/lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'changemejwtsecret';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export function signSession(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySession(token: string): object | null {
  try {
    return jwt.verify(token, JWT_SECRET) as object;
  } catch (e) {
    return null;
  }
}

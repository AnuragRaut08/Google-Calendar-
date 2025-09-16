// src/pages/api/auth/google.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUrl } from '../../../lib/google';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { role } = req.query;

  if (role !== 'SELLER' && role !== 'BUYER') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const url = getAuthUrl(role);
  res.redirect(url);
}

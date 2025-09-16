// src/pages/api/sellers.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // returns basic seller info
  const sellers = await prisma.user.findMany({
    where: { role: 'SELLER' },
    select: { id: true, name: true, email: true, picture: true }
  });
  res.json(sellers);
}

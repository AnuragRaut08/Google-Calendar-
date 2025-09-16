// src/pages/api/availability.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';
import { getCalendarClientFromEncryptedToken } from '../../lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sellerId, timeMin, timeMax } = req.query;
  if (!sellerId) return res.status(400).send('sellerId required');

  const seller = await prisma.user.findUnique({ where: { id: String(sellerId) } });
  if (!seller || !seller.refreshToken) return res.status(404).send('Seller or refresh token not found');

  try {
    const calendar = await getCalendarClientFromEncryptedToken(seller.refreshToken);
    const resp = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin ? String(timeMin) : new Date().toISOString(),
        timeMax: timeMax ? String(timeMax) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        items: [{ id: 'primary' }],
      }
    });
    // resp.data.calendars.primary.busy -> array of busy ranges
    res.json(resp.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching freebusy');
  }
}

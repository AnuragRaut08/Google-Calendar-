// src/pages/api/book.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/db';
import { getCalendarClientFromEncryptedToken, createOAuthClient } from '../../lib/google';
import { decrypt } from '../../lib/encrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'changemejwtsecret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.session;
  if (!token) return res.status(401).send('Not authenticated');

  let payload: any = null;
  try { payload = jwt.verify(token, JWT_SECRET); } catch (e) { return res.status(401).send('Invalid token'); }

  const { sellerId, start, end, title, description } = req.body;
  if (!sellerId || !start || !end) return res.status(400).send('Missing fields');

  const buyer = await prisma.user.findUnique({ where: { id: payload.userId } });
  const seller = await prisma.user.findUnique({ where: { id: String(sellerId) } });

  if (!buyer || !seller) return res.status(404).send('User not found');

  if (!seller.refreshToken) return res.status(400).send('Seller has no refresh token');

  try {
    // Get seller calendar client (using saved refresh token)
    const sellerCal = await getCalendarClientFromEncryptedToken(seller.refreshToken);
    // For buyer we might have access_token in DB from login; if not, we can create event with seller only and add buyer as attendee (Google will send invite by email)
    let buyerAuthClient = null;
    if (buyer.refreshToken) {
      const { getCalendarClientFromEncryptedToken } = await import('../../lib/google');
      buyerAuthClient = await getCalendarClientFromEncryptedToken(buyer.refreshToken);
    } else if (buyer.accessToken) {
      const client = createOAuthClient();
      client.setCredentials({ access_token: buyer.accessToken });
      buyerAuthClient = require('googleapis').google.calendar({ version: 'v3', auth: client });
    }

    // Create event body
    const event = {
      summary: title || `Appointment with ${seller.name}`,
      description: description || '',
      start: { dateTime: new Date(start).toISOString() },
      end: { dateTime: new Date(end).toISOString() },
      attendees: [{ email: seller.email }, { email: buyer.email }],
      // request conference (Google Meet)
      conferenceData: { createRequest: { requestId: `req-${Date.now()}` } }
    };

    // Insert into seller calendar (primary). Use conferenceDataVersion param for meet
    const created = await sellerCal.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    const googleEventId = created.data.id;

    // Optionally insert on buyer calendar if buyerAuthClient exists
    if (buyerAuthClient) {
      await buyerAuthClient.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1
      });
    }

    // Persist appointment
    const appt = await prisma.appointment.create({
      data: {
        sellerId: seller.id,
        buyerId: buyer.id,
        start: new Date(start),
        end: new Date(end),
        googleEventId: googleEventId ?? undefined,
      }
    });

    res.json({ ok: true, appointment: appt, googleEvent: created.data });
  } catch (err) {
    console.error('booking error', err);
    res.status(500).send('Booking failed');
  }
}

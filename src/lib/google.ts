// src/lib/google.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(role: 'SELLER' | 'BUYER') {
  const client = createOAuthClient();
  const scopes = ['https://www.googleapis.com/auth/calendar'];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: role,
  });
}

export async function getCalendarClientFromEncryptedToken(encryptedToken: string) {
  // 🔐 decrypt if needed before parsing
  const token = JSON.parse(encryptedToken);
  const client = createOAuthClient();
  client.setCredentials(token);
  return google.calendar({ version: 'v3', auth: client });
}

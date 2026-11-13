import 'server-only';

import { cookies } from 'next/headers';

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function getCookieName(): string {
  const name = process.env.SESSION_COOKIE_NAME;

  if (!name || !/^[A-Za-z0-9_-]+$/.test(name)) {
    throw new Error('SESSION_COOKIE_NAME is invalid or missing.');
  }

  return name;
}

export async function getSessionIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(getCookieName())?.value;

  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
    return null;
  }

  return sessionId;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    throw new Error('Invalid session identifier.');
  }

  const cookieStore = await cookies();

  cookieStore.set(getCookieName(), sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(getCookieName(), '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });
}

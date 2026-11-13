import 'server-only';

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { getRedisClient } from '@/lib/auth/redis';
import { getSessionIdFromCookie } from '@/lib/auth/session-cookie';
import { getSession } from '@/lib/auth/session-store';

const CSRF_TTL_SECONDS = 30 * 60;
const CSRF_PREFIX = 'mhr:csrf:';

function getCsrfSecret(): Buffer {
  const secret = process.env.CSRF_SECRET;

  if (!secret) {
    throw new Error('CSRF_SECRET is not configured.');
  }

  const key = Buffer.from(secret, 'base64');

  if (key.length !== 32 || key.toString('base64') !== secret) {
    throw new Error('CSRF_SECRET must be a valid base64-encoded 32-byte key.');
  }

  return key;
}

function getAppOrigin(): string {
  const configuredOrigin = process.env.APP_ORIGIN;

  if (!configuredOrigin) {
    throw new Error('APP_ORIGIN is not configured.');
  }

  const parsed = new URL(configuredOrigin);

  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error('APP_ORIGIN must be a valid application origin.');
  }

  return parsed.origin;
}

function getPreAuthTokenKey(token: string): string {
  const digest = createHmac('sha256', getCsrfSecret()).update(token).digest('hex');

  return `${CSRF_PREFIX}${digest}`;
}

function isValidTokenFormat(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}

function safeCompare(first: string, second: string): boolean {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');

  if (!origin) {
    return false;
  }

  try {
    if (new URL(origin).origin !== getAppOrigin()) {
      return false;
    }
  } catch {
    return false;
  }

  const fetchSite = request.headers.get('sec-fetch-site');

  if (fetchSite && fetchSite !== 'same-origin') {
    return false;
  }

  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();

  return contentType === 'application/json';
}

export async function createPreAuthCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString('base64url');

  const redis = await getRedisClient();

  await redis.set(getPreAuthTokenKey(token), '1', {
    EX: CSRF_TTL_SECONDS,
  });

  return token;
}

export async function verifyCsrfRequest(request: Request): Promise<boolean> {
  if (!isSameOriginRequest(request)) {
    return false;
  }

  const token = request.headers.get('x-csrf-token');

  if (!token || !isValidTokenFormat(token)) {
    return false;
  }

  const sessionId = await getSessionIdFromCookie();

  if (sessionId) {
    const session = await getSession(sessionId);

    if (!session) {
      return false;
    }

    return safeCompare(token, session.csrfToken);
  }

  const redis = await getRedisClient();

  const exists = await redis.exists(getPreAuthTokenKey(token));

  return exists === 1;
}

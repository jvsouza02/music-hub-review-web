import 'server-only';

import { createHash, randomBytes } from 'node:crypto';

import { ServerAuthError, logoutWithServer, refreshWithServer } from '@/lib/auth/server';

import { getRedisClient } from '@/lib/auth/redis';

import {
  deleteSession,
  getSession,
  updateSession,
  type ServerSession,
} from '@/lib/auth/session-store';

const LOCK_PREFIX = 'mhr:session-refresh-lock:';

const LOCK_TTL_SECONDS = 20;
const ACCESS_REFRESH_WINDOW_MS = 60_000;
const MINIMUM_REMAINING_ACCESS_MS = 5_000;

const WAIT_TIMEOUT_MS = 25_000;
const POLL_INTERVAL_MS = 100;

const RELEASE_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end

return 0
`;

export class SessionRefreshUnavailableError extends Error {
  constructor(message = 'Session refresh is temporarily unavailable.') {
    super(message);
    this.name = 'SessionRefreshUnavailableError';
  }
}

function getLockKey(sessionId: string): string {
  const hash = createHash('sha256').update(sessionId).digest('hex');

  return `${LOCK_PREFIX}${hash}`;
}

function hasUsableAccessToken(session: ServerSession): boolean {
  return session.accessTokenExpiresAt > Date.now() + ACCESS_REFRESH_WINDOW_MS;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function refreshWhileLocked(sessionId: string): Promise<ServerSession | null> {
  const currentSession = await getSession(sessionId);

  if (!currentSession) {
    return null;
  }

  if (hasUsableAccessToken(currentSession)) {
    return currentSession;
  }

  if (currentSession.refreshTokenExpiresAt <= Date.now()) {
    await deleteSession(sessionId);
    return null;
  }

  let tokens;

  try {
    tokens = await refreshWithServer(currentSession.refreshToken);
  } catch (error) {
    if (error instanceof ServerAuthError && [401, 403].includes(error.status)) {
      await deleteSession(sessionId);
      return null;
    }

    if (currentSession.accessTokenExpiresAt > Date.now() + MINIMUM_REMAINING_ACCESS_MS) {
      return currentSession;
    }

    throw new SessionRefreshUnavailableError();
  }

  const updatedSession: ServerSession = {
    ...currentSession,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
  };

  const updated = await updateSession(sessionId, updatedSession);

  if (!updated) {
    try {
      await logoutWithServer(tokens.refreshToken);
    } catch {
      console.error('[Auth] Could not revoke a refresh token after session removal.');
    }

    return null;
  }

  return updatedSession;
}

export async function getSessionWithRefresh(sessionId: string): Promise<ServerSession | null> {
  const initialSession = await getSession(sessionId);

  if (!initialSession) {
    return null;
  }

  if (hasUsableAccessToken(initialSession)) {
    return initialSession;
  }

  const redis = await getRedisClient();
  const lockKey = getLockKey(sessionId);
  const lockOwner = randomBytes(24).toString('base64url');

  const deadline = Date.now() + WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const lock = await redis.set(lockKey, lockOwner, {
      NX: true,
      EX: LOCK_TTL_SECONDS,
    });

    if (lock === 'OK') {
      try {
        return await refreshWhileLocked(sessionId);
      } finally {
        try {
          await redis.eval(RELEASE_LOCK_SCRIPT, {
            keys: [lockKey],
            arguments: [lockOwner],
          });
        } catch {
          console.error('[Auth] Could not release the session refresh lock.');
        }
      }
    }

    const latestSession = await getSession(sessionId);

    if (!latestSession) {
      return null;
    }

    if (hasUsableAccessToken(latestSession)) {
      return latestSession;
    }

    await wait(POLL_INTERVAL_MS);
  }

  throw new SessionRefreshUnavailableError('Timed out waiting for the session refresh operation.');
}

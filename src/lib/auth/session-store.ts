import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';

import { getRedisClient } from '@/lib/auth/redis';
import { decryptSession, encryptSession } from '@/lib/auth/session-crypto';

const SESSION_PREFIX = 'mhr:session:';

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const sessionUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'moderator', 'admin']),
  is_active: z.boolean(),
});

const serverSessionSchema = z.object({
  user: sessionUserSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessTokenExpiresAt: z.number().int().positive(),
  refreshTokenExpiresAt: z.number().int().positive(),
  csrfToken: z.string().length(43),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export type ServerSession = z.infer<typeof serverSessionSchema>;

const CREATE_SESSION_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 1 then
  return 0
end

redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])

return 1
`;

const UPDATE_SESSION_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 0 then
  return 0
end

redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])

return 1
`;

function createSessionId(): string {
  return randomBytes(32).toString('base64url');
}

function getSessionKey(sessionId: string): string {
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    throw new Error('Invalid session identifier.');
  }

  const hashedId = createHash('sha256').update(sessionId).digest('hex');

  return `${SESSION_PREFIX}${hashedId}`;
}

function getSessionTtl(expiresAt: number): number {
  return Math.floor((expiresAt - Date.now()) / 1000);
}

function serializeSession(session: ServerSession): string {
  const validatedSession = serverSessionSchema.parse(session);

  return encryptSession(JSON.stringify(validatedSession));
}

export async function createSession(session: ServerSession): Promise<string> {
  const ttl = getSessionTtl(session.refreshTokenExpiresAt);

  if (ttl <= 0) {
    throw new Error('Cannot create an expired session.');
  }

  const redis = await getRedisClient();
  const encryptedSession = serializeSession(session);

  for (let attempt = 0; attempt < 3; attempt++) {
    const sessionId = createSessionId();
    const key = getSessionKey(sessionId);

    const result = await redis.eval(CREATE_SESSION_SCRIPT, {
      keys: [key],
      arguments: [encryptedSession, String(ttl)],
    });

    if (Number(result) === 1) {
      return sessionId;
    }
  }

  throw new Error('Could not generate a unique session identifier.');
}

export async function getSession(sessionId: string): Promise<ServerSession | null> {
  const redis = await getRedisClient();
  const key = getSessionKey(sessionId);

  const encryptedSession = await redis.get(key);

  if (!encryptedSession) {
    return null;
  }

  try {
    const decryptedSession = decryptSession(encryptedSession);

    const parsedSession = JSON.parse(decryptedSession);

    const result = serverSessionSchema.safeParse(parsedSession);

    if (!result.success) {
      throw new Error('Invalid session data.');
    }

    if (result.data.refreshTokenExpiresAt <= Date.now()) {
      await redis.del(key);
      return null;
    }

    return result.data;
  } catch {
    await redis.del(key);
    return null;
  }
}

export async function updateSession(sessionId: string, session: ServerSession): Promise<boolean> {
  const ttl = getSessionTtl(session.refreshTokenExpiresAt);

  if (ttl <= 0) {
    await deleteSession(sessionId);
    return false;
  }

  const redis = await getRedisClient();
  const key = getSessionKey(sessionId);

  const encryptedSession = serializeSession(session);

  const result = await redis.eval(UPDATE_SESSION_SCRIPT, {
    keys: [key],
    arguments: [encryptedSession, String(ttl)],
  });

  return Number(result) === 1;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const redis = await getRedisClient();

  await redis.del(getSessionKey(sessionId));
}

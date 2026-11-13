import 'server-only';

import { Buffer } from 'node:buffer';

import {
  authUserSchema,
  loginResponseSchema,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from '@/features/auth/schemas/auth.schema.ts';

export class ServerAuthError extends Error {
  constructor(
    public readonly status: number,
    message = 'Authentication request failed.',
  ) {
    super(message);
    this.name = 'ServerAuthError';
  }
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

function getApiUrl(path: string): string {
  const baseUrl = process.env.SERVER_INTERNAL_URL;

  if (!baseUrl) {
    throw new Error('SERVER_INTERNAL_URL is not configured.');
  }

  const parsedBaseUrl = new URL(baseUrl);

  if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
    throw new Error('SERVER_INTERNAL_URL must use HTTP or HTTPS.');
  }

  if (parsedBaseUrl.username || parsedBaseUrl.password) {
    throw new Error('SERVER_INTERNAL_URL must not contain credentials.');
  }

  return new URL(path.replace(/^\/+/, ''), `${parsedBaseUrl.origin}/`).toString();
}

function getJwtExpiration(token: string, expectedType: 'access' | 'refresh'): number {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT received from Server.');
  }

  try {
    const payload: unknown = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('exp' in payload) ||
      !('type' in payload)
    ) {
      throw new Error('Invalid JWT payload.');
    }

    const claims = payload as {
      exp: unknown;
      type: unknown;
    };

    if (
      typeof claims.exp !== 'number' ||
      !Number.isSafeInteger(claims.exp) ||
      claims.type !== expectedType
    ) {
      throw new Error('Unexpected JWT claims.');
    }

    const expiresAt = claims.exp * 1000;

    if (expiresAt <= Date.now()) {
      throw new Error('Server returned an expired token.');
    }

    return expiresAt;
  } catch {
    throw new Error('Could not read JWT expiration.');
  }
}

function extractCookie(response: Response, cookieName: string): string {
  const cookieHeaders = response.headers.getSetCookie();
  const prefix = `${cookieName}=`;

  for (const cookieHeader of cookieHeaders) {
    const cookiePair = cookieHeader.split(';', 1)[0];

    if (!cookiePair.startsWith(prefix)) {
      continue;
    }

    const value = cookiePair.slice(prefix.length);

    if (!value) {
      break;
    }

    return decodeURIComponent(value);
  }

  throw new Error(`Server did not return the required ${cookieName} cookie.`);
}

function validateRefreshCookie(value: string): void {
  if (value.split('.').length !== 3) {
    throw new Error('Server returned an invalid refresh token cookie.');
  }
}

async function parseLoginResponse(response: Response): Promise<AuthTokens> {
  if (!response.ok) {
    throw new ServerAuthError(response.status);
  }

  const body: unknown = await response.json();
  const parsedBody = loginResponseSchema.safeParse(body);

  if (!parsedBody.success) {
    throw new Error('Server returned an invalid login response.');
  }

  const refreshToken = extractCookie(response, 'refresh_token');

  validateRefreshCookie(refreshToken);

  return {
    accessToken: parsedBody.data.access_token,
    refreshToken,
    accessTokenExpiresAt: getJwtExpiration(parsedBody.data.access_token, 'access'),
    refreshTokenExpiresAt: getJwtExpiration(refreshToken, 'refresh'),
  };
}

export async function registerWithServer(input: RegisterInput): Promise<AuthUser> {
  const response = await fetch(getApiUrl('/api/v1/users/'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    cache: 'no-store',
    redirect: 'error',
  });

  if (!response.ok) {
    throw new ServerAuthError(response.status);
  }

  const body: unknown = await response.json();
  const parsedUser = authUserSchema.safeParse(body);

  if (!parsedUser.success) {
    throw new Error('Server returned an invalid user response.');
  }

  return parsedUser.data;
}

export async function loginWithServer(input: LoginInput): Promise<AuthTokens> {
  const formData = new URLSearchParams();

  formData.set('username', input.email);
  formData.set('password', input.password);

  const response = await fetch(getApiUrl('/api/v1/auth/login'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
    cache: 'no-store',
    redirect: 'error',
  });

  return parseLoginResponse(response);
}

export async function getAuthenticatedUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch(getApiUrl('/api/v1/users/me'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
    redirect: 'error',
  });

  if (!response.ok) {
    throw new ServerAuthError(response.status);
  }

  const body: unknown = await response.json();
  const parsedUser = authUserSchema.safeParse(body);

  if (!parsedUser.success) {
    throw new Error('Server returned an invalid user response.');
  }

  return parsedUser.data;
}

export async function refreshWithServer(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(getApiUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Cookie: `refresh_token=${encodeURIComponent(refreshToken)}`,
    },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });

  return parseLoginResponse(response);
}

export async function logoutWithServer(refreshToken: string): Promise<void> {
  const response = await fetch(getApiUrl('/api/v1/auth/logout'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Cookie: `refresh_token=${encodeURIComponent(refreshToken)}`,
    },
    cache: 'no-store',
    redirect: 'error',
  });

  if (!response.ok) {
    throw new ServerAuthError(response.status);
  }
}

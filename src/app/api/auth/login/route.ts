import { randomBytes } from 'node:crypto';

import { NextResponse } from 'next/server';

import { loginInputSchema } from '@/features/auth/schemas/auth.schema';

import {
  ServerAuthError,
  getAuthenticatedUser,
  loginWithServer,
  logoutWithServer,
  type AuthTokens,
} from '@/lib/auth/server';

import { verifyCsrfRequest } from '@/lib/auth/csrf';

import { createSession, deleteSession } from '@/lib/auth/session-store';

import { setSessionCookie } from '@/lib/auth/session-cookie';

export const runtime = 'nodejs';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

export async function POST(request: Request) {
  const csrfValid = await verifyCsrfRequest(request);

  if (!csrfValid) {
    return NextResponse.json(
      { message: 'Não foi possível validar a solicitação.' },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 });
  }

  const parsedInput = loginInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Informe um e-mail e uma senha válidos.' },
      { status: 400 },
    );
  }

  let tokens: AuthTokens | null = null;
  let sessionId: string | null = null;

  try {
    tokens = await loginWithServer(parsedInput.data);

    const user = await getAuthenticatedUser(tokens.accessToken);

    if (!user.is_active) {
      throw new ServerAuthError(401);
    }

    const csrfToken = randomBytes(32).toString('base64url');

    sessionId = await createSession({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      csrfToken,
    });

    await setSessionCookie(sessionId);

    return NextResponse.json(
      {
        user,
        csrfToken,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    if (sessionId) {
      try {
        await deleteSession(sessionId);
      } catch {
        console.error('[Auth] Could not clean up a failed session.');
      }
    }

    if (tokens) {
      try {
        await logoutWithServer(tokens.refreshToken);
      } catch {
        console.error('[Auth] Could not revoke a failed login session.');
      }
    }

    if (error instanceof ServerAuthError && error.status >= 400 && error.status < 500) {
      return NextResponse.json(
        { message: 'E-mail ou senha inválidos.' },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    console.error('[Auth] Login request failed.');

    return NextResponse.json(
      { message: 'Não foi possível realizar o login.' },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}

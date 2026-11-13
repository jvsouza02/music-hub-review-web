import { NextResponse } from 'next/server';

import { verifyCsrfRequest } from '@/lib/auth/csrf';

import { getSession, deleteSession } from '@/lib/auth/session-store';

import { getSessionIdFromCookie, clearSessionCookie } from '@/lib/auth/session-cookie';

import { logoutWithServer } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const csrfValid = await verifyCsrfRequest(request);

  if (!csrfValid) {
    return NextResponse.json(
      { message: 'Não foi possível validar a solicitação.' },
      { status: 403 },
    );
  }

  const sessionId = await getSessionIdFromCookie();

  if (!sessionId) {
    await clearSessionCookie();

    return NextResponse.json({ message: 'Sessão encerrada.' }, { status: 200 });
  }

  const session = await getSession(sessionId);

  try {
    // Invalida primeiro a sessão local.
    await deleteSession(sessionId);
  } catch {
    console.error('[Auth] Could not delete the local session.');

    return NextResponse.json({ message: 'Não foi possível encerrar a sessão.' }, { status: 503 });
  }

  await clearSessionCookie();

  if (session) {
    try {
      await logoutWithServer(session.refreshToken);
    } catch {
      console.warn('[Auth] Remote refresh token revocation failed.');
    }
  }

  return NextResponse.json(
    { message: 'Sessão encerrada.' },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

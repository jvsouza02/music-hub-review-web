import 'server-only';

import { NextResponse } from 'next/server';

import { ApiError } from '@/lib/api/api-error';

import { getCurrentSession } from '@/lib/auth/session';

import { SessionRefreshUnavailableError } from '@/lib/auth/session-refresh';

import { clearSessionCookie, getSessionIdFromCookie } from '@/lib/auth/session-cookie';

import { deleteSession, type ServerSession } from '@/lib/auth/session-store';

import { verifyCsrfRequest } from '@/lib/auth/csrf';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

type AuthenticatedMutationResult =
  | {
      authenticated: true;
      session: ServerSession;
    }
  | {
      authenticated: false;
      response: NextResponse;
    };

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: NO_STORE_HEADERS,
    },
  );
}

export async function requireAuthenticatedMutation(
  request: Request,
): Promise<AuthenticatedMutationResult> {
  try {
    const csrfValid = await verifyCsrfRequest(request);

    if (!csrfValid) {
      return {
        authenticated: false,
        response: jsonError('Não foi possível validar a solicitação.', 403),
      };
    }

    const session = await getCurrentSession();

    if (!session || !session.user.is_active) {
      await clearSessionCookie();

      return {
        authenticated: false,
        response: jsonError('Sua sessão expirou. Entre novamente.', 401),
      };
    }

    return {
      authenticated: true,
      session,
    };
  } catch (error) {
    if (error instanceof SessionRefreshUnavailableError) {
      return {
        authenticated: false,
        response: jsonError('O serviço de autenticação está temporariamente indisponível.', 503),
      };
    }

    console.error('[Auth] Could not authorize protected mutation.');

    return {
      authenticated: false,
      response: jsonError('Não foi possível validar sua sessão.', 503),
    };
  }
}

async function invalidateCurrentSession(): Promise<void> {
  try {
    const sessionId = await getSessionIdFromCookie();

    if (sessionId) {
      await deleteSession(sessionId);
    }
  } finally {
    await clearSessionCookie();
  }
}

export async function createReviewErrorResponse(error: unknown): Promise<NextResponse> {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return jsonError('Os dados da avaliação são inválidos.', 422);

      case 401:
        try {
          await invalidateCurrentSession();
        } catch {
          console.error('[Auth] Could not invalidate an unauthorized session.');
        }

        return jsonError('Sua sessão expirou. Entre novamente.', 401);

      case 403:
        return jsonError('Você não tem permissão para executar esta ação.', 403);

      case 404:
        return jsonError('A avaliação ou faixa solicitada não foi encontrada.', 404);

      case 409:
        return jsonError('Não foi possível concluir a operação devido a um conflito.', 409);

      case 429: {
        const headers = new Headers(NO_STORE_HEADERS);

        if (error.retryAfterMs !== undefined) {
          headers.set('Retry-After', String(Math.ceil(error.retryAfterMs / 1000)));
        }

        return NextResponse.json(
          {
            message: 'Muitas solicitações. Aguarde antes de tentar novamente.',
          },
          {
            status: 429,
            headers,
          },
        );
      }

      default:
        return jsonError(
          'Não foi possível concluir a operação.',
          error.status >= 500 || error.status === 0 ? 502 : 400,
        );
    }
  }

  if (error instanceof SessionRefreshUnavailableError) {
    return jsonError('O serviço de autenticação está temporariamente indisponível.', 503);
  }

  console.error('[Reviews] Review operation failed.');

  return jsonError('Não foi possível concluir a operação.', 502);
}

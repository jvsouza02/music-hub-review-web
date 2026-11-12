import { NextRequest, NextResponse } from 'next/server';

import { ApiError, getHttpStatus } from '@/lib/api/api-error';
import { searchTracksByTerm } from '@/features/tracks/api/server';

import {
  trackSearchQuerySchema,
  trackSearchResultsSchema,
} from '@/features/tracks/schemas/track-search.schema';

export const dynamic = 'force-dynamic';

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json(
    { code, message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get('query');
  const parsedQuery = trackSearchQuerySchema.safeParse(rawQuery);

  if (!parsedQuery.success) {
    return jsonError('QUERY_REQUIRED', 'Informe o nome da faixa que deseja pesquisar.', 400);
  }

  try {
    const results = await searchTracksByTerm(parsedQuery.data);
    const parsedResults = trackSearchResultsSchema.safeParse(results);

    if (!parsedResults.success) {
      return jsonError(
        'INVALID_TRACK_SEARCH_RESPONSE',
        'O serviço retornou dados em um formato inesperado.',
        502,
      );
    }

    return NextResponse.json(parsedResults.data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const status = getHttpStatus(error instanceof Error ? error : new Error('Unknown API error'));

    if (status === 429) {
      return jsonError(
        'RATE_LIMIT_EXCEEDED',
        'Muitas pesquisas foram realizadas. Aguarde um pouco e tente novamente.',
        429,
      );
    }

    if (status === 401 || status === 403) {
      return jsonError(
        'SEARCH_NOT_AVAILABLE',
        'A pesquisa não está disponível no momento.',
        status,
      );
    }

    if (status === 404) {
      return jsonError(
        'SEARCH_SERVICE_NOT_FOUND',
        'O serviço de pesquisa não foi encontrado.',
        404,
      );
    }

    const code = error instanceof ApiError ? error.code : 'TRACK_SEARCH_FAILED';

    return jsonError(code, 'Não foi possível pesquisar as faixas. Tente novamente.', 502);
  }
}

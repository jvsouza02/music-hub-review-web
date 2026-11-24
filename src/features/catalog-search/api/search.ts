import type { ZodType } from 'zod';

import { ApiError } from '@/lib/api/api-error';

type SearchError = {
  code: string;
  message: string;
};

type CatalogSearchOptions<T> = {
  endpoint: string;
  query: string;
  signal: AbortSignal;
  resultsSchema: ZodType<T>;
  errorSchema: ZodType<SearchError>;
  fallbackCode: string;
  fallbackMessage: string;
  invalidResponseCode: string;
  invalidResponseMessage: string;
};

export async function fetchCatalogSearch<T>({
  endpoint,
  query,
  signal,
  resultsSchema,
  errorSchema,
  fallbackCode,
  fallbackMessage,
  invalidResponseCode,
  invalidResponseMessage,
}: CatalogSearchOptions<T>): Promise<T> {
  const params = new URLSearchParams({ query });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: 'GET',
    signal,
    cache: 'no-store',
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = errorSchema.safeParse(body);

    throw new ApiError(
      response.status,
      parsedError.success ? parsedError.data.code : fallbackCode,
      parsedError.success ? parsedError.data.message : fallbackMessage,
    );
  }

  const parsedResults = resultsSchema.safeParse(body);

  if (!parsedResults.success) {
    throw new ApiError(502, invalidResponseCode, invalidResponseMessage);
  }

  return parsedResults.data;
}
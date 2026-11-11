import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { ApiError, getHttpStatus, getRetryAfterMs } from '@/lib/api/api-error';

function handleGlobalApiError(error: Error) {
  const status = getHttpStatus(error);

  if (status !== 401 && status !== 403 && status !== 429) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const detail = {
    status,
    code: error instanceof ApiError ? error.code : `HTTP_${status}`,
    message: error.message,
    retryAfterMs: getRetryAfterMs(error),
  };

  window.dispatchEvent(new CustomEvent('music-hub:api-error', { detail }));
}

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  const status = getHttpStatus(error);

  if (status === 401 || status === 403) {
    return false;
  }

  if (status === 429) {
    const retryAfterMs = getRetryAfterMs(error);

    return failureCount < 1 && retryAfterMs !== undefined && retryAfterMs <= 30_000;
  }

  if (status !== undefined && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < 2;
}

function getRetryDelay(failureCount: number, error: Error): number {
  const retryAfterMs = getRetryAfterMs(error);

  if (retryAfterMs !== undefined) {
    return retryAfterMs;
  }

  return Math.min(1_000 * 2 ** failureCount, 8_000);
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleGlobalApiError,
    }),

    mutationCache: new MutationCache({
      onError: handleGlobalApiError,
    }),

    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: shouldRetryQuery,
        retryDelay: getRetryDelay,
      },

      mutations: {
        retry: false,
      },
    },
  });
}

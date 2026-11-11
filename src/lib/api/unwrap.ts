import { ApiError, createApiError } from './api-error';

type SdkResult<T> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

function ensureSuccessfulResponse<T>(result: SdkResult<T>): void {
  if (result.error != null || result.response?.ok === false) {
    throw createApiError(result.response, result.error);
  }
}

export function unwrapApiResult<T>(result: SdkResult<T>): T {
  ensureSuccessfulResponse(result);

  if (result.data === undefined) {
    throw new ApiError(
      result.response?.status ?? 502,
      'EMPTY_API_RESPONSE',
      'O servidor retornou uma resposta sem os dados esperados.',
    );
  }

  return result.data;
}

export function unwrapApiVoid(result: SdkResult<unknown>): void {
  ensureSuccessfulResponse(result);

  if (!result.response) {
    throw createApiError(undefined, 'No HTTP response was received from the API.');
  }
}

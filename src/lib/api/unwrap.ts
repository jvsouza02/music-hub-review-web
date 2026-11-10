import { ApiError, createApiError } from "./api-error";

type SdkResult<T> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

export function unwrapApiResult<T>(result: SdkResult<T>): T {
  if (result.error != null || result.response?.ok === false) {
    throw createApiError(result.response, result.error);
  }

  if (result.data === undefined) {
    throw new ApiError(
      result.response?.status ?? 502,
      "EMPTY_API_RESPONSE",
      "O servidor retornou uma resposta sem os dados esperados.",
    );
  }

  return result.data;
}
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAfterMs?: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const date = Date.parse(value);

  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

export function createApiError(
  response: Response | undefined,
  payload: unknown,
): ApiError {
  const root = isRecord(payload) ? payload : {};
  const nested = isRecord(root.error) ? root.error : root;

  const status = response?.status ?? 0;

  const fallbackMessages: Record<number, string> = {
    0: "Não foi possível conectar ao servidor.",
    401: "Sua sessão expirou. Entre novamente.",
    403: "Você não tem permissão para executar esta ação.",
    429: "Muitas solicitações. Aguarde antes de tentar novamente.",
  };

  const message =
    (typeof nested.message === "string" && nested.message) ||
    (typeof root.detail === "string" && root.detail) ||
    fallbackMessages[status] ||
    "Não foi possível concluir a solicitação.";

  const code =
    typeof nested.code === "string" ? nested.code : `HTTP_${status}`;

  const requestId =
    typeof nested.request_id === "string" ? nested.request_id : undefined;

  return new ApiError(
    status,
    code,
    message,
    parseRetryAfter(response?.headers.get("Retry-After") ?? null),
    requestId,
  );
}

export function getHttpStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  if (!isRecord(error)) return undefined;

  if (typeof error.status === "number") return error.status;

  if (isRecord(error.response) && typeof error.response.status === "number") {
    return error.response.status;
  }

  return undefined;
}

export function getRetryAfterMs(error: unknown): number | undefined {
  return error instanceof ApiError ? error.retryAfterMs : undefined;
}
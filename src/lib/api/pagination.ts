export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export function normalizePagination(params: PaginationParams = {}) {
  return {
    limit: params.limit ?? 20,
    offset: params.offset ?? 0,
  };
}
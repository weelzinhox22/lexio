/**
 * Helpers para paginação no Supabase
 */

export type PaginationParams = {
  page?: number
  limit?: number
}

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit || DEFAULT_LIMIT))
  const from = (page - 1) * limit
  const to = from + limit - 1

  return { page, limit, from, to }
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  }
}




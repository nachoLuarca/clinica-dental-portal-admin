/**
 * Tipos compartidos para respuestas de la API (Laravel).
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    from: number | null
    to: number | null
    per_page: number
    last_page: number
    total: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface ResourceResponse<T> {
  data: T
}

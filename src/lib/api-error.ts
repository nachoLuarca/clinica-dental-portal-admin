import { isAxiosError } from 'axios'

/**
 * Extrae un mensaje de error legible desde una respuesta de la API.
 *
 * La API (Laravel) devuelve errores ya en español de Chile, en el formato
 * `{ message, errors?: { campo: string[] } }`. Los mostramos tal cual, sin
 * traducir ni reformular.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado. Intenta nuevamente.'): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.'
    }

    const data = error.response.data as { message?: string; errors?: Record<string, string[]> } | undefined

    if (data?.errors) {
      const firstError = Object.values(data.errors)[0]?.[0]
      if (firstError) return firstError
    }

    if (data?.message) return data.message
  }

  return fallback
}

/**
 * true si el error es un 403 de la API (usuario autenticado pero sin permiso
 * para la acción, vía roles/permisos de Spatie aplicados en el backend).
 */
export function isForbiddenError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403
}

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

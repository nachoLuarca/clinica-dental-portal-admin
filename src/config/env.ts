/**
 * Variables de entorno tipadas para el resto de la app.
 * Nunca hardcodear la URL de la API en otro lugar: siempre importar desde acá.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
}

if (!env.apiBaseUrl) {
  // Falla temprano y explícito en desarrollo si falta configurar el .env
  console.error(
    'VITE_API_BASE_URL no está definida. Revisa el archivo .env en la raíz del proyecto.',
  )
}

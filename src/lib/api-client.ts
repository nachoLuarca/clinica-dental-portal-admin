import axios from 'axios'
import { env } from '@/config/env'

/**
 * Cliente HTTP centralizado para consumir clinica-dental-api.
 *
 * El tenant NUNCA se envía manualmente desde el frontend: lo resuelve
 * la API a partir del token de sesión del usuario staff autenticado.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

const STAFF_TOKEN_KEY = 'staff_token'

export function getStaffToken(): string | null {
  return localStorage.getItem(STAFF_TOKEN_KEY)
}

export function setStaffToken(token: string): void {
  localStorage.setItem(STAFF_TOKEN_KEY, token)
}

export function clearStaffToken(): void {
  localStorage.removeItem(STAFF_TOKEN_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getStaffToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStaffToken()
    }
    return Promise.reject(error)
  },
)

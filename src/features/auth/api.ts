import { apiClient } from '@/lib/api-client'
import type { StaffAuthResponse, StaffLoginPayload, StaffUser } from './types'

/**
 * Llamadas HTTP del dominio de autenticación de staff.
 * No contienen lógica de negocio: solo mapean a los endpoints de la API.
 */
export async function loginStaff(payload: StaffLoginPayload): Promise<StaffAuthResponse> {
  const { data } = await apiClient.post<StaffAuthResponse>('/api/staff/login', payload)
  return data
}

export async function fetchCurrentStaff(): Promise<StaffUser> {
  const { data } = await apiClient.get<{ data: StaffUser }>('/api/staff/me')
  return data.data
}

export async function logoutStaff(): Promise<void> {
  await apiClient.post('/api/staff/logout')
}

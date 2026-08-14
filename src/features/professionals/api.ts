import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Professional, ProfessionalPayload } from './types'

/**
 * Llamadas HTTP del dominio de profesionales. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 */
export async function fetchProfessionals(): Promise<Professional[]> {
  const { data } = await apiClient.get<PaginatedResponse<Professional>>('/api/staff/professionals')
  return data.data
}

export async function createProfessional(payload: ProfessionalPayload): Promise<Professional> {
  const { data } = await apiClient.post<ResourceResponse<Professional>>('/api/staff/professionals', payload)
  return data.data
}

export async function updateProfessional(id: number, payload: ProfessionalPayload): Promise<Professional> {
  const { data } = await apiClient.put<ResourceResponse<Professional>>(`/api/staff/professionals/${id}`, payload)
  return data.data
}

export async function deleteProfessional(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/professionals/${id}`)
}

import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Treatment, TreatmentPayload } from './types'

/**
 * Llamadas HTTP del dominio de tratamientos. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 */
export async function fetchTreatments(): Promise<Treatment[]> {
  const { data } = await apiClient.get<PaginatedResponse<Treatment>>('/api/staff/treatments')
  return data.data
}

export async function createTreatment(payload: TreatmentPayload): Promise<Treatment> {
  const { data } = await apiClient.post<ResourceResponse<Treatment>>('/api/staff/treatments', payload)
  return data.data
}

export async function updateTreatment(id: number, payload: TreatmentPayload): Promise<Treatment> {
  const { data } = await apiClient.put<ResourceResponse<Treatment>>(`/api/staff/treatments/${id}`, payload)
  return data.data
}

export async function deleteTreatment(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/treatments/${id}`)
}

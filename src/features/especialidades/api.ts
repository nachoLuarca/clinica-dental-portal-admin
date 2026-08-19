import { apiClient } from '@/lib/api-client'
import type { ResourceResponse } from '@/lib/types'
import type { Especialidad, EspecialidadPayload } from './types'

/**
 * Llamadas HTTP del dominio de especialidades. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 *
 * El listado no viene paginado (catálogo chico de la clínica).
 */
export async function fetchEspecialidades(): Promise<Especialidad[]> {
  const { data } = await apiClient.get<ResourceResponse<Especialidad[]>>('/api/staff/especialidades')
  return data.data
}

export async function createEspecialidad(payload: EspecialidadPayload): Promise<Especialidad> {
  const { data } = await apiClient.post<ResourceResponse<Especialidad>>('/api/staff/especialidades', payload)
  return data.data
}

export async function updateEspecialidad(id: number, payload: EspecialidadPayload): Promise<Especialidad> {
  const { data } = await apiClient.put<ResourceResponse<Especialidad>>(`/api/staff/especialidades/${id}`, payload)
  return data.data
}

export async function deleteEspecialidad(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/especialidades/${id}`)
}

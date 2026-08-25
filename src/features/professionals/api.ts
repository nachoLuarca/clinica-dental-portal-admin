import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Professional, ProfessionalPayload } from './types'

/**
 * Llamadas HTTP del dominio de profesionales. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 *
 * La foto se sube aparte, en una segunda petición multipart (`_method=PATCH`,
 * mismo patrón que el logo de la clínica): los campos de texto/arreglos
 * (`horarios`, `especialidades`) se mandan siempre como JSON para poder
 * enviar arreglos vacíos y así limpiarlos -algo que multipart/form-data no
 * puede representar de forma nativa-.
 */
export async function fetchProfessionals(): Promise<Professional[]> {
  const { data } = await apiClient.get<PaginatedResponse<Professional>>('/api/staff/professionals')
  return data.data
}

async function uploadFoto(id: number, foto: File): Promise<Professional> {
  const form = new FormData()
  form.append('_method', 'PATCH')
  form.append('foto', foto)
  const { data } = await apiClient.post<ResourceResponse<Professional>>(`/api/staff/professionals/${id}`, form)
  return data.data
}

export async function createProfessional(payload: ProfessionalPayload): Promise<Professional> {
  const { foto, ...rest } = payload
  const { data } = await apiClient.post<ResourceResponse<Professional>>('/api/staff/professionals', rest)
  return foto ? uploadFoto(data.data.id, foto) : data.data
}

export async function updateProfessional(id: number, payload: ProfessionalPayload): Promise<Professional> {
  const { foto, ...rest } = payload
  const { data } = await apiClient.put<ResourceResponse<Professional>>(`/api/staff/professionals/${id}`, rest)
  return foto ? uploadFoto(id, foto) : data.data
}

export async function deleteProfessional(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/professionals/${id}`)
}

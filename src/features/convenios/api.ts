import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Convenio, ConvenioPayload } from './types'

/**
 * Llamadas HTTP del dominio de convenios. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 *
 * El logo se sube como multipart/form-data, mismo patrón que el logo de la
 * clínica (ver `features/branding/api.ts`). `PATCH` con archivo requiere
 * `_method=PATCH` dentro del propio form-data porque Laravel no parsea PATCH
 * multipart nativo.
 */
export async function fetchConvenios(): Promise<Convenio[]> {
  const { data } = await apiClient.get<PaginatedResponse<Convenio>>('/api/staff/convenios')
  return data.data
}

function buildFormData(payload: ConvenioPayload): FormData {
  const form = new FormData()
  form.append('nombre', payload.nombre)
  form.append('tipo', payload.tipo)
  form.append('descripcion', payload.descripcion ?? '')
  form.append('activo', payload.activo ? '1' : '0')
  if (payload.logo) form.append('logo', payload.logo)
  return form
}

export async function createConvenio(payload: ConvenioPayload): Promise<Convenio> {
  const { data } = await apiClient.post<ResourceResponse<Convenio>>('/api/staff/convenios', buildFormData(payload))
  return data.data
}

export async function updateConvenio(id: number, payload: ConvenioPayload): Promise<Convenio> {
  const form = buildFormData(payload)
  form.append('_method', 'PATCH')
  const { data } = await apiClient.post<ResourceResponse<Convenio>>(`/api/staff/convenios/${id}`, form)
  return data.data
}

export async function deleteConvenio(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/convenios/${id}`)
}

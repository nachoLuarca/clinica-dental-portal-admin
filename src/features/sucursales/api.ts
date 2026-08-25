import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Sucursal, SucursalPayload } from './types'

/**
 * Llamadas HTTP del dominio de sucursales. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 */
export async function fetchSucursales(): Promise<Sucursal[]> {
  const { data } = await apiClient.get<PaginatedResponse<Sucursal>>('/api/staff/sucursales')
  return data.data
}

export async function createSucursal(payload: SucursalPayload): Promise<Sucursal> {
  const { data } = await apiClient.post<ResourceResponse<Sucursal>>('/api/staff/sucursales', payload)
  return data.data
}

export async function updateSucursal(id: number, payload: SucursalPayload): Promise<Sucursal> {
  const { data } = await apiClient.put<ResourceResponse<Sucursal>>(`/api/staff/sucursales/${id}`, payload)
  return data.data
}

export async function deleteSucursal(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/sucursales/${id}`)
}

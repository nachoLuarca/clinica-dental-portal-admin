import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { CreateStaffPayload, ResetPasswordPayload, StaffMember, StaffMemberFilters, UpdateStaffPayload } from './types'

/**
 * Llamadas HTTP del dominio de usuarios de staff. Sin lógica de negocio
 * propia: solo mapean a los endpoints de la API, scoped por tenant
 * automáticamente.
 */
export async function fetchStaffMembers(filters: StaffMemberFilters = {}): Promise<StaffMember[]> {
  const params: Record<string, string> = {}
  if (filters.rol) params.rol = filters.rol
  if (filters.activo !== undefined) params.activo = String(filters.activo)
  if (filters.nombre) params.nombre = filters.nombre

  const { data } = await apiClient.get<PaginatedResponse<StaffMember> | ResourceResponse<StaffMember[]>>(
    '/api/staff/users',
    { params },
  )
  return Array.isArray(data.data) ? data.data : []
}

export async function createStaffMember(payload: CreateStaffPayload): Promise<StaffMember> {
  const { data } = await apiClient.post<ResourceResponse<StaffMember>>('/api/staff/users', payload)
  return data.data
}

export async function updateStaffMember(id: number, payload: UpdateStaffPayload): Promise<StaffMember> {
  const { data } = await apiClient.put<ResourceResponse<StaffMember>>(`/api/staff/users/${id}`, payload)
  return data.data
}

export async function changeStaffRole(id: number, rol: string): Promise<StaffMember> {
  const { data } = await apiClient.patch<ResourceResponse<StaffMember>>(`/api/staff/users/${id}/rol`, { rol })
  return data.data
}

export async function changeStaffStatus(id: number, activo: boolean): Promise<StaffMember> {
  const { data } = await apiClient.patch<ResourceResponse<StaffMember>>(`/api/staff/users/${id}/estado`, { activo })
  return data.data
}

export async function resetStaffPassword(id: number, payload: ResetPasswordPayload): Promise<void> {
  await apiClient.patch(`/api/staff/users/${id}/password`, payload)
}

import { apiClient } from '@/lib/api-client'
import type { ResourceResponse } from '@/lib/types'
import type { PermissionCatalog, Role, RolePayload, RolePermissionsPayload } from './types'

/**
 * Llamadas HTTP del dominio de roles/permisos. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 */
export async function fetchRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<ResourceResponse<Role[]>>('/api/staff/roles')
  return data.data
}

export async function fetchPermissionCatalog(): Promise<PermissionCatalog> {
  const { data } = await apiClient.get<ResourceResponse<PermissionCatalog>>('/api/staff/permisos')
  return data.data
}

export async function createRole(payload: RolePayload): Promise<Role> {
  const { data } = await apiClient.post<ResourceResponse<Role>>('/api/staff/roles', payload)
  return data.data
}

export async function updateRoleName(id: number, name: string): Promise<Role> {
  const { data } = await apiClient.put<ResourceResponse<Role>>(`/api/staff/roles/${id}`, { name })
  return data.data
}

export async function updateRolePermissions(id: number, payload: RolePermissionsPayload): Promise<Role> {
  const { data } = await apiClient.patch<ResourceResponse<Role>>(`/api/staff/roles/${id}/permisos`, payload)
  return data.data
}

export async function deleteRole(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/roles/${id}`)
}

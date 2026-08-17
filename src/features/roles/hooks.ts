import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRole,
  deleteRole,
  fetchPermissionCatalog,
  fetchRoles,
  updateRoleName,
  updateRolePermissions,
} from './api'
import type { RolePayload, RolePermissionsPayload } from './types'

const ROLES_KEY = ['roles'] as const
const PERMISSIONS_KEY = ['permisos'] as const

export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: fetchRoles,
  })
}

/** Catálogo de permisos disponibles, agrupado por recurso. Cambia poco: se cachea de forma más laxa. */
export function usePermissionCatalog() {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: fetchPermissionCatalog,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RolePayload) => createRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

export function useUpdateRoleName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateRoleName(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RolePermissionsPayload }) => updateRolePermissions(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

/**
 * Tipos del dominio de roles y permisos editables de staff.
 *
 * Los roles ya no son un set fijo (`admin`/`profesional`/`recepcion`): la
 * clínica puede crear roles propios con su propia matriz de permisos vía
 * `clinica-dental-api`. El rol `admin` es la única excepción protegida: no
 * se puede renombrar, editar sus permisos ni eliminar.
 */
export interface Permission {
  id: number
  name: string
  guard_name: string
}

/** Catálogo de permisos agrupado por recurso, tal como lo entrega la API. */
export type PermissionCatalog = Record<string, string[]>

export interface Role {
  id: number
  tenant_id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  permissions: Permission[]
}

export interface RolePayload {
  name: string
  permissions: string[]
}

export interface RolePermissionsPayload {
  permissions: string[]
}

export const ADMIN_ROLE_NAME = 'admin'

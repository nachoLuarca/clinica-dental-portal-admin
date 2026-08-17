/**
 * Roles de staff soportados por la API (aislados por tenant vía Spatie
 * Permission). Ver `RoleProvisioner::matriz()` en `clinica-dental-api` para
 * la matriz completa de permisos por rol.
 */
export type StaffRole = 'admin' | 'profesional' | 'recepcion'

/**
 * Tipos del dominio de autenticación de staff.
 *
 * `roles` se sigue modelando como opcional por robustez, pero desde el
 * commit `635f538` de `clinica-dental-api` (feature de gestión de
 * usuarios/roles editables) `GET /api/staff/me` y `POST /api/staff/login`
 * SÍ incluyen `roles: string[]` en su payload (confirmado contra la API
 * real). El frontend ya lo usa de forma proactiva vía `isAdmin` en
 * `AuthContext`.
 */
export interface StaffUser {
  id: number
  tenant_id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  roles?: StaffRole[]
}

export interface StaffLoginPayload {
  clinica: string
  email: string
  password: string
}

export interface StaffAuthResponse {
  token: string
  token_type: string
  data: StaffUser
}

/**
 * Roles de staff soportados por la API (aislados por tenant vía Spatie
 * Permission). Ver `RoleProvisioner::matriz()` en `clinica-dental-api` para
 * la matriz completa de permisos por rol.
 */
export type StaffRole = 'admin' | 'profesional' | 'recepcion'

/**
 * Tipos del dominio de autenticación de staff.
 *
 * `roles` es opcional: al momento de escribir esto, `GET /api/staff/me` NO
 * incluye el/los rol(es) del usuario en su payload (se confirmó contra la
 * API real) aunque los permisos sí se aplican de verdad en el backend. Se
 * modela como opcional para no romper si el campo no llega, y para que el
 * día que el backend lo agregue (el shape más probable es `roles: string[]`,
 * típico de Sanctum+Spatie) el frontend lo empiece a usar sin cambios.
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

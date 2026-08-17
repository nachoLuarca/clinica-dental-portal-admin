/**
 * Tipos del dominio de gestión de usuarios de staff (exclusivo de admin).
 */
export interface StaffRoleRef {
  id: number
  name: string
}

export interface StaffMember {
  id: number
  tenant_id: number
  name: string
  email: string
  activo: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
  roles: StaffRoleRef[]
}

export interface StaffMemberFilters {
  rol?: string
  activo?: boolean
  nombre?: string
}

export interface CreateStaffPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  rol: string
}

export interface UpdateStaffPayload {
  name: string
  email: string
}

export interface ResetPasswordPayload {
  password: string
  password_confirmation: string
}

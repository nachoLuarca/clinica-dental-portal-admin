/**
 * Tipos del dominio de autenticación de staff.
 */
export interface StaffUser {
  id: number
  tenant_id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
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

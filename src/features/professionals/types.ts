/**
 * Tipos del dominio de profesionales.
 */
export interface Professional {
  id: number
  tenant_id: number
  nombre: string
  apellido: string
  especialidad: string
  email: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ProfessionalPayload {
  nombre: string
  apellido: string
  especialidad: string
  email: string
  activo: boolean
}

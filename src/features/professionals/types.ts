import type { Especialidad } from '@/features/especialidades/types'

/**
 * Tipos del dominio de profesionales.
 *
 * `especialidad` (texto libre) es el campo histórico y sigue existiendo tal
 * cual. `especialidades` es una capa nueva en paralelo: relación N:N contra
 * el catálogo de especialidades de la clínica.
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
  especialidades: Especialidad[]
}

export interface ProfessionalPayload {
  nombre: string
  apellido: string
  especialidad: string
  email: string
  activo: boolean
  /** IDs de especialidades. Si se envía, reemplaza por completo lo asignado. */
  especialidades?: number[]
}

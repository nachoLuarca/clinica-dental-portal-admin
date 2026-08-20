import type { Especialidad } from '@/features/especialidades/types'

/**
 * Tipos del dominio de profesionales.
 *
 * `especialidades` es la relación N:N real contra el catálogo de
 * especialidades de la clínica (el campo de texto libre legado ya no se usa
 * en el frontend).
 *
 * `schedules` (respuesta) / `horarios` (payload): tramos horarios propios
 * del profesional, sin nada compartido entre profesionales. `dia_semana` va
 * de 0 (domingo) a 6 (sábado); `hora_inicio`/`hora_fin` en formato `HH:mm`.
 * Guardar reemplaza por completo el set de tramos existente.
 */
export interface Schedule {
  id: number
  professional_id: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

export interface HorarioInput {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

export interface Professional {
  id: number
  tenant_id: number
  nombre: string
  apellido: string
  email: string
  activo: boolean
  created_at: string
  updated_at: string
  especialidades: Especialidad[]
  schedules: Schedule[]
}

export interface ProfessionalPayload {
  nombre: string
  apellido: string
  email: string
  activo: boolean
  /** IDs de especialidades. Si se envía, reemplaza por completo lo asignado. */
  especialidades?: number[]
  /** Tramos horarios. Si se envía, reemplaza por completo lo asignado. */
  horarios?: HorarioInput[]
}

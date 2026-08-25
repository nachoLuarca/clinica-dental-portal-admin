import type { Especialidad } from '@/features/especialidades/types'
import type { Sucursal } from '@/features/sucursales/types'

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
 *
 * `foto_url`/`bio`/`matricula`/`sucursal`: ficha pública del profesional que
 * alimenta el sitio del paciente (informativa, no afecta reservas).
 * `sucursal_id` es la sede a la que pertenece (una sola por ahora, nullable:
 * clínicas sin sucursales cargadas siguen funcionando igual).
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
  foto_path: string | null
  foto_url: string | null
  bio: string | null
  matricula: string | null
  sucursal_id: number | null
  sucursal: Sucursal | null
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
  bio?: string
  matricula?: string
  /** null limpia la sucursal asignada. */
  sucursal_id?: number | null
  /** Solo se envía cuando el usuario elige una foto nueva. */
  foto?: File
}

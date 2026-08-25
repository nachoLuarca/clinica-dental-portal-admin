/**
 * Tipos del dominio de sucursales (sedes físicas de la clínica).
 *
 * `horarios` (respuesta) / payload homónimo: tramos horarios propios de la
 * sede, uno por día abierto (mismo esquema que los horarios de
 * profesionales). `dia_semana` va de 0 (domingo) a 6 (sábado);
 * `hora_inicio`/`hora_fin` en formato `HH:mm`. Guardar reemplaza por
 * completo el set de tramos existente.
 */
export interface SucursalHorario {
  id: number
  sucursal_id: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

export interface HorarioInput {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

export interface Sucursal {
  id: number
  tenant_id: number
  nombre: string
  direccion: string | null
  comuna: string | null
  telefono: string | null
  activo: boolean
  created_at: string
  updated_at: string
  horarios: SucursalHorario[]
}

export interface SucursalPayload {
  nombre: string
  direccion?: string
  comuna?: string
  telefono?: string
  activo: boolean
  /** Tramos horarios. Si se envía, reemplaza por completo lo asignado. */
  horarios?: HorarioInput[]
}

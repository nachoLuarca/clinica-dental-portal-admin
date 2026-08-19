/**
 * Tipos del dominio de tratamientos.
 *
 * `es_diferencial` marca un tratamiento "no listado" / de atención
 * diferencial: uno creado a medida para un caso puntual, en vez de un
 * tratamiento estándar del catálogo de la clínica.
 */
export interface Treatment {
  id: number
  tenant_id: number
  nombre: string
  descripcion: string | null
  precio: string
  duracion_minutos: number | null
  es_diferencial: boolean
  activo: boolean
  created_at: string
  updated_at: string
}

export interface TreatmentPayload {
  nombre: string
  descripcion?: string
  precio: number
  duracion_minutos?: number | null
  es_diferencial: boolean
  activo: boolean
}

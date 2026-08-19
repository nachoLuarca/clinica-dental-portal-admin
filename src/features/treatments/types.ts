/**
 * Tipos del dominio de tratamientos.
 *
 * `es_diferencial` marca un tratamiento "no listado" / de atención
 * diferencial: uno creado a medida para un caso puntual, en vez de un
 * tratamiento estándar del catálogo de la clínica.
 *
 * `categoria` es texto libre, solo descriptivo (ficha rica del catálogo
 * público). La relación real con el catálogo de especialidades es
 * `especialidad_id` (FK): un tratamiento pertenece a una sola especialidad,
 * o ninguna.
 */
export interface TreatmentEspecialidad {
  id: number
  nombre: string
}

export interface Treatment {
  id: number
  tenant_id: number
  nombre: string
  categoria: string | null
  especialidad_id: number | null
  especialidad: TreatmentEspecialidad | null
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
  especialidad_id?: number | null
  descripcion?: string
  precio: number
  duracion_minutos?: number | null
  es_diferencial: boolean
  activo: boolean
}

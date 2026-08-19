/**
 * Tipos del dominio de especialidades: catálogo por clínica, asignable a
 * profesionales (uno puede tener varias), mapeado a categorías de
 * tratamiento en texto libre.
 */
export interface EspecialidadCategoria {
  id: number
  categoria: string
}

export interface Especialidad {
  id: number
  nombre: string
  categorias: EspecialidadCategoria[]
}

export interface EspecialidadPayload {
  nombre: string
  /** Si se envía, reemplaza por completo las categorías asignadas. */
  categorias?: string[]
}

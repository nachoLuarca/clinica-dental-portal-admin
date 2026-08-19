/**
 * Tipos del dominio de especialidades: catálogo por clínica, asignable a
 * profesionales (uno puede tener varias) y a tratamientos (un tratamiento
 * pertenece a una sola especialidad, o ninguna, vía Treatment::especialidad_id).
 */
export interface EspecialidadTreatment {
  id: number
  nombre: string
}

export interface Especialidad {
  id: number
  nombre: string
  treatments: EspecialidadTreatment[]
}

export interface EspecialidadPayload {
  nombre: string
  /** Si se envía, reemplaza por completo el set de tratamientos asignados. */
  treatment_ids?: number[]
}

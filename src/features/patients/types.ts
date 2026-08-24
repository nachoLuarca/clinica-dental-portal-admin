import type { Professional } from '@/features/professionals/types'

/**
 * Tipos del dominio de pacientes y sus diagnósticos.
 *
 * `apellido` y `datos_aceptados_at` (consentimiento de tratamiento de datos,
 * como timestamp de cuándo se aceptó) solo se completan vía el flujo público
 * de registro por RUT — el staff no puede editarlos desde este portal, así
 * que se muestran de solo lectura.
 */
export interface Patient {
  id: number
  tenant_id: number
  nombre: string
  apellido: string | null
  rut: string
  email: string
  fecha_nacimiento: string
  telefono: string | null
  notas: string | null
  datos_aceptados_at: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
  diagnoses?: Diagnosis[]
}

export interface PatientPayload {
  nombre: string
  rut: string
  email: string
  fecha_nacimiento: string
  telefono?: string
  notas?: string
}

export interface Diagnosis {
  id: number
  tenant_id: number
  patient_id: number
  professional_id: number | null
  fecha: string
  descripcion: string
  notas: string | null
  created_at: string
  updated_at: string
  professional?: Professional
}

export interface DiagnosisPayload {
  fecha: string
  descripcion: string
  notas?: string
  professional_id?: number | null
}

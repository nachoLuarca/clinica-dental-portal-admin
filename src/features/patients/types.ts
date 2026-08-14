import type { Professional } from '@/features/professionals/types'

/**
 * Tipos del dominio de pacientes y sus diagnósticos.
 */
export interface Patient {
  id: number
  tenant_id: number
  nombre: string
  email: string
  fecha_nacimiento: string
  telefono: string | null
  notas: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
  diagnoses?: Diagnosis[]
}

export interface PatientPayload {
  nombre: string
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

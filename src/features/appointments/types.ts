import type { Patient } from '@/features/patients/types'
import type { Professional } from '@/features/professionals/types'
import type { Treatment } from '@/features/treatments/types'

/**
 * Tipos del dominio de citas/agenda.
 *
 * La API solo expone dos transiciones reales sobre una cita: crearla
 * ('reservada', que es la reserva ya efectiva hecha por el staff) y
 * cancelarla ('cancelada', que libera el slot). Los estados 'confirmada' y
 * 'completada' existen en el modelo de datos pero no hay ningún endpoint que
 * los dispare hoy — no se muestran acciones para ellos en la UI.
 */
export const APPOINTMENT_ESTADOS = ['reservada', 'confirmada', 'cancelada', 'completada'] as const
export type AppointmentEstado = (typeof APPOINTMENT_ESTADOS)[number]

export const APPOINTMENT_ESTADO_LABELS: Record<AppointmentEstado, string> = {
  reservada: 'Reservada',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

export interface Appointment {
  id: number
  tenant_id: number
  professional_id: number
  patient_id: number
  treatment_id: number
  fecha_hora: string
  fecha_hora_fin: string
  duracion_minutos: number
  estado: AppointmentEstado
  notas: string | null
  created_at: string
  updated_at: string
  professional?: Professional
  patient?: Patient
  treatment?: Treatment
}

export interface AppointmentPayload {
  patient_id: number
  professional_id: number
  treatment_id: number
  fecha_hora: string
  notas?: string
}

export interface AvailabilitySlot {
  inicio: string
  fin: string
  fecha_hora: string
}

export interface Availability {
  professional_id: number
  treatment_id: number
  fecha: string
  duracion_minutos: number
  slots: AvailabilitySlot[]
}

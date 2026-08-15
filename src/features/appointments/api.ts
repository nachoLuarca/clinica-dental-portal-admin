import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Appointment, AppointmentPayload, Availability } from './types'

/**
 * Llamadas HTTP del dominio de citas/agenda. Sin lógica de negocio propia:
 * la disponibilidad y las reglas de choque de horario las resuelve
 * siempre la API (`/api/staff/availability`), acá solo se consumen.
 */
export async function fetchAppointments(): Promise<Appointment[]> {
  const { data } = await apiClient.get<PaginatedResponse<Appointment>>('/api/staff/appointments', {
    params: { per_page: 100 },
  })
  return data.data
}

export async function fetchAvailability(params: {
  professional_id: number
  treatment_id: number
  fecha: string
}): Promise<Availability> {
  const { data } = await apiClient.get<ResourceResponse<Availability>>('/api/staff/availability', { params })
  return data.data
}

export async function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  const { data } = await apiClient.post<ResourceResponse<Appointment>>('/api/staff/appointments', payload)
  return data.data
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  const { data } = await apiClient.delete<ResourceResponse<Appointment>>(`/api/staff/appointments/${id}`)
  return data.data
}

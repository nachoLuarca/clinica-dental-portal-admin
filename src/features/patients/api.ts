import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Diagnosis, DiagnosisPayload, Patient, PatientPayload } from './types'

/**
 * Llamadas HTTP del dominio de pacientes y diagnósticos. Sin lógica de
 * negocio propia: solo mapean a los endpoints de la API, scoped por tenant
 * automáticamente.
 */
export async function fetchPatients(): Promise<Patient[]> {
  // El listado del staff no soporta búsqueda por parámetro: se trae todo
  // (per_page alto) y el filtro por nombre/RUT/correo se hace en el cliente.
  const { data } = await apiClient.get<PaginatedResponse<Patient>>('/api/staff/patients', {
    params: { per_page: 200 },
  })
  return data.data
}

export async function fetchPatient(id: number): Promise<Patient> {
  const { data } = await apiClient.get<ResourceResponse<Patient>>(`/api/staff/patients/${id}`)
  return data.data
}

export async function createPatient(payload: PatientPayload): Promise<Patient> {
  const { data } = await apiClient.post<ResourceResponse<Patient>>('/api/staff/patients', payload)
  return data.data
}

export async function updatePatient(id: number, payload: PatientPayload): Promise<Patient> {
  const { data } = await apiClient.put<ResourceResponse<Patient>>(`/api/staff/patients/${id}`, payload)
  return data.data
}

export async function deletePatient(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/patients/${id}`)
}

export async function fetchDiagnoses(patientId: number): Promise<Diagnosis[]> {
  const { data } = await apiClient.get<PaginatedResponse<Diagnosis>>(`/api/staff/patients/${patientId}/diagnoses`)
  return data.data
}

export async function createDiagnosis(patientId: number, payload: DiagnosisPayload): Promise<Diagnosis> {
  const { data } = await apiClient.post<ResourceResponse<Diagnosis>>(
    `/api/staff/patients/${patientId}/diagnoses`,
    payload,
  )
  return data.data
}

export async function updateDiagnosis(
  patientId: number,
  diagnosisId: number,
  payload: DiagnosisPayload,
): Promise<Diagnosis> {
  const { data } = await apiClient.put<ResourceResponse<Diagnosis>>(
    `/api/staff/patients/${patientId}/diagnoses/${diagnosisId}`,
    payload,
  )
  return data.data
}

export async function deleteDiagnosis(patientId: number, diagnosisId: number): Promise<void> {
  await apiClient.delete(`/api/staff/patients/${patientId}/diagnoses/${diagnosisId}`)
}

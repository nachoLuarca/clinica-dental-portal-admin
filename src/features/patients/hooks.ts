import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDiagnosis,
  createPatient,
  deleteDiagnosis,
  deletePatient,
  fetchDiagnoses,
  fetchPatient,
  fetchPatients,
  updateDiagnosis,
  updatePatient,
} from './api'
import type { DiagnosisPayload, PatientPayload } from './types'

const PATIENTS_KEY = ['patients'] as const
const patientKey = (id: number) => ['patients', id] as const
const diagnosesKey = (patientId: number) => ['patients', patientId, 'diagnoses'] as const

export function usePatients() {
  return useQuery({
    queryKey: PATIENTS_KEY,
    queryFn: fetchPatients,
  })
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: patientKey(id),
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PatientPayload) => createPatient(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PatientPayload }) => updatePatient(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY })
      queryClient.invalidateQueries({ queryKey: patientKey(variables.id) })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePatient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  })
}

export function useDiagnoses(patientId: number) {
  return useQuery({
    queryKey: diagnosesKey(patientId),
    queryFn: () => fetchDiagnoses(patientId),
    enabled: !!patientId,
  })
}

export function useCreateDiagnosis(patientId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DiagnosisPayload) => createDiagnosis(patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosesKey(patientId) })
      queryClient.invalidateQueries({ queryKey: patientKey(patientId) })
    },
  })
}

export function useUpdateDiagnosis(patientId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ diagnosisId, payload }: { diagnosisId: number; payload: DiagnosisPayload }) =>
      updateDiagnosis(patientId, diagnosisId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosesKey(patientId) })
      queryClient.invalidateQueries({ queryKey: patientKey(patientId) })
    },
  })
}

export function useDeleteDiagnosis(patientId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (diagnosisId: number) => deleteDiagnosis(patientId, diagnosisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosesKey(patientId) })
      queryClient.invalidateQueries({ queryKey: patientKey(patientId) })
    },
  })
}

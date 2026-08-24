import { useEffect, useState } from 'react'
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
import { getPendingPatients, removePendingPatient, subscribeToQueue, syncPendingPatients } from './offline-queue'
import type { DiagnosisPayload, PatientPayload } from './types'

const PATIENTS_KEY = ['patients'] as const
const patientsSearchKey = (search: string) => ['patients', 'search', search] as const
const patientKey = (id: number) => ['patients', id] as const
const diagnosesKey = (patientId: number) => ['patients', patientId, 'diagnoses'] as const

export function usePatients(search = '') {
  return useQuery({
    queryKey: search ? patientsSearchKey(search) : PATIENTS_KEY,
    queryFn: () => fetchPatients(search || undefined),
    placeholderData: (previous) => previous,
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

/**
 * Registros de pacientes+diagnóstico que quedaron encolados en IndexedDB
 * por haberse creado sin conexión. Se refresca solo cuando la cola cambia
 * (encolado, sincronizado o marcado con error), no por polling.
 */
export function usePendingPatients() {
  const [pending, setPending] = useState<Awaited<ReturnType<typeof getPendingPatients>>>([])

  useEffect(() => {
    let active = true
    function refresh() {
      getPendingPatients().then((items) => {
        if (active) setPending(items)
      })
    }
    refresh()
    const unsubscribe = subscribeToQueue(refresh)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return pending
}

export function useSyncPendingPatients() {
  const queryClient = useQueryClient()
  return () => syncPendingPatients(queryClient)
}

export function useRemovePendingPatient() {
  return (id: string) => removePendingPatient(id)
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

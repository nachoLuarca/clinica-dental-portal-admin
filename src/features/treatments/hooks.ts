import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTreatment, deleteTreatment, fetchTreatments, updateTreatment } from './api'
import type { TreatmentPayload } from './types'

const TREATMENTS_KEY = ['treatments'] as const

export function useTreatments() {
  return useQuery({
    queryKey: TREATMENTS_KEY,
    queryFn: fetchTreatments,
  })
}

export function useCreateTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TreatmentPayload) => createTreatment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TREATMENTS_KEY }),
  })
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TreatmentPayload }) => updateTreatment(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TREATMENTS_KEY }),
  })
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTreatment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TREATMENTS_KEY }),
  })
}

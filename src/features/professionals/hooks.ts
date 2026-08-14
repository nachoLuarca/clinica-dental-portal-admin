import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProfessional, deleteProfessional, fetchProfessionals, updateProfessional } from './api'
import type { ProfessionalPayload } from './types'

const PROFESSIONALS_KEY = ['professionals'] as const

export function useProfessionals() {
  return useQuery({
    queryKey: PROFESSIONALS_KEY,
    queryFn: fetchProfessionals,
  })
}

export function useCreateProfessional() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfessionalPayload) => createProfessional(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFESSIONALS_KEY }),
  })
}

export function useUpdateProfessional() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProfessionalPayload }) => updateProfessional(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFESSIONALS_KEY }),
  })
}

export function useDeleteProfessional() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProfessional(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFESSIONALS_KEY }),
  })
}

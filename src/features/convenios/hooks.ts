import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createConvenio, deleteConvenio, fetchConvenios, updateConvenio } from './api'
import type { ConvenioPayload } from './types'

export const CONVENIOS_KEY = ['convenios'] as const

export function useConvenios() {
  return useQuery({
    queryKey: CONVENIOS_KEY,
    queryFn: fetchConvenios,
  })
}

export function useCreateConvenio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ConvenioPayload) => createConvenio(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVENIOS_KEY }),
  })
}

export function useUpdateConvenio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ConvenioPayload }) => updateConvenio(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVENIOS_KEY }),
  })
}

export function useDeleteConvenio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteConvenio(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVENIOS_KEY }),
  })
}

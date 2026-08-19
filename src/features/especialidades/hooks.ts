import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createEspecialidad, deleteEspecialidad, fetchEspecialidades, updateEspecialidad } from './api'
import type { EspecialidadPayload } from './types'

export const ESPECIALIDADES_KEY = ['especialidades'] as const

export function useEspecialidades() {
  return useQuery({
    queryKey: ESPECIALIDADES_KEY,
    queryFn: fetchEspecialidades,
  })
}

export function useCreateEspecialidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EspecialidadPayload) => createEspecialidad(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ESPECIALIDADES_KEY }),
  })
}

export function useUpdateEspecialidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EspecialidadPayload }) => updateEspecialidad(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ESPECIALIDADES_KEY }),
  })
}

export function useDeleteEspecialidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteEspecialidad(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ESPECIALIDADES_KEY }),
  })
}

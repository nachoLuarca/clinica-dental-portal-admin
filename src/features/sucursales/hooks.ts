import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSucursal, deleteSucursal, fetchSucursales, updateSucursal } from './api'
import type { SucursalPayload } from './types'

export const SUCURSALES_KEY = ['sucursales'] as const

export function useSucursales() {
  return useQuery({
    queryKey: SUCURSALES_KEY,
    queryFn: fetchSucursales,
  })
}

export function useCreateSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SucursalPayload) => createSucursal(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUCURSALES_KEY }),
  })
}

export function useUpdateSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SucursalPayload }) => updateSucursal(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUCURSALES_KEY }),
  })
}

export function useDeleteSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSucursal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUCURSALES_KEY }),
  })
}

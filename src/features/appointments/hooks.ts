import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelAppointment, createAppointment, fetchAppointments, fetchAvailability } from './api'
import type { AppointmentPayload } from './types'

const APPOINTMENTS_KEY = ['appointments'] as const

export function useAppointments() {
  return useQuery({
    queryKey: APPOINTMENTS_KEY,
    queryFn: fetchAppointments,
  })
}

export function useAvailability(params: { professional_id?: number; treatment_id?: number; fecha?: string }) {
  const { professional_id, treatment_id, fecha } = params
  return useQuery({
    queryKey: ['availability', professional_id, treatment_id, fecha] as const,
    queryFn: () =>
      fetchAvailability({
        professional_id: professional_id as number,
        treatment_id: treatment_id as number,
        fecha: fecha as string,
      }),
    enabled: !!professional_id && !!treatment_id && !!fecha,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AppointmentPayload) => createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      // La API ya liberó el slot al cancelar; solo refrescamos vista y
      // disponibilidad para reflejarlo.
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}

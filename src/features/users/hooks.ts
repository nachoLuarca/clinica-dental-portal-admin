import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeStaffRole,
  changeStaffStatus,
  createStaffMember,
  fetchStaffMembers,
  resetStaffPassword,
  updateStaffMember,
} from './api'
import type { CreateStaffPayload, ResetPasswordPayload, StaffMemberFilters, UpdateStaffPayload } from './types'

const STAFF_MEMBERS_KEY = ['staff-members'] as const

export function useStaffMembers(filters: StaffMemberFilters = {}) {
  return useQuery({
    queryKey: [...STAFF_MEMBERS_KEY, filters],
    queryFn: () => fetchStaffMembers(filters),
  })
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaffMember(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_MEMBERS_KEY }),
  })
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffPayload }) => updateStaffMember(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_MEMBERS_KEY }),
  })
}

export function useChangeStaffRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rol }: { id: number; rol: string }) => changeStaffRole(id, rol),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_MEMBERS_KEY }),
  })
}

export function useChangeStaffStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => changeStaffStatus(id, activo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_MEMBERS_KEY }),
  })
}

export function useResetStaffPassword() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ResetPasswordPayload }) => resetStaffPassword(id, payload),
  })
}

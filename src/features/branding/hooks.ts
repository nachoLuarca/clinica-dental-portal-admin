import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTenant, updateTenant } from './api'
import type { TenantUpdatePayload } from './types'

const TENANT_KEY = ['branding', 'tenant'] as const

export function useTenant() {
  return useQuery({
    queryKey: TENANT_KEY,
    queryFn: fetchTenant,
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TenantUpdatePayload) => updateTenant(payload),
    onSuccess: (tenant) => {
      queryClient.setQueryData(TENANT_KEY, tenant)
    },
  })
}

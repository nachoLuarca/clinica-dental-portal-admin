import { useQuery } from '@tanstack/react-query'
import { fetchTenantBrandingInfo } from './api'

const TENANT_BRANDING_KEY = ['branding', 'tenant-info'] as const

export function useTenantBrandingInfo() {
  return useQuery({
    queryKey: TENANT_BRANDING_KEY,
    queryFn: fetchTenantBrandingInfo,
  })
}

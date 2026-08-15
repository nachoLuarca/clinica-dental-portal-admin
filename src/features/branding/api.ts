import { apiClient } from '@/lib/api-client'
import type { StaffUser } from '@/features/auth/types'
import type { TenantBrandingInfo } from './types'

/**
 * Llamadas HTTP del dominio de branding.
 *
 * No existe (todavía) un endpoint de la API para leer ni editar el branding
 * del tenant (nombre, logo, color). Lo único que el backend expone hoy sobre
 * el tenant actual es el `tenant_id` dentro de `/api/staff/me`, así que es lo
 * único que esta llamada puede devolver de forma honesta.
 */
export async function fetchTenantBrandingInfo(): Promise<TenantBrandingInfo> {
  const { data } = await apiClient.get<{ data: StaffUser }>('/api/staff/me')
  return { tenantId: data.data.tenant_id }
}

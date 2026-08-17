import { apiClient } from '@/lib/api-client'
import type { ResourceResponse } from '@/lib/types'
import type { Tenant, TenantUpdatePayload } from './types'

/**
 * Llamadas HTTP del dominio de branding (marca de la clínica). El tenant
 * nunca se manda explícitamente: siempre es el de la sesión del staff
 * autenticado, resuelto por la API a partir del token.
 */
export async function fetchTenant(): Promise<Tenant> {
  const { data } = await apiClient.get<ResourceResponse<Tenant>>('/api/staff/tenant')
  return data.data
}

/**
 * `PATCH /api/staff/tenant` con archivo requiere multipart/form-data, y
 * Laravel no parsea PATCH multipart nativo: se manda POST con method-spoofing
 * (`_method=PATCH`) dentro del mismo form-data.
 */
export async function updateTenant(payload: TenantUpdatePayload): Promise<Tenant> {
  const form = new FormData()
  form.append('_method', 'PATCH')

  if (payload.nombre !== undefined) form.append('nombre', payload.nombre)
  if (payload.color_primario !== undefined) form.append('color_primario', payload.color_primario)
  if (payload.logo !== undefined) form.append('logo', payload.logo)

  // No se fija el header 'Content-Type' a mano: con FormData, axios/el
  // navegador deben calcularlo ellos mismos para incluir el boundary
  // correcto. Si se fuerza el header aquí, el boundary se pierde y Laravel
  // no logra parsear el multipart.
  const { data } = await apiClient.post<ResourceResponse<Tenant>>('/api/staff/tenant', form)
  return data.data
}

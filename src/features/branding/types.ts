/**
 * Tipos del dominio de branding (marca de la clínica / tenant).
 *
 * Refleja `GET /api/staff/tenant`. Lectura disponible para los 3 roles de
 * staff; edición (`PATCH /api/staff/tenant`) exclusiva del rol `admin`.
 */
export interface Tenant {
  id: number
  nombre: string
  slug: string
  logo_path: string | null
  color_primario: string | null
  activo: boolean
  logo_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Payload de edición. Todos los campos son opcionales (`sometimes` en la
 * API): solo se envían los que efectivamente cambiaron.
 */
export interface TenantUpdatePayload {
  nombre?: string
  color_primario?: string
  logo?: File
}

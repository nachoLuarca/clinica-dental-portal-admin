/**
 * Tipos del dominio de branding (marca de la clínica).
 *
 * IMPORTANTE: la API de staff hoy no expone ningún endpoint que devuelva o
 * permita editar los datos del tenant (nombre, logo_path, color_primario).
 * `TenantBrandingInfo` solo modela lo poco que sí llega desde `/staff/me`
 * (el `tenant_id`), a la espera de que el backend agregue el endpoint real.
 */
export interface TenantBrandingInfo {
  tenantId: number
}

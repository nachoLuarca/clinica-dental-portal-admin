/**
 * Traducciones al español de Chile para el catálogo de permisos
 * (`GET /api/staff/permisos`), que llega agrupado por recurso con la
 * convención `recurso.acción` (ej. `patients.ver`).
 */
export const RESOURCE_LABELS: Record<string, string> = {
  appointments: 'Citas',
  budgets: 'Presupuestos',
  diagnoses: 'Diagnósticos',
  patients: 'Pacientes',
  professionals: 'Profesionales',
  roles: 'Roles',
  tenant: 'Clínica (marca y configuración)',
  treatments: 'Tratamientos',
  usuarios: 'Usuarios',
}

const ACTION_LABELS: Record<string, string> = {
  ver: 'Ver',
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
}

export function resourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource
}

export function permissionActionLabel(permission: string): string {
  const action = permission.split('.').at(-1) ?? permission
  return ACTION_LABELS[action] ?? action
}

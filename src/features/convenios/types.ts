/**
 * Tipos del dominio de convenios (convenios de salud que acepta la clínica:
 * Fonasa, isapre, caja de compensación, aseguradora u otro).
 */
export type ConvenioTipo = 'fonasa' | 'isapre' | 'caja_compensacion' | 'aseguradora' | 'otro'

export const CONVENIO_TIPOS: ConvenioTipo[] = ['fonasa', 'isapre', 'caja_compensacion', 'aseguradora', 'otro']

export const CONVENIO_TIPO_LABELS: Record<ConvenioTipo, string> = {
  fonasa: 'Fonasa',
  isapre: 'Isapre',
  caja_compensacion: 'Caja de compensación',
  aseguradora: 'Aseguradora',
  otro: 'Otro',
}

export interface Convenio {
  id: number
  tenant_id: number
  nombre: string
  tipo: ConvenioTipo
  logo_path: string | null
  logo_url: string | null
  descripcion: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

/**
 * Payload de creación/edición. `logo` solo se envía cuando el usuario elige
 * un archivo nuevo; si se omite, la API conserva el logo actual.
 */
export interface ConvenioPayload {
  nombre: string
  tipo: ConvenioTipo
  descripcion?: string
  activo: boolean
  logo?: File
}

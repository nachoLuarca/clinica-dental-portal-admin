import type { Patient } from '@/features/patients/types'
import type { Treatment } from '@/features/treatments/types'

/**
 * Tipos del dominio de presupuestos. Un ítem de presupuesto referencia un
 * tratamiento existente (estándar o de atención diferencial creado en el
 * catálogo de Tratamientos).
 */
export const BUDGET_ESTADOS = ['borrador', 'enviado', 'aceptado', 'rechazado'] as const
export type BudgetEstado = (typeof BUDGET_ESTADOS)[number]

export const BUDGET_ESTADO_LABELS: Record<BudgetEstado, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
}

export interface BudgetItem {
  id?: number
  treatment_id: number
  cantidad: number
  precio_unitario?: string | number
  subtotal?: string | number
  treatment?: Treatment
}

export interface Budget {
  id: number
  tenant_id: number
  patient_id: number
  total?: string | number
  estado?: BudgetEstado
  notas?: string | null
  items: BudgetItem[]
  patient?: Patient
  created_at: string
  updated_at: string
}

export interface BudgetItemPayload {
  treatment_id: number
  cantidad: number
}

export interface BudgetPayload {
  patient_id: number
  items: BudgetItemPayload[]
}

export interface BudgetUpdatePayload {
  estado?: BudgetEstado
  notas?: string
  items?: BudgetItemPayload[]
}

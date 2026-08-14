import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, ResourceResponse } from '@/lib/types'
import type { Budget, BudgetPayload, BudgetUpdatePayload } from './types'

/**
 * Llamadas HTTP del dominio de presupuestos. Sin lógica de negocio propia:
 * solo mapean a los endpoints de la API, scoped por tenant automáticamente.
 */
export async function fetchBudgets(): Promise<Budget[]> {
  const { data } = await apiClient.get<PaginatedResponse<Budget>>('/api/staff/budgets')
  return data.data
}

export async function fetchBudget(id: number): Promise<Budget> {
  const { data } = await apiClient.get<ResourceResponse<Budget>>(`/api/staff/budgets/${id}`)
  return data.data
}

export async function createBudget(payload: BudgetPayload): Promise<Budget> {
  const { data } = await apiClient.post<ResourceResponse<Budget>>('/api/staff/budgets', payload)
  return data.data
}

export async function updateBudget(id: number, payload: BudgetUpdatePayload): Promise<Budget> {
  const { data } = await apiClient.put<ResourceResponse<Budget>>(`/api/staff/budgets/${id}`, payload)
  return data.data
}

export async function deleteBudget(id: number): Promise<void> {
  await apiClient.delete(`/api/staff/budgets/${id}`)
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBudget, deleteBudget, fetchBudgets, updateBudget } from './api'
import type { BudgetPayload, BudgetUpdatePayload } from './types'

const BUDGETS_KEY = ['budgets'] as const

export function useBudgets() {
  return useQuery({
    queryKey: BUDGETS_KEY,
    queryFn: fetchBudgets,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BudgetPayload) => createBudget(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BudgetUpdatePayload }) => updateBudget(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  })
}

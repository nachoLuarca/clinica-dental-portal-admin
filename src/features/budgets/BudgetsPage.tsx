import { useState } from 'react'
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { getApiErrorMessage } from '@/lib/api-error'
import { usePatients } from '@/features/patients/hooks'
import { useBudgets, useDeleteBudget } from './hooks'
import { BudgetFormDialog } from './BudgetFormDialog'
import { BUDGET_ESTADO_LABELS, type Budget, type BudgetEstado } from './types'

const ESTADO_VARIANTS: Record<BudgetEstado, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  borrador: 'secondary',
  enviado: 'outline',
  aceptado: 'default',
  rechazado: 'destructive',
}

const dateFormatter = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' })
const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

function budgetTotal(budget: Budget): number {
  if (budget.total !== undefined) return Number(budget.total)
  return budget.items.reduce((sum, item) => {
    const unit = item.precio_unitario ?? item.treatment?.precio ?? 0
    return sum + Number(unit) * item.cantidad
  }, 0)
}

export default function BudgetsPage() {
  const { data: budgets, isLoading, isError, error } = useBudgets()
  const { data: patients } = usePatients()
  const deleteMutation = useDeleteBudget()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)

  function patientName(budget: Budget): string {
    if (budget.patient) return budget.patient.nombre
    return patients?.find((p) => p.id === budget.patient_id)?.nombre ?? `Paciente #${budget.patient_id}`
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(budget: Budget) {
    setEditing(budget)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Presupuesto eliminado.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar el presupuesto.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Presupuestos</h1>
          <p className="text-sm text-muted-foreground">Presupuestos generados para los pacientes de la clínica.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo presupuesto
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar los presupuestos.')}
        </p>
      )}

      {!isLoading && !isError && budgets && budgets.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          <FileText className="size-8" strokeWidth={1.5} />
          <p>Aún no hay presupuestos generados.</p>
        </div>
      )}

      {!isLoading && !isError && budgets && budgets.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tratamientos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{patientName(budget)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {budget.items.map((item, index) => (
                        <Badge key={item.id ?? index} variant="outline">
                          {item.treatment?.nombre ?? `Tratamiento #${item.treatment_id}`} x{item.cantidad}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{clpFormatter.format(budgetTotal(budget))}</TableCell>
                  <TableCell>
                    <Badge variant={ESTADO_VARIANTS[budget.estado ?? 'borrador']}>
                      {BUDGET_ESTADO_LABELS[budget.estado ?? 'borrador']}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{dateFormatter.format(new Date(budget.created_at))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(budget)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(budget)}>
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BudgetFormDialog open={formOpen} onOpenChange={setFormOpen} budget={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar presupuesto"
        description="¿Seguro que deseas eliminar este presupuesto? Esta acción no se puede deshacer."
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { usePatients } from '@/features/patients/hooks'
import { useTreatments } from '@/features/treatments/hooks'
import { useCreateBudget, useUpdateBudget } from './hooks'
import { BUDGET_ESTADOS, BUDGET_ESTADO_LABELS, type Budget } from './types'

const budgetSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente.'),
  estado: z.enum(BUDGET_ESTADOS),
  items: z
    .array(
      z.object({
        treatment_id: z.string().min(1, 'Selecciona un tratamiento.'),
        cantidad: z
          .string()
          .trim()
          .min(1, 'Ingresa una cantidad.')
          .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, 'La cantidad debe ser mayor a cero.'),
      }),
    )
    .min(1, 'Agrega al menos un tratamiento.'),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: Budget | null
}

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

const emptyValues: BudgetFormValues = {
  patient_id: '',
  estado: 'borrador',
  items: [{ treatment_id: '', cantidad: '1' }],
}

export function BudgetFormDialog({ open, onOpenChange, budget }: BudgetFormDialogProps) {
  const isEditing = !!budget
  const { data: patients } = usePatients()
  const { data: treatments } = useTreatments()
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  useEffect(() => {
    if (open) {
      form.reset(
        budget
          ? {
              patient_id: String(budget.patient_id),
              estado: budget.estado ?? 'borrador',
              items: budget.items.map((item) => ({
                treatment_id: String(item.treatment_id),
                cantidad: String(item.cantidad),
              })),
            }
          : emptyValues,
      )
    }
  }, [open, budget, form])

  const watchedItems = form.watch('items')
  const total = watchedItems.reduce((sum, item) => {
    const treatment = treatments?.find((t) => String(t.id) === item.treatment_id)
    if (!treatment) return sum
    return sum + Number(treatment.precio) * (Number(item.cantidad) || 0)
  }, 0)

  async function onSubmit(values: BudgetFormValues) {
    try {
      const items = values.items.map((item) => ({
        treatment_id: Number(item.treatment_id),
        cantidad: Number(item.cantidad),
      }))

      if (isEditing && budget) {
        await updateMutation.mutateAsync({ id: budget.id, payload: { estado: values.estado, items } })
        toast.success('Presupuesto actualizado correctamente.')
      } else {
        await createMutation.mutateAsync({ patient_id: Number(values.patient_id), items })
        toast.success('Presupuesto creado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el presupuesto.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar presupuesto' : 'Nuevo presupuesto'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza el estado y los tratamientos incluidos en el presupuesto.'
              : 'Selecciona el paciente y los tratamientos a incluir. Puedes agregar tratamientos de atención diferencial si ya fueron creados en el catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={String(patient.id)}>
                          {patient.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUDGET_ESTADOS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {BUDGET_ESTADO_LABELS[estado]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <FormLabel>Tratamientos</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ treatment_id: '', cantidad: '1' })}
                >
                  <Plus className="size-4" />
                  Agregar
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.treatment_id`}
                    render={({ field: itemField }) => (
                      <FormItem className="flex-1">
                        <Select value={itemField.value} onValueChange={itemField.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un tratamiento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {treatments?.map((treatment) => (
                              <SelectItem key={treatment.id} value={String(treatment.id)}>
                                {treatment.nombre}
                                {treatment.es_diferencial ? ' (diferencial)' : ''} —{' '}
                                {clpFormatter.format(Number(treatment.precio))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.cantidad`}
                    render={({ field: itemField }) => (
                      <FormItem className="w-20">
                        <FormControl>
                          <Input type="number" min="1" step="1" {...itemField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4 text-destructive" />
                    <span className="sr-only">Quitar</span>
                  </Button>
                </div>
              ))}
              {form.formState.errors.items?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm font-medium">
              <span>Total estimado</span>
              <span>{clpFormatter.format(total)}</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear presupuesto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

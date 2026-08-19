import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useTreatments } from '@/features/treatments/hooks'
import { useCreateEspecialidad, useUpdateEspecialidad } from './hooks'
import type { Especialidad } from './types'

const especialidadSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  treatment_ids: z.array(z.number()),
})

type EspecialidadFormValues = z.infer<typeof especialidadSchema>

interface EspecialidadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  especialidad?: Especialidad | null
}

export function EspecialidadFormDialog({ open, onOpenChange, especialidad }: EspecialidadFormDialogProps) {
  const isEditing = !!especialidad
  const { data: treatments } = useTreatments()
  const createMutation = useCreateEspecialidad()
  const updateMutation = useUpdateEspecialidad()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [treatmentSelect, setTreatmentSelect] = useState('')

  const form = useForm<EspecialidadFormValues>({
    resolver: zodResolver(especialidadSchema),
    defaultValues: { nombre: '', treatment_ids: [] },
  })

  useEffect(() => {
    if (open) {
      setTreatmentSelect('')
      form.reset(
        especialidad
          ? { nombre: especialidad.nombre, treatment_ids: especialidad.treatments.map((t) => t.id) }
          : { nombre: '', treatment_ids: [] },
      )
    }
  }, [open, especialidad, form])

  const treatmentIds = form.watch('treatment_ids')

  // Tratamientos que se pueden asignar: sin especialidad, o ya asignados a
  // esta misma especialidad (un tratamiento pertenece a una sola especialidad).
  const assignableTreatments = useMemo(
    () =>
      (treatments ?? []).filter(
        (t) => t.especialidad_id === null || t.especialidad_id === especialidad?.id,
      ),
    [treatments, especialidad],
  )

  const treatmentsById = useMemo(() => {
    const map = new Map<number, string>()
    for (const t of treatments ?? []) map.set(t.id, t.nombre)
    return map
  }, [treatments])

  function addTreatmentFromSelect() {
    const id = Number(treatmentSelect)
    if (!id) return
    const current = form.getValues('treatment_ids')
    if (!current.includes(id)) {
      form.setValue('treatment_ids', [...current, id], { shouldDirty: true })
    }
    setTreatmentSelect('')
  }

  function removeTreatment(id: number) {
    form.setValue(
      'treatment_ids',
      form.getValues('treatment_ids').filter((t) => t !== id),
      { shouldDirty: true },
    )
  }

  async function onSubmit(values: EspecialidadFormValues) {
    try {
      const payload = { nombre: values.nombre, treatment_ids: values.treatment_ids }
      if (isEditing && especialidad) {
        await updateMutation.mutateAsync({ id: especialidad.id, payload })
        toast.success('Especialidad actualizada correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Especialidad creada correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la especialidad.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar especialidad' : 'Nueva especialidad'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza el nombre y los tratamientos de esta especialidad.'
              : 'Registra una especialidad del catálogo de la clínica, asignable a profesionales.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ortodoncia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Tratamientos</FormLabel>
                  <FormDescription>Tratamientos del catálogo que cubre esta especialidad.</FormDescription>

                  {assignableTreatments.filter((t) => !treatmentIds.includes(t.id)).length > 0 ? (
                    <div className="flex gap-2">
                      <Select value={treatmentSelect} onValueChange={setTreatmentSelect}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Elige un tratamiento disponible" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableTreatments
                            .filter((t) => !treatmentIds.includes(t.id))
                            .map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.nombre}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTreatmentFromSelect}
                        disabled={!treatmentSelect}
                      >
                        <Plus className="size-4" />
                        Agregar
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay tratamientos disponibles para asignar. Se crean en el catálogo de Tratamientos.
                    </p>
                  )}

                  {treatmentIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {treatmentIds.map((id) => (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          {treatmentsById.get(id) ?? `#${id}`}
                          <button
                            type="button"
                            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                            onClick={() => removeTreatment(id)}
                          >
                            <X className="size-3" />
                            <span className="sr-only">Quitar {treatmentsById.get(id) ?? `#${id}`}</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear especialidad'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

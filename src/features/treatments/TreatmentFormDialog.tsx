import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useEspecialidades } from '@/features/especialidades/hooks'
import { useCreateTreatment, useUpdateTreatment } from './hooks'
import type { Treatment } from './types'

const SIN_ESPECIALIDAD = 'ninguna'

const treatmentSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  especialidad_id: z.string(),
  descripcion: z.string().trim().optional(),
  precio: z
    .string()
    .trim()
    .min(1, 'El precio es obligatorio.')
    .refine((value) => Number(value) > 0, 'El precio debe ser mayor a cero.'),
  duracion_minutos: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || Number(value) > 0, 'La duración debe ser mayor a cero.'),
  es_diferencial: z.boolean(),
  activo: z.boolean(),
})

type TreatmentFormValues = z.infer<typeof treatmentSchema>

interface TreatmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  treatment?: Treatment | null
}

export function TreatmentFormDialog({ open, onOpenChange, treatment }: TreatmentFormDialogProps) {
  const isEditing = !!treatment
  const { data: especialidades } = useEspecialidades()
  const createMutation = useCreateTreatment()
  const updateMutation = useUpdateTreatment()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      nombre: '',
      especialidad_id: SIN_ESPECIALIDAD,
      descripcion: '',
      precio: '',
      duracion_minutos: '',
      es_diferencial: false,
      activo: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        treatment
          ? {
              nombre: treatment.nombre,
              especialidad_id: treatment.especialidad_id ? String(treatment.especialidad_id) : SIN_ESPECIALIDAD,
              descripcion: treatment.descripcion ?? '',
              precio: String(treatment.precio),
              duracion_minutos: treatment.duracion_minutos ? String(treatment.duracion_minutos) : '',
              es_diferencial: treatment.es_diferencial,
              activo: treatment.activo,
            }
          : {
              nombre: '',
              especialidad_id: SIN_ESPECIALIDAD,
              descripcion: '',
              precio: '',
              duracion_minutos: '',
              es_diferencial: false,
              activo: true,
            },
      )
    }
  }, [open, treatment, form])

  async function onSubmit(values: TreatmentFormValues) {
    try {
      const payload = {
        ...values,
        especialidad_id: values.especialidad_id === SIN_ESPECIALIDAD ? null : Number(values.especialidad_id),
        precio: Number(values.precio),
        descripcion: values.descripcion || undefined,
        duracion_minutos: values.duracion_minutos ? Number(values.duracion_minutos) : undefined,
      }
      if (isEditing && treatment) {
        await updateMutation.mutateAsync({ id: treatment.id, payload })
        toast.success('Tratamiento actualizado correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Tratamiento creado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el tratamiento.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar tratamiento' : 'Nuevo tratamiento'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos del tratamiento.'
              : 'Registra un tratamiento del catálogo o uno de atención diferencial.'}
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
                    <Input placeholder="Limpieza dental" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="especialidad_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sin especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SIN_ESPECIALIDAD}>Sin especialidad</SelectItem>
                      {especialidades?.map((especialidad) => (
                        <SelectItem key={especialidad.id} value={String(especialidad.id)}>
                          {especialidad.nombre}
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
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalle del procedimiento (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (CLP)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" placeholder="25000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duracion_minutos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="es_diferencial"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-2 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                  </FormControl>
                  <div className="flex flex-col gap-1">
                    <FormLabel className="font-normal">Tratamiento no listado / atención diferencial</FormLabel>
                    <FormDescription>
                      Marca esta opción para tratamientos creados a medida, fuera del catálogo estándar.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                  </FormControl>
                  <FormLabel className="font-normal">Tratamiento activo</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear tratamiento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

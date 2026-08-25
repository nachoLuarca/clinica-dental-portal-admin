import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCreateSucursal, useUpdateSucursal } from './hooks'
import type { Sucursal } from './types'

/**
 * Días de la semana en el mismo orden y convención (0 = domingo … 6 =
 * sábado) que usan los horarios de profesionales, para mantener consistencia
 * en toda la app.
 */
const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
] as const

const DEFAULT_HORA_INICIO = '09:00'
const DEFAULT_HORA_FIN = '18:00'

const diaRowSchema = z
  .object({
    dia_semana: z.number().min(0).max(6),
    abierto: z.boolean(),
    hora_inicio: z.string(),
    hora_fin: z.string(),
  })
  .refine((row) => !row.abierto || row.hora_inicio.length > 0, {
    message: 'Obligatorio.',
    path: ['hora_inicio'],
  })
  .refine((row) => !row.abierto || row.hora_fin.length > 0, {
    message: 'Obligatorio.',
    path: ['hora_fin'],
  })
  .refine((row) => !row.abierto || row.hora_fin > row.hora_inicio, {
    message: 'Debe ser posterior a la hora de inicio.',
    path: ['hora_fin'],
  })

const sucursalSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  direccion: z.string().trim().optional(),
  comuna: z.string().trim().optional(),
  telefono: z.string().trim().optional(),
  activo: z.boolean(),
  horarios: z.array(diaRowSchema).length(7),
})

type SucursalFormValues = z.infer<typeof sucursalSchema>

function buildHorariosDefault(sucursal?: Sucursal | null): SucursalFormValues['horarios'] {
  return DIAS_SEMANA.map(({ value }) => {
    const existente = sucursal?.horarios.find((h) => h.dia_semana === value)
    return {
      dia_semana: value,
      abierto: !!existente,
      hora_inicio: existente ? existente.hora_inicio.slice(0, 5) : DEFAULT_HORA_INICIO,
      hora_fin: existente ? existente.hora_fin.slice(0, 5) : DEFAULT_HORA_FIN,
    }
  })
}

interface SucursalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sucursal?: Sucursal | null
}

export function SucursalFormDialog({ open, onOpenChange, sucursal }: SucursalFormDialogProps) {
  const isEditing = !!sucursal
  const createMutation = useCreateSucursal()
  const updateMutation = useUpdateSucursal()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<SucursalFormValues>({
    resolver: zodResolver(sucursalSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      comuna: '',
      telefono: '',
      activo: true,
      horarios: buildHorariosDefault(null),
    },
  })

  const horariosField = useFieldArray({ control: form.control, name: 'horarios' })

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: sucursal?.nombre ?? '',
        direccion: sucursal?.direccion ?? '',
        comuna: sucursal?.comuna ?? '',
        telefono: sucursal?.telefono ?? '',
        activo: sucursal?.activo ?? true,
        horarios: buildHorariosDefault(sucursal),
      })
    }
  }, [open, sucursal, form])

  async function onSubmit(values: SucursalFormValues) {
    try {
      const payload = {
        nombre: values.nombre,
        direccion: values.direccion || undefined,
        comuna: values.comuna || undefined,
        telefono: values.telefono || undefined,
        activo: values.activo,
        horarios: values.horarios
          .filter((h) => h.abierto)
          .map((h) => ({ dia_semana: h.dia_semana, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin })),
      }

      if (isEditing && sucursal) {
        await updateMutation.mutateAsync({ id: sucursal.id, payload })
        toast.success('Sucursal actualizada correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Sucursal creada correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la sucursal.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar sucursal' : 'Nueva sucursal'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos de la sede de la clínica.'
              : 'Registra una nueva sede de la clínica.'}
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
                    <Input placeholder="Sede Centro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Siempre Viva 742" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="comuna"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comuna</FormLabel>
                    <FormControl>
                      <Input placeholder="Providencia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+56 9 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Horario de atención</Label>
              <FormDescription>
                Marca los días en que la sede atiende y define su horario. Los días sin marcar quedan cerrados.
              </FormDescription>

              <div className="flex flex-col gap-1.5 rounded-md border p-2">
                {horariosField.fields.map((field, index) => {
                  const abierto = form.watch(`horarios.${index}.abierto`)
                  return (
                    <div key={field.id} className="flex items-center gap-2 rounded-md px-1 py-1">
                      <FormField
                        control={form.control}
                        name={`horarios.${index}.abierto`}
                        render={({ field: abiertoField }) => (
                          <FormItem className="flex w-28 shrink-0 flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={abiertoField.value}
                                onCheckedChange={(checked) => abiertoField.onChange(!!checked)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{DIAS_SEMANA[index].label}</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`horarios.${index}.hora_inicio`}
                        render={({ field: horaField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" disabled={!abierto} {...horaField} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-sm text-muted-foreground">a</span>
                      <FormField
                        control={form.control}
                        name={`horarios.${index}.hora_fin`}
                        render={({ field: horaField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" disabled={!abierto} {...horaField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                  </FormControl>
                  <FormLabel className="font-normal">Sucursal activa</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear sucursal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

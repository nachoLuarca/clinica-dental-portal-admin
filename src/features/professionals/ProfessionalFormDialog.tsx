import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image, Loader2, Plus, Trash2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useEspecialidades } from '@/features/especialidades/hooks'
import { useSucursales } from '@/features/sucursales/hooks'
import { useCreateProfessional, useUpdateProfessional } from './hooks'
import type { Professional } from './types'

const MAX_FOTO_BYTES = 2 * 1024 * 1024

/** Sentinel para "sin sucursal asignada": Radix Select no admite value="". */
const SIN_SUCURSAL = '__sin_sucursal__'

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

const horarioSchema = z
  .object({
    dia_semana: z.number().min(0).max(6),
    hora_inicio: z.string().min(1, 'Obligatorio.'),
    hora_fin: z.string().min(1, 'Obligatorio.'),
  })
  .refine((h) => h.hora_fin > h.hora_inicio, {
    message: 'Debe ser posterior a la hora de inicio.',
    path: ['hora_fin'],
  })

const professionalSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio.'),
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  activo: z.boolean(),
  especialidades: z.array(z.number()),
  horarios: z.array(horarioSchema),
  bio: z.string().trim().optional(),
  matricula: z.string().trim().optional(),
  sucursal_id: z.string(),
})

type ProfessionalFormValues = z.infer<typeof professionalSchema>

interface ProfessionalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professional?: Professional | null
}

export function ProfessionalFormDialog({ open, onOpenChange, professional }: ProfessionalFormDialogProps) {
  const isEditing = !!professional
  const { data: especialidadesCatalogo } = useEspecialidades()
  const { data: sucursales } = useSucursales()
  const createMutation = useCreateProfessional()
  const updateMutation = useUpdateProfessional()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoError, setFotoError] = useState<string | null>(null)

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      activo: true,
      especialidades: [],
      horarios: [],
      bio: '',
      matricula: '',
      sucursal_id: SIN_SUCURSAL,
    },
  })

  const horariosField = useFieldArray({ control: form.control, name: 'horarios' })

  useEffect(() => {
    if (open) {
      setFotoFile(null)
      setFotoError(null)
      form.reset(
        professional
          ? {
              nombre: professional.nombre,
              apellido: professional.apellido,
              email: professional.email,
              activo: professional.activo,
              especialidades: professional.especialidades?.map((e) => e.id) ?? [],
              horarios:
                professional.schedules?.map((s) => ({
                  dia_semana: s.dia_semana,
                  hora_inicio: s.hora_inicio.slice(0, 5),
                  hora_fin: s.hora_fin.slice(0, 5),
                })) ?? [],
              bio: professional.bio ?? '',
              matricula: professional.matricula ?? '',
              sucursal_id: professional.sucursal_id ? String(professional.sucursal_id) : SIN_SUCURSAL,
            }
          : {
              nombre: '',
              apellido: '',
              email: '',
              activo: true,
              especialidades: [],
              horarios: [],
              bio: '',
              matricula: '',
              sucursal_id: SIN_SUCURSAL,
            },
      )
    }
  }, [open, professional, form])

  const fotoPreview = useMemo(
    () => (fotoFile ? URL.createObjectURL(fotoFile) : (professional?.foto_url ?? null)),
    [fotoFile, professional],
  )

  useEffect(() => {
    return () => {
      if (fotoFile) URL.revokeObjectURL(fotoPreview!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotoFile])

  function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setFotoError(null)
    if (file && file.size > MAX_FOTO_BYTES) {
      setFotoError('La foto no puede superar los 2MB.')
      setFotoFile(null)
      event.target.value = ''
      return
    }
    setFotoFile(file)
  }

  async function onSubmit(values: ProfessionalFormValues) {
    try {
      const payload = {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        activo: values.activo,
        especialidades: values.especialidades,
        horarios: values.horarios,
        bio: values.bio || undefined,
        matricula: values.matricula || undefined,
        sucursal_id: values.sucursal_id === SIN_SUCURSAL ? null : Number(values.sucursal_id),
        foto: fotoFile ?? undefined,
      }

      if (isEditing && professional) {
        await updateMutation.mutateAsync({ id: professional.id, payload })
        toast.success('Profesional actualizado correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Profesional creado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el profesional.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar profesional' : 'Nuevo profesional'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos del profesional de la clínica.'
              : 'Completa los datos para registrar un nuevo profesional.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="professional-foto">Foto</Label>
              <div className="flex items-center gap-3">
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed text-muted-foreground">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto del profesional" className="size-full object-cover" />
                  ) : (
                    <Image className="size-6" strokeWidth={1.5} />
                  )}
                </span>
                <div className="flex flex-col gap-1">
                  <Input
                    id="professional-foto"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleFotoChange}
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG, SVG o WEBP. Máximo 2MB.</p>
                  {fotoError && <p className="text-xs text-destructive">{fotoError}</p>}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="especialidades"
              render={() => (
                <FormItem>
                  <FormLabel>Especialidades</FormLabel>
                  {(especialidadesCatalogo ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aún no hay especialidades registradas en el catálogo de la clínica.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-3">
                      {(especialidadesCatalogo ?? []).map((esp) => (
                        <label key={esp.id} className="flex items-center gap-2 text-sm font-normal">
                          <Checkbox
                            checked={form.watch('especialidades').includes(esp.id)}
                            onCheckedChange={(checked) => {
                              const current = new Set(form.getValues('especialidades'))
                              if (checked) current.add(esp.id)
                              else current.delete(esp.id)
                              form.setValue('especialidades', Array.from(current), { shouldDirty: true })
                            }}
                          />
                          {esp.nombre}
                        </label>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Label>Horarios de atención</Label>
              <p className="text-sm text-muted-foreground">
                Tramos horarios propios de este profesional (no se comparten con otros).
              </p>

              {horariosField.fields.length > 0 && (
                <div className="flex flex-col gap-2">
                  {horariosField.fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 rounded-md border p-2">
                      <FormField
                        control={form.control}
                        name={`horarios.${index}.dia_semana`}
                        render={({ field: diaField }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs font-normal">Día</FormLabel>
                            <Select
                              value={String(diaField.value)}
                              onValueChange={(value) => diaField.onChange(Number(value))}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DIAS_SEMANA.map((dia) => (
                                  <SelectItem key={dia.value} value={String(dia.value)}>
                                    {dia.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`horarios.${index}.hora_inicio`}
                        render={({ field: horaField }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-normal">Desde</FormLabel>
                            <FormControl>
                              <Input type="time" {...horaField} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`horarios.${index}.hora_fin`}
                        render={({ field: horaField }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-normal">Hasta</FormLabel>
                            <FormControl>
                              <Input type="time" {...horaField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => horariosField.remove(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Quitar tramo</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => horariosField.append({ dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00' })}
              >
                <Plus className="size-4" />
                Agregar tramo
              </Button>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="profesional@clinica.cl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="matricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula</FormLabel>
                    <FormControl>
                      <Input placeholder="12345-6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sucursal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sucursal</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sin sucursal asignada" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SIN_SUCURSAL}>Sin sucursal asignada</SelectItem>
                        {(sucursales ?? []).map((sucursal) => (
                          <SelectItem key={sucursal.id} value={String(sucursal.id)}>
                            {sucursal.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reseña breve para la ficha pública (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
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
                  <FormLabel className="font-normal">Profesional activo</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear profesional'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

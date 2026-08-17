import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, WifiOff } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useOnlineStatus } from '@/lib/use-online-status'
import { useProfessionals } from '@/features/professionals/hooks'
import { useCreatePatient, useUpdatePatient } from './hooks'
import { enqueuePatient } from './offline-queue'
import type { Patient } from './types'

const patientSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
    email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
    fecha_nacimiento: z.string().trim().min(1, 'La fecha de nacimiento es obligatoria.'),
    telefono: z.string().trim().optional(),
    notas: z.string().trim().optional(),
    diagnostico_fecha: z.string().trim().optional(),
    diagnostico_descripcion: z.string().trim().optional(),
    diagnostico_notas: z.string().trim().optional(),
    diagnostico_professional_id: z.string().optional(),
  })
  .refine((values) => !values.diagnostico_descripcion || !!values.diagnostico_fecha, {
    message: 'Ingresa la fecha del diagnóstico.',
    path: ['diagnostico_fecha'],
  })

type PatientFormValues = z.infer<typeof patientSchema>

interface PatientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient | null
}

function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10)
}

const EMPTY_VALUES: PatientFormValues = {
  nombre: '',
  email: '',
  fecha_nacimiento: '',
  telefono: '',
  notas: '',
  diagnostico_fecha: '',
  diagnostico_descripcion: '',
  diagnostico_notas: '',
  diagnostico_professional_id: undefined,
}

export function PatientFormDialog({ open, onOpenChange, patient }: PatientFormDialogProps) {
  const isEditing = !!patient
  const isOnline = useOnlineStatus()
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient()
  const { data: professionals } = useProfessionals()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (open) {
      form.reset(
        patient
          ? {
              ...EMPTY_VALUES,
              nombre: patient.nombre,
              email: patient.email,
              fecha_nacimiento: toDateInputValue(patient.fecha_nacimiento),
              telefono: patient.telefono ?? '',
              notas: patient.notas ?? '',
            }
          : EMPTY_VALUES,
      )
    }
  }, [open, patient, form])

  async function onSubmit(values: PatientFormValues) {
    const payload = {
      nombre: values.nombre,
      email: values.email,
      fecha_nacimiento: values.fecha_nacimiento,
      telefono: values.telefono || undefined,
      notas: values.notas || undefined,
    }

    try {
      if (isEditing && patient) {
        await updateMutation.mutateAsync({ id: patient.id, payload })
        toast.success('Paciente actualizado correctamente.')
        onOpenChange(false)
        return
      }

      const diagnosisPayload = values.diagnostico_descripcion
        ? {
            fecha: values.diagnostico_fecha!,
            descripcion: values.diagnostico_descripcion,
            notas: values.diagnostico_notas || undefined,
            professional_id: values.diagnostico_professional_id
              ? Number(values.diagnostico_professional_id)
              : undefined,
          }
        : undefined

      if (!isOnline) {
        await enqueuePatient(payload, diagnosisPayload)
        toast.success('Sin conexión: el registro se guardó localmente y se sincronizará cuando vuelva la conexión.')
        onOpenChange(false)
        return
      }

      await createMutation.mutateAsync(payload)
      toast.success('Paciente creado correctamente.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el paciente.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza los datos del paciente.' : 'Completa los datos para registrar un nuevo paciente.'}
          </DialogDescription>
        </DialogHeader>

        {!isEditing && !isOnline && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            <WifiOff className="size-4 shrink-0" />
            Estás sin conexión. El registro se guardará en este dispositivo y se sincronizará automáticamente cuando
            vuelva la conexión.
          </div>
        )}

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Pedro Paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="paciente@correo.cl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fecha_nacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observaciones generales (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <div className="flex flex-col gap-4 rounded-lg border border-dashed p-3">
                <div>
                  <p className="text-sm font-medium">Diagnóstico inicial (opcional)</p>
                  <p className="text-xs text-muted-foreground">
                    Si completas la descripción, el diagnóstico se registrará junto con el paciente.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="diagnostico_fecha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diagnostico_professional_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profesional</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sin asignar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {professionals?.map((professional) => (
                              <SelectItem key={professional.id} value={String(professional.id)}>
                                {professional.nombre} {professional.apellido}
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
                  name="diagnostico_descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción del diagnóstico (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnostico_notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas del diagnóstico</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones adicionales (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : !isOnline ? 'Guardar sin conexión' : 'Crear paciente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

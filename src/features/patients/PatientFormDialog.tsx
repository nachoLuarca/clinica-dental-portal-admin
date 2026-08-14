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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCreatePatient, useUpdatePatient } from './hooks'
import type { Patient } from './types'

const patientSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  fecha_nacimiento: z.string().trim().min(1, 'La fecha de nacimiento es obligatoria.'),
  telefono: z.string().trim().optional(),
  notas: z.string().trim().optional(),
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

export function PatientFormDialog({ open, onOpenChange, patient }: PatientFormDialogProps) {
  const isEditing = !!patient
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { nombre: '', email: '', fecha_nacimiento: '', telefono: '', notas: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        patient
          ? {
              nombre: patient.nombre,
              email: patient.email,
              fecha_nacimiento: toDateInputValue(patient.fecha_nacimiento),
              telefono: patient.telefono ?? '',
              notas: patient.notas ?? '',
            }
          : { nombre: '', email: '', fecha_nacimiento: '', telefono: '', notas: '' },
      )
    }
  }, [open, patient, form])

  async function onSubmit(values: PatientFormValues) {
    try {
      const payload = {
        ...values,
        telefono: values.telefono || undefined,
        notas: values.notas || undefined,
      }
      if (isEditing && patient) {
        await updateMutation.mutateAsync({ id: patient.id, payload })
        toast.success('Paciente actualizado correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Paciente creado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el paciente.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza los datos del paciente.' : 'Completa los datos para registrar un nuevo paciente.'}
          </DialogDescription>
        </DialogHeader>

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear paciente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

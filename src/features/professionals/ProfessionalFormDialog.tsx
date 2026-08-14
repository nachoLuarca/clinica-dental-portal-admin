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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCreateProfessional, useUpdateProfessional } from './hooks'
import type { Professional } from './types'

const professionalSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio.'),
  especialidad: z.string().trim().min(1, 'La especialidad es obligatoria.'),
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  activo: z.boolean(),
})

type ProfessionalFormValues = z.infer<typeof professionalSchema>

interface ProfessionalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professional?: Professional | null
}

export function ProfessionalFormDialog({ open, onOpenChange, professional }: ProfessionalFormDialogProps) {
  const isEditing = !!professional
  const createMutation = useCreateProfessional()
  const updateMutation = useUpdateProfessional()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      especialidad: '',
      email: '',
      activo: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        professional
          ? {
              nombre: professional.nombre,
              apellido: professional.apellido,
              especialidad: professional.especialidad,
              email: professional.email,
              activo: professional.activo,
            }
          : { nombre: '', apellido: '', especialidad: '', email: '', activo: true },
      )
    }
  }, [open, professional, form])

  async function onSubmit(values: ProfessionalFormValues) {
    try {
      if (isEditing && professional) {
        await updateMutation.mutateAsync({ id: professional.id, payload: values })
        toast.success('Profesional actualizado correctamente.')
      } else {
        await createMutation.mutateAsync(values)
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

            <FormField
              control={form.control}
              name="especialidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ortodoncia" {...field} />
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
                    <Input type="email" placeholder="profesional@clinica.cl" {...field} />
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

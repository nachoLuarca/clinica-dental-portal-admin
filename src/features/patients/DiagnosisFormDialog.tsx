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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage, isForbiddenError } from '@/lib/api-error'
import { useProfessionals } from '@/features/professionals/hooks'
import { useCreateDiagnosis, useUpdateDiagnosis } from './hooks'
import type { Diagnosis } from './types'

const diagnosisSchema = z.object({
  fecha: z.string().trim().min(1, 'La fecha es obligatoria.'),
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria.'),
  notas: z.string().trim().optional(),
  professional_id: z.string().optional(),
})

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>

interface DiagnosisFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: number
  diagnosis?: Diagnosis | null
  /**
   * Se llama cuando la API rechaza con 403 (usuario sin `diagnoses.crear` /
   * `diagnoses.editar`, ej. rol `recepción`). El padre lo usa para dejar de
   * ofrecer esta acción por el resto de la sesión.
   */
  onForbidden?: () => void
}

function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10)
}

export function DiagnosisFormDialog({ open, onOpenChange, patientId, diagnosis, onForbidden }: DiagnosisFormDialogProps) {
  const isEditing = !!diagnosis
  const { data: professionals } = useProfessionals()
  const createMutation = useCreateDiagnosis(patientId)
  const updateMutation = useUpdateDiagnosis(patientId)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: { fecha: '', descripcion: '', notas: '', professional_id: undefined },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        diagnosis
          ? {
              fecha: toDateInputValue(diagnosis.fecha),
              descripcion: diagnosis.descripcion,
              notas: diagnosis.notas ?? '',
              professional_id: diagnosis.professional_id ? String(diagnosis.professional_id) : undefined,
            }
          : { fecha: '', descripcion: '', notas: '', professional_id: undefined },
      )
    }
  }, [open, diagnosis, form])

  async function onSubmit(values: DiagnosisFormValues) {
    try {
      const payload = {
        fecha: values.fecha,
        descripcion: values.descripcion,
        notas: values.notas || undefined,
        professional_id: values.professional_id ? Number(values.professional_id) : undefined,
      }
      if (isEditing && diagnosis) {
        await updateMutation.mutateAsync({ diagnosisId: diagnosis.id, payload })
        toast.success('Diagnóstico actualizado correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Diagnóstico registrado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      if (isForbiddenError(error)) onForbidden?.()
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el diagnóstico.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}</DialogTitle>
          <DialogDescription>Registra el diagnóstico y las observaciones clínicas del paciente.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fecha"
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
                name="professional_id"
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
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción del diagnóstico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observaciones adicionales (opcional)" {...field} />
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
                {isEditing ? 'Guardar cambios' : 'Registrar diagnóstico'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

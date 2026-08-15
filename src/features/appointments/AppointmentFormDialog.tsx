import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarClock, Loader2, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-error'
import { useOnlineStatus } from '@/lib/use-online-status'
import { usePatients } from '@/features/patients/hooks'
import { useProfessionals } from '@/features/professionals/hooks'
import { useTreatments } from '@/features/treatments/hooks'
import { useAvailability, useCreateAppointment } from './hooks'
import type { AvailabilitySlot } from './types'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente.'),
  professional_id: z.string().min(1, 'Selecciona un profesional.'),
  treatment_id: z.string().min(1, 'Selecciona un tratamiento.'),
  fecha: z.string().min(1, 'Selecciona una fecha.'),
  notas: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyValues: AppointmentFormValues = {
  patient_id: '',
  professional_id: '',
  treatment_id: '',
  fecha: '',
  notas: '',
}

const timeFormatter = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })

function todayISODate(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}

export function AppointmentFormDialog({ open, onOpenChange }: AppointmentFormDialogProps) {
  const isOnline = useOnlineStatus()
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()
  const { data: treatments } = useTreatments()
  const createMutation = useCreateAppointment()

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(emptyValues)
      setSelectedSlot(null)
    }
  }, [open, form])

  const professionalId = form.watch('professional_id')
  const treatmentId = form.watch('treatment_id')
  const fecha = form.watch('fecha')

  const availabilityParams = useMemo(
    () => ({
      professional_id: professionalId ? Number(professionalId) : undefined,
      treatment_id: treatmentId ? Number(treatmentId) : undefined,
      fecha: fecha || undefined,
    }),
    [professionalId, treatmentId, fecha],
  )

  const {
    data: availability,
    isFetching: isLoadingAvailability,
    isError: isAvailabilityError,
    error: availabilityError,
  } = useAvailability(availabilityParams)

  useEffect(() => {
    setSelectedSlot(null)
  }, [professionalId, treatmentId, fecha])

  async function onSubmit(values: AppointmentFormValues) {
    if (!selectedSlot) {
      toast.error('Selecciona un horario disponible para la cita.')
      return
    }

    try {
      await createMutation.mutateAsync({
        patient_id: Number(values.patient_id),
        professional_id: Number(values.professional_id),
        treatment_id: Number(values.treatment_id),
        fecha_hora: selectedSlot.fecha_hora,
        notas: values.notas || undefined,
      })
      toast.success('Cita agendada correctamente.')
      onOpenChange(false)
    } catch (error) {
      // Si el slot ya no está disponible (choque detectado por la API),
      // limpiamos la selección y dejamos que la disponibilidad se refresque.
      setSelectedSlot(null)
      toast.error(getApiErrorMessage(error, 'No se pudo agendar la cita.'))
    }
  }

  const showSlots = professionalId && treatmentId && fecha

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
          <DialogDescription>
            Agenda una cita para un paciente. Los horarios disponibles los calcula la clínica en tiempo real.
          </DialogDescription>
        </DialogHeader>

        {!isOnline && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <WifiOff className="size-4 shrink-0" />
            Necesitas conexión a internet para agendar una cita: el horario se valida en tiempo real contra la
            clínica para evitar choques de reserva.
          </div>
        )}

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesional</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un profesional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals
                          ?.filter((p) => p.activo)
                          .map((professional) => (
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

              <FormField
                control={form.control}
                name="treatment_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamiento</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un tratamiento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {treatments
                          ?.filter((t) => t.activo)
                          .map((treatment) => (
                            <SelectItem key={treatment.id} value={String(treatment.id)}>
                              {treatment.nombre}
                              {treatment.es_diferencial ? ' (diferencial)' : ''}
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
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" min={todayISODate()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showSlots && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Horarios disponibles</p>

                {isLoadingAvailability && (
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                )}

                {isAvailabilityError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {getApiErrorMessage(availabilityError, 'No se pudo consultar la disponibilidad.')}
                  </p>
                )}

                {!isLoadingAvailability && !isAvailabilityError && availability && availability.slots.length === 0 && (
                  <p className="rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                    El profesional no tiene horarios disponibles ese día para este tratamiento.
                  </p>
                )}

                {!isLoadingAvailability && !isAvailabilityError && availability && availability.slots.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availability.slots.map((slot) => (
                      <button
                        key={slot.fecha_hora}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          'flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium transition-colors',
                          selectedSlot?.fecha_hora === slot.fecha_hora
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        <CalendarClock className="size-3.5" />
                        {timeFormatter.format(new Date(slot.fecha_hora))}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Observaciones para la cita" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !selectedSlot || !isOnline}>
                {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Agendar cita
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

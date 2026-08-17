import { useMemo, useState } from 'react'
import { CalendarDays, CalendarX2, Loader2, Plus, WifiOff, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getApiErrorMessage } from '@/lib/api-error'
import { useOnlineStatus } from '@/lib/use-online-status'
import { useProfessionals } from '@/features/professionals/hooks'
import { useAppointments, useCancelAppointment } from './hooks'
import { AppointmentFormDialog } from './AppointmentFormDialog'
import { APPOINTMENT_ESTADO_LABELS, type Appointment, type AppointmentEstado } from './types'

const ESTADO_VARIANTS: Record<AppointmentEstado, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  reservada: 'default',
  confirmada: 'default',
  cancelada: 'destructive',
  completada: 'secondary',
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' })

const ESTADO_FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'reservada', label: 'Reservadas' },
  { value: 'cancelada', label: 'Canceladas' },
] as const

export default function AppointmentsPage() {
  const { data: appointments, isLoading, isError, error } = useAppointments()
  const { data: professionals } = useProfessionals()
  const cancelMutation = useCancelAppointment()
  const isOnline = useOnlineStatus()

  const [formOpen, setFormOpen] = useState(false)
  const [cancelling, setCancelling] = useState<Appointment | null>(null)
  const [fechaFilter, setFechaFilter] = useState('')
  const [professionalFilter, setProfessionalFilter] = useState('todos')
  const [estadoFilter, setEstadoFilter] = useState<(typeof ESTADO_FILTERS)[number]['value']>('todas')

  const filtered = useMemo(() => {
    if (!appointments) return []
    return appointments.filter((appointment) => {
      if (fechaFilter && !appointment.fecha_hora.startsWith(fechaFilter)) return false
      if (professionalFilter !== 'todos' && String(appointment.professional_id) !== professionalFilter) return false
      if (estadoFilter !== 'todas' && appointment.estado !== estadoFilter) return false
      return true
    })
  }, [appointments, fechaFilter, professionalFilter, estadoFilter])

  function patientLabel(appointment: Appointment): string {
    return appointment.patient?.nombre ?? `Paciente #${appointment.patient_id}`
  }

  function professionalLabel(appointment: Appointment): string {
    if (appointment.professional) return `${appointment.professional.nombre} ${appointment.professional.apellido}`
    return `Profesional #${appointment.professional_id}`
  }

  async function confirmCancel() {
    if (!cancelling) return
    if (!isOnline) {
      toast.error('No se puede cancelar una cita sin conexión: el horario debe liberarse en tiempo real.')
      return
    }
    try {
      await cancelMutation.mutateAsync(cancelling.id)
      toast.success('Cita cancelada. El horario vuelve a estar disponible.')
      setCancelling(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo cancelar la cita.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={CalendarDays}
        title="Agenda"
        description="Citas agendadas para los pacientes de la clínica."
        accent="cyan"
        action={
          <Button onClick={() => setFormOpen(true)} disabled={!isOnline}>
            <Plus className="size-4" />
            Nueva cita
          </Button>
        }
      />

      {!isOnline && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive duration-300 animate-in fade-in fill-mode-both">
          <WifiOff className="size-4 shrink-0" />
          Estás sin conexión. Agendar y cancelar citas está bloqueado porque requieren validar el horario en tiempo
          real contra la clínica; los datos que ves pueden estar desactualizados.
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-background p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Fecha</label>
          <Input
            type="date"
            className="w-[160px]"
            value={fechaFilter}
            onChange={(event) => setFechaFilter(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Profesional</label>
          <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los profesionales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los profesionales</SelectItem>
              {professionals?.map((professional) => (
                <SelectItem key={professional.id} value={String(professional.id)}>
                  {professional.nombre} {professional.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <div className="flex gap-1">
            {ESTADO_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={estadoFilter === filter.value ? 'default' : 'outline'}
                onClick={() => setEstadoFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {(fechaFilter || professionalFilter !== 'todos' || estadoFilter !== 'todas') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setFechaFilter('')
              setProfessionalFilter('todos')
              setEstadoFilter('todas')
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar las citas.')}
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState icon={CalendarX2} message="No hay citas que coincidan con los filtros." />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="rounded-lg border duration-300 animate-in fade-in fill-mode-both">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Profesional</TableHead>
                <TableHead>Tratamiento</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[140px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((appointment, index) => (
                <TableRow
                  key={appointment.id}
                  className="duration-300 animate-in fade-in fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                >
                  <TableCell className="font-medium">{patientLabel(appointment)}</TableCell>
                  <TableCell>{professionalLabel(appointment)}</TableCell>
                  <TableCell>{appointment.treatment?.nombre ?? `Tratamiento #${appointment.treatment_id}`}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateTimeFormatter.format(new Date(appointment.fecha_hora))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ESTADO_VARIANTS[appointment.estado]}>
                      {APPOINTMENT_ESTADO_LABELS[appointment.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {appointment.estado !== 'cancelada' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={!isOnline}
                        title={!isOnline ? 'Sin conexión: no se puede cancelar una cita.' : undefined}
                        onClick={() => setCancelling(appointment)}
                      >
                        <XCircle className="size-4" />
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AppointmentFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <AlertDialog open={!!cancelling} onOpenChange={(open) => !open && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar cita</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas cancelar la cita de {cancelling ? patientLabel(cancelling) : ''} el{' '}
              {cancelling ? dateTimeFormatter.format(new Date(cancelling.fecha_hora)) : ''}? El horario quedará
              disponible nuevamente para otros pacientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Volver</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                confirmCancel()
              }}
            >
              {cancelMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Cancelar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

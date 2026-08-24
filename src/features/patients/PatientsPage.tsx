import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CloudUpload, Pencil, Plus, RefreshCw, Search, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useOnlineStatus } from '@/lib/use-online-status'
import { formatTelefono } from '@/lib/phone'
import { useDeletePatient, usePatients, usePendingPatients, useRemovePendingPatient, useSyncPendingPatients } from './hooks'
import { PatientFormDialog } from './PatientFormDialog'
import type { Patient } from './types'

const dateFormatter = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' })

function normalizar(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export default function PatientsPage() {
  const { data: patients, isLoading, isError, error } = usePatients()
  const deleteMutation = useDeletePatient()
  const pendingPatients = usePendingPatients()
  const isOnline = useOnlineStatus()
  const syncPending = useSyncPendingPatients()
  const removePending = useRemovePendingPatient()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [deleting, setDeleting] = useState<Patient | null>(null)
  const [search, setSearch] = useState('')

  const filteredPatients = useMemo(() => {
    const query = normalizar(search.trim())
    if (!query) return patients ?? []
    return (patients ?? []).filter((patient) => {
      const haystack = normalizar(
        [patient.nombre, patient.apellido ?? '', patient.rut, patient.email].join(' '),
      )
      return haystack.includes(query)
    })
  }, [patients, search])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(patient: Patient) {
    setEditing(patient)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Paciente eliminado.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar el paciente.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Users}
        title="Pacientes"
        description="Gestiona la ficha y el diagnóstico de tus pacientes."
        accent="emerald"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo paciente
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, RUT o correo…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {pendingPatients.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-3 duration-300 animate-in fade-in fill-mode-both">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
              <CloudUpload className="size-4 shrink-0" />
              {pendingPatients.length === 1
                ? '1 registro pendiente de sincronizar.'
                : `${pendingPatients.length} registros pendientes de sincronizar.`}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!isOnline}
              title={!isOnline ? 'Sin conexión: no se puede sincronizar todavía.' : undefined}
              onClick={() => syncPending()}
            >
              <RefreshCw className="size-4" />
              Sincronizar ahora
            </Button>
          </div>

          <div className="flex flex-col divide-y">
            {pendingPatients.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-medium">{item.patientPayload.nombre}</p>
                  <p className="text-xs text-muted-foreground">{item.patientPayload.email}</p>
                  {item.diagnosisPayload && (
                    <p className="text-xs text-muted-foreground">Incluye diagnóstico inicial</p>
                  )}
                  {item.status === 'error' && item.errorMessage && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3 shrink-0" />
                      {item.errorMessage}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === 'error' ? 'destructive' : 'outline'}>
                    {item.status === 'syncing'
                      ? 'Sincronizando…'
                      : item.status === 'error'
                        ? 'Error al sincronizar'
                        : 'Pendiente de sincronizar'}
                  </Badge>
                  {item.status === 'error' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removePending(item.id)}
                      title="Descartar registro pendiente"
                    >
                      <Trash2 className="size-4 text-destructive" />
                      <span className="sr-only">Descartar</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar los pacientes.')}
        </p>
      )}

      {!isLoading && !isError && patients && patients.length === 0 && (
        <EmptyState icon={Users} message="Aún no hay pacientes registrados." />
      )}

      {!isLoading && !isError && patients && patients.length > 0 && filteredPatients.length === 0 && (
        <EmptyState icon={Search} message="No hay pacientes que coincidan con la búsqueda." />
      )}

      {!isLoading && !isError && filteredPatients.length > 0 && (
        <div className="rounded-lg border duration-300 animate-in fade-in fill-mode-both">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Fecha de nacimiento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Datos aceptados</TableHead>
                <TableHead className="w-[140px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient, index) => (
                <TableRow
                  key={patient.id}
                  className="duration-300 animate-in fade-in fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                >
                  <TableCell className="font-medium">
                    <Link to={`/pacientes/${patient.id}`} className="hover:underline">
                      {patient.nombre} {patient.apellido ?? ''}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{patient.rut}</TableCell>
                  <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(patient.fecha_nacimiento))}</TableCell>
                  <TableCell>{formatTelefono(patient.telefono)}</TableCell>
                  <TableCell>
                    {patient.datos_aceptados_at ? (
                      <Badge variant="outline">{dateFormatter.format(new Date(patient.datos_aceptados_at))}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(patient)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(patient)}>
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PatientFormDialog open={formOpen} onOpenChange={setFormOpen} patient={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar paciente"
        description={`¿Seguro que deseas eliminar a ${deleting?.nombre}? Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

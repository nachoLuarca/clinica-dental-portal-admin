import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDeletePatient, usePatients } from './hooks'
import { PatientFormDialog } from './PatientFormDialog'
import type { Patient } from './types'

const dateFormatter = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' })

export default function PatientsPage() {
  const { data: patients, isLoading, isError, error } = usePatients()
  const deleteMutation = useDeletePatient()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [deleting, setDeleting] = useState<Patient | null>(null)

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Gestiona la ficha y el diagnóstico de tus pacientes.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo paciente
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar los pacientes.')}
        </p>
      )}

      {!isLoading && !isError && patients && patients.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          <Users className="size-8" strokeWidth={1.5} />
          <p>Aún no hay pacientes registrados.</p>
        </div>
      )}

      {!isLoading && !isError && patients && patients.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Fecha de nacimiento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="w-[140px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <Link to={`/pacientes/${patient.id}`} className="hover:underline">
                      {patient.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(patient.fecha_nacimiento))}</TableCell>
                  <TableCell>{patient.telefono ?? '—'}</TableCell>
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

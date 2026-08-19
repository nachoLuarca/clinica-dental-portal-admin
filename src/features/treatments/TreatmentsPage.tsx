import { useState } from 'react'
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDeleteTreatment, useTreatments } from './hooks'
import { TreatmentFormDialog } from './TreatmentFormDialog'
import type { Treatment } from './types'

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

export default function TreatmentsPage() {
  const { data: treatments, isLoading, isError, error } = useTreatments()
  const deleteMutation = useDeleteTreatment()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Treatment | null>(null)
  const [deleting, setDeleting] = useState<Treatment | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(treatment: Treatment) {
    setEditing(treatment)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Tratamiento eliminado.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar el tratamiento.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={ClipboardList}
        title="Tratamientos"
        description="Catálogo de tratamientos y atenciones diferenciales de la clínica."
        accent="violet"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo tratamiento
          </Button>
        }
      />

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar los tratamientos.')}
        </p>
      )}

      {!isLoading && !isError && treatments && treatments.length === 0 && (
        <EmptyState icon={ClipboardList} message="Aún no hay tratamientos registrados." />
      )}

      {!isLoading && !isError && treatments && treatments.length > 0 && (
        <div className="rounded-lg border duration-300 animate-in fade-in fill-mode-both">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment, index) => (
                <TableRow
                  key={treatment.id}
                  className="duration-300 animate-in fade-in fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                >
                  <TableCell className="font-medium">{treatment.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{treatment.especialidad?.nombre ?? '—'}</TableCell>
                  <TableCell>{clpFormatter.format(Number(treatment.precio))}</TableCell>
                  <TableCell>{treatment.duracion_minutos ? `${treatment.duracion_minutos} min` : '—'}</TableCell>
                  <TableCell>
                    {treatment.es_diferencial ? (
                      <Badge variant="outline">Diferencial</Badge>
                    ) : (
                      <Badge variant="secondary">Estándar</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={treatment.activo ? 'default' : 'secondary'}>
                      {treatment.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(treatment)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(treatment)}>
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

      <TreatmentFormDialog open={formOpen} onOpenChange={setFormOpen} treatment={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar tratamiento"
        description={`¿Seguro que deseas eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

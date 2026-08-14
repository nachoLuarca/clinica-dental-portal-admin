import { useState } from 'react'
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tratamientos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo de tratamientos y atenciones diferenciales de la clínica.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo tratamiento
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
          {getApiErrorMessage(error, 'No se pudieron cargar los tratamientos.')}
        </p>
      )}

      {!isLoading && !isError && treatments && treatments.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          <ClipboardList className="size-8" strokeWidth={1.5} />
          <p>Aún no hay tratamientos registrados.</p>
        </div>
      )}

      {!isLoading && !isError && treatments && treatments.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">{treatment.nombre}</TableCell>
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

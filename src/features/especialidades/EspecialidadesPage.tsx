import { useState } from 'react'
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDeleteEspecialidad, useEspecialidades } from './hooks'
import { EspecialidadFormDialog } from './EspecialidadFormDialog'
import type { Especialidad } from './types'

export default function EspecialidadesPage() {
  const { data: especialidades, isLoading, isError, error } = useEspecialidades()
  const deleteMutation = useDeleteEspecialidad()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Especialidad | null>(null)
  const [deleting, setDeleting] = useState<Especialidad | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(especialidad: Especialidad) {
    setEditing(especialidad)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Especialidad eliminada.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar la especialidad.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={GraduationCap}
        title="Especialidades"
        description="Catálogo de especialidades de la clínica, asignables a los profesionales."
        accent="cyan"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva especialidad
          </Button>
        }
      />

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar las especialidades.')}
        </p>
      )}

      {!isLoading && !isError && especialidades && especialidades.length === 0 && (
        <EmptyState icon={GraduationCap} message="Aún no hay especialidades registradas." />
      )}

      {!isLoading && !isError && especialidades && especialidades.length > 0 && (
        <div className="rounded-lg border duration-300 animate-in fade-in fill-mode-both">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tratamientos</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {especialidades.map((especialidad, index) => (
                <TableRow
                  key={especialidad.id}
                  className="duration-300 animate-in fade-in fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                >
                  <TableCell className="font-medium">{especialidad.nombre}</TableCell>
                  <TableCell>
                    {especialidad.treatments.length === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {especialidad.treatments.map((t) => (
                          <Badge key={t.id} variant="secondary">
                            {t.nombre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(especialidad)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(especialidad)}>
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

      <EspecialidadFormDialog open={formOpen} onOpenChange={setFormOpen} especialidad={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar especialidad"
        description={`¿Seguro que deseas eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

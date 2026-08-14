import { useState } from 'react'
import { Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDeleteProfessional, useProfessionals } from './hooks'
import { ProfessionalFormDialog } from './ProfessionalFormDialog'
import type { Professional } from './types'

export default function ProfessionalsPage() {
  const { data: professionals, isLoading, isError, error } = useProfessionals()
  const deleteMutation = useDeleteProfessional()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Professional | null>(null)
  const [deleting, setDeleting] = useState<Professional | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(professional: Professional) {
    setEditing(professional)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Profesional eliminado.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar el profesional.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Profesionales</h1>
          <p className="text-sm text-muted-foreground">Gestiona el equipo clínico de tu clínica.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo profesional
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
          {getApiErrorMessage(error, 'No se pudieron cargar los profesionales.')}
        </p>
      )}

      {!isLoading && !isError && professionals && professionals.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          <Stethoscope className="size-8" strokeWidth={1.5} />
          <p>Aún no hay profesionales registrados.</p>
        </div>
      )}

      {!isLoading && !isError && professionals && professionals.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell className="font-medium">
                    {professional.nombre} {professional.apellido}
                  </TableCell>
                  <TableCell>{professional.especialidad}</TableCell>
                  <TableCell className="text-muted-foreground">{professional.email}</TableCell>
                  <TableCell>
                    <Badge variant={professional.activo ? 'default' : 'secondary'}>
                      {professional.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(professional)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(professional)}>
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

      <ProfessionalFormDialog open={formOpen} onOpenChange={setFormOpen} professional={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar profesional"
        description={`¿Seguro que deseas eliminar a ${deleting?.nombre} ${deleting?.apellido}? Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

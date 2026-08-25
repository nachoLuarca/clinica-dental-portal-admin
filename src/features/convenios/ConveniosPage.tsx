import { useState } from 'react'
import { HeartHandshake, Image, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useConvenios, useDeleteConvenio } from './hooks'
import { ConvenioFormDialog } from './ConvenioFormDialog'
import { CONVENIO_TIPO_LABELS, type Convenio } from './types'

export default function ConveniosPage() {
  const { data: convenios, isLoading, isError, error } = useConvenios()
  const deleteMutation = useDeleteConvenio()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Convenio | null>(null)
  const [deleting, setDeleting] = useState<Convenio | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(convenio: Convenio) {
    setEditing(convenio)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Convenio eliminado.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar el convenio.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={HeartHandshake}
        title="Convenios"
        description="Convenios de salud que acepta tu clínica (Fonasa, isapres, aseguradoras, etc.)."
        accent="violet"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo convenio
          </Button>
        }
      />

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar los convenios.')}
        </p>
      )}

      {!isLoading && !isError && convenios && convenios.length === 0 && (
        <EmptyState icon={HeartHandshake} message="Aún no hay convenios registrados." />
      )}

      {!isLoading && !isError && convenios && convenios.length > 0 && (
        <div className="rounded-lg border duration-300 animate-in fade-in fill-mode-both">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {convenios.map((convenio, index) => (
                <TableRow
                  key={convenio.id}
                  className="duration-300 animate-in fade-in fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                >
                  <TableCell>
                    <span className="flex size-10 items-center justify-center overflow-hidden rounded-md border text-muted-foreground">
                      {convenio.logo_url ? (
                        <img src={convenio.logo_url} alt={convenio.nombre} className="size-full object-contain" />
                      ) : (
                        <Image className="size-4" strokeWidth={1.5} />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{convenio.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{CONVENIO_TIPO_LABELS[convenio.tipo]}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {convenio.descripcion || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={convenio.activo ? 'default' : 'secondary'}>
                      {convenio.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(convenio)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(convenio)}>
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

      <ConvenioFormDialog open={formOpen} onOpenChange={setFormOpen} convenio={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar convenio"
        description={`¿Seguro que deseas eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

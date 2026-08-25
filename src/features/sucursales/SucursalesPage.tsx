import { useState } from 'react'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDeleteSucursal, useSucursales } from './hooks'
import { SucursalFormDialog } from './SucursalFormDialog'
import type { Sucursal } from './types'

const DIAS_ABREV = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function SucursalesPage() {
  const { data: sucursales, isLoading, isError, error } = useSucursales()
  const deleteMutation = useDeleteSucursal()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Sucursal | null>(null)
  const [deleting, setDeleting] = useState<Sucursal | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(sucursal: Sucursal) {
    setEditing(sucursal)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Sucursal eliminada.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar la sucursal.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Building2}
        title="Sucursales"
        description="Sedes físicas de tu clínica y su horario de atención."
        accent="emerald"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva sucursal
          </Button>
        }
      />

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar las sucursales.')}
        </p>
      )}

      {!isLoading && !isError && sucursales && sucursales.length === 0 && (
        <EmptyState icon={Building2} message="Aún no hay sucursales registradas." />
      )}

      {!isLoading && !isError && sucursales && sucursales.length > 0 && (
        <div className="rounded-lg border duration-300 animate-in fade-in fill-mode-both">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sucursales.map((sucursal, index) => (
                <TableRow
                  key={sucursal.id}
                  className="duration-300 animate-in fade-in fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                >
                  <TableCell className="font-medium">{sucursal.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[sucursal.direccion, sucursal.comuna].filter(Boolean).join(', ') || '—'}
                  </TableCell>
                  <TableCell>
                    {sucursal.horarios.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {sucursal.horarios.map((h) => (
                          <Badge key={h.id} variant="outline">
                            {DIAS_ABREV[h.dia_semana]} {h.hora_inicio.slice(0, 5)}–{h.hora_fin.slice(0, 5)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sucursal.telefono || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={sucursal.activo ? 'default' : 'secondary'}>
                      {sucursal.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(sucursal)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(sucursal)}>
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

      <SucursalFormDialog open={formOpen} onOpenChange={setFormOpen} sucursal={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar sucursal"
        description={`¿Seguro que deseas eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

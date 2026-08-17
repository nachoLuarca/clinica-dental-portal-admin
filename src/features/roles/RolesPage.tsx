import { useMemo, useState } from 'react'
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { getApiErrorMessage } from '@/lib/api-error'
import { useStaffMembers } from '@/features/users/hooks'
import { useDeleteRole, useRoles } from './hooks'
import { RoleFormDialog } from './RoleFormDialog'
import { resourceLabel, permissionActionLabel } from './permission-labels'
import { ADMIN_ROLE_NAME, type Role } from './types'

export default function RolesPage() {
  const { data: roles, isLoading, isError, error } = useRoles()
  const { data: staffMembers } = useStaffMembers()
  const deleteMutation = useDeleteRole()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)

  const usageByRole = useMemo(() => {
    const map = new Map<string, number>()
    for (const member of staffMembers ?? []) {
      for (const role of member.roles) {
        map.set(role.name, (map.get(role.name) ?? 0) + 1)
      }
    }
    return map
  }, [staffMembers])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(role: Role) {
    setEditing(role)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Rol eliminado.')
      setDeleting(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar el rol.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={ShieldCheck}
        title="Roles y permisos"
        description="Define los roles del staff y qué puede hacer cada uno dentro del portal."
        accent="violet"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo rol
          </Button>
        }
      />

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar los roles.')}
        </p>
      )}

      {!isLoading && !isError && roles && roles.length === 0 && (
        <EmptyState icon={ShieldCheck} message="Aún no hay roles configurados." />
      )}

      {!isLoading && !isError && roles && roles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((role, index) => {
            const isProtected = role.name === ADMIN_ROLE_NAME
            const usersCount = usageByRole.get(role.name) ?? 0
            const canDelete = !isProtected && usersCount === 0

            return (
              <div
                key={role.id}
                className="flex flex-col gap-3 rounded-lg border p-4 duration-300 animate-in fade-in fill-mode-both"
                style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold capitalize">{role.name}</h3>
                      {isProtected && <Badge variant="secondary">Protegido</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {usersCount} {usersCount === 1 ? 'usuario asignado' : 'usuarios asignados'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(role)}
                      disabled={isProtected}
                      title={isProtected ? 'El rol admin no se puede editar.' : undefined}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleting(role)}
                      disabled={!canDelete}
                      title={
                        isProtected
                          ? 'El rol admin no se puede eliminar.'
                          : usersCount > 0
                            ? 'No se puede eliminar: hay usuarios con este rol.'
                            : undefined
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {role.permissions.length === 0 && (
                    <span className="text-xs text-muted-foreground">Sin permisos asignados.</span>
                  )}
                  {role.permissions.map((permission) => (
                    <Badge key={permission.id} variant="outline" className="text-[11px]">
                      {resourceLabel(permission.name.split('.')[0])} · {permissionActionLabel(permission.name)}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editing} />

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar rol"
        description={`¿Seguro que deseas eliminar el rol "${deleting?.name}"? Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

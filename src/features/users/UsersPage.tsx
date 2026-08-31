import { useMemo, useState } from 'react'
import { KeyRound, MoreVertical, Pencil, Plus, ShieldQuestion, UserCog, UserX, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuth } from '@/features/auth/use-auth'
import { useRoles } from '@/features/roles/hooks'
import { useChangeStaffStatus, useStaffMembers } from './hooks'
import { UserFormDialog } from './UserFormDialog'
import { ChangeRoleDialog } from './ChangeRoleDialog'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import type { StaffMember, StaffMemberFilters } from './types'

const ACTIVO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
]

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { data: roles } = useRoles()

  const [rolFilter, setRolFilter] = useState('todos')
  const [activoFilter, setActivoFilter] = useState('todos')
  const [nombreFilter, setNombreFilter] = useState('')

  const filters: StaffMemberFilters = useMemo(
    () => ({
      rol: rolFilter === 'todos' ? undefined : rolFilter,
      activo: activoFilter === 'todos' ? undefined : activoFilter === 'true',
      nombre: nombreFilter.trim() || undefined,
    }),
    [rolFilter, activoFilter, nombreFilter],
  )

  const { data: staffMembers, isLoading, isError, error } = useStaffMembers(filters)
  const changeStatusMutation = useChangeStaffStatus()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [changingRole, setChangingRole] = useState<StaffMember | null>(null)
  const [resettingPassword, setResettingPassword] = useState<StaffMember | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(member: StaffMember) {
    setEditing(member)
    setFormOpen(true)
  }

  async function toggleStatus(member: StaffMember) {
    try {
      await changeStatusMutation.mutateAsync({ id: member.id, activo: !member.activo })
      toast.success(member.activo ? 'Usuario desactivado.' : 'Usuario activado.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el estado del usuario.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={UsersIcon}
        title="Usuarios del staff"
        description="Gestiona las cuentas del equipo de tu clínica y sus roles asignados."
        accent="cyan"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 duration-300 animate-in fade-in slide-in-from-bottom-1 fill-mode-both">
        <Input
          placeholder="Buscar por nombre…"
          value={nombreFilter}
          onChange={(e) => setNombreFilter(e.target.value)}
          className="w-full sm:w-56"
        />
        <Select value={rolFilter} onValueChange={setRolFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            {(roles ?? []).map((role) => (
              <SelectItem key={role.id} value={role.name} className="capitalize">
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activoFilter} onValueChange={setActivoFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <TableSkeleton />}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudieron cargar los usuarios.')}
        </p>
      )}

      {!isLoading && !isError && staffMembers && staffMembers.length === 0 && (
        <EmptyState icon={UsersIcon} message="No se encontraron usuarios con estos filtros." />
      )}

      {!isLoading && !isError && staffMembers && staffMembers.length > 0 && (
        <div className="rounded-lg border duration-300 animate-in fade-in fill-mode-both">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[60px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.map((member, index) => {
                const isSelf = member.id === currentUser?.id
                return (
                  <TableRow
                    key={member.id}
                    className="duration-300 animate-in fade-in fill-mode-both"
                    style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                  >
                    <TableCell className="font-medium">
                      {member.name}
                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.roles.length === 0 && (
                          <Badge variant="outline" className="gap-1 text-amber-600">
                            <ShieldQuestion className="size-3" />
                            Sin rol
                          </Badge>
                        )}
                        {member.roles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="capitalize">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.activo ? 'default' : 'secondary'}>
                        {member.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(member)}>
                            <Pencil className="size-4" />
                            Editar datos
                          </DropdownMenuItem>
                          {!isSelf && (
                            <DropdownMenuItem onClick={() => setChangingRole(member)}>
                              <UserCog className="size-4" />
                              Cambiar rol
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setResettingPassword(member)}>
                            <KeyRound className="size-4" />
                            Restablecer contraseña
                          </DropdownMenuItem>
                          {!isSelf && (
                            <DropdownMenuItem
                              variant={member.activo ? 'destructive' : 'default'}
                              onClick={() => toggleStatus(member)}
                            >
                              <UserX className="size-4" />
                              {member.activo ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} staffMember={editing} />
      <ChangeRoleDialog
        open={!!changingRole}
        onOpenChange={(open) => !open && setChangingRole(null)}
        staffMember={changingRole}
      />
      <ResetPasswordDialog
        open={!!resettingPassword}
        onOpenChange={(open) => !open && setResettingPassword(null)}
        staffMember={resettingPassword}
      />
    </div>
  )
}

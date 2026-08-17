import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api-error'
import { useRoles } from '@/features/roles/hooks'
import { useChangeStaffRole } from './hooks'
import type { StaffMember } from './types'

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffMember: StaffMember | null
}

export function ChangeRoleDialog({ open, onOpenChange, staffMember }: ChangeRoleDialogProps) {
  const { data: roles } = useRoles()
  const changeRoleMutation = useChangeStaffRole()
  const [selectedRole, setSelectedRole] = useState('')

  useEffect(() => {
    if (open) setSelectedRole(staffMember?.roles[0]?.name ?? '')
  }, [open, staffMember])

  async function handleSubmit() {
    if (!staffMember || !selectedRole) return
    try {
      await changeRoleMutation.mutateAsync({ id: staffMember.id, rol: selectedRole })
      toast.success('Rol actualizado correctamente.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar el rol del usuario.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar rol</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo rol para <span className="font-medium">{staffMember?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            {(roles ?? []).map((role) => (
              <SelectItem key={role.id} value={role.name} className="capitalize">
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeRoleMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!selectedRole || changeRoleMutation.isPending}>
            {changeRoleMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

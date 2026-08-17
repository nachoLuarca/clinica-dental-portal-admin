import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCreateRole, usePermissionCatalog, useUpdateRoleName, useUpdateRolePermissions } from './hooks'
import { permissionActionLabel, resourceLabel } from './permission-labels'
import type { Role } from './types'

const roleSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del rol es obligatorio.'),
  permissions: z.array(z.string()),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Rol a editar, o null/undefined para crear uno nuevo. Nunca se pasa el rol `admin` (protegido). */
  role?: Role | null
}

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEditing = !!role
  const { data: catalog, isLoading: isLoadingCatalog } = usePermissionCatalog()
  const createMutation = useCreateRole()
  const updateNameMutation = useUpdateRoleName()
  const updatePermissionsMutation = useUpdateRolePermissions()
  const isSubmitting = createMutation.isPending || updateNameMutation.isPending || updatePermissionsMutation.isPending

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', permissions: [] },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        role
          ? { name: role.name, permissions: role.permissions.map((p) => p.name) }
          : { name: '', permissions: [] },
      )
    }
  }, [open, role, form])

  async function onSubmit(values: RoleFormValues) {
    try {
      if (isEditing && role) {
        if (values.name !== role.name) {
          await updateNameMutation.mutateAsync({ id: role.id, name: values.name })
        }
        await updatePermissionsMutation.mutateAsync({ id: role.id, payload: { permissions: values.permissions } })
        toast.success('Rol actualizado correctamente.')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Rol creado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el rol.'))
    }
  }

  const selected = form.watch('permissions')

  function toggleGroup(perms: string[], checkAll: boolean) {
    const current = new Set(form.getValues('permissions'))
    for (const perm of perms) {
      if (checkAll) current.add(perm)
      else current.delete(perm)
    }
    form.setValue('permissions', Array.from(current), { shouldDirty: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar rol: ${role?.name}` : 'Nuevo rol'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza el nombre y la matriz de permisos de este rol.'
              : 'Define un nombre y selecciona los permisos que tendrá este rol.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del rol</FormLabel>
                  <FormControl>
                    <Input placeholder="asistente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3">
              <FormLabel>Permisos</FormLabel>
              {isLoadingCatalog && <p className="text-sm text-muted-foreground">Cargando catálogo de permisos…</p>}
              {catalog &&
                Object.entries(catalog).map(([resource, perms]) => {
                  const allChecked = perms.every((perm) => selected.includes(perm))
                  return (
                    <div key={resource} className="rounded-md border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{resourceLabel(resource)}</span>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => toggleGroup(perms, !allChecked)}
                        >
                          {allChecked ? 'Quitar todos' : 'Marcar todos'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {perms.map((perm) => (
                          <label key={perm} className="flex items-center gap-2 text-sm font-normal">
                            <Checkbox
                              checked={selected.includes(perm)}
                              onCheckedChange={(checked) => {
                                const current = new Set(form.getValues('permissions'))
                                if (checked) current.add(perm)
                                else current.delete(perm)
                                form.setValue('permissions', Array.from(current), { shouldDirty: true })
                              }}
                            />
                            {permissionActionLabel(perm)}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear rol'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

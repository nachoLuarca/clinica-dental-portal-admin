import { useEffect, useMemo } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useRoles } from '@/features/roles/hooks'
import { useCreateStaffMember, useUpdateStaffMember } from './hooks'
import type { StaffMember } from './types'

/**
 * Un único schema (con campos opcionales) en vez de dos schemas distintos:
 * así `useForm` mantiene un tipo consistente y la validación condicional
 * (rol/password obligatorios solo al crear) vive en `superRefine`, que sí
 * puede cerrar sobre `isEditing`.
 */
function buildSchema(isEditing: boolean) {
  return z
    .object({
      name: z.string().trim().min(1, 'El nombre es obligatorio.'),
      email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
      rol: z.string().optional(),
      password: z.string().optional(),
      password_confirmation: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (isEditing) return

      if (!data.rol) {
        ctx.addIssue({ code: 'custom', message: 'Debes seleccionar un rol.', path: ['rol'] })
      }
      if (!data.password || data.password.length < 8) {
        ctx.addIssue({
          code: 'custom',
          message: 'La contraseña debe tener al menos 8 caracteres.',
          path: ['password'],
        })
      }
      if (data.password !== data.password_confirmation) {
        ctx.addIssue({ code: 'custom', message: 'Las contraseñas no coinciden.', path: ['password_confirmation'] })
      }
    })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffMember?: StaffMember | null
}

/**
 * Crea o edita datos básicos de un usuario de staff. El rol inicial se pide
 * solo al crear (obligatorio en la API); cambiar el rol de un usuario ya
 * existente se hace desde `ChangeRoleDialog`, y la contraseña desde
 * `ResetPasswordDialog` — son endpoints separados en la API.
 */
export function UserFormDialog({ open, onOpenChange, staffMember }: UserFormDialogProps) {
  const isEditing = !!staffMember
  const { data: roles } = useRoles()
  const createMutation = useCreateStaffMember()
  const updateMutation = useUpdateStaffMember()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => buildSchema(isEditing), [isEditing])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', rol: '', password: '', password_confirmation: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        staffMember
          ? { name: staffMember.name, email: staffMember.email, rol: '', password: '', password_confirmation: '' }
          : { name: '', email: '', rol: '', password: '', password_confirmation: '' },
      )
    }
  }, [open, staffMember, form])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && staffMember) {
        await updateMutation.mutateAsync({ id: staffMember.id, payload: { name: values.name, email: values.email } })
        toast.success('Usuario actualizado correctamente.')
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          email: values.email,
          rol: values.rol!,
          password: values.password!,
          password_confirmation: values.password_confirmation!,
        })
        toast.success('Usuario creado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el usuario.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza el nombre y correo de este usuario de staff.'
              : 'Registra un nuevo usuario de staff y asígnale un rol inicial.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="María Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="staff@clinica.cl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(roles ?? []).map((role) => (
                            <SelectItem key={role.id} value={role.name} className="capitalize">
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

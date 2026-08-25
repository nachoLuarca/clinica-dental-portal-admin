import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image, Loader2 } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCreateConvenio, useUpdateConvenio } from './hooks'
import { CONVENIO_TIPOS, CONVENIO_TIPO_LABELS, type Convenio } from './types'

const MAX_LOGO_BYTES = 2 * 1024 * 1024

const convenioSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  tipo: z.enum(CONVENIO_TIPOS as [string, ...string[]], { message: 'Selecciona un tipo.' }),
  descripcion: z.string().trim().optional(),
  activo: z.boolean(),
})

type ConvenioFormValues = z.infer<typeof convenioSchema>

interface ConvenioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  convenio?: Convenio | null
}

export function ConvenioFormDialog({ open, onOpenChange, convenio }: ConvenioFormDialogProps) {
  const isEditing = !!convenio
  const createMutation = useCreateConvenio()
  const updateMutation = useUpdateConvenio()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)

  const form = useForm<ConvenioFormValues>({
    resolver: zodResolver(convenioSchema),
    defaultValues: { nombre: '', tipo: 'fonasa', descripcion: '', activo: true },
  })

  useEffect(() => {
    if (open) {
      setLogoFile(null)
      setLogoError(null)
      form.reset(
        convenio
          ? {
              nombre: convenio.nombre,
              tipo: convenio.tipo,
              descripcion: convenio.descripcion ?? '',
              activo: convenio.activo,
            }
          : { nombre: '', tipo: 'fonasa', descripcion: '', activo: true },
      )
    }
  }, [open, convenio, form])

  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : (convenio?.logo_url ?? null)),
    [logoFile, convenio],
  )

  useEffect(() => {
    return () => {
      if (logoFile) URL.revokeObjectURL(logoPreview!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoFile])

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setLogoError(null)
    if (file && file.size > MAX_LOGO_BYTES) {
      setLogoError('El logo no puede superar los 2MB.')
      setLogoFile(null)
      event.target.value = ''
      return
    }
    setLogoFile(file)
  }

  async function onSubmit(values: ConvenioFormValues) {
    try {
      const payload = {
        nombre: values.nombre,
        tipo: values.tipo as Convenio['tipo'],
        descripcion: values.descripcion || undefined,
        activo: values.activo,
        logo: logoFile ?? undefined,
      }

      if (isEditing && convenio) {
        await updateMutation.mutateAsync({ id: convenio.id, payload })
        toast.success('Convenio actualizado correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Convenio creado correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el convenio.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar convenio' : 'Nuevo convenio'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos del convenio de salud.'
              : 'Registra un convenio de salud que acepta la clínica.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Fonasa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONVENIO_TIPOS.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {CONVENIO_TIPO_LABELS[tipo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción breve del convenio (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convenio-logo">Logo del convenio</Label>
              <div className="flex items-center gap-3">
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed text-muted-foreground">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo del convenio" className="size-full object-contain" />
                  ) : (
                    <Image className="size-6" strokeWidth={1.5} />
                  )}
                </span>
                <div className="flex flex-col gap-1">
                  <Input
                    id="convenio-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG, SVG o WEBP. Máximo 2MB.</p>
                  {logoError && <p className="text-xs text-destructive">{logoError}</p>}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                  </FormControl>
                  <FormLabel className="font-normal">Convenio activo</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear convenio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

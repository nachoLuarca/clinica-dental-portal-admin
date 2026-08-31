import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Image, Loader2, Lock, Palette, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/features/auth/use-auth'
import { getApiErrorMessage, isForbiddenError } from '@/lib/api-error'
import { useTenant, useUpdateTenant } from './hooks'

const MAX_LOGO_BYTES = 2 * 1024 * 1024

const brandingSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre de la clínica es obligatorio.'),
  color_primario: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Usa un color hexadecimal válido (ej. #2563eb).')
    .or(z.literal('')),
})

type BrandingFormValues = z.infer<typeof brandingSchema>

export default function BrandingPage() {
  const { data: tenant, isLoading, isError, error } = useTenant()
  const updateMutation = useUpdateTenant()
  const { isAdmin, rolesKnown } = useAuth()

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  // Si la API confirma con un 403 que este usuario no puede editar (caso no
  // cubierto de antemano porque /staff/me todavía no informa el rol), la
  // pantalla se bloquea para el resto de la sesión en vez de reintentar.
  const [forbidden, setForbidden] = useState(false)

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { nombre: '', color_primario: '' },
  })

  useEffect(() => {
    if (tenant) {
      form.reset({ nombre: tenant.nombre, color_primario: tenant.color_primario ?? '' })
    }
  }, [tenant, form])

  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : (tenant?.logo_url ?? null)), [
    logoFile,
    tenant,
  ])

  useEffect(() => {
    return () => {
      if (logoFile) URL.revokeObjectURL(logoPreview!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoFile])

  // Sabemos con certeza que no es admin solo si la API llegó a informar
  // roles y `admin` no está entre ellos. Mientras no lo sepamos, se muestra
  // el formulario editable y se confía en el 403 real como red de seguridad.
  const knownNonAdmin = rolesKnown && isAdmin === false
  const readOnly = knownNonAdmin || forbidden

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

  async function onSubmit(values: BrandingFormValues) {
    if (!tenant) return

    const payload: { nombre?: string; color_primario?: string; logo?: File } = {}
    if (values.nombre !== tenant.nombre) payload.nombre = values.nombre
    if (values.color_primario !== (tenant.color_primario ?? '')) payload.color_primario = values.color_primario
    if (logoFile) payload.logo = logoFile

    if (Object.keys(payload).length === 0) {
      toast.info('No hay cambios para guardar.')
      return
    }

    try {
      await updateMutation.mutateAsync(payload)
      toast.success('Marca de la clínica actualizada.')
      setLogoFile(null)
    } catch (err) {
      if (isForbiddenError(err)) {
        setForbidden(true)
      }
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar la marca de la clínica.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Palette}
        title="Marca de la clínica"
        description="Logo, nombre y color de la clínica que ven pacientes y staff en el portal."
        accent="rose"
      />

      {readOnly && (
        <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground duration-300 animate-in fade-in fill-mode-both">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>Solo el administrador de la clínica puede editar la marca. Puedes ver los datos actuales abajo.</p>
        </div>
      )}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudo obtener la información de la clínica.')}
        </p>
      )}

      {isLoading && (
        <Card className="duration-300 animate-in fade-in fill-mode-both">
          <CardContent className="flex flex-col gap-4 pt-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-16 w-16 rounded-lg" />
          </CardContent>
        </Card>
      )}

      {!isLoading && tenant && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Card className="duration-300 animate-in fade-in slide-in-from-bottom-1 fill-mode-both">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  Identidad visual
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Clínica <Badge variant="secondary">{tenant.slug}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la clínica</FormLabel>
                        <FormControl>
                          <Input placeholder="Clínica Dental Demo" disabled={readOnly} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color_primario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color primario</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              type="color"
                              disabled={readOnly}
                              className="h-9 w-14 shrink-0 p-1"
                              value={field.value || '#0f172a'}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <Input
                            placeholder="#0f172a"
                            disabled={readOnly}
                            value={field.value}
                            onChange={field.onChange}
                            className="font-mono"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="branding-logo">Logo de la clínica</Label>
                  <div className="flex items-center gap-3">
                    <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed text-muted-foreground">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo de la clínica" className="size-full object-contain" />
                      ) : (
                        <Image className="size-6" strokeWidth={1.5} />
                      )}
                    </span>
                    {!readOnly && (
                      <div className="flex flex-col gap-1">
                        <Input
                          id="branding-logo"
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleLogoChange}
                        />
                        <p className="text-xs text-muted-foreground">JPG, PNG, SVG o WEBP. Máximo 2MB.</p>
                        {logoError && <p className="text-xs text-destructive">{logoError}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              {!readOnly && (
                <CardFooter className="justify-end">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    Guardar cambios
                  </Button>
                </CardFooter>
              )}
            </Card>
          </form>
        </Form>
      )}
    </div>
  )
}

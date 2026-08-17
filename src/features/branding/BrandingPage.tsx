import { AlertTriangle, Building2, Image, Palette } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { getApiErrorMessage } from '@/lib/api-error'
import { useTenantBrandingInfo } from './hooks'

/**
 * Pantalla de branding (marca de la clínica).
 *
 * La API de staff (`clinica-dental-api`) todavía no expone ningún endpoint
 * para leer ni editar los datos de branding del tenant (nombre, logo, color
 * primario) — solo el modelo `Tenant` los tiene definidos, pero ninguna ruta
 * de `routes/api.php` bajo `staff/*` los sirve. Por eso esta pantalla:
 *
 * - Muestra lo único que sí es real y viene de la API (`tenant_id`, vía
 *   `/api/staff/me`).
 * - Deja el resto de los campos visibles pero deshabilitados, para que se
 *   entienda la forma que va a tener el formulario cuando el backend agregue
 *   el endpoint, sin simular datos ni permitir guardar nada que no exista.
 */
export default function BrandingPage() {
  const { data, isLoading, isError, error } = useTenantBrandingInfo()

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Palette}
        title="Marca de la clínica"
        description="Logo, nombre y color de la clínica que ven pacientes y staff en el portal."
        accent="rose"
      />

      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 duration-300 animate-in fade-in fill-mode-both dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Esta pantalla está bloqueada por el backend.</p>
          <p className="text-amber-800 dark:text-amber-300">
            La API todavía no tiene un endpoint para que el staff consulte o edite el nombre, logo y color de su
            clínica. Los campos de abajo se muestran deshabilitados como referencia de diseño, no reflejan datos
            reales.
          </p>
        </div>
      </div>

      <Card className="duration-300 animate-in fade-in slide-in-from-bottom-1 fill-mode-both">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4" />
            Clínica actual
          </CardTitle>
          <CardDescription>Dato real, obtenido de la sesión activa (/api/staff/me).</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-9 w-40" />}

          {isError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(error, 'No se pudo obtener la información de la clínica.')}
            </p>
          )}

          {!isLoading && !isError && data && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ID interno de la clínica:</span>
              <Badge variant="secondary">{data.tenantId}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="opacity-75 duration-300 animate-in fade-in slide-in-from-bottom-1 fill-mode-both delay-75">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4" />
            Identidad visual
          </CardTitle>
          <CardDescription>No disponible todavía desde la API. Pendiente de implementar en el backend.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="branding-nombre">Nombre de la clínica</Label>
              <Input id="branding-nombre" disabled placeholder="No disponible" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="branding-color">Color primario</Label>
              <Input id="branding-color" type="color" disabled className="h-9 w-full" defaultValue="#000000" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="branding-logo">Logo de la clínica</Label>
            <div className="flex items-center gap-3">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                <Image className="size-6" strokeWidth={1.5} />
              </span>
              <Input id="branding-logo" type="file" disabled accept="image/*" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Building2, Loader2, Lock, Mail, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/lib/api-error'

interface LocationState {
  from?: { pathname: string }
}

export default function LoginPage() {
  const { user, isLoadingSession, isLoggingIn, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [clinica, setClinica] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isLoadingSession && user) {
    const state = location.state as LocationState | null
    const redirectTo = state?.from?.pathname ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await login({ clinica: clinica.trim(), email: email.trim(), password })
      toast.success('Sesión iniciada correctamente.')
      navigate('/', { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudo iniciar sesión. Intenta nuevamente.')
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/30 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="size-6" strokeWidth={1.75} />
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Portal Clínica Dental</h1>
          <p className="text-sm text-muted-foreground">Acceso para personal de la clínica</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Ingresa los datos de tu cuenta de staff.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="clinica">Clínica</Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="clinica"
                    name="clinica"
                    autoComplete="organization"
                    placeholder="identificador-de-tu-clinica"
                    className="pl-9"
                    value={clinica}
                    onChange={(e) => setClinica(e.target.value)}
                    required
                    aria-invalid={!!errorMessage}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tucorreo@clinica.cl"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={!!errorMessage}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-invalid={!!errorMessage}
                  />
                </div>
              </div>

              {errorMessage && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" className="mt-2" disabled={isLoggingIn}>
                {isLoggingIn && <Loader2 className="size-4 animate-spin" />}
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from './AuthContext'

/**
 * Protege rutas exclusivas de administrador (gestión de usuarios/roles).
 * Requiere sesión activa (delegado en `ProtectedRoute`, que envuelve a
 * este componente) y además `isAdmin === true`. Mientras `isAdmin` es
 * `null` (rol aún no resuelto) se muestra un loader en vez de redirigir,
 * para no expulsar por error a un admin real antes de tiempo.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, rolesKnown, isLoadingSession } = useAuth()

  if (isLoadingSession || !rolesKnown) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

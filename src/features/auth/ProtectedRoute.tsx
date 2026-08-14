import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from './AuthContext'

/**
 * Envuelve rutas que requieren sesión de staff activa.
 * Si no hay sesión, redirige a /login preservando la ruta de origen.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoadingSession } = useAuth()
  const location = useLocation()

  if (isLoadingSession) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/40">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

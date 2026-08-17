import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearStaffToken, getStaffToken, setStaffToken } from '@/lib/api-client'
import { fetchCurrentStaff, loginStaff, logoutStaff } from './api'
import type { StaffLoginPayload, StaffRole, StaffUser } from './types'

interface AuthContextValue {
  /** Usuario staff autenticado, o null si no hay sesión. */
  user: StaffUser | null
  /** true mientras se resuelve la sesión inicial (lectura de /staff/me). */
  isLoadingSession: boolean
  /** true mientras se procesa un login en curso. */
  isLoggingIn: boolean
  login: (payload: StaffLoginPayload) => Promise<void>
  logout: () => Promise<void>
  /**
   * Roles del usuario actual. Hoy `GET /api/staff/me` no los incluye en su
   * respuesta (ver nota en `types.ts`), así que en la práctica esta lista
   * queda vacía y `rolesKnown` en `false` — el frontend no puede saber de
   * antemano qué rol tiene el usuario, solo confirmarlo cuando la API
   * responde 403 a una acción puntual.
   */
  roles: StaffRole[]
  /** true solo si la API efectivamente informó el/los rol(es) del usuario. */
  rolesKnown: boolean
  hasRole: (...roles: StaffRole[]) => boolean
  /**
   * `true` si sabemos que es admin, `false` si sabemos que NO lo es, y
   * `null` si no hay información de rol disponible (caso actual). Cuando es
   * `null`, la UI debe optar por mostrar la acción y confiar en el 403 real
   * de la API en vez de ocultarla a ciegas.
   */
  isAdmin: boolean | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const token = getStaffToken()
    if (!token) {
      setIsLoadingSession(false)
      return
    }

    fetchCurrentStaff()
      .then(setUser)
      .catch(() => {
        // Token inválido/expirado: el interceptor ya lo limpió de localStorage.
        setUser(null)
      })
      .finally(() => setIsLoadingSession(false))
  }, [])

  const login = useCallback(async (payload: StaffLoginPayload) => {
    setIsLoggingIn(true)
    try {
      const response = await loginStaff(payload)
      setStaffToken(response.token)
      setUser(response.data)
    } finally {
      setIsLoggingIn(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutStaff()
    } catch {
      // Si la API no responde (ej. sesión ya expirada), igual cerramos localmente.
    } finally {
      clearStaffToken()
      setUser(null)
    }
  }, [])

  const roles = useMemo(() => user?.roles ?? [], [user])
  const rolesKnown = roles.length > 0
  const hasRole = useCallback((...names: StaffRole[]) => roles.some((role) => names.includes(role)), [roles])
  const isAdmin = rolesKnown ? roles.includes('admin') : null

  return (
    <AuthContext.Provider
      value={{ user, isLoadingSession, isLoggingIn, login, logout, roles, rolesKnown, hasRole, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

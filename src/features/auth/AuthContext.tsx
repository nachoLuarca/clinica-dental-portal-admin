import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { clearStaffToken, getStaffToken, setStaffToken } from '@/lib/api-client'
import { fetchCurrentStaff, loginStaff, logoutStaff } from './api'
import type { StaffLoginPayload, StaffUser } from './types'

interface AuthContextValue {
  /** Usuario staff autenticado, o null si no hay sesión. */
  user: StaffUser | null
  /** true mientras se resuelve la sesión inicial (lectura de /staff/me). */
  isLoadingSession: boolean
  /** true mientras se procesa un login en curso. */
  isLoggingIn: boolean
  login: (payload: StaffLoginPayload) => Promise<void>
  logout: () => Promise<void>
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

  return (
    <AuthContext.Provider value={{ user, isLoadingSession, isLoggingIn, login, logout }}>
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

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearStaffToken, getStaffToken, setStaffToken } from '@/lib/api-client'
import { fetchCurrentStaff, loginStaff, logoutStaff } from './api'
import type { StaffLoginPayload, StaffRole, StaffUser } from './types'
import { AuthContext } from './context'

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

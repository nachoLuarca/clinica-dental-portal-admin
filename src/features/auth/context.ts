import { createContext } from 'react'
import type { StaffLoginPayload, StaffRole, StaffUser } from './types'

export interface AuthContextValue {
  /** Usuario staff autenticado, o null si no hay sesión. */
  user: StaffUser | null
  /** true mientras se resuelve la sesión inicial (lectura de /staff/me). */
  isLoadingSession: boolean
  /** true mientras se procesa un login en curso. */
  isLoggingIn: boolean
  login: (payload: StaffLoginPayload) => Promise<void>
  logout: () => Promise<void>
  /**
   * Roles del usuario actual, informados por la API (`GET /api/staff/me` y
   * `POST /api/staff/login` ya incluyen `roles: string[]` desde el commit
   * `635f538` de `clinica-dental-api`).
   */
  roles: StaffRole[]
  /** true solo si la API efectivamente informó el/los rol(es) del usuario. */
  rolesKnown: boolean
  hasRole: (...roles: StaffRole[]) => boolean
  /**
   * `true` si sabemos que es admin, `false` si sabemos que NO lo es, y
   * `null` si no hay información de rol disponible (ej. mientras se resuelve
   * la sesión). La UI debe usar `isAdmin` de forma proactiva para
   * ocultar/proteger módulos exclusivos de admin, no solo reaccionar a 403.
   */
  isAdmin: boolean | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

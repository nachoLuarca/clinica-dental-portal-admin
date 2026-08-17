import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LogOut,
  Palette,
  ShieldCheck,
  Stethoscope,
  Users,
  UserCog,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/shared/BrandMark'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'

const NAV_ITEMS = [
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/profesionales', label: 'Profesionales', icon: Stethoscope },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/tratamientos', label: 'Tratamientos', icon: ClipboardList },
  { to: '/presupuestos', label: 'Presupuestos', icon: FileText },
  { to: '/marca', label: 'Marca', icon: Palette },
]

/** Solo visible para admin: gestión de usuarios y roles del staff. */
const ADMIN_NAV_ITEMS = [
  { to: '/usuarios', label: 'Usuarios', icon: UserCog },
  { to: '/roles', label: 'Roles', icon: ShieldCheck },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada.')
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105">
              <BrandMark className="size-5" />
            </span>
            <span className="font-semibold tracking-tight">Portal Clínica Dental</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div
          key={location.pathname}
          className="duration-300 animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
        >
          {children}
        </div>
      </main>
    </div>
  )
}

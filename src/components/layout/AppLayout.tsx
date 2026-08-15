import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { CalendarDays, ClipboardList, FileText, LogOut, Stethoscope, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'

const NAV_ITEMS = [
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/profesionales', label: 'Profesionales', icon: Stethoscope },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/tratamientos', label: 'Tratamientos', icon: ClipboardList },
  { to: '/presupuestos', label: 'Presupuestos', icon: FileText },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada.')
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Stethoscope className="size-5" strokeWidth={1.75} />
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
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">{children}</main>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, FileText, Stethoscope, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'
import type { PageAccent } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils'

const ACCENT_CLASSES: Record<PageAccent, string> = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
}

const SECTIONS: { to: string; title: string; description: string; icon: typeof CalendarDays; accent: PageAccent }[] = [
  {
    to: '/agenda',
    title: 'Agenda',
    description: 'Revisa, agenda y cancela citas de la clínica.',
    icon: CalendarDays,
    accent: 'cyan',
  },
  {
    to: '/profesionales',
    title: 'Profesionales',
    description: 'Administra el equipo clínico de tu clínica.',
    icon: Stethoscope,
    accent: 'blue',
  },
  {
    to: '/pacientes',
    title: 'Pacientes',
    description: 'Gestiona fichas de pacientes y sus diagnósticos.',
    icon: Users,
    accent: 'emerald',
  },
  {
    to: '/tratamientos',
    title: 'Tratamientos',
    description: 'Catálogo de tratamientos y atenciones diferenciales.',
    icon: ClipboardList,
    accent: 'violet',
  },
  {
    to: '/presupuestos',
    title: 'Presupuestos',
    description: 'Genera y revisa presupuestos de tratamientos.',
    icon: FileText,
    accent: 'amber',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <div className="duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
        <h1 className="text-xl font-semibold tracking-tight">Bienvenido/a, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">Elige un módulo para comenzar a trabajar.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map(({ to, title, description, icon: Icon, accent }, index) => (
          <Link
            key={to}
            to={to}
            className="duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110',
                    ACCENT_CLASSES[accent],
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <CardTitle className="pt-2">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

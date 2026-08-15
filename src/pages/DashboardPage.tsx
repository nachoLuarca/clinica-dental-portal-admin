import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, FileText, Stethoscope, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'

const SECTIONS = [
  {
    to: '/agenda',
    title: 'Agenda',
    description: 'Revisa, agenda y cancela citas de la clínica.',
    icon: CalendarDays,
  },
  {
    to: '/profesionales',
    title: 'Profesionales',
    description: 'Administra el equipo clínico de tu clínica.',
    icon: Stethoscope,
  },
  {
    to: '/pacientes',
    title: 'Pacientes',
    description: 'Gestiona fichas de pacientes y sus diagnósticos.',
    icon: Users,
  },
  {
    to: '/tratamientos',
    title: 'Tratamientos',
    description: 'Catálogo de tratamientos y atenciones diferenciales.',
    icon: ClipboardList,
  },
  {
    to: '/presupuestos',
    title: 'Presupuestos',
    description: 'Genera y revisa presupuestos de tratamientos.',
    icon: FileText,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Bienvenido/a, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">Elige un módulo para comenzar a trabajar.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map(({ to, title, description, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

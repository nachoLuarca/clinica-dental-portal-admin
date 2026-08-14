import { LogOut, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada.')
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-6 text-primary" strokeWidth={1.75} />
          <span className="font-semibold">Portal Clínica Dental</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Bienvenido/a, {user?.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sesión de staff activa. Los próximos módulos (profesionales,
            pacientes, agenda) se construyen a partir de esta base.
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

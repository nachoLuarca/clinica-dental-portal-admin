import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AdminRoute } from '@/features/auth/AdminRoute'
import { syncPendingPatients } from '@/features/patients/offline-queue'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfessionalsPage from '@/features/professionals/ProfessionalsPage'
import EspecialidadesPage from '@/features/especialidades/EspecialidadesPage'
import PatientsPage from '@/features/patients/PatientsPage'
import PatientDetailPage from '@/features/patients/PatientDetailPage'
import TreatmentsPage from '@/features/treatments/TreatmentsPage'
import BudgetsPage from '@/features/budgets/BudgetsPage'
import AppointmentsPage from '@/features/appointments/AppointmentsPage'
import SucursalesPage from '@/features/sucursales/SucursalesPage'
import ConveniosPage from '@/features/convenios/ConveniosPage'
import BrandingPage from '@/features/branding/BrandingPage'
import UsersPage from '@/features/users/UsersPage'
import RolesPage from '@/features/roles/RolesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function Protected({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <AdminRoute>{children}</AdminRoute>
      </AppLayout>
    </ProtectedRoute>
  )
}

/**
 * Dispara la sincronización de la cola offline de pacientes/diagnóstico al
 * recuperar conexión, y también al montar la app si ya hay conexión (por
 * si quedaron registros pendientes de una sesión anterior).
 */
function OfflineSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    syncPendingPatients(queryClient)

    function handleOnline() {
      syncPendingPatients(queryClient)
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [queryClient])

  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineSync />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <Protected>
                  <DashboardPage />
                </Protected>
              }
            />
            <Route
              path="/profesionales"
              element={
                <Protected>
                  <ProfessionalsPage />
                </Protected>
              }
            />
            <Route
              path="/especialidades"
              element={
                <Protected>
                  <EspecialidadesPage />
                </Protected>
              }
            />
            <Route
              path="/pacientes"
              element={
                <Protected>
                  <PatientsPage />
                </Protected>
              }
            />
            <Route
              path="/pacientes/:id"
              element={
                <Protected>
                  <PatientDetailPage />
                </Protected>
              }
            />
            <Route
              path="/tratamientos"
              element={
                <Protected>
                  <TreatmentsPage />
                </Protected>
              }
            />
            <Route
              path="/presupuestos"
              element={
                <Protected>
                  <BudgetsPage />
                </Protected>
              }
            />
            <Route
              path="/agenda"
              element={
                <Protected>
                  <AppointmentsPage />
                </Protected>
              }
            />
            <Route
              path="/sucursales"
              element={
                <Protected>
                  <SucursalesPage />
                </Protected>
              }
            />
            <Route
              path="/convenios"
              element={
                <Protected>
                  <ConveniosPage />
                </Protected>
              }
            />
            <Route
              path="/marca"
              element={
                <Protected>
                  <BrandingPage />
                </Protected>
              }
            />
            <Route
              path="/usuarios"
              element={
                <AdminOnly>
                  <UsersPage />
                </AdminOnly>
              }
            />
            <Route
              path="/roles"
              element={
                <AdminOnly>
                  <RolesPage />
                </AdminOnly>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}

export default App

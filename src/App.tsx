import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfessionalsPage from '@/features/professionals/ProfessionalsPage'
import PatientsPage from '@/features/patients/PatientsPage'
import PatientDetailPage from '@/features/patients/PatientDetailPage'
import TreatmentsPage from '@/features/treatments/TreatmentsPage'
import BudgetsPage from '@/features/budgets/BudgetsPage'
import AppointmentsPage from '@/features/appointments/AppointmentsPage'
import BrandingPage from '@/features/branding/BrandingPage'

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
              path="/marca"
              element={
                <Protected>
                  <BrandingPage />
                </Protected>
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

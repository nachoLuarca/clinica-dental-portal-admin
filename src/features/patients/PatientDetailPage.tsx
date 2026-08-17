import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { getApiErrorMessage, isForbiddenError } from '@/lib/api-error'
import { useDeleteDiagnosis, usePatient } from './hooks'
import { DiagnosisFormDialog } from './DiagnosisFormDialog'
import { PatientFormDialog } from './PatientFormDialog'
import type { Diagnosis } from './types'

const dateFormatter = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' })

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const patientId = Number(id)
  const navigate = useNavigate()

  const { data: patient, isLoading, isError, error } = usePatient(patientId)
  const deleteDiagnosisMutation = useDeleteDiagnosis(patientId)

  const [patientFormOpen, setPatientFormOpen] = useState(false)
  const [diagnosisFormOpen, setDiagnosisFormOpen] = useState(false)
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null)
  const [deletingDiagnosis, setDeletingDiagnosis] = useState<Diagnosis | null>(null)
  // Se confirma con un 403 real (rol sin permiso de diagnósticos, ej.
  // recepción): a partir de ahí se dejan de ofrecer las acciones por el
  // resto de la sesión, en vez de asumir el rol de antemano.
  const [diagnosesForbidden, setDiagnosesForbidden] = useState(false)

  function openCreateDiagnosis() {
    setEditingDiagnosis(null)
    setDiagnosisFormOpen(true)
  }

  function openEditDiagnosis(diagnosis: Diagnosis) {
    setEditingDiagnosis(diagnosis)
    setDiagnosisFormOpen(true)
  }

  async function confirmDeleteDiagnosis() {
    if (!deletingDiagnosis) return
    try {
      await deleteDiagnosisMutation.mutateAsync(deletingDiagnosis.id)
      toast.success('Diagnóstico eliminado.')
      setDeletingDiagnosis(null)
    } catch (err) {
      if (isForbiddenError(err)) setDiagnosesForbidden(true)
      toast.error(getApiErrorMessage(err, 'No se pudo eliminar el diagnóstico.'))
    }
  }

  if (Number.isNaN(patientId)) {
    return <Navigate to="/pacientes" replace />
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => navigate('/pacientes')}>
        <ArrowLeft className="size-4" />
        Volver a pacientes
      </Button>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, 'No se pudo cargar el paciente.')}
        </p>
      )}

      {patient && (
        <>
          <Card className="duration-300 animate-in fade-in slide-in-from-bottom-1 fill-mode-both">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{patient.nombre}</CardTitle>
                <p className="text-sm text-muted-foreground">{patient.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPatientFormOpen(true)}>
                <Pencil className="size-4" />
                Editar
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Fecha de nacimiento</p>
                <p>{dateFormatter.format(new Date(patient.fecha_nacimiento))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Teléfono</p>
                <p>{patient.telefono ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Notas</p>
                <p>{patient.notas ?? '—'}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Diagnósticos</h2>
            {!diagnosesForbidden && (
              <Button size="sm" onClick={openCreateDiagnosis}>
                <Plus className="size-4" />
                Nuevo diagnóstico
              </Button>
            )}
          </div>

          {diagnosesForbidden && (
            <div className="flex items-center gap-2 rounded-md border border-muted bg-muted/50 px-3 py-2 text-sm text-muted-foreground duration-300 animate-in fade-in fill-mode-both">
              <Lock className="size-4 shrink-0" />
              Tu usuario no tiene permisos para gestionar diagnósticos.
            </div>
          )}

          {(!patient.diagnoses || patient.diagnoses.length === 0) && (
            <EmptyState icon={Stethoscope} message="Este paciente aún no tiene diagnósticos registrados." />
          )}

          <div className="flex flex-col gap-3">
            {patient.diagnoses?.map((diagnosis, index) => (
              <Card
                key={diagnosis.id}
                className="duration-300 animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
              >
                <CardContent className="flex flex-col gap-2 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{dateFormatter.format(new Date(diagnosis.fecha))}</p>
                      <p className="font-medium">{diagnosis.descripcion}</p>
                    </div>
                    {!diagnosesForbidden && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDiagnosis(diagnosis)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeletingDiagnosis(diagnosis)}>
                          <Trash2 className="size-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  {diagnosis.notas && <p className="text-sm text-muted-foreground">{diagnosis.notas}</p>}
                  {diagnosis.professional && (
                    <p className="text-xs text-muted-foreground">
                      Profesional: {diagnosis.professional.nombre} {diagnosis.professional.apellido}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <PatientFormDialog open={patientFormOpen} onOpenChange={setPatientFormOpen} patient={patient} />

          <DiagnosisFormDialog
            open={diagnosisFormOpen}
            onOpenChange={setDiagnosisFormOpen}
            patientId={patientId}
            diagnosis={editingDiagnosis}
            onForbidden={() => setDiagnosesForbidden(true)}
          />

          <ConfirmDeleteDialog
            open={!!deletingDiagnosis}
            onOpenChange={(open) => !open && setDeletingDiagnosis(null)}
            title="Eliminar diagnóstico"
            description="¿Seguro que deseas eliminar este diagnóstico? Esta acción no se puede deshacer."
            isDeleting={deleteDiagnosisMutation.isPending}
            onConfirm={confirmDeleteDiagnosis}
          />
        </>
      )}
    </div>
  )
}

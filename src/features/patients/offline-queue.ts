import type { QueryClient } from '@tanstack/react-query'
import { dbDelete, dbGetAll, dbPut } from '@/lib/offline-db'
import { getApiErrorMessage } from '@/lib/api-error'
import { createDiagnosis, createPatient } from './api'
import type { DiagnosisPayload, PatientPayload } from './types'

const STORE = 'pending-patients'

export interface PendingPatient {
  id: string
  patientPayload: PatientPayload
  diagnosisPayload?: DiagnosisPayload
  createdAt: string
  status: 'pending' | 'syncing' | 'error'
  errorMessage?: string
}

/**
 * Cola offline (IndexedDB) para el registro de pacientes + diagnóstico.
 * Solo este flujo se encola sin conexión: confirmar/cancelar citas se
 * bloquea directamente en la UI porque depende de validación en tiempo
 * real contra la API (ver `useOnlineStatus`).
 */

type Listener = () => void
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function subscribeToQueue(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function getPendingPatients(): Promise<PendingPatient[]> {
  const items = await dbGetAll<PendingPatient>(STORE)
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function generateId(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function enqueuePatient(
  patientPayload: PatientPayload,
  diagnosisPayload?: DiagnosisPayload,
): Promise<PendingPatient> {
  const item: PendingPatient = {
    id: generateId(),
    patientPayload,
    diagnosisPayload,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
  await dbPut(STORE, item)
  notify()
  return item
}

export async function removePendingPatient(id: string): Promise<void> {
  await dbDelete(STORE, id)
  notify()
}

async function markStatus(item: PendingPatient, status: PendingPatient['status'], errorMessage?: string) {
  const updated: PendingPatient = { ...item, status, errorMessage }
  await dbPut(STORE, updated)
  notify()
}

let syncing = false

/**
 * Recorre la cola y trata de sincronizar cada registro pendiente contra la
 * API real. Se invoca al reconectar (`online` event) y opcionalmente al
 * iniciar la app si ya hay conexión.
 */
export async function syncPendingPatients(queryClient: QueryClient): Promise<void> {
  if (syncing) return
  if (!navigator.onLine) return

  syncing = true
  try {
    const items = await getPendingPatients()
    let syncedAny = false

    for (const item of items) {
      if (item.status === 'syncing') continue
      if (!navigator.onLine) break

      await markStatus(item, 'syncing')
      try {
        const patient = await createPatient(item.patientPayload)
        if (item.diagnosisPayload) {
          await createDiagnosis(patient.id, item.diagnosisPayload)
        }
        await removePendingPatient(item.id)
        syncedAny = true
      } catch (error) {
        await markStatus(item, 'error', getApiErrorMessage(error, 'No se pudo sincronizar este registro.'))
      }
    }

    if (syncedAny) {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    }
  } finally {
    syncing = false
  }
}

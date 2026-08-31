import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { QueryClient } from '@tanstack/react-query'
import { dbDelete, dbGetAll } from '@/lib/offline-db'
import type { Patient, PatientPayload } from './types'

const { createPatient, createDiagnosis } = vi.hoisted(() => ({
  createPatient: vi.fn(),
  createDiagnosis: vi.fn(),
}))

vi.mock('./api', () => ({ createPatient, createDiagnosis }))

const { enqueuePatient, getPendingPatients, removePendingPatient, subscribeToQueue, syncPendingPatients } =
  await import('./offline-queue')

const STORE = 'pending-patients'

const patientPayload: PatientPayload = {
  nombre: 'Ana',
  rut: '11.111.111-1',
  email: 'ana@example.com',
  fecha_nacimiento: '1990-01-01',
}

function fakeQueryClient(): QueryClient {
  return { invalidateQueries: vi.fn() } as unknown as QueryClient
}

describe('offline-queue', () => {
  beforeEach(async () => {
    const items = await dbGetAll<{ id: string }>(STORE)
    await Promise.all(items.map((item) => dbDelete(STORE, item.id)))
    createPatient.mockReset()
    createDiagnosis.mockReset()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('encola un paciente y lo devuelve en estado pending', async () => {
    const item = await enqueuePatient(patientPayload)
    expect(item.status).toBe('pending')
    expect(await getPendingPatients()).toHaveLength(1)
  })

  it('notifica a los suscriptores al encolar y al remover', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToQueue(listener)

    const item = await enqueuePatient(patientPayload)
    expect(listener).toHaveBeenCalledTimes(1)

    await removePendingPatient(item.id)
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
  })

  it('sincroniza un registro pendiente exitosamente y lo quita de la cola', async () => {
    createPatient.mockResolvedValue({ id: 1 } as Patient)
    await enqueuePatient(patientPayload)

    const queryClient = fakeQueryClient()
    await syncPendingPatients(queryClient)

    expect(createPatient).toHaveBeenCalledWith(patientPayload)
    expect(createDiagnosis).not.toHaveBeenCalled()
    expect(await getPendingPatients()).toHaveLength(0)
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['patients'] })
  })

  it('deja el registro marcado como error si la sincronización falla', async () => {
    createPatient.mockRejectedValue(new Error('falló la red'))
    await enqueuePatient(patientPayload)

    await syncPendingPatients(fakeQueryClient())

    const pending = await getPendingPatients()
    expect(pending).toHaveLength(1)
    expect(pending[0].status).toBe('error')
  })

  it('no sincroniza si el navegador está offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    await enqueuePatient(patientPayload)

    await syncPendingPatients(fakeQueryClient())

    expect(createPatient).not.toHaveBeenCalled()
    expect(await getPendingPatients()).toHaveLength(1)
  })
})

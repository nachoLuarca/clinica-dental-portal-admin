import { beforeEach, describe, expect, it } from 'vitest'
import { dbDelete, dbGetAll, dbPut } from './offline-db'

const STORE = 'pending-patients'

describe('offline-db', () => {
  beforeEach(async () => {
    const items = await dbGetAll<{ id: string }>(STORE)
    await Promise.all(items.map((item) => dbDelete(STORE, item.id)))
  })

  it('empieza vacío', async () => {
    expect(await dbGetAll(STORE)).toEqual([])
  })

  it('guarda y devuelve un registro con dbPut/dbGetAll', async () => {
    await dbPut(STORE, { id: 'a', valor: 1 })
    expect(await dbGetAll(STORE)).toEqual([{ id: 'a', valor: 1 }])
  })

  it('sobrescribe un registro existente con la misma key', async () => {
    await dbPut(STORE, { id: 'a', valor: 1 })
    await dbPut(STORE, { id: 'a', valor: 2 })
    expect(await dbGetAll(STORE)).toEqual([{ id: 'a', valor: 2 }])
  })

  it('elimina un registro con dbDelete', async () => {
    await dbPut(STORE, { id: 'a', valor: 1 })
    await dbDelete(STORE, 'a')
    expect(await dbGetAll(STORE)).toEqual([])
  })
})

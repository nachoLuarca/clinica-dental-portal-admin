import { describe, expect, it } from 'vitest'
import { formatTelefono } from './phone'

describe('formatTelefono', () => {
  it('formatea un teléfono chileno en E.164', () => {
    expect(formatTelefono('+56912345678')).toBe('+56 9 1234 5678')
  })

  it('devuelve un guion largo cuando el teléfono es null', () => {
    expect(formatTelefono(null)).toBe('—')
  })

  it('devuelve el valor tal cual si no matchea el patrón esperado', () => {
    expect(formatTelefono('123456')).toBe('123456')
    expect(formatTelefono('+541112345678')).toBe('+541112345678')
  })
})

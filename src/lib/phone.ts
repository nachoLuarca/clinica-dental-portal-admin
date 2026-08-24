/**
 * Formatea un teléfono chileno en E.164 (`+56912345678`) a un formato
 * legible (`+56 9 1234 5678`). El backend no valida ningún formato de
 * teléfono, así que esto es solo cosmético: si no matchea el patrón
 * esperado, se devuelve el valor tal cual llegó.
 */
export function formatTelefono(telefono: string | null): string {
  if (!telefono) return '—'

  const match = telefono.match(/^\+56(\d)(\d{4})(\d{4})$/)
  if (!match) return telefono

  const [, primerDigito, bloque1, bloque2] = match
  return `+56 ${primerDigito} ${bloque1} ${bloque2}`
}

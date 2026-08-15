import { useEffect, useState } from 'react'

/**
 * Estado de conexión del navegador. Se usa para bloquear acciones que
 * dependen de validación en tiempo real contra la API (confirmar/cancelar
 * citas, reservar horas) — no se pueden encolar sin conexión porque
 * romperían la protección contra choques de reserva.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

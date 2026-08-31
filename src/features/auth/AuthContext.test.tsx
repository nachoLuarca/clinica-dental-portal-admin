import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StaffAuthResponse, StaffUser } from './types'

const { loginStaff, fetchCurrentStaff, logoutStaff } = vi.hoisted(() => ({
  loginStaff: vi.fn(),
  fetchCurrentStaff: vi.fn(),
  logoutStaff: vi.fn(),
}))

vi.mock('./api', () => ({ loginStaff, fetchCurrentStaff, logoutStaff }))

const { AuthProvider, useAuth } = await import('./AuthContext')

const staffUser: StaffUser = {
  id: 1,
  tenant_id: 1,
  name: 'Ana Staff',
  email: 'ana@clinica.cl',
  email_verified_at: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  roles: ['recepcion'],
}

function Probe() {
  const { user, isLoadingSession, isAdmin, login, logout, hasRole } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(isLoadingSession)}</span>
      <span data-testid="user">{user?.name ?? 'sin sesión'}</span>
      <span data-testid="is-admin">{String(isAdmin)}</span>
      <span data-testid="has-recepcion">{String(hasRole('recepcion'))}</span>
      <button onClick={() => login({ clinica: 'demo', email: staffUser.email, password: '123456' })}>
        Ingresar
      </button>
      <button onClick={() => logout()}>Salir</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    loginStaff.mockReset()
    fetchCurrentStaff.mockReset()
    logoutStaff.mockReset()
  })

  it('arranca sin sesión cuando no hay token guardado', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('sin sesión')
    expect(fetchCurrentStaff).not.toHaveBeenCalled()
  })

  it('resuelve la sesión desde /staff/me si hay un token guardado', async () => {
    localStorage.setItem('staff_token', 'un-token')
    fetchCurrentStaff.mockResolvedValue(staffUser)

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ana Staff'))
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false')
    expect(screen.getByTestId('has-recepcion')).toHaveTextContent('true')
  })

  it('cierra la sesión localmente aunque falle la llamada a /staff/logout', async () => {
    localStorage.setItem('staff_token', 'un-token')
    fetchCurrentStaff.mockResolvedValue(staffUser)
    logoutStaff.mockRejectedValue(new Error('sesión ya expirada'))

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ana Staff'))

    const user = userEvent.setup()
    await act(() => user.click(screen.getByText('Salir')))

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('sin sesión'))
    expect(localStorage.getItem('staff_token')).toBeNull()
  })

  it('login guarda el token y el usuario devuelto por la API', async () => {
    loginStaff.mockResolvedValue({
      token: 'nuevo-token',
      token_type: 'Bearer',
      data: staffUser,
    } satisfies StaffAuthResponse)

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    const user = userEvent.setup()
    await act(() => user.click(screen.getByText('Ingresar')))

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ana Staff'))
    expect(localStorage.getItem('staff_token')).toBe('nuevo-token')
  })
})

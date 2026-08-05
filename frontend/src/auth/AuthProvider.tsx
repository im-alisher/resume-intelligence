import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { apiRequest } from '../lib/api'
import {
  AuthContext,
  type Credentials,
  type Registration,
  type User,
} from './auth-context'

const TOKEN_KEY = 'resume-intelligence-access-token'

interface AuthResponse {
  accessToken: string
  user: User
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))

  const saveSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    setToken(response.accessToken)
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    apiRequest<User>('/auth/me', {}, token)
      .then(setUser)
      .catch(logout)
      .finally(() => setIsLoading(false))
  }, [logout, token])

  const login = useCallback(
    async (credentials: Credentials) => {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      saveSession(response)
    },
    [saveSession],
  )

  const register = useCallback(
    async (details: Registration) => {
      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(details),
      })
      saveSession(response)
    },
    [saveSession],
  )

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [isLoading, login, logout, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

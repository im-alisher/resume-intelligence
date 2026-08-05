import { createContext, useContext } from 'react'

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: string
}

export interface Credentials {
  email: string
  password: string
}

export interface Registration extends Credentials {
  firstName?: string
  lastName?: string
}

export interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (credentials: Credentials) => Promise<void>
  register: (details: Registration) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

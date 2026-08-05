import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { ApiError } from '../lib/api'

interface AuthPageProps {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isRegister = mode === 'register'

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const data = new FormData(event.currentTarget)

    try {
      const credentials = {
        email: String(data.get('email')),
        password: String(data.get('password')),
      }
      if (isRegister) {
        await register({
          ...credentials,
          firstName: String(data.get('firstName')),
          lastName: String(data.get('lastName')),
        })
      } else {
        await login(credentials)
      }
      const destination = (location.state as { from?: string } | null)?.from
      navigate(destination ?? '/dashboard', { replace: true })
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : 'Unable to connect to the server',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <Link to="/" className="text-sm font-semibold text-cyan-300">
          ← Resume Intelligence
        </Link>
        <h1 className="mt-6 text-3xl font-bold">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-slate-400">
          {isRegister
            ? 'Start building resumes tailored to your goals.'
            : 'Sign in to continue building your resume.'}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" name="firstName" autoComplete="given-name" />
              <Field label="Last name" name="lastName" autoComplete="family-name" />
            </div>
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={8}
            required
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Please wait…'
              : isRegister
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? 'Already have an account?' : 'New to Resume Intelligence?'}{' '}
          <Link
            to={isRegister ? '/login' : '/register'}
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  )
}

interface FieldProps {
  label: string
  name: string
  type?: string
  autoComplete?: string
  minLength?: number
  required?: boolean
}

function Field({ label, ...inputProps }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <input
        {...inputProps}
        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />
    </label>
  )
}

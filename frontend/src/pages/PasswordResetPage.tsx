import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, apiRequest } from '../lib/api'

interface PasswordResetPageProps {
  mode: 'request' | 'reset'
}

export function PasswordResetPage({ mode }: PasswordResetPageProps) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isReset = mode === 'reset'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setError(null)
    setMessage(null)
    const data = new FormData(form)
    const password = String(data.get('password') ?? '')
    const confirmation = String(data.get('confirmation') ?? '')

    if (isReset && password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiRequest<{ message: string }>(
        isReset ? '/auth/reset-password' : '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify(
            isReset
              ? { token, password }
              : { email: String(data.get('email') ?? '') },
          ),
        },
      )
      setMessage(response.message)
      form.reset()
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

  if (isReset && !token) {
    return (
      <ResetShell>
        <StatusMessage type="error">This reset link is missing its secure token.</StatusMessage>
        <Link to="/forgot-password" className="mt-5 inline-flex font-semibold text-cyan-300 hover:text-cyan-200">Request a new link</Link>
      </ResetShell>
    )
  }

  return (
    <ResetShell>
      <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300">
        Secure account recovery
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {isReset ? 'Choose a new password' : 'Forgot your password?'}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {isReset
          ? 'Use at least 8 characters. Your reset link can only be used once.'
          : 'Enter your account email and we will send you a password reset link.'}
      </p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        {isReset ? (
          <>
            <ResetField label="New password" name="password" type="password" autoComplete="new-password" minLength={8} />
            <ResetField label="Confirm new password" name="confirmation" type="password" autoComplete="new-password" minLength={8} />
          </>
        ) : (
          <ResetField label="Email address" name="email" type="email" autoComplete="email" />
        )}

        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {message && <StatusMessage type="success">{message}</StatusMessage>}

        <button type="submit" disabled={isSubmitting || Boolean(message && isReset)} className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Please wait...' : isReset ? 'Reset password' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {isReset && message ? 'Your new password is ready. ' : 'Remembered your password? '}
        <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Sign in</Link>
      </p>
    </ResetShell>
  )
}

function ResetShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050816] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(34,211,238,0.12),transparent_42%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/[0.09] bg-slate-900/75 p-7 shadow-2xl shadow-black/30 backdrop-blur sm:p-9">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><span aria-hidden="true">←</span> Resume Intelligence</Link>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  )
}

function ResetField({ label, ...props }: { label: string; name: string; type: string; autoComplete: string; minLength?: number }) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <input {...props} required className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15" />
    </label>
  )
}

function StatusMessage({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  return <p role={type === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${type === 'error' ? 'border-red-400/15 bg-red-400/10 text-red-300' : 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300'}`}>{children}</p>
}

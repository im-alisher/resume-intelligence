import { useAuth } from '../auth/auth-context'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const displayName = user?.firstName || user?.email

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <p className="font-semibold text-cyan-300">Resume Intelligence</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {displayName}</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-900"
          >
            Sign out
          </button>
        </header>
        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-xl font-semibold">Your resumes</h2>
          <p className="mt-3 text-slate-400">
            Your account is ready. Resume creation arrives in Phase 5.
          </p>
        </section>
      </div>
    </main>
  )
}

import { Link, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/auth-context'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'

function HomePage() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="font-bold text-cyan-300">Resume Intelligence</span>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-900">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white">
                Sign in
              </Link>
              <Link to="/register" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="mx-auto flex max-w-5xl flex-col items-center py-24 text-center">
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
          AI-powered career tools
        </span>
        <h1 className="mt-8 max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">
          Build a resume that gets noticed.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Resume Intelligence helps you analyze, improve, and create a professional resume tailored to your next opportunity.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button disabled title="Available in Phase 4" className="cursor-not-allowed rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 opacity-60">
            Analyze your resume
          </button>
          <Link to="/dashboard" className="rounded-lg border border-slate-700 px-6 py-3 font-semibold transition hover:border-slate-500 hover:bg-slate-900">
            Build a resume
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

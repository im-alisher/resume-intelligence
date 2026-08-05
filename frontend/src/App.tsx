import { Route, Routes } from 'react-router-dom'

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
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
          <button className="rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Analyze your resume
          </button>
          <button className="rounded-lg border border-slate-700 px-6 py-3 font-semibold transition hover:border-slate-500 hover:bg-slate-900">
            Build a resume
          </button>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}

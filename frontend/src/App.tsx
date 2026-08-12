import { Link, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/auth-context'
import { AuthPage } from './pages/AuthPage'
import { AnalyzerPage } from './pages/AnalyzerPage'
import { DashboardPage } from './pages/DashboardPage'
import { ResumeBuilderPage } from './pages/ResumeBuilderPage'

function HomePage() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.13),transparent_58%)]" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3 font-bold text-white">
          <span className="grid size-9 place-items-center rounded-xl bg-cyan-400 text-xs text-slate-950 shadow-lg shadow-cyan-400/20">RI</span>
          <span className="hidden sm:inline">Resume Intelligence</span>
          <span className="sm:hidden">Resume AI</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          {user ? (
            <Link to="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                Sign in
              </Link>
              <Link to="/register" className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-16 text-center sm:px-8 sm:pb-28 sm:pt-24">
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">AI-powered career tools</span>
        <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">Build a resume that <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">gets noticed.</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">Analyze your current resume, uncover ATS gaps, improve your writing, and build a polished resume for your next opportunity.</p>
        <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link to="/analyze" className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5">Analyze your resume <span aria-hidden="true">→</span></Link>
          <Link to="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-semibold transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Build a resume</Link>
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500"><span>✓ No account needed to analyze</span><span>✓ Private PDF processing</span><span>✓ Actionable AI feedback</span></div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.02] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Everything in one place" title="From first draft to application-ready" description="Use focused AI tools at every stage without switching between different platforms." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {homeFeatures.map((feature) => (
              <article key={feature.title} className="group rounded-2xl border border-white/[0.08] bg-slate-900/55 p-6 transition hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-slate-900/80">
                <span className={`grid size-11 place-items-center rounded-xl text-lg ${feature.style}`} aria-hidden="true">{feature.icon}</span>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Simple workflow" title="A stronger resume in three steps" description="Start with what you already have, understand what needs work, and turn the feedback into a polished document." />
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            <div className="absolute left-[17%] right-[17%] top-7 hidden h-px bg-gradient-to-r from-cyan-400/10 via-cyan-400/50 to-cyan-400/10 md:block" />
            {homeSteps.map((item, index) => (
              <article key={item.title} className="relative rounded-2xl border border-white/[0.07] bg-slate-900/45 p-6 text-center">
                <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-cyan-400/25 bg-[#0b1020] text-sm font-bold text-cyan-300 shadow-lg shadow-cyan-950/30">0{index + 1}</span>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-slate-900/80 to-blue-500/10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Built for real applications</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Turn generic content into a clear career story.</h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-400">Resume Intelligence combines structured resume data with focused AI suggestions. You stay in control—review every recommendation before anything is saved.</p>
            <Link to="/dashboard" className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-100">Start building free <span className="ml-2" aria-hidden="true">→</span></Link>
          </div>
          <div className="grid gap-3 border-t border-white/[0.07] bg-slate-950/30 p-7 sm:grid-cols-2 sm:p-10 lg:border-l lg:border-t-0">
            {homeBenefits.map((benefit) => <div key={benefit} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm leading-6 text-slate-300"><span className="mt-1 text-cyan-300">✓</span>{benefit}</div>)}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] px-5 py-16 text-center sm:px-8 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to improve your next application?</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">Get useful feedback in minutes, or build a professional resume from scratch.</p>
        <div className="mx-auto mt-7 flex max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
          <Link to="/analyze" className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-300">Analyze for free</Link>
          <Link to={user ? '/dashboard' : '/register'} className="rounded-xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/5">{user ? 'Open dashboard' : 'Create an account'}</Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-6 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-slate-600 sm:flex-row"><span>Resume Intelligence</span><span>AI-assisted tools for stronger resumes.</span></div></footer>
    </main>
  )
}

const homeFeatures = [
  { icon: '◎', title: 'ATS analysis', description: 'Measure ATS readiness, identify formatting risks, and understand keyword alignment.', style: 'bg-cyan-400/10 text-cyan-300' },
  { icon: '⌕', title: 'Skill-gap insights', description: 'Compare your resume with a target role and discover important missing capabilities.', style: 'bg-violet-400/10 text-violet-300' },
  { icon: '✦', title: 'AI improvements', description: 'Rewrite summaries, experience bullets, skills, and project descriptions with control.', style: 'bg-amber-400/10 text-amber-300' },
  { icon: '↓', title: 'PDF export', description: 'Build, preview, save, and download a clean professional resume whenever you are ready.', style: 'bg-emerald-400/10 text-emerald-300' },
]

const homeSteps = [
  { title: 'Upload or create', description: 'Analyze an existing PDF without signing up, or create a structured resume in the builder.' },
  { title: 'Review the insights', description: 'Understand your scores, strengths, skill gaps, and the changes most likely to help.' },
  { title: 'Improve and export', description: 'Apply the suggestions you choose, preview the result, and download your final PDF.' },
]

const homeBenefits = ['Private in-memory PDF processing', 'Real-time resume preview', 'Suggestions never auto-save', 'Secure account-based resume storage']

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2><p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{description}</p></div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/analyze" element={<AnalyzerPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resumes/:resumeId" element={<ResumeBuilderPage />} />
      </Route>
    </Routes>
  )
}

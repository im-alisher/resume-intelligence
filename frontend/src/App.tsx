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
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#050816]/80 backdrop-blur-xl">
        <nav className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8" aria-label="Main navigation">
          <Link to="/" className="group flex shrink-0 items-center gap-3 text-white">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-cyan-500 text-xs font-black text-slate-950 shadow-lg shadow-cyan-400/20 transition group-hover:scale-105">RI</span>
            <span>
              <span className="block text-sm font-bold leading-tight sm:text-base">Resume Intelligence</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/70 sm:block">AI career toolkit</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.035] p-1 lg:flex">
            <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white">Features</a>
            <a href="#how-it-works" className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white">How it works</a>
            <a href="#sample-report" className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white">Sample report</a>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {user ? (
              <Link to="/dashboard" className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5">
                Dashboard <span className="hidden sm:inline" aria-hidden="true">→</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-2.5 py-2 text-sm font-semibold text-slate-300 transition hover:text-white sm:px-3">
                  Sign in
                </Link>
                <Link to="/register" className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3.5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 sm:px-4">
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

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

      <section id="features" className="scroll-mt-20 border-y border-white/[0.06] bg-white/[0.02] px-5 py-20 sm:px-8 sm:py-24">
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

      <section id="how-it-works" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Simple workflow" title="A stronger resume in three steps" description="Start with what you already have, understand what needs work, and turn the feedback into a polished document." />
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
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
            {homeBenefits.map((benefit) => <article key={benefit.title} className="group rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.055] to-transparent p-5 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.04]"><span className={`grid size-10 place-items-center rounded-xl text-lg ${benefit.style}`} aria-hidden="true">{benefit.icon}</span><h3 className="mt-4 font-semibold text-slate-100">{benefit.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{benefit.description}</p></article>)}
          </div>
        </div>
      </section>

      <section id="sample-report" className="scroll-mt-20 border-t border-white/[0.06] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Clear, structured feedback" title="See exactly where your resume stands" description="Your report turns a complex resume review into clear scores, strengths, gaps, and prioritized next steps." />
          <div className="mt-10 overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-slate-900/90 to-slate-950/70 p-5 shadow-2xl shadow-black/25 sm:p-8">
            <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Sample analysis</p><h3 className="mt-2 text-xl font-semibold">Resume performance report</h3></div><span className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">Generated in moments</span></div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.65fr_0.65fr_1.7fr]">
              <SampleScore label="Overall score" score={82} color="cyan" />
              <SampleScore label="ATS readiness" score={76} color="blue" />
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive snapshot</p><h4 className="mt-3 font-semibold text-white">A strong foundation with focused opportunities.</h4><p className="mt-2 text-sm leading-6 text-slate-500">Clear experience and relevant skills are visible. Stronger metrics and target-role keywords could improve impact.</p><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold"><span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-emerald-300">6 strengths</span><span className="rounded-full bg-amber-400/10 px-3 py-1.5 text-amber-300">4 skill gaps</span><span className="rounded-full bg-violet-400/10 px-3 py-1.5 text-violet-300">5 actions</span></div></div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <SampleInsight title="Skills detected" tone="cyan" items={['TypeScript', 'React', 'REST APIs']} />
              <SampleInsight title="What stands out" tone="emerald" items={['Relevant experience', 'Clear career progression']} />
              <SampleInsight title="Priority action" tone="amber" items={['Add measurable outcomes', 'Improve keyword alignment']} />
            </div>
            <div className="mt-6 text-center"><Link to="/analyze" className="inline-flex rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Get your own analysis <span className="ml-2" aria-hidden="true">→</span></Link></div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.07] bg-[#040713] px-5 pb-7 pt-14 sm:px-8 sm:pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-b border-white/[0.07] pb-12 md:grid-cols-[1.5fr_0.75fr_0.75fr]">
            <div className="max-w-md">
              <Link to="/" className="inline-flex items-center gap-3 text-white">
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-cyan-500 text-xs font-black text-slate-950 shadow-lg shadow-cyan-400/15">RI</span>
                <span><span className="block font-bold">Resume Intelligence</span><span className="text-xs text-slate-500">Build a stronger career story.</span></span>
              </Link>
              <p className="mt-5 text-sm leading-6 text-slate-500">Analyze, improve, build, and export professional resumes with focused AI guidance and full control over every change.</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-xs font-medium text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                Uploaded PDFs are processed in memory
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Product</h2>
              <div className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-500">
                <Link to="/analyze" className="transition hover:text-cyan-300">Resume analyzer</Link>
                <Link to="/dashboard" className="transition hover:text-cyan-300">Resume builder</Link>
                <a href="#features" className="transition hover:text-cyan-300">Features</a>
                <a href="#sample-report" className="transition hover:text-cyan-300">Sample report</a>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Your workspace</h2>
              <div className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-500">
                <Link to="/dashboard" className="transition hover:text-cyan-300">Dashboard</Link>
                {!user && <Link to="/login" className="transition hover:text-cyan-300">Sign in</Link>}
                {!user && <Link to="/register" className="transition hover:text-cyan-300">Create account</Link>}
                <a href="#how-it-works" className="transition hover:text-cyan-300">How it works</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Resume Intelligence. All rights reserved.</p>
            <p>AI-assisted feedback should always be reviewed before applying.</p>
          </div>
        </div>
      </footer>
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

const homeBenefits = [
  { icon: '◇', title: 'Private processing', description: 'Uploaded PDFs are processed in memory and never permanently stored.', style: 'bg-cyan-400/10 text-cyan-300' },
  { icon: '◫', title: 'Live preview', description: 'See every resume edit reflected instantly before you save or export.', style: 'bg-blue-400/10 text-blue-300' },
  { icon: '✦', title: 'You stay in control', description: 'AI suggestions are previewed first and never applied automatically.', style: 'bg-violet-400/10 text-violet-300' },
  { icon: '⌾', title: 'Secure resume storage', description: 'Authenticated resume data is isolated to its owning account.', style: 'bg-emerald-400/10 text-emerald-300' },
]

function SampleScore({ label, score, color }: { label: string; score: number; color: 'cyan' | 'blue' }) {
  const accent = color === 'cyan' ? '#22d3ee' : '#60a5fa'
  return <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 lg:flex-col lg:items-start"><div className="relative grid size-16 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${accent} ${score * 3.6}deg, rgba(51,65,85,.55) 0deg)` }}><div className="absolute inset-[5px] rounded-full bg-[#0b1020]" /><span className="relative text-lg font-bold">{score}</span></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-200">Strong foundation</p></div></div>
}

const sampleTones = { cyan: 'bg-cyan-400/10 text-cyan-200', emerald: 'bg-emerald-400/10 text-emerald-200', amber: 'bg-amber-400/10 text-amber-200' }
function SampleInsight({ title, items, tone }: { title: string; items: string[]; tone: keyof typeof sampleTones }) {
  return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><h4 className="font-semibold">{title}</h4><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className={`rounded-lg px-2.5 py-1.5 text-xs ${sampleTones[tone]}`}>{item}</span>)}</div></div>
}

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

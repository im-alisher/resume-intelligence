import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ResumeAnalysisResult } from '../analysis/analysis-types'
import { ApiError, apiRequest } from '../lib/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const processingSteps = [
  'Reading your resume structure',
  'Reviewing skills and experience',
  'Checking ATS compatibility',
  'Preparing your recommendations',
]

export function AnalyzerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState(0)
  const analysis = useMutation({
    mutationFn: async () => {
      if (!file) throw new ApiError('Select a PDF resume first', 400)
      const formData = new FormData()
      formData.append('resume', file)
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim())
      return apiRequest<ResumeAnalysisResult>('/analysis/resume', {
        method: 'POST',
        body: formData,
      })
    },
  })

  useEffect(() => {
    if (!analysis.isPending) {
      setProcessingStep(0)
      return
    }
    const timer = window.setInterval(() => {
      setProcessingStep((current) => Math.min(current + 1, processingSteps.length - 1))
    }, 1800)
    return () => window.clearInterval(timer)
  }, [analysis.isPending])

  useEffect(() => {
    if (!analysis.data) return
    const frame = window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [analysis.data])

  function selectFile(candidate?: File) {
    setFileError(null)
    analysis.reset()
    if (!candidate) return
    if (candidate.type !== 'application/pdf') {
      setFileError('Please select a PDF file.')
      return
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFileError('The PDF must be 5 MB or smaller.')
      return
    }
    setFile(candidate)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0])
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    selectFile(event.dataTransfer.files?.[0])
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    analysis.mutate()
  }

  const error = analysis.error
    ? analysis.error instanceof ApiError
      ? analysis.error.message
      : 'Unable to analyze this resume. Please try again.'
    : null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_58%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-7 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/5 pb-5">
          <Link to="/" className="flex items-center gap-3 font-bold text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-cyan-400 text-sm text-slate-950 shadow-lg shadow-cyan-400/20">RI</span>
            <span>Resume Intelligence</span>
          </Link>
          <Link to="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200">
            Build a resume <span aria-hidden="true">→</span>
          </Link>
        </header>

        <section className="mx-auto max-w-3xl pb-10 pt-16 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
            Free AI-powered review
          </span>
          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-6xl">
            Make your resume <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">impossible to ignore.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Get a clear ATS score, discover missing skills, and receive practical recommendations tailored to your next opportunity.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/70 p-1 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="space-y-6 rounded-[1.35rem] border border-white/5 bg-[#0b1020]/90 p-5 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_0.95fr]">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-200">Upload resume</p>
                  <span className="text-xs text-slate-500">PDF · Max 5 MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  disabled={analysis.isPending}
                  className={`group grid min-h-56 w-full place-items-center rounded-2xl border border-dashed px-6 py-8 text-center transition disabled:cursor-wait ${file ? 'border-cyan-400/50 bg-cyan-400/[0.07]' : 'border-slate-600 bg-slate-950/50 hover:border-cyan-400/60 hover:bg-cyan-400/[0.05]'}`}
                >
                  <span>
                    <span className={`mx-auto grid size-14 place-items-center rounded-2xl text-2xl transition group-hover:-translate-y-1 ${file ? 'bg-cyan-400 text-slate-950' : 'border border-slate-700 bg-slate-900 text-cyan-300'}`} aria-hidden="true">
                      {file ? '✓' : '↑'}
                    </span>
                    <span className="mt-4 block max-w-xs truncate text-base font-semibold text-white">
                      {file ? file.name : 'Drop your resume here'}
                    </span>
                    <span className="mt-2 block text-sm text-slate-500">
                      {file ? `${formatFileSize(file.size)} · Ready to analyze` : 'or click to browse your files'}
                    </span>
                    {file && <span className="mt-4 inline-block text-xs font-semibold text-cyan-300">Choose another file</span>}
                  </span>
                </button>
                <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
                {fileError && <p className="mt-2 text-sm text-rose-300">{fileError}</p>}
              </div>

              <label className="flex flex-col text-sm font-semibold text-slate-200">
                <span className="mb-3">Target job description <span className="font-normal text-slate-500">(optional)</span></span>
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  disabled={analysis.isPending}
                  maxLength={12_000}
                  placeholder="Paste the job description for tailored keyword and skill-gap analysis..."
                  className="min-h-56 flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-4 font-normal leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-wait"
                />
              </label>
            </div>

            {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

            <button
              type="submit"
              disabled={!file || analysis.isPending}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
            >
              {analysis.isPending ? 'Analysis in progress' : 'Analyze my resume'}
              {!analysis.isPending && <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>}
            </button>
          </div>
        </form>

        {analysis.isPending && <ProcessingPanel step={processingStep} fileName={file?.name ?? 'your resume'} />}
        {analysis.data && <AnalysisResults ref={resultsRef} result={analysis.data} />}
      </div>
    </main>
  )
}

function ProcessingPanel({ step, fileName }: { step: number; fileName: string }) {
  return (
    <section className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-xl shadow-cyan-950/20 sm:p-8" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative grid size-24 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full border border-cyan-400/20" />
          <span className="analyzer-orbit absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-300 border-r-blue-400" />
          <span className="analyzer-pulse grid size-12 place-items-center rounded-2xl bg-cyan-400/15 text-xl text-cyan-200">✦</span>
        </div>
        <div className="w-full">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Analyzing securely</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{processingSteps[step]}</h2>
          <p className="mt-2 truncate text-sm text-slate-500">{fileName}</p>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {processingSteps.map((label, index) => (
              <div key={label}>
                <div className={`h-1.5 overflow-hidden rounded-full ${index <= step ? 'bg-cyan-400/25' : 'bg-slate-800'}`}>
                  {index <= step && <div className={`h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 ${index === step ? 'analyzer-progress' : 'w-full'}`} />}
                </div>
                <span className="sr-only">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const AnalysisResults = ({ result, ref }: { result: ResumeAnalysisResult; ref: React.Ref<HTMLElement> }) => {
  const strongestArea = result.overallScore >= result.atsScore ? 'Overall quality' : 'ATS readiness'
  return (
    <section ref={ref} className="mx-auto mt-16 max-w-6xl scroll-mt-6 space-y-6 pb-20" tabIndex={-1}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Your analysis is ready</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Resume performance report</h2>
          <p className="mt-3 max-w-2xl text-slate-400">A focused review of what is working, what may block ATS performance, and where to improve next.</p>
        </div>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200">Analyze another resume</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_0.8fr_1.4fr]">
        <ScoreCard label="Overall score" score={result.overallScore} accent="cyan" />
        <ScoreCard label="ATS readiness" score={result.atsScore} accent="blue" />
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/60 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Executive snapshot</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{scoreHeadline(Math.round((result.overallScore + result.atsScore) / 2))}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">Your strongest measured area is <span className="font-semibold text-slate-200">{strongestArea}</span>. Start with the high-priority recommendations below for the greatest impact.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-emerald-300">{result.strengths.length} strengths</span>
            <span className="rounded-full bg-amber-400/10 px-3 py-1.5 text-amber-300">{result.missingSkills.length} skill gaps</span>
            <span className="rounded-full bg-violet-400/10 px-3 py-1.5 text-violet-300">{result.improvementSuggestions.length} actions</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightCard icon="✓" title="Skills detected" subtitle="Capabilities already visible to recruiters" items={result.skills} tone="cyan" tags />
        <InsightCard icon="↗" title="Skills to develop" subtitle="Potential gaps for your target direction" items={result.missingSkills} tone="amber" tags />
        <InsightCard icon="+" title="What stands out" subtitle="Your strongest resume signals" items={result.strengths} tone="emerald" />
        <InsightCard icon="!" title="What needs attention" subtitle="Issues that may reduce your impact" items={result.weaknesses} tone="rose" />
      </div>

      <ResultCard eyebrow="Career story" title="Experience analysis">
        <dl className="grid gap-4 sm:grid-cols-2">
          {Object.entries(result.experienceAnalysis).map(([label, value], index) => (
            <div key={label} className="rounded-2xl border border-white/[0.07] bg-slate-950/45 p-5">
              <dt className="flex items-center gap-3 font-semibold capitalize text-slate-100"><span className="grid size-7 place-items-center rounded-lg bg-cyan-400/10 text-xs text-cyan-300">0{index + 1}</span>{label}</dt>
              <dd className="mt-3 text-sm leading-6 text-slate-400">{value}</dd>
            </div>
          ))}
        </dl>
      </ResultCard>

      <ResultCard eyebrow="Action plan" title="Recommended improvements">
        <div className="space-y-3">
          {result.improvementSuggestions.map((item, index) => (
            <article key={`${item.category}-${index}`} className="group grid gap-4 rounded-2xl border border-white/[0.07] bg-slate-950/45 p-5 transition hover:border-white/15 sm:grid-cols-[auto_1fr]">
              <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[item.priority]}`}>{item.priority} priority</span>
                  <h3 className="font-semibold text-white">{item.category}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.suggestion}</p>
              </div>
            </article>
          ))}
        </div>
      </ResultCard>
    </section>
  )
}

const priorityStyles = {
  high: 'border border-rose-400/20 bg-rose-400/10 text-rose-300',
  medium: 'border border-amber-400/20 bg-amber-400/10 text-amber-300',
  low: 'border border-sky-400/20 bg-sky-400/10 text-sky-300',
}

function ScoreCard({ label, score, accent }: { label: string; score: number; accent: 'cyan' | 'blue' }) {
  const color = accent === 'cyan' ? '#22d3ee' : '#60a5fa'
  return (
    <div className="flex items-center gap-5 rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:flex-col sm:items-start xl:flex-row xl:items-center">
      <div className="relative grid size-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${score * 3.6}deg, rgba(51,65,85,.55) 0deg)` }}>
        <div className="absolute inset-[7px] rounded-full bg-slate-900" />
        <span className="relative text-2xl font-bold text-white">{score}</span>
      </div>
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p><p className="mt-2 text-lg font-semibold text-slate-100">{scoreLabel(score)}</p><p className="mt-1 text-xs text-slate-500">Score out of 100</p></div>
    </div>
  )
}

const toneStyles = {
  cyan: { icon: 'bg-cyan-400/10 text-cyan-300', item: 'border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-100', dot: 'bg-cyan-300' },
  amber: { icon: 'bg-amber-400/10 text-amber-300', item: 'border-amber-400/15 bg-amber-400/[0.07] text-amber-100', dot: 'bg-amber-300' },
  emerald: { icon: 'bg-emerald-400/10 text-emerald-300', item: 'border-emerald-400/10 bg-emerald-400/[0.05] text-slate-300', dot: 'bg-emerald-300' },
  rose: { icon: 'bg-rose-400/10 text-rose-300', item: 'border-rose-400/10 bg-rose-400/[0.05] text-slate-300', dot: 'bg-rose-300' },
}

function InsightCard({ icon, title, subtitle, items, tone, tags = false }: { icon: string; title: string; subtitle: string; items: string[]; tone: keyof typeof toneStyles; tags?: boolean }) {
  const styles = toneStyles[tone]
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex items-start gap-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl text-lg font-bold ${styles.icon}`}>{icon}</span><div><h3 className="text-lg font-semibold text-white">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div></div>
      {items.length ? tags ? (
        <div className="mt-5 flex flex-wrap gap-2">{items.map((item) => <span key={item} className={`rounded-lg border px-3 py-2 text-xs font-medium ${styles.item}`}>{item}</span>)}</div>
      ) : (
        <ul className="mt-5 space-y-2.5">{items.map((item) => <li key={item} className={`flex gap-3 rounded-xl border px-4 py-3 text-sm leading-5 ${styles.item}`}><span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${styles.dot}`} />{item}</li>)}</ul>
      ) : <p className="mt-5 text-sm text-slate-500">Nothing identified in this category.</p>}
    </div>
  )
}

function ResultCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p><h3 className="mb-6 mt-2 text-2xl font-semibold text-white">{title}</h3>{children}</div>
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Strong foundation'
  if (score >= 55) return 'Good potential'
  return 'Needs attention'
}

function scoreHeadline(score: number) {
  if (score >= 85) return 'Your resume is in excellent shape.'
  if (score >= 70) return 'You have a strong foundation.'
  if (score >= 55) return 'A few focused changes can lift your resume.'
  return 'Prioritize the fundamentals before applying.'
}

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

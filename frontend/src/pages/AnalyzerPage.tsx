import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { ResumeAnalysisResult } from '../analysis/analysis-types'
import { ApiError, apiRequest } from '../lib/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function AnalyzerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  const analysis = useMutation({
    mutationFn: async () => {
      if (!file) throw new ApiError('Select a PDF resume first', 400)
      const formData = new FormData()
      formData.append('resume', file)
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim())
      }
      return apiRequest<ResumeAnalysisResult>('/analysis/resume', {
        method: 'POST',
        body: formData,
      })
    },
  })

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
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link to="/" className="font-bold text-cyan-300">
            Resume Intelligence
          </Link>
          <Link to="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-white">
            Build a resume
          </Link>
        </header>

        <section className="mx-auto mt-16 max-w-3xl text-center">
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            No account required
          </span>
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">AI Resume Analyzer</h1>
          <p className="mt-4 text-lg text-slate-400">
            Upload a PDF to get ATS scoring, skill gaps, experience feedback, and actionable improvements.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-200">Resume PDF</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="w-full rounded-xl border-2 border-dashed border-slate-700 px-6 py-10 text-center transition hover:border-cyan-400 hover:bg-cyan-400/5"
            >
              <span className="block text-lg font-semibold text-white">
                {file ? file.name : 'Drop your resume here or click to browse'}
              </span>
              <span className="mt-2 block text-sm text-slate-400">PDF only, up to 5 MB</span>
            </button>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
            {fileError && <p className="mt-2 text-sm text-red-300">{fileError}</p>}
          </div>

          <label className="block text-sm font-semibold text-slate-200">
            Job description <span className="font-normal text-slate-500">(optional)</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              maxLength={12_000}
              rows={7}
              placeholder="Paste the role description to identify missing keywords and skills…"
              className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-normal text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>

          {error && <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={!file || analysis.isPending}
            className="w-full rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analysis.isPending ? 'Analyzing your resume…' : 'Analyze resume'}
          </button>
        </form>

        {analysis.data && <AnalysisResults result={analysis.data} />}
      </div>
    </main>
  )
}

function AnalysisResults({ result }: { result: ResumeAnalysisResult }) {
  return (
    <section className="mx-auto mt-10 max-w-5xl space-y-6 pb-16">
      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreCard label="Overall score" score={result.overallScore} />
        <ScoreCard label="ATS score" score={result.atsScore} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard title="Skills found" items={result.skills} tone="cyan" />
        <ListCard title="Missing skills" items={result.missingSkills} tone="amber" />
        <ListCard title="Strengths" items={result.strengths} tone="emerald" />
        <ListCard title="Weaknesses" items={result.weaknesses} tone="rose" />
      </div>
      <ResultCard title="Experience analysis">
        <dl className="grid gap-5 sm:grid-cols-2">
          {Object.entries(result.experienceAnalysis).map(([label, value]) => (
            <div key={label}>
              <dt className="capitalize font-semibold text-slate-200">{label}</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-400">{value}</dd>
            </div>
          ))}
        </dl>
      </ResultCard>
      <ResultCard title="Improvement suggestions">
        <div className="space-y-4">
          {result.improvementSuggestions.map((item, index) => (
            <article key={`${item.category}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${priorityStyles[item.priority]}`}>
                  {item.priority}
                </span>
                <h3 className="font-semibold">{item.category}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.suggestion}</p>
            </article>
          ))}
        </div>
      </ResultCard>
    </section>
  )
}

const priorityStyles = {
  high: 'bg-red-500/15 text-red-300',
  medium: 'bg-amber-500/15 text-amber-300',
  low: 'bg-slate-700 text-slate-300',
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-3 text-5xl font-bold text-cyan-300">{score}<span className="text-xl text-slate-500">/100</span></p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: 'cyan' | 'amber' | 'emerald' | 'rose' }) {
  const tones = { cyan: 'bg-cyan-400/10 text-cyan-200', amber: 'bg-amber-400/10 text-amber-200', emerald: 'bg-emerald-400/10 text-emerald-200', rose: 'bg-rose-400/10 text-rose-200' }
  return (
    <ResultCard title={title}>
      <div className="flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className={`rounded-full px-3 py-1.5 text-sm ${tones[tone]}`}>{item}</span>) : <span className="text-sm text-slate-500">None identified</span>}
      </div>
    </ResultCard>
  )
}

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  )
}

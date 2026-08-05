import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { ApiError } from '../lib/api'
import {
  improveDescription,
  improveSummary,
  reviewAts,
  rewriteExperience,
  suggestSkills,
} from '../resume/improvement-api'
import {
  downloadResumePdf,
  getResume,
  resumeKeys,
  updateResume,
} from '../resume/resume-api'
import {
  blankCertification,
  blankEducation,
  blankExperience,
  blankProject,
} from '../resume/resume-defaults'
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeForm,
} from '../resume/resume-types'

const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'

export function ResumeBuilderPage() {
  const { resumeId = '' } = useParams()
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const resumeQuery = useQuery({
    queryKey: resumeKeys.detail(resumeId),
    queryFn: () => getResume(token!, resumeId),
    enabled: Boolean(token && resumeId),
  })
  const [form, setForm] = useState<ResumeForm | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    if (resumeQuery.data) setForm(resumeQuery.data)
  }, [resumeQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => updateResume(token!, resumeId, form!),
    onSuccess: (saved) => {
      setForm(saved)
      setSavedAt(new Date())
      queryClient.setQueryData(resumeKeys.detail(resumeId), saved)
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all })
    },
  })

  if (resumeQuery.isError) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-red-300">Unable to load this resume.</div>
  }
  if (resumeQuery.isLoading || !form) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-300">Loading builder…</div>
  }

  const saveError = saveMutation.error instanceof ApiError ? saveMutation.error.message : saveMutation.isError ? 'Unable to save the resume.' : null
  const update = <K extends keyof ResumeForm>(key: K, value: ResumeForm[K]) => setForm((current) => current ? { ...current, [key]: value } : current)
  const context = { jobDescription: jobDescription.trim() || undefined }

  async function runAi(label: string, action: () => Promise<void>) {
    setAiLoading(label)
    setAiError(null)
    try {
      await action()
    } catch (error) {
      setAiError(error instanceof ApiError ? error.message : 'AI improvement failed. Please try again.')
    } finally {
      setAiLoading(null)
    }
  }

  function applySuggestion() {
    suggestion?.apply?.()
    setSuggestion(null)
  }

  async function handleExport() {
    setIsExporting(true)
    setExportError(null)
    try {
      const saved = await saveMutation.mutateAsync()
      await downloadResumePdf(token!, resumeId, saved.title)
    } catch (error) {
      setExportError(
        error instanceof ApiError
          ? error.message
          : 'Unable to generate the PDF. Please try again.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/dashboard" className="shrink-0 text-sm font-semibold text-cyan-300">← Dashboard</Link>
            <input value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={120} aria-label="Resume title" className="min-w-0 max-w-sm border-0 bg-transparent text-lg font-semibold outline-none" />
          </div>
          <div className="flex items-center gap-3">
            {savedAt && <span className="hidden text-xs text-slate-500 sm:inline">Saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            <button onClick={() => void handleExport()} disabled={isExporting || saveMutation.isPending} className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900 disabled:opacity-50">
              {isExporting ? 'Generating…' : 'Download PDF'}
            </button>
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isExporting} className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
              {saveMutation.isPending ? 'Saving…' : 'Save resume'}
            </button>
          </div>
        </div>
      </header>

      {saveError && <div className="mx-auto mt-4 max-w-[1600px] px-4 text-sm text-red-300 sm:px-6">{saveError}</div>}
      {exportError && <div className="mx-auto mt-4 max-w-[1600px] px-4 text-sm text-red-300 sm:px-6">{exportError}</div>}
      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[minmax(400px,0.9fr)_minmax(500px,1.1fr)] lg:px-6">
        <div className="space-y-5">
          <EditorSection title="AI Resume Coach">
            <p className="text-sm leading-6 text-slate-400">Add a target job description for tailored recommendations. AI suggestions are previewed before changing your resume.</p>
            <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={5} maxLength={12000} placeholder="Optional target job description…" className={inputClass} />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <AiButton loading={aiLoading === 'ats'} onClick={() => void runAi('ats', async () => {
                await saveMutation.mutateAsync()
                const result = await reviewAts(token!, resumeId, context)
                setSuggestion({ title: `ATS readiness: ${result.estimatedScore}/100`, content: result.recommendations, note: `Suggested keywords: ${result.keywords.join(', ') || 'None'}`, applyLabel: 'Add keywords to skills', apply: () => update('skills', unique([...form.skills, ...result.keywords])) })
              })}>Review ATS score</AiButton>
              <AiButton loading={aiLoading === 'skills'} onClick={() => void runAi('skills', async () => {
                const result = await suggestSkills(token!, resumeId, form.skills, context)
                setSuggestion({ title: 'AI skill suggestions', content: [result.rationale, ...result.missingSkills.map((skill) => `Potential gap: ${skill}`)], note: `Recommended supported skills: ${result.skills.join(', ')}`, applyLabel: 'Use recommended skills', apply: () => update('skills', result.skills) })
              })}>Suggest skills</AiButton>
            </div>
            {aiError && <p className="mt-3 text-sm text-red-300">{aiError}</p>}
          </EditorSection>

          {suggestion && (
            <section className="rounded-2xl border border-violet-400/30 bg-violet-400/10 p-5">
              <div className="flex items-start justify-between gap-4"><h2 className="text-lg font-semibold text-violet-100">{suggestion.title}</h2><button onClick={() => setSuggestion(null)} className="text-sm text-violet-300">Dismiss</button></div>
              {suggestion.note && <p className="mt-3 text-sm leading-6 text-violet-200">{suggestion.note}</p>}
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">{suggestion.content.map((item, index) => <li key={index}>{item}</li>)}</ul>
              {suggestion.apply && <button onClick={applySuggestion} className="mt-4 rounded-lg bg-violet-300 px-4 py-2 text-sm font-semibold text-violet-950 hover:bg-violet-200">{suggestion.applyLabel ?? 'Apply suggestion'}</button>}
            </section>
          )}

          <EditorSection title="Personal information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.personalInfo.fullName} onChange={(value) => update('personalInfo', { ...form.personalInfo, fullName: value })} />
              <Field label="Email" type="email" value={form.personalInfo.email} onChange={(value) => update('personalInfo', { ...form.personalInfo, email: value })} />
              <Field label="Phone" value={form.personalInfo.phone} onChange={(value) => update('personalInfo', { ...form.personalInfo, phone: value })} />
              <Field label="Location" value={form.personalInfo.location} onChange={(value) => update('personalInfo', { ...form.personalInfo, location: value })} />
              <Field label="Website" type="url" value={form.personalInfo.website ?? ''} onChange={(value) => update('personalInfo', { ...form.personalInfo, website: value })} />
              <Field label="LinkedIn" type="url" value={form.personalInfo.linkedin ?? ''} onChange={(value) => update('personalInfo', { ...form.personalInfo, linkedin: value })} />
            </div>
          </EditorSection>

          <EditorSection title="Professional summary">
            <div className="mb-3 flex justify-end"><AiButton compact loading={aiLoading === 'summary'} onClick={() => void runAi('summary', async () => {
              const result = await improveSummary(token!, resumeId, form.summary, context)
              setSuggestion({ title: 'Improved professional summary', content: [result.summary, ...result.changes.map((change) => `Change: ${change}`)], applyLabel: 'Use this summary', apply: () => update('summary', result.summary) })
            })}>Improve with AI</AiButton></div>
            <textarea value={form.summary} onChange={(event) => update('summary', event.target.value)} rows={5} maxLength={2500} placeholder="Summarize your experience and career value…" className={inputClass} />
          </EditorSection>

          <EditorSection title="Skills">
            <textarea value={form.skills.join(', ')} onChange={(event) => update('skills', splitComma(event.target.value))} rows={3} placeholder="TypeScript, React, Product strategy…" className={inputClass} />
            <p className="mt-2 text-xs text-slate-500">Separate skills with commas.</p>
          </EditorSection>

          <CollectionSection title="Experience" onAdd={() => update('experiences', [...form.experiences, blankExperience()])}>
            {form.experiences.map((item, index) => (
              <ExperienceEditor key={index} item={item} onChange={(next) => updateItem(form, update, 'experiences', index, next)} onRemove={() => removeItem(form, update, 'experiences', index)} isImproving={aiLoading === `experience-${index}`} onImprove={() => void runAi(`experience-${index}`, async () => {
                const result = await rewriteExperience(token!, resumeId, { position: item.position, company: item.company, accomplishments: item.accomplishments, ...context })
                setSuggestion({ title: `Rewritten experience: ${item.position || 'Role'}`, content: [...result.bullets, result.guidance], applyLabel: 'Use these bullet points', apply: () => updateItem(form, update, 'experiences', index, { ...item, accomplishments: result.bullets }) })
              })} />
            ))}
          </CollectionSection>

          <CollectionSection title="Education" onAdd={() => update('education', [...form.education, blankEducation()])}>
            {form.education.map((item, index) => (
              <EducationEditor key={index} item={item} onChange={(next) => updateItem(form, update, 'education', index, next)} onRemove={() => removeItem(form, update, 'education', index)} />
            ))}
          </CollectionSection>

          <CollectionSection title="Projects" onAdd={() => update('projects', [...form.projects, blankProject()])}>
            {form.projects.map((item, index) => (
              <ProjectEditor key={index} item={item} onChange={(next) => updateItem(form, update, 'projects', index, next)} onRemove={() => removeItem(form, update, 'projects', index)} isImproving={aiLoading === `project-${index}`} onImprove={() => void runAi(`project-${index}`, async () => {
                const result = await improveDescription(token!, resumeId, { type: 'project', title: item.name, currentDescription: item.description, ...context })
                setSuggestion({ title: `Improved project description: ${item.name || 'Project'}`, content: [result.description, ...result.improvements], applyLabel: 'Use this description', apply: () => updateItem(form, update, 'projects', index, { ...item, description: result.description }) })
              })} />
            ))}
          </CollectionSection>

          <CollectionSection title="Certifications" onAdd={() => update('certifications', [...form.certifications, blankCertification()])}>
            {form.certifications.map((item, index) => (
              <CertificationEditor key={index} item={item} onChange={(next) => updateItem(form, update, 'certifications', index, next)} onRemove={() => removeItem(form, update, 'certifications', index)} />
            ))}
          </CollectionSection>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Live preview</p>
          <ResumePreview resume={form} />
        </aside>
      </div>
    </main>
  )
}

function ExperienceEditor({ item, onChange, onRemove, onImprove, isImproving }: AiEditorProps<ExperienceItem>) {
  return <ItemCard onRemove={onRemove}><div className="mb-3 flex justify-end"><AiButton compact loading={isImproving} onClick={onImprove}>Rewrite bullets</AiButton></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Position" value={item.position} onChange={(position) => onChange({ ...item, position })} /><Field label="Company" value={item.company} onChange={(company) => onChange({ ...item, company })} /><Field label="Location" value={item.location ?? ''} onChange={(location) => onChange({ ...item, location })} /><span /><MonthField label="Start" value={item.startDate} onChange={(startDate) => onChange({ ...item, startDate })} /><MonthField label="End" value={item.endDate ?? ''} disabled={item.isCurrent} onChange={(endDate) => onChange({ ...item, endDate })} /></div><label className="mt-3 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={item.isCurrent} onChange={(event) => onChange({ ...item, isCurrent: event.target.checked, endDate: '' })} />I currently work here</label><label className="mt-3 block text-sm text-slate-300">Accomplishments<textarea value={item.accomplishments.join('\n')} onChange={(event) => onChange({ ...item, accomplishments: splitLines(event.target.value) })} rows={4} placeholder="One achievement per line" className={inputClass} /></label></ItemCard>
}

function EducationEditor({ item, onChange, onRemove }: EditorProps<EducationItem>) {
  return <ItemCard onRemove={onRemove}><div className="grid gap-3 sm:grid-cols-2"><Field label="Institution" value={item.institution} onChange={(institution) => onChange({ ...item, institution })} /><Field label="Degree" value={item.degree} onChange={(degree) => onChange({ ...item, degree })} /><Field label="Field of study" value={item.field ?? ''} onChange={(field) => onChange({ ...item, field })} /><Field label="Location" value={item.location ?? ''} onChange={(location) => onChange({ ...item, location })} /><MonthField label="Start" value={item.startDate ?? ''} onChange={(startDate) => onChange({ ...item, startDate })} /><MonthField label="End" value={item.endDate ?? ''} onChange={(endDate) => onChange({ ...item, endDate })} /></div><label className="mt-3 block text-sm text-slate-300">Description<textarea value={item.description ?? ''} onChange={(event) => onChange({ ...item, description: event.target.value })} rows={3} className={inputClass} /></label></ItemCard>
}

function ProjectEditor({ item, onChange, onRemove, onImprove, isImproving }: AiEditorProps<ProjectItem>) {
  return <ItemCard onRemove={onRemove}><div className="mb-3 flex justify-end"><AiButton compact loading={isImproving} onClick={onImprove}>Improve description</AiButton></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Project name" value={item.name} onChange={(name) => onChange({ ...item, name })} /><Field label="Project URL" type="url" value={item.url ?? ''} onChange={(url) => onChange({ ...item, url })} /></div><label className="mt-3 block text-sm text-slate-300">Description<textarea value={item.description} onChange={(event) => onChange({ ...item, description: event.target.value })} rows={3} className={inputClass} /></label><Field label="Technologies (comma separated)" value={item.technologies.join(', ')} onChange={(value) => onChange({ ...item, technologies: splitComma(value) })} /></ItemCard>
}

function CertificationEditor({ item, onChange, onRemove }: EditorProps<CertificationItem>) {
  return <ItemCard onRemove={onRemove}><div className="grid gap-3 sm:grid-cols-2"><Field label="Certification" value={item.name} onChange={(name) => onChange({ ...item, name })} /><Field label="Issuing organization" value={item.issuingOrg} onChange={(issuingOrg) => onChange({ ...item, issuingOrg })} /><MonthField label="Issue date" value={item.issueDate ?? ''} onChange={(issueDate) => onChange({ ...item, issueDate })} /><MonthField label="Expiration date" value={item.expirationDate ?? ''} onChange={(expirationDate) => onChange({ ...item, expirationDate })} /></div><Field label="Credential URL" type="url" value={item.credentialUrl ?? ''} onChange={(credentialUrl) => onChange({ ...item, credentialUrl })} /></ItemCard>
}

function ResumePreview({ resume }: { resume: ResumeForm }) {
  const info = resume.personalInfo
  return (
    <article className="mx-auto min-h-[900px] w-full max-w-[794px] bg-white p-8 text-slate-800 shadow-2xl sm:p-12">
      <header className="border-b-2 border-slate-800 pb-5 text-center"><h1 className="text-3xl font-bold tracking-wide">{info.fullName || 'Your Name'}</h1><p className="mt-2 text-sm text-slate-600">{[info.email, info.phone, info.location].filter(Boolean).join(' • ')}</p><p className="mt-1 text-xs text-slate-500">{[info.website, info.linkedin].filter(Boolean).join(' • ')}</p></header>
      {resume.summary && <PreviewSection title="Professional Summary"><p>{resume.summary}</p></PreviewSection>}
      {resume.skills.length > 0 && <PreviewSection title="Skills"><p>{resume.skills.join(' • ')}</p></PreviewSection>}
      {resume.experiences.length > 0 && <PreviewSection title="Experience">{resume.experiences.map((item, index) => <PreviewItem key={index} title={item.position || 'Position'} subtitle={[item.company, item.location].filter(Boolean).join(', ')} date={`${formatMonth(item.startDate)} – ${item.isCurrent ? 'Present' : formatMonth(item.endDate)}`}>{item.accomplishments.length > 0 && <ul className="list-disc space-y-1 pl-5">{item.accomplishments.map((line) => <li key={line}>{line}</li>)}</ul>}</PreviewItem>)}</PreviewSection>}
      {resume.education.length > 0 && <PreviewSection title="Education">{resume.education.map((item, index) => <PreviewItem key={index} title={[item.degree, item.field].filter(Boolean).join(' in ') || 'Degree'} subtitle={[item.institution, item.location].filter(Boolean).join(', ')} date={[formatMonth(item.startDate), formatMonth(item.endDate)].filter(Boolean).join(' – ')}>{item.description && <p>{item.description}</p>}</PreviewItem>)}</PreviewSection>}
      {resume.projects.length > 0 && <PreviewSection title="Projects">{resume.projects.map((item, index) => <PreviewItem key={index} title={item.name || 'Project'} subtitle={item.technologies.join(', ')}><p>{item.description}</p></PreviewItem>)}</PreviewSection>}
      {resume.certifications.length > 0 && <PreviewSection title="Certifications">{resume.certifications.map((item, index) => <PreviewItem key={index} title={item.name || 'Certification'} subtitle={item.issuingOrg} date={formatMonth(item.issueDate)} />)}</PreviewSection>}
    </article>
  )
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) { return <section className="mt-6"><h2 className="mb-3 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-[0.16em]">{title}</h2><div className="text-sm leading-6">{children}</div></section> }
function PreviewItem({ title, subtitle, date, children }: { title: string; subtitle?: string; date?: string; children?: ReactNode }) { return <div className="mb-4 last:mb-0"><div className="flex justify-between gap-4"><div><h3 className="font-bold">{title}</h3>{subtitle && <p className="italic text-slate-600">{subtitle}</p>}</div>{date && <span className="shrink-0 text-xs text-slate-500">{date}</span>}</div>{children && <div className="mt-1 text-slate-700">{children}</div>}</div> }
function EditorSection({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{children}</section> }
function CollectionSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) { return <EditorSection title={title}><div className="space-y-4">{children}</div><button type="button" onClick={onAdd} className="mt-4 w-full rounded-lg border border-dashed border-slate-600 py-2.5 text-sm font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-400/5">+ Add {title.toLowerCase().replace(/s$/, '')}</button></EditorSection> }
function ItemCard({ onRemove, children }: { onRemove: () => void; children: ReactNode }) { return <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4"><div className="mb-2 flex justify-end"><button type="button" onClick={onRemove} className="text-xs font-semibold text-red-300 hover:text-red-200">Remove</button></div>{children}</div> }
function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm text-slate-300">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label> }
function MonthField({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) { return <label className="block text-sm text-slate-300">{label}<input type="month" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label> }

interface EditorProps<T> { item: T; onChange: (item: T) => void; onRemove: () => void }
interface AiEditorProps<T> extends EditorProps<T> { onImprove: () => void; isImproving: boolean }
interface AiSuggestion { title: string; content: string[]; note?: string; applyLabel?: string; apply?: () => void }
function AiButton({ children, onClick, loading, compact = false }: { children: ReactNode; onClick: () => void; loading: boolean; compact?: boolean }) { return <button type="button" onClick={onClick} disabled={loading} className={`rounded-lg border border-violet-400/40 font-semibold text-violet-200 hover:bg-violet-400/10 disabled:opacity-50 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'}`}>{loading ? 'Working…' : <>✦ {children}</>}</button> }
type UpdateForm = <K extends keyof ResumeForm>(key: K, value: ResumeForm[K]) => void
function updateItem<K extends 'experiences' | 'education' | 'projects' | 'certifications'>(form: ResumeForm, update: UpdateForm, key: K, index: number, value: ResumeForm[K][number]) { const items = [...form[key]] as ResumeForm[K]; items[index] = value as never; update(key, items) }
function removeItem<K extends 'experiences' | 'education' | 'projects' | 'certifications'>(form: ResumeForm, update: UpdateForm, key: K, index: number) { update(key, form[key].filter((_, itemIndex) => itemIndex !== index) as ResumeForm[K]) }
function splitComma(value: string) { return value.split(',').map((item) => item.trim()).filter(Boolean) }
function splitLines(value: string) { return value.split('\n').map((item) => item.trim()).filter(Boolean) }
function unique(items: string[]) { return [...new Set(items.map((item) => item.trim()).filter(Boolean))] }
function formatMonth(value?: string) { if (!value) return ''; const [year, month] = value.split('-'); return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1))) }

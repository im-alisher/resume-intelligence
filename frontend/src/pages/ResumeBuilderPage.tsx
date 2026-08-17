import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Children, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { ApiError } from '../lib/api'
import { improveDescription, improveSummary, reviewAts, rewriteExperience, suggestSkills } from '../resume/improvement-api'
import { downloadResumePdf, getResume, importResume, resumeKeys, updateResume } from '../resume/resume-api'
import { blankCertification, blankEducation, blankExperience, blankProject } from '../resume/resume-defaults'
import type { CertificationItem, CustomSection, EducationItem, ExperienceItem, ProjectItem, ResumeForm } from '../resume/resume-types'

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
  const [importDraft, setImportDraft] = useState<ResumeForm | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importError, setImportError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

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
  const update = <K extends keyof ResumeForm>(key: K, value: ResumeForm[K]) => setForm((current) => (current ? { ...current, [key]: value } : current))
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
      setExportError(error instanceof ApiError ? error.message : 'Unable to generate the PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024) {
      setImportError('Choose a PDF file that is 5 MB or smaller.')
      return
    }
    setImportError(null)
    setImportProgress(12)
    const timer = window.setInterval(() => setImportProgress((value) => Math.min(value + 8, 88)), 700)
    try {
      const imported = await importResume(token!, file)
      setImportDraft(normalizeImport(imported, form))
      setImportProgress(100)
    } catch (error) {
      setImportError(error instanceof ApiError ? error.message : 'Unable to parse this PDF. Please try another file.')
      setImportProgress(0)
    } finally {
      window.clearInterval(timer)
    }
  }

  function applyImport() {
    if (!importDraft) return
    setForm(importDraft)
    setImportDraft(null)
    setImportProgress(0)
    setNotice('Imported resume is ready for review. Your saved resume has not been changed yet.')
  }

  function addCustomSection() {
    const title = window.prompt('Custom section title')?.trim()
    if (!title) return
    update('customSections', [...form.customSections, { id: createId(), title, items: [], order: form.customSections.length }])
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/dashboard" className="shrink-0 text-sm font-semibold text-cyan-300">
              ← Dashboard
            </Link>
            <input value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={120} aria-label="Resume title" className="min-w-0 max-w-sm border-0 bg-transparent text-lg font-semibold outline-none" />
          </div>
          <div className="flex items-center gap-3">
            {savedAt && (
              <span className="hidden text-xs text-slate-500 sm:inline">
                Saved{' '}
                {savedAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
            <button onClick={() => void handleExport()} disabled={isExporting || saveMutation.isPending} className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900 disabled:opacity-50">
              {isExporting ? 'Generating…' : 'Download PDF'}
            </button>
            <input ref={importInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => void handleImport(event)} />
            <button type="button" onClick={() => importInputRef.current?.click()} disabled={importProgress > 0 && importProgress < 100} className="rounded-lg border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-50">
              {importProgress > 0 && importProgress < 100 ? `Importing ${importProgress}%` : 'Import Resume'}
            </button>
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isExporting} className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
              {saveMutation.isPending ? 'Saving…' : 'Save resume'}
            </button>
          </div>
        </div>
      </header>

      {saveError && <div className="mx-auto mt-4 max-w-[1600px] px-4 text-sm text-red-300 sm:px-6">{saveError}</div>}
      {exportError && <div className="mx-auto mt-4 max-w-[1600px] px-4 text-sm text-red-300 sm:px-6">{exportError}</div>}
      {importError && (
        <Notice tone="error" onClose={() => setImportError(null)}>
          {importError}
        </Notice>
      )}
      {notice && (
        <Notice tone="success" onClose={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {importProgress > 0 && importProgress < 100 && (
        <div className="mx-auto mt-4 max-w-[1600px] px-4 sm:px-6">
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${importProgress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">Extracting text and organizing your resume with AI…</p>
        </div>
      )}
      {importDraft && (
        <ImportReview
          draft={importDraft}
          onCancel={() => {
            setImportDraft(null)
            setImportProgress(0)
          }}
          onApply={applyImport}
        />
      )}
      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[minmax(400px,0.9fr)_minmax(500px,1.1fr)] lg:px-6">
        <div className="space-y-5">
          <EditorSection title="AI Resume Coach">
            <p className="text-sm leading-6 text-slate-400">Add a target job description for tailored recommendations. AI suggestions are previewed before changing your resume.</p>
            <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={5} maxLength={12000} placeholder="Optional target job description…" className={inputClass} />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <AiButton
                loading={aiLoading === 'ats'}
                onClick={() =>
                  void runAi('ats', async () => {
                    await saveMutation.mutateAsync()
                    const result = await reviewAts(token!, resumeId, context)
                    setSuggestion({
                      title: `ATS readiness: ${result.estimatedScore}/100`,
                      content: result.recommendations,
                      note: `Suggested keywords: ${result.keywords.join(', ') || 'None'}`,
                    })
                  })
                }
              >
                Review ATS score
              </AiButton>
              <AiButton
                loading={aiLoading === 'skills'}
                onClick={() =>
                  void runAi('skills', async () => {
                    const result = await suggestSkills(token!, resumeId, form.skills, context)
                    setSuggestion({
                      title: 'AI skill suggestions',
                      content: [result.rationale, ...result.missingSkills.map((skill) => `Potential gap: ${skill}`)],
                      note: `Recommended supported skills: ${result.skills.join(', ')}`,
                      applyLabel: 'Use recommended skills',
                      apply: () => update('skills', result.skills),
                    })
                  })
                }
              >
                Suggest skills
              </AiButton>
            </div>
            {aiError && <p className="mt-3 text-sm text-red-300">{aiError}</p>}
          </EditorSection>

          {suggestion && (
            <section
              role="dialog"
              aria-modal="false"
              aria-labelledby="ai-suggestion-title"
              className="fixed inset-x-4 bottom-4 z-40 max-h-[min(70vh,38rem)] overflow-y-auto rounded-2xl border border-violet-400/40 bg-slate-900/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:left-auto sm:right-6 sm:w-[min(30rem,calc(100vw-3rem))]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">AI suggestion ready</p>
                  <h2 id="ai-suggestion-title" className="mt-1 text-lg font-semibold text-violet-100">{suggestion.title}</h2>
                </div>
                <button type="button" onClick={() => setSuggestion(null)} className="rounded-lg px-2 py-1 text-sm text-violet-300 hover:bg-violet-400/10" aria-label="Dismiss AI suggestion">
                  ×
                </button>
              </div>
              {suggestion.note && <p className="mt-3 text-sm leading-6 text-violet-200">{suggestion.note}</p>}
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
                {suggestion.content.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              {suggestion.apply && (
                <button type="button" onClick={applySuggestion} className="mt-4 w-full rounded-lg bg-violet-300 px-4 py-2.5 text-sm font-semibold text-violet-950 hover:bg-violet-200">
                  {suggestion.applyLabel ?? 'Apply suggestion'}
                </button>
              )}
            </section>
          )}

          <EditorSection title="Personal information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.personalInfo.fullName}
                onChange={(value) =>
                  update('personalInfo', {
                    ...form.personalInfo,
                    fullName: value,
                  })
                }
              />
              <Field label="Email" type="email" value={form.personalInfo.email} onChange={(value) => update('personalInfo', { ...form.personalInfo, email: value })} />
              <Field label="Phone" value={form.personalInfo.phone} onChange={(value) => update('personalInfo', { ...form.personalInfo, phone: value })} />
              <Field
                label="Location"
                value={form.personalInfo.location}
                onChange={(value) =>
                  update('personalInfo', {
                    ...form.personalInfo,
                    location: value,
                  })
                }
              />
              <Field
                label="Website"
                type="url"
                value={form.personalInfo.website ?? ''}
                onChange={(value) =>
                  update('personalInfo', {
                    ...form.personalInfo,
                    website: value,
                  })
                }
              />
              <Field
                label="LinkedIn"
                type="url"
                value={form.personalInfo.linkedin ?? ''}
                onChange={(value) =>
                  update('personalInfo', {
                    ...form.personalInfo,
                    linkedin: value,
                  })
                }
              />
            </div>
          </EditorSection>

          <EditorSection title="Professional summary">
            <div className="mb-3 flex justify-end">
              <AiButton
                compact
                loading={aiLoading === 'summary'}
                onClick={() =>
                  void runAi('summary', async () => {
                    const result = await improveSummary(token!, resumeId, form.summary, context)
                    setSuggestion({
                      title: 'Improved professional summary',
                      content: [result.summary, ...result.changes.map((change) => `Change: ${change}`)],
                      applyLabel: 'Use this summary',
                      apply: () => update('summary', result.summary),
                    })
                  })
                }
              >
                Improve with AI
              </AiButton>
            </div>
            <textarea value={form.summary} onChange={(event) => update('summary', event.target.value)} rows={5} maxLength={2500} placeholder="Summarize your experience and career value…" className={inputClass} />
          </EditorSection>

          <EditorSection title="Skills">
            <textarea value={form.skills.join(', ')} onChange={(event) => update('skills', splitComma(event.target.value))} rows={3} placeholder="TypeScript, React, Product strategy…" className={inputClass} />
            <p className="mt-2 text-xs text-slate-500">Separate skills with commas.</p>
          </EditorSection>

          <CollectionSection title="Experience" onAdd={() => update('experiences', [...form.experiences, blankExperience()])}>
            {form.experiences.map((item, index) => (
              <ReorderableItem key={index} index={index} count={form.experiences.length} onMove={(from, to) => update('experiences', moveItem(form.experiences, from, to))}>
                <ExperienceEditor
                  item={item}
                  onChange={(next) => updateItem(form, update, 'experiences', index, next)}
                  onRemove={() => removeItem(form, update, 'experiences', index)}
                  isImproving={aiLoading === `experience-${index}`}
                  onImprove={() =>
                    void runAi(`experience-${index}`, async () => {
                      const result = await rewriteExperience(token!, resumeId, {
                        position: item.position,
                        company: item.company,
                        accomplishments: item.accomplishments,
                        ...context,
                      })
                      setSuggestion({
                        title: `Rewritten experience: ${item.position || 'Role'}`,
                        content: [...result.bullets, result.guidance],
                        applyLabel: 'Use these bullet points',
                        apply: () =>
                          updateItem(form, update, 'experiences', index, {
                            ...item,
                            accomplishments: result.bullets,
                          }),
                      })
                    })
                  }
                />
              </ReorderableItem>
            ))}
          </CollectionSection>

          <CollectionSection title="Education" onAdd={() => update('education', [...form.education, blankEducation()])}>
            {form.education.map((item, index) => (
              <ReorderableItem key={index} index={index} count={form.education.length} onMove={(from, to) => update('education', moveItem(form.education, from, to))}>
                <EducationEditor item={item} onChange={(next) => updateItem(form, update, 'education', index, next)} onRemove={() => removeItem(form, update, 'education', index)} />
              </ReorderableItem>
            ))}
          </CollectionSection>

          <CollectionSection title="Projects" onAdd={() => update('projects', [...form.projects, blankProject()])}>
            {form.projects.map((item, index) => (
              <ReorderableItem key={index} index={index} count={form.projects.length} onMove={(from, to) => update('projects', moveItem(form.projects, from, to))}>
                <ProjectEditor
                  item={item}
                  onChange={(next) => updateItem(form, update, 'projects', index, next)}
                  onRemove={() => removeItem(form, update, 'projects', index)}
                  isImproving={aiLoading === `project-${index}`}
                  onImprove={() =>
                    void runAi(`project-${index}`, async () => {
                      const result = await improveDescription(token!, resumeId, {
                        type: 'project',
                        title: item.name,
                        currentDescription: item.description,
                        ...context,
                      })
                      setSuggestion({
                        title: `Improved project description: ${item.name || 'Project'}`,
                        content: [result.description, ...result.improvements],
                        applyLabel: 'Use this description',
                        apply: () =>
                          updateItem(form, update, 'projects', index, {
                            ...item,
                            description: result.description,
                          }),
                      })
                    })
                  }
                />
              </ReorderableItem>
            ))}
          </CollectionSection>

          <CollectionSection title="Certifications" onAdd={() => update('certifications', [...form.certifications, blankCertification()])}>
            {form.certifications.map((item, index) => (
              <ReorderableItem key={index} index={index} count={form.certifications.length} onMove={(from, to) => update('certifications', moveItem(form.certifications, from, to))}>
                <CertificationEditor item={item} onChange={(next) => updateItem(form, update, 'certifications', index, next)} onRemove={() => removeItem(form, update, 'certifications', index)} />
              </ReorderableItem>
            ))}
          </CollectionSection>

          {form.customSections.map((section, index) => (
            <ReorderableItem
              key={section.id}
              index={index}
              count={form.customSections.length}
              onMove={(from, to) =>
                update(
                  'customSections',
                  moveItem(form.customSections, from, to).map((item, order) => ({ ...item, order })),
                )
              }
            >
              <EditorSection title={section.title}>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Field
                      label="Section title"
                      value={section.title}
                      onChange={(title) =>
                        updateCustomSection(form, update, index, {
                          ...section,
                          title,
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'customSections',
                        form.customSections.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="mb-2.5 text-xs font-semibold text-red-300"
                  >
                    Delete section
                  </button>
                </div>
                <label className="mt-3 block text-sm text-slate-300">
                  Items
                  <textarea
                    value={section.items.join('\n')}
                    onChange={(event) =>
                      updateCustomSection(form, update, index, {
                        ...section,
                        items: splitLines(event.target.value),
                      })
                    }
                    rows={5}
                    placeholder="One item per line"
                    className={inputClass}
                  />
                </label>
              </EditorSection>
            </ReorderableItem>
          ))}
          <button type="button" onClick={addCustomSection} className="w-full rounded-xl border border-dashed border-cyan-400/40 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/5">
            + Add Custom Section
          </button>
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
  return (
    <ItemCard onRemove={onRemove}>
      <div className="mb-3 flex justify-end">
        <AiButton compact loading={isImproving} onClick={onImprove}>
          Rewrite bullets
        </AiButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Position" value={item.position} onChange={(position) => onChange({ ...item, position })} />
        <Field label="Company" value={item.company} onChange={(company) => onChange({ ...item, company })} />
        <Field label="Location" value={item.location ?? ''} onChange={(location) => onChange({ ...item, location })} />
        <span />
        <MonthField label="Start" value={item.startDate} onChange={(startDate) => onChange({ ...item, startDate })} />
        <MonthField label="End" value={item.endDate ?? ''} disabled={item.isCurrent} onChange={(endDate) => onChange({ ...item, endDate })} />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={item.isCurrent} onChange={(event) => onChange({ ...item, isCurrent: event.target.checked, endDate: '' })} />I currently work here
      </label>
      <label className="mt-3 block text-sm text-slate-300">
        Accomplishments
        <textarea
          value={item.accomplishments.join('\n')}
          onChange={(event) =>
            onChange({
              ...item,
              accomplishments: splitLines(event.target.value),
            })
          }
          rows={4}
          placeholder="One achievement per line"
          className={inputClass}
        />
      </label>
    </ItemCard>
  )
}

function EducationEditor({ item, onChange, onRemove }: EditorProps<EducationItem>) {
  return (
    <ItemCard onRemove={onRemove}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Institution" value={item.institution} onChange={(institution) => onChange({ ...item, institution })} />
        <Field label="Degree" value={item.degree} onChange={(degree) => onChange({ ...item, degree })} />
        <Field label="Field of study" value={item.field ?? ''} onChange={(field) => onChange({ ...item, field })} />
        <Field label="Location" value={item.location ?? ''} onChange={(location) => onChange({ ...item, location })} />
        <MonthField label="Start" value={item.startDate ?? ''} onChange={(startDate) => onChange({ ...item, startDate })} />
        <MonthField label="End" value={item.endDate ?? ''} onChange={(endDate) => onChange({ ...item, endDate })} />
      </div>
      <label className="mt-3 block text-sm text-slate-300">
        Description
        <textarea value={item.description ?? ''} onChange={(event) => onChange({ ...item, description: event.target.value })} rows={3} className={inputClass} />
      </label>
    </ItemCard>
  )
}

function ProjectEditor({ item, onChange, onRemove, onImprove, isImproving }: AiEditorProps<ProjectItem>) {
  return (
    <ItemCard onRemove={onRemove}>
      <div className="mb-3 flex justify-end">
        <AiButton compact loading={isImproving} onClick={onImprove}>
          Improve description
        </AiButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Project name" value={item.name} onChange={(name) => onChange({ ...item, name })} />
        <Field label="Project URL" type="url" value={item.url ?? ''} onChange={(url) => onChange({ ...item, url })} />
      </div>
      <label className="mt-3 block text-sm text-slate-300">
        Description
        <textarea value={item.description} onChange={(event) => onChange({ ...item, description: event.target.value })} rows={3} className={inputClass} />
      </label>
      <Field label="Technologies (comma separated)" value={item.technologies.join(', ')} onChange={(value) => onChange({ ...item, technologies: splitComma(value) })} />
    </ItemCard>
  )
}

function CertificationEditor({ item, onChange, onRemove }: EditorProps<CertificationItem>) {
  return (
    <ItemCard onRemove={onRemove}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Certification" value={item.name} onChange={(name) => onChange({ ...item, name })} />
        <Field label="Issuing organization" value={item.issuingOrg} onChange={(issuingOrg) => onChange({ ...item, issuingOrg })} />
        <MonthField label="Issue date" value={item.issueDate ?? ''} onChange={(issueDate) => onChange({ ...item, issueDate })} />
        <MonthField label="Expiration date" value={item.expirationDate ?? ''} onChange={(expirationDate) => onChange({ ...item, expirationDate })} />
      </div>
      <Field label="Credential URL" type="url" value={item.credentialUrl ?? ''} onChange={(credentialUrl) => onChange({ ...item, credentialUrl })} />
    </ItemCard>
  )
}

function ResumePreview({ resume }: { resume: ResumeForm }) {
  const info = resume.personalInfo
  return (
    <article className="mx-auto min-h-[900px] w-full max-w-[794px] bg-white p-8 text-slate-800 shadow-2xl sm:p-12">
      <header className="border-b-2 border-slate-800 pb-5 text-center">
        <h1 className="text-3xl font-bold tracking-wide">{info.fullName || 'Your Name'}</h1>
        <p className="mt-2 text-sm text-slate-600">{[info.email, info.phone, info.location].filter(Boolean).join(' • ')}</p>
        <p className="mt-1 text-xs text-slate-500">{[info.website, info.linkedin].filter(Boolean).join(' • ')}</p>
      </header>
      {resume.summary && (
        <PreviewSection title="Professional Summary">
          <p>{resume.summary}</p>
        </PreviewSection>
      )}
      {resume.skills.length > 0 && (
        <PreviewSection title="Skills">
          <p>{resume.skills.join(' • ')}</p>
        </PreviewSection>
      )}
      {resume.experiences.length > 0 && (
        <PreviewSection title="Experience">
          {resume.experiences.map((item, index) => (
            <PreviewItem key={index} title={item.position || 'Position'} subtitle={[item.company, item.location].filter(Boolean).join(', ')} date={`${formatMonth(item.startDate)} – ${item.isCurrent ? 'Present' : formatMonth(item.endDate)}`}>
              {item.accomplishments.length > 0 && (
                <ul className="list-disc space-y-1 pl-5">
                  {item.accomplishments.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </PreviewItem>
          ))}
        </PreviewSection>
      )}
      {resume.education.length > 0 && (
        <PreviewSection title="Education">
          {resume.education.map((item, index) => (
            <PreviewItem key={index} title={[item.degree, item.field].filter(Boolean).join(' in ') || 'Degree'} subtitle={[item.institution, item.location].filter(Boolean).join(', ')} date={[formatMonth(item.startDate), formatMonth(item.endDate)].filter(Boolean).join(' – ')}>
              {item.description && <p>{item.description}</p>}
            </PreviewItem>
          ))}
        </PreviewSection>
      )}
      {resume.projects.length > 0 && (
        <PreviewSection title="Projects">
          {resume.projects.map((item, index) => (
            <PreviewItem key={index} title={item.name || 'Project'} subtitle={item.technologies.join(', ')}>
              <p>{item.description}</p>
            </PreviewItem>
          ))}
        </PreviewSection>
      )}
      {resume.certifications.length > 0 && (
        <PreviewSection title="Certifications">
          {resume.certifications.map((item, index) => (
            <PreviewItem key={index} title={item.name || 'Certification'} subtitle={item.issuingOrg} date={formatMonth(item.issueDate)} />
          ))}
        </PreviewSection>
      )}
      {resume.customSections.map(
        (section) =>
          section.items.length > 0 && (
            <PreviewSection key={section.id} title={section.title}>
              {section.items.map((item, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {item}
                </p>
              ))}
            </PreviewSection>
          ),
      )}
    </article>
  )
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-[0.16em]">{title}</h2>
      <div className="text-sm leading-6">{children}</div>
    </section>
  )
}
function PreviewItem({ title, subtitle, date, children }: { title: string; subtitle?: string; date?: string; children?: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between gap-4">
        <div>
          <h3 className="font-bold">{title}</h3>
          {subtitle && <p className="italic text-slate-600">{subtitle}</p>}
        </div>
        {date && <span className="shrink-0 text-xs text-slate-500">{date}</span>}
      </div>
      {children && <div className="mt-1 text-slate-700">{children}</div>}
    </div>
  )
}
function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  const storageKey = `resume-builder-section:${title.toLowerCase().replace(/\s+/g, '-')}`
  const [expanded, setExpanded] = useState(() => window.localStorage.getItem(storageKey) === 'true')
  function toggle() {
    setExpanded((current) => {
      window.localStorage.setItem(storageKey, String(!current))
      return !current
    })
  }
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <button type="button" onClick={toggle} aria-expanded={expanded} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-cyan-300" aria-hidden="true">
          {expanded ? '▼' : '▶'}
        </span>
      </button>
      {expanded && <div className="border-t border-slate-800 p-5">{children}</div>}
    </section>
  )
}
function CollectionSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) {
  const empty = Children.count(children) === 0
  return (
    <EditorSection title={title}>
      {empty ? (
        <div className="rounded-xl border border-dashed border-slate-700 px-4 py-7 text-center">
          <span className="text-2xl" aria-hidden="true">
            ◇
          </span>
          <p className="mt-2 text-sm text-slate-400">No {title.toLowerCase()} added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">{children}</div>
      )}
      <button type="button" onClick={onAdd} className="mt-4 w-full rounded-lg border border-dashed border-slate-600 py-2.5 text-sm font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-400/5">
        + Add {title.toLowerCase().replace(/s$/, '')}
      </button>
    </EditorSection>
  )
}
function ItemCard({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
      <div className="mb-2 flex justify-end">
        <button type="button" onClick={onRemove} className="text-xs font-semibold text-red-300 hover:text-red-200">
          Remove
        </button>
      </div>
      {children}
    </div>
  )
}

function ReorderableItem({ index, count, onMove, children }: { index: number; count: number; onMove: (from: number, to: number) => void; children: ReactNode }) {
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const from = Number(event.dataTransfer.getData('text/resume-index'))
        if (Number.isInteger(from)) onMove(from, index)
      }}
    >
      <div className="mb-1 flex items-center justify-end gap-1 text-xs text-slate-500">
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/resume-index', String(index))
          }}
          className="cursor-grab rounded px-2 py-1 hover:bg-slate-800"
          title="Drag to reorder"
        >
          ⠿ Drag
        </button>
        <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} className="rounded px-2 py-1 hover:bg-slate-800 disabled:opacity-30" aria-label="Move up">
          ↑
        </button>
        <button type="button" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} className="rounded px-2 py-1 hover:bg-slate-800 disabled:opacity-30" aria-label="Move down">
          ↓
        </button>
      </div>
      {children}
    </div>
  )
}

function ImportReview({ draft, onCancel, onApply }: { draft: ResumeForm; onCancel: () => void; onApply: () => void }) {
  const counts = [`${draft.skills.length} skills`, `${draft.experiences.length} experiences`, `${draft.education.length} education entries`, `${draft.projects.length} projects`, `${draft.certifications.length} certifications`]
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="import-review-title">
      <section className="w-full max-w-3xl rounded-3xl border border-cyan-400/25 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Import complete</p>
        <h2 id="import-review-title" className="mt-2 text-2xl font-semibold">
          Review before replacing your editor
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Nothing has been saved. Continue to load this content into the builder, edit it, and save only when you are satisfied.</p>
        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/50 p-5">
          <h3 className="text-xl font-semibold">{draft.personalInfo.fullName || draft.title || 'Imported resume'}</h3>
          <p className="mt-2 text-sm text-slate-400">{counts.join(' · ')}</p>
          {draft.summary && <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-300">{draft.summary}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold">
            Keep existing data
          </button>
          <button type="button" onClick={onApply} className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
            Review imported data in builder
          </button>
        </div>
      </section>
    </div>
  )
}

function Notice({ tone, onClose, children }: { tone: 'success' | 'error'; onClose: () => void; children: ReactNode }) {
  return (
    <div className={`mx-auto mt-4 flex max-w-[1600px] items-center justify-between rounded-xl border px-4 py-3 text-sm sm:px-6 ${tone === 'success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-red-400/20 bg-red-400/10 text-red-200'}`}>
      <span>{children}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-sm text-slate-300">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  )
}
function MonthField({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <label className="block text-sm text-slate-300">
      {label}
      <input type="month" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  )
}

interface EditorProps<T> {
  item: T
  onChange: (item: T) => void
  onRemove: () => void
}
interface AiEditorProps<T> extends EditorProps<T> {
  onImprove: () => void
  isImproving: boolean
}
interface AiSuggestion {
  title: string
  content: string[]
  note?: string
  applyLabel?: string
  apply?: () => void
}
function AiButton({ children, onClick, loading, compact = false }: { children: ReactNode; onClick: () => void; loading: boolean; compact?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className={`rounded-lg border border-violet-400/40 font-semibold text-violet-200 hover:bg-violet-400/10 disabled:opacity-50 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'}`}>
      {loading ? 'Working…' : <>✦ {children}</>}
    </button>
  )
}
type UpdateForm = <K extends keyof ResumeForm>(key: K, value: ResumeForm[K]) => void
function updateItem<K extends 'experiences' | 'education' | 'projects' | 'certifications'>(form: ResumeForm, update: UpdateForm, key: K, index: number, value: ResumeForm[K][number]) {
  const items = [...form[key]] as ResumeForm[K]
  items[index] = value as never
  update(key, items)
}
function removeItem<K extends 'experiences' | 'education' | 'projects' | 'certifications'>(form: ResumeForm, update: UpdateForm, key: K, index: number) {
  update(key, form[key].filter((_, itemIndex) => itemIndex !== index) as ResumeForm[K])
}
function updateCustomSection(form: ResumeForm, update: UpdateForm, index: number, value: CustomSection) {
  const sections = [...form.customSections]
  sections[index] = value
  update('customSections', sections)
}
function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `section-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
function normalizeImport(imported: ResumeForm, current: ResumeForm): ResumeForm {
  return {
    ...imported,
    title: imported.title?.trim() || current.title,
    personalInfo: {
      fullName: imported.personalInfo?.fullName?.trim() || current.personalInfo.fullName,
      email: imported.personalInfo?.email?.trim() || current.personalInfo.email,
      phone: imported.personalInfo?.phone?.trim() || current.personalInfo.phone,
      location: imported.personalInfo?.location?.trim() || current.personalInfo.location,
      website: imported.personalInfo?.website?.trim() || '',
      linkedin: imported.personalInfo?.linkedin?.trim() || '',
    },
    summary: imported.summary ?? '',
    skills: imported.skills ?? [],
    experiences: imported.experiences ?? [],
    education: imported.education ?? [],
    projects: imported.projects ?? [],
    certifications: imported.certifications ?? [],
    customSections: (imported.customSections ?? []).map((section, order) => ({
      ...section,
      id: section.id || createId(),
      order,
    })),
  }
}
function splitComma(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}
function formatMonth(value?: string) {
  if (!value) return ''
  const [year, month] = value.split('-')
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)))
}

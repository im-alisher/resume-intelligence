import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import {
  createResume,
  deleteResume,
  listResumes,
  resumeKeys,
} from '../resume/resume-api'
import { createBlankResume } from '../resume/resume-defaults'

export function DashboardPage() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const resumes = useQuery({
    queryKey: resumeKeys.all,
    queryFn: () => listResumes(token!),
    enabled: Boolean(token),
  })
  const createMutation = useMutation({
    mutationFn: () => createResume(token!, createBlankResume(user!)),
    onSuccess: (resume) => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all })
      navigate(`/resumes/${resume.id}`)
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResume(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resumeKeys.all }),
  })
  const displayName = user?.firstName || user?.email

  function confirmDelete(id: string, title: string) {
    if (window.confirm(`Delete “${title}”? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="font-semibold text-cyan-300">Resume Intelligence</Link>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {displayName}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
              {createMutation.isPending ? 'Creating…' : 'Create resume'}
            </button>
            <button onClick={logout} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-900">Sign out</button>
          </div>
        </header>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div><h2 className="text-2xl font-semibold">Your resumes</h2><p className="mt-2 text-slate-400">Create, edit, and manage your professional resumes.</p></div>
          </div>
          {resumes.isLoading && <p className="mt-8 text-slate-400">Loading resumes…</p>}
          {resumes.isError && <p className="mt-8 text-red-300">Unable to load your resumes.</p>}
          {resumes.data?.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-12 text-center">
              <h3 className="text-xl font-semibold">Build your first resume</h3>
              <p className="mt-2 text-slate-400">Start with a clean professional template.</p>
              <button onClick={() => createMutation.mutate()} className="mt-6 rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Create resume</button>
            </div>
          )}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.data?.map((resume) => (
              <article key={resume.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{resume.status.toLowerCase()}</span>
                <h3 className="mt-4 truncate text-xl font-semibold">{resume.title}</h3>
                <p className="mt-2 text-sm text-slate-500">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                <div className="mt-6 flex gap-3">
                  <Link to={`/resumes/${resume.id}`} className="flex-1 rounded-lg bg-cyan-400 px-4 py-2 text-center text-sm font-semibold text-slate-950">Edit</Link>
                  <button onClick={() => confirmDelete(resume.id, resume.title)} disabled={deleteMutation.isPending} className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10">Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

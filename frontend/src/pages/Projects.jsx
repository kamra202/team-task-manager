import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import ProjectCard from '../components/ProjectCard'
import { projectsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const emptyForm = { title: '', description: '' }

export default function ProjectsPage() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    projectsApi
      .list()
      .then((res) => setProjects(res.data.data.projects || []))
      .catch((err) => toast.error(err.message || 'Failed to load projects'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setModal('create')
  }

  const openEdit = (p) => {
    setForm({ title: p.title, description: p.description || '' })
    setModal({ type: 'edit', id: p.id })
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      if (modal === 'create') {
        await projectsApi.create(form)
        toast.success('Project created')
      } else if (modal?.type === 'edit') {
        await projectsApi.update(modal.id, form)
        toast.success('Project updated')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete project “${p.title}”? Tasks in this project will be removed.`)) {
      return
    }
    try {
      await projectsApi.delete(p.id)
      toast.success('Project deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="mt-1 text-slate-600">
              {isAdmin ? 'Create and manage team projects.' : 'Projects you have tasks in.'}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              New project
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <p className="mt-8 text-slate-600">No projects yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={{
                  ...p,
                  task_count: p.tasks?.length ?? p.task_count,
                }}
                showActions={isAdmin}
                onEdit={openEdit}
                onDelete={remove}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => !saving && setModal(null)}
          />
          <form
            onSubmit={save}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {modal === 'create' ? 'New project' : 'Edit project'}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setModal(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import TaskCard from '../components/TaskCard'
import StatusBadge from '../components/StatusBadge'
import { projectsApi, tasksApi, usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const emptyTask = {
  title: '',
  description: '',
  status: 'todo',
  due_date: '',
  project_id: '',
  assigned_to: '',
}

export default function TasksPage() {
  const { isAdmin, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get('project_id')

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyTask)
  const [saving, setSaving] = useState(false)

  const loadTasks = () => {
    const params = {}
    if (projectFilter) params.project_id = Number(projectFilter)
    return tasksApi
      .list(params)
      .then((res) => setTasks(res.data.data.tasks || []))
      .catch((err) => toast.error(err.message || 'Failed to load tasks'))
  }

  const loadProjects = () =>
    projectsApi
      .list()
      .then((res) => setProjects(res.data.data.projects || []))
      .catch(() => {})

  const loadUsers = () =>
    usersApi
      .list()
      .then((res) => setMembers(res.data.data.users || []))
      .catch(() => {})

  useEffect(() => {
    setLoading(true)
    Promise.all([loadTasks(), loadProjects(), isAdmin ? loadUsers() : Promise.resolve()])
      .finally(() => setLoading(false))
  }, [projectFilter, isAdmin])

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        label: p.title,
      })),
    [projects],
  )

  const openCreate = () => {
    setForm({
      ...emptyTask,
      project_id: projectFilter || '',
    })
    setModal(true)
  }

  const saveTask = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.project_id || !form.assigned_to) {
      toast.error('Project and assignee are required.')
      return
    }
    setSaving(true)
    try {
      const body = {
        title: form.title.trim(),
        description: form.description,
        status: form.status,
        due_date: form.due_date || null,
        project_id: Number(form.project_id),
        assigned_to: Number(form.assigned_to),
      }
      await tasksApi.create(body)
      toast.success('Task created')
      setModal(false)
      loadTasks()
    } catch (err) {
      toast.error(err.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (taskId, status) => {
    try {
      await tasksApi.update(taskId, { status })
      toast.success('Status updated')
      loadTasks()
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  const deleteTask = async (t) => {
    if (!window.confirm(`Delete task “${t.title}”?`)) return
    try {
      await tasksApi.delete(t.id)
      toast.success('Task deleted')
      loadTasks()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const setProjectFilter = (id) => {
    if (!id) {
      searchParams.delete('project_id')
    } else {
      searchParams.set('project_id', id)
    }
    setSearchParams(searchParams)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
            <p className="mt-1 text-slate-600">
              {isAdmin ? 'Manage and assign work.' : 'Your assigned tasks.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={projectFilter || ''}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All projects</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {isAdmin && (
              <button
                type="button"
                onClick={openCreate}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                New task
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mt-6 hidden lg:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Task</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Project</th>
                    {isAdmin && (
                      <th className="px-4 py-3 font-semibold text-slate-700">Assignee</th>
                    )}
                    <th className="px-4 py-3 font-semibold text-slate-700">Due</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-slate-600">
                        No tasks found.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((t) => (
                      <tr key={t.id} className={t.is_overdue ? 'bg-red-50/50' : ''}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{t.title}</p>
                          {t.description && (
                            <p className="line-clamp-1 text-xs text-slate-500">{t.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{t.project_title || '—'}</td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-slate-600">{t.assignee_name || '—'}</td>
                        )}
                        <td className="px-4 py-3 text-slate-600">{t.due_date || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={t.status} />
                            {t.is_overdue && (
                              <span className="text-xs font-medium text-red-600">Overdue</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {(isAdmin || t.assigned_to === user?.id) && (
                            <select
                              value={t.status}
                              onChange={(e) => updateStatus(t.id, e.target.value)}
                              className="max-w-[140px] rounded border border-slate-200 px-2 py-1 text-xs"
                            >
                              <option value="todo">Todo</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => deleteTask(t)}
                              className="ml-2 text-xs font-medium text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 lg:hidden">
              {tasks.length === 0 ? (
                <p className="text-slate-600">No tasks found.</p>
              ) : (
                tasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    showAssignee={isAdmin}
                    canChangeStatus={isAdmin || t.assigned_to === user?.id}
                    onStatusChange={updateStatus}
                    onDelete={isAdmin ? deleteTask : undefined}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {modal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="absolute inset-0" aria-hidden onClick={() => !saving && setModal(false)} />
          <form
            onSubmit={saveTask}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">New task</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Project</label>
                <select
                  required
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Assign to</label>
                <select
                  required
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {members.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Due date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}

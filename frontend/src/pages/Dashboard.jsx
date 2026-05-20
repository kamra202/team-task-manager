import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { statsApi, tasksApi } from '../services/api'
import Layout from '../components/Layout'
import TaskCard from '../components/TaskCard'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  Todo: '#f59e0b',
  'In Progress': '#3b82f6',
  Done: '#10b981',
}

function StatCard({ title, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-1 text-3xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { isAdmin, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    statsApi
      .get()
      .then((res) => {
        if (!cancelled) setStats(res.data.data)
      })
      .catch((err) => toast.error(err.message || 'Failed to load stats'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleStatus = async (taskId, status) => {
    try {
      await tasksApi.update(taskId, { status })
      const res = await statsApi.get()
      setStats(res.data.data)
      toast.success('Status updated')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  if (loading || !stats) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  const statusChartData = [
    { name: 'Todo', value: stats.todo_tasks ?? 0 },
    { name: 'In Progress', value: stats.in_progress_tasks ?? 0 },
    { name: 'Done', value: stats.completed_tasks ?? 0 },
  ]

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          {isAdmin ? 'Organization overview' : 'Your assignments at a glance'}
        </p>

        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total projects" value={stats.total_projects} />
          <StatCard title="Total tasks" value={stats.total_tasks} />
          <StatCard title="Completed" value={stats.completed_tasks} accent="text-emerald-600" />
          <StatCard title="In Progress" value={stats.in_progress_tasks ?? 0} accent="text-blue-600" />
          <StatCard title="Todo" value={stats.todo_tasks ?? 0} accent="text-amber-600" />
          <StatCard title="Overdue" value={stats.overdue_tasks} accent="text-red-600" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Tasks by status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Status breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-800">Recent tasks</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {stats.recent_tasks?.length ? (
              stats.recent_tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  showAssignee={isAdmin}
                  canChangeStatus={isAdmin || t.assigned_to === user?.id}
                  onStatusChange={handleStatus}
                />
              ))
            ) : (
              <p className="text-slate-600">No tasks yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

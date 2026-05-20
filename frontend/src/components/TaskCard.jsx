import StatusBadge from './StatusBadge'

export default function TaskCard({
  task,
  onStatusChange,
  showAssignee,
  canChangeStatus,
  onDelete,
}) {
  const overdue = task.is_overdue

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${
        overdue ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-800">{task.title}</h3>
          {task.project_title && (
            <p className="mt-0.5 text-xs text-slate-500">Project: {task.project_title}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {overdue && (
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Overdue
            </span>
          )}
          <StatusBadge status={task.status} />
        </div>
      </div>
      {task.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        {task.due_date && <span>Due {task.due_date}</span>}
        {showAssignee && task.assignee_name && <span>Assigned: {task.assignee_name}</span>}
      </div>
      {canChangeStatus && (
        <div className="mt-3">
          <label className="sr-only" htmlFor={`status-${task.id}`}>
            Update status
          </label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-auto"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="mt-3 text-sm font-medium text-red-600 hover:underline"
        >
          Delete task
        </button>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  showActions,
}) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold text-slate-800">{project.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
          {project.description || 'No description'}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          {project.task_count != null ? `${project.task_count} task(s)` : ''}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/tasks?project_id=${project.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:flex-none"
        >
          View tasks
        </Link>
        {showActions && (
          <>
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(project)}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

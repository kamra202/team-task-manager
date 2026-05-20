const styles = {
  todo: 'bg-amber-100 text-amber-800 ring-amber-500/20',
  in_progress: 'bg-blue-100 text-blue-800 ring-blue-500/20',
  done: 'bg-emerald-100 text-emerald-800 ring-emerald-500/20',
}

const labels = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

export default function StatusBadge({ status }) {
  const cls = styles[status] || 'bg-slate-100 text-slate-700'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {labels[status] || status}
    </span>
  )
}

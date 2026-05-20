import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
]

export default function Sidebar({ open, onNavigate }) {
  const base =
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
  const active = 'bg-brand-50 text-brand-700'
  const inactive = 'text-slate-600 hover:bg-slate-100'

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close menu"
          onClick={onNavigate}
        />
      )}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-14 items-center border-b border-slate-100 px-4 lg:hidden">
          <span className="font-semibold text-slate-800">Menu</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

import { NavLink, Outlet } from 'react-router'
import Navbar from '../components/Navbar'

export default function AdminPage() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 shrink-0 border-r border-border bg-surface overflow-y-auto p-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3 px-3">
            Quản trị
          </p>
          <nav className="space-y-1">
            <SideLink to="/admin/species">Quản lý loài cá</SideLink>
            <SideLink to="/admin/compatibility">Ngoại lệ tương thích</SideLink>
            <SideLink to="/admin/flags">Báo cáo vi phạm</SideLink>
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SideLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-light text-primary'
            : 'text-ink-muted hover:text-ink hover:bg-background'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

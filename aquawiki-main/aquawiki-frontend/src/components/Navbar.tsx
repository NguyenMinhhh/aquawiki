import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingFlags, setPendingFlags] = useState(0)

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    api.get<{ count: number }>('/api/admin/flags/pending-count')
      .then(r => setPendingFlags(r.data.count))
      .catch(() => {})
  }, [user?.role])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-14 md:h-16 bg-surface border-b border-border flex items-center px-4 md:px-6 gap-4">
      <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="14" cy="14" rx="12" ry="8" fill="var(--color-primary-light)" />
          <path
            d="M6 14c2-4 8-7 14-4-6-1-10 2-12 6 2 4 6 6 12 5-6 3-12 0-14-7z"
            fill="var(--color-primary)"
          />
          <circle cx="9" cy="12" r="1.2" fill="var(--color-primary)" />
        </svg>
        <span className="text-base font-bold text-primary tracking-tight">
          AquaWiki
        </span>
      </Link>

      {user && (
        <nav className="flex items-center gap-5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'
              }`
            }
          >
            Bách khoa cá cảnh
          </NavLink>
          <NavLink
            to="/simulator"
            className={({ isActive }) =>
              `text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'
              }`
            }
          >
            Mô phỏng hồ
          </NavLink>
          <NavLink
            to="/tanks"
            className={({ isActive }) =>
              `text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'
              }`
            }
          >
            Bể của tôi
          </NavLink>
          <NavLink
            to="/identify"
            className={({ isActive }) =>
              `text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'
              }`
            }
          >
            Nhận diện cá
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin/flags"
              className={({ isActive }) =>
                `relative text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              Quản trị
              {pendingFlags > 0 && (
                <span className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingFlags > 99 ? '99+' : pendingFlags}
                </span>
              )}
            </NavLink>
          )}
        </nav>
      )}

      {user && (
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm text-ink-muted hidden sm:block truncate max-w-[160px]">
            {user.displayName ?? user.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-ink-muted hover:text-danger transition-colors duration-300 whitespace-nowrap"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  )
}

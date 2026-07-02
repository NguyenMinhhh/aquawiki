import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Welcome card */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <ellipse cx="14" cy="14" rx="12" ry="8" fill="var(--color-primary-light)" />
                  <path
                    d="M6 14c2-4 8-7 14-4-6-1-10 2-12 6 2 4 6 6 12 5-6 3-12 0-14-7z"
                    fill="var(--color-primary)"
                  />
                  <circle cx="9" cy="12" r="1.2" fill="var(--color-primary)" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink">
                  Xin chào, {user?.displayName ?? user?.email}!
                </h1>
                <p className="text-sm text-ink-muted">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                </p>
              </div>
            </div>

            <p className="text-sm text-ink-muted leading-relaxed">
              AquaWiki đang phát triển. Các tính năng tra cứu loài cá và kiểm tra tương thích sẽ sớm
              ra mắt.
            </p>
          </div>

          {/* Feature cards — placeholder */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-5 opacity-60">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-primary)">
                  <path d="M3 8a5 5 0 1110 0A5 5 0 013 8zm5-6.5a.5.5 0 00-.5.5v.5H7a.5.5 0 000 1h.5V5A3.5 3.5 0 014 8.5H3.5a.5.5 0 000 1H4A4.5 4.5 0 008.5 5V3.5H9a.5.5 0 000-1h-.5V2a.5.5 0 00-.5-.5z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-ink mb-1">Simulator</h2>
              <p className="text-xs text-ink-muted">Kiểm tra tương thích loài cá — Sắp ra mắt</p>
            </div>

            <div className="bg-surface rounded-xl border border-border p-5 opacity-60">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-primary)">
                  <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zM5 7a.5.5 0 000 1h6a.5.5 0 000-1H5zm0 3a.5.5 0 000 1h4a.5.5 0 000-1H5zM5 4a.5.5 0 000 1h6a.5.5 0 000-1H5z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-ink mb-1">Bách khoa</h2>
              <p className="text-xs text-ink-muted">Tra cứu loài cá cảnh — Sắp ra mắt</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import api from '../services/api'

interface ApiError {
  status: number
  error: string
  message: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/api/auth/register', { email, password, displayName })
      navigate('/login', { state: { registered: true } })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: ApiError } }
      const data = axiosError.response?.data
      if (data?.status === 409) {
        setError('Email này đã được sử dụng.')
      } else if (data?.status === 400) {
        setError(data.message ?? 'Thông tin không hợp lệ.')
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Brand mark */}
      <div className="flex items-center gap-2 mb-8">
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <ellipse cx="14" cy="14" rx="12" ry="8" fill="var(--color-primary-light)" />
          <path
            d="M6 14c2-4 8-7 14-4-6-1-10 2-12 6 2 4 6 6 12 5-6 3-12 0-14-7z"
            fill="var(--color-primary)"
          />
          <circle cx="9" cy="12" r="1.2" fill="var(--color-primary)" />
        </svg>
        <span className="text-xl font-bold text-primary tracking-tight">AquaWiki</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-ink mb-1">Tạo tài khoản</h1>
        <p className="text-sm text-ink-muted mb-6">Bắt đầu tra cứu cá cảnh miễn phí.</p>

        {/* Error banner */}
        {error && (
          <div className="alert-enter mb-5 flex items-start gap-2.5 px-4 py-3 bg-danger-light border border-danger/30 rounded-lg text-sm text-danger">
            <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="displayName" className="block text-sm font-medium text-ink">
              Tên hiển thị
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tên của bạn"
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-disabled transition-colors duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email <span className="text-danger">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-disabled transition-colors duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Mật khẩu <span className="text-danger">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 8 ký tự"
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-disabled transition-colors duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-muted text-center">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

interface FlagResponse {
  id: number
  species: { id: number; commonName: string; scientificName: string }
  reportedByEmail: string
  reason: string
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED'
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  REVIEWED: 'Đã xem xét',
  DISMISSED: 'Bỏ qua',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warning-light text-warning',
  REVIEWED: 'bg-success-light text-success',
  DISMISSED: 'bg-border text-ink-muted',
}

export default function FlagReviewPage() {
  const [flags, setFlags] = useState<FlagResponse[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get<FlagResponse[]>('/api/admin/flags')
      .then(r => setFlags(r.data))
      .catch(() => setError('Không thể tải danh sách báo cáo.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleStatusChange(id: number, status: string) {
    await api.patch(`/api/admin/flags/${id}/status`, { status })
    load()
  }

  const filtered = filter === 'ALL' ? flags : flags.filter(f => f.status === filter)

  if (loading) return <p className="text-ink-muted">Đang tải...</p>
  if (error) return <p className="text-danger">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Báo cáo vi phạm</h1>
        <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
          {['ALL', 'PENDING', 'REVIEWED', 'DISMISSED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-surface shadow-sm text-ink'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {s === 'ALL' ? 'Tất cả' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-muted">Không có báo cáo nào.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(flag => (
            <div key={flag.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-ink text-sm">{flag.species.commonName}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[flag.status]}`}>
                      {STATUS_LABELS[flag.status]}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted mb-1 italic">{flag.species.scientificName}</p>
                  <p className="text-sm text-ink leading-relaxed">{flag.reason}</p>
                  <p className="text-xs text-ink-muted mt-2">
                    Báo cáo bởi: {flag.reportedByEmail} · {new Date(flag.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {flag.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleStatusChange(flag.id, 'REVIEWED')}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-success-light text-success hover:bg-success hover:text-white transition-colors"
                    >
                      Xem xét
                    </button>
                    <button
                      onClick={() => handleStatusChange(flag.id, 'DISMISSED')}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-background border border-border text-ink-muted hover:text-ink transition-colors"
                    >
                      Bỏ qua
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

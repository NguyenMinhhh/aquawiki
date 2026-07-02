import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../components/Navbar'
import api from '../services/api'
import type { Tank, ReminderStatus } from '../types/tank'

const STATUS_STYLE: Record<ReminderStatus, { dot: string; text: string; label: string }> = {
  OK: { dot: 'bg-success', text: 'text-success', label: 'Ổn định' },
  DUE: { dot: 'bg-warning', text: 'text-warning', label: 'Đến hạn thay nước hôm nay' },
  OVERDUE: { dot: 'bg-danger', text: 'text-danger', label: 'Quá hạn thay nước' },
}

export default function MyTanksPage() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get<Tank[]>('/api/tanks')
      setTanks(res.data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function markWaterChange(id: number) {
    setBusyId(id)
    try {
      const res = await api.post<Tank>(`/api/tanks/${id}/water-change`)
      setTanks(prev => prev.map(t => (t.id === id ? res.data : t)))
    } catch {
      // keep current state; error surfaced by interceptor on 401
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: number) {
    if (!confirm('Xóa bể này?')) return
    setBusyId(id)
    try {
      await api.delete(`/api/tanks/${id}`)
      setTanks(prev => prev.filter(t => t.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  const overdueCount = tanks.filter(t => t.reminderStatus !== 'OK').length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">Bể của tôi</h1>
            <p className="text-sm text-ink-muted mt-0.5">
              {overdueCount > 0
                ? `${overdueCount} bể cần thay nước`
                : 'Quản lý bể và lịch thay nước'}
            </p>
          </div>
          <button
            onClick={() => navigate('/tanks/new')}
            className="shrink-0 text-sm font-medium bg-primary text-white rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            + Thêm bể
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-danger-light border border-danger/30 rounded-xl p-4 text-sm text-danger">
            Không tải được danh sách bể. Vui lòng thử lại.
          </div>
        )}

        {!loading && !error && tanks.length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <p className="text-sm text-ink-muted mb-4">Bạn chưa có bể nào.</p>
            <button
              onClick={() => navigate('/tanks/new')}
              className="text-sm font-medium text-primary hover:underline"
            >
              Tạo bể đầu tiên →
            </button>
          </div>
        )}

        <div className="space-y-3">
          {tanks.map(tank => {
            const style = STATUS_STYLE[tank.reminderStatus]
            return (
              <div key={tank.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-ink truncate">{tank.name}</h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {tank.lengthCm}×{tank.widthCm}×{tank.heightCm} cm · {tank.volumeLiters} lít
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                  <div className="text-ink-muted">
                    {tank.waterChangeIntervalDays
                      ? <>Chu kỳ {tank.waterChangeIntervalDays} ngày · Lần tới: <span className="text-ink font-medium">{tank.nextDueDate ?? '—'}</span></>
                      : <span className="text-ink-disabled">Chưa đặt lịch thay nước</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {tank.reminderStatus !== 'OK' && (
                      <button
                        onClick={() => markWaterChange(tank.id)}
                        disabled={busyId === tank.id}
                        className="font-medium text-primary hover:underline disabled:opacity-40"
                      >
                        Đã thay nước
                      </button>
                    )}
                    <Link to={`/simulator?tankId=${tank.id}`} className="font-medium text-primary hover:underline">Mô phỏng</Link>
                    <Link to={`/tanks/${tank.id}/edit`} className="text-ink-muted hover:text-ink">Sửa</Link>
                    <button
                      onClick={() => remove(tank.id)}
                      disabled={busyId === tank.id}
                      className="text-ink-disabled hover:text-danger disabled:opacity-40"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

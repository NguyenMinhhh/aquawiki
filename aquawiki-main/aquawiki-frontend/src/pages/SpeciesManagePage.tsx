import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import api from '../services/api'
import type { Species } from '../types/species'

export default function SpeciesManagePage() {
  const location = useLocation()
  const [successMsg, setSuccessMsg] = useState<string | null>(
    (location.state as { success?: string } | null)?.success ?? null
  )
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ data: Species[]; total: number }>('/api/species?size=200')
      .then(r => setSpecies(r.data.data))
      .catch(() => setError('Không thể tải danh sách loài.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleStatusToggle(s: Species) {
    const next = s.status === 'APPROVED' ? 'DRAFT' : 'APPROVED'
    await api.patch(`/api/species/${s.id}/status`, { status: next })
    load()
  }

  async function handleDelete(s: Species) {
    if (!confirm(`Xóa "${s.commonName}"? Không thể hoàn tác.`)) return
    await api.delete(`/api/species/${s.id}`)
    load()
  }

  if (loading) return <p className="text-ink-muted">Đang tải...</p>
  if (error) return <p className="text-danger">{error}</p>

  return (
    <div>
      {successMsg && (
        <div className="mb-5 p-3 bg-success-light text-success rounded-lg text-sm flex items-center justify-between alert-enter">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-4 text-success hover:opacity-70">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Quản lý loài cá</h1>
        <Link
          to="/admin/species/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Thêm loài mới
        </Link>
      </div>

      {species.length === 0 ? (
        <p className="text-ink-muted">Chưa có loài nào.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-4 py-3 font-semibold text-ink">Tên loài</th>
                <th className="text-left px-4 py-3 font-semibold text-ink hidden md:table-cell">Tên khoa học</th>
                <th className="text-left px-4 py-3 font-semibold text-ink">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {species.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{s.commonName}</td>
                  <td className="px-4 py-3 text-ink-muted italic hidden md:table-cell">{s.scientificName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleStatusToggle(s)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          s.status === 'APPROVED'
                            ? 'bg-warning-light text-warning hover:bg-warning hover:text-white'
                            : 'bg-success-light text-success hover:bg-success hover:text-white'
                        }`}
                      >
                        {s.status === 'APPROVED' ? 'Ẩn' : 'Duyệt'}
                      </button>
                      <Link
                        to={`/admin/species/${s.id}/edit`}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(s)}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-danger-light text-danger hover:bg-danger hover:text-white transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      status === 'APPROVED'
        ? 'bg-success-light text-success'
        : 'bg-warning-light text-warning'
    }`}>
      {status === 'APPROVED' ? 'Đã duyệt' : 'Nháp'}
    </span>
  )
}

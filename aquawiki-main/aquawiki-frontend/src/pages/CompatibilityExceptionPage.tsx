import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import type { Species } from '../types/species'

interface ExceptionResponse {
  id: number
  speciesA: { id: number; commonName: string; scientificName: string }
  speciesB: { id: number; commonName: string; scientificName: string }
  level: string
  note: string | null
  verifiedBy: string | null
  createdAt: string
}

const LEVEL_LABELS: Record<string, string> = {
  COMPATIBLE: 'Tương thích',
  CAUTION: 'Cần chú ý',
  INCOMPATIBLE: 'Không tương thích',
}

const LEVEL_COLORS: Record<string, string> = {
  COMPATIBLE: 'bg-success-light text-success',
  CAUTION: 'bg-warning-light text-warning',
  INCOMPATIBLE: 'bg-danger-light text-danger',
}

export default function CompatibilityExceptionPage() {
  const [exceptions, setExceptions] = useState<ExceptionResponse[]>([])
  const [allSpecies, setAllSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<ExceptionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get<ExceptionResponse[]>('/api/compatibility/exceptions'),
      api.get<{ data: Species[] }>('/api/species?size=500'),
    ])
      .then(([ex, sp]) => {
        setExceptions(ex.data)
        setAllSpecies(sp.data.data)
      })
      .catch(() => setError('Không thể tải dữ liệu.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: number) {
    if (!confirm('Xóa ngoại lệ này?')) return
    await api.delete(`/api/compatibility/exceptions/${id}`)
    load()
  }

  function openCreate() {
    setEditTarget(null)
    setShowForm(true)
  }

  function openEdit(ex: ExceptionResponse) {
    setEditTarget(ex)
    setShowForm(true)
  }

  if (loading) return <p className="text-ink-muted">Đang tải...</p>
  if (error) return <p className="text-danger">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Ngoại lệ tương thích</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Thêm ngoại lệ
        </button>
      </div>

      {showForm && (
        <ExceptionForm
          species={allSpecies}
          editTarget={editTarget}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}

      {exceptions.length === 0 ? (
        <p className="text-ink-muted">Chưa có ngoại lệ nào.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-4 py-3 font-semibold text-ink">Loài A</th>
                <th className="text-left px-4 py-3 font-semibold text-ink">Loài B</th>
                <th className="text-left px-4 py-3 font-semibold text-ink">Mức độ</th>
                <th className="text-left px-4 py-3 font-semibold text-ink hidden lg:table-cell">Ghi chú</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map(ex => (
                <tr key={ex.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3 text-ink">{ex.speciesA.commonName}</td>
                  <td className="px-4 py-3 text-ink">{ex.speciesB.commonName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[ex.level]}`}>
                      {LEVEL_LABELS[ex.level] ?? ex.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted hidden lg:table-cell max-w-xs truncate">
                    {ex.note ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(ex)}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id)}
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

function ExceptionForm({
  species,
  editTarget,
  onClose,
  onSaved,
}: {
  species: Species[]
  editTarget: ExceptionResponse | null
  onClose: () => void
  onSaved: () => void
}) {
  const [speciesAId, setSpeciesAId] = useState(editTarget ? String(editTarget.speciesA.id) : '')
  const [speciesBId, setSpeciesBId] = useState(editTarget ? String(editTarget.speciesB.id) : '')
  const [level, setLevel] = useState(editTarget?.level ?? 'COMPATIBLE')
  const [note, setNote] = useState(editTarget?.note ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editTarget) {
        await api.put(`/api/compatibility/exceptions/${editTarget.id}`, { level, note: note || null })
      } else {
        await api.post('/api/compatibility/exceptions', {
          speciesAId: Number(speciesAId),
          speciesBId: Number(speciesBId),
          level,
          note: note || null,
        })
      }
      onSaved()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-6 bg-surface border border-border rounded-xl p-6">
      <h2 className="text-base font-semibold text-ink mb-4">
        {editTarget ? 'Chỉnh sửa ngoại lệ' : 'Thêm ngoại lệ mới'}
      </h2>

      {error && <div className="mb-3 p-3 bg-danger-light text-danger rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!editTarget && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Loài A<span className="text-danger ml-0.5">*</span></label>
              <select
                value={speciesAId}
                onChange={e => setSpeciesAId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">-- Chọn loài --</option>
                {species.map(s => (
                  <option key={s.id} value={s.id}>{s.commonName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Loài B<span className="text-danger ml-0.5">*</span></label>
              <select
                value={speciesBId}
                onChange={e => setSpeciesBId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">-- Chọn loài --</option>
                {species.map(s => (
                  <option key={s.id} value={s.id}>{s.commonName}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Mức độ tương thích<span className="text-danger ml-0.5">*</span></label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="COMPATIBLE">Tương thích</option>
            <option value="CAUTION">Cần chú ý</option>
            <option value="INCOMPATIBLE">Không tương thích</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Ghi chú</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder="Lý do ngoại lệ..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border text-ink-muted rounded-lg text-sm font-medium hover:text-ink transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

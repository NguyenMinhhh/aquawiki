import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import Navbar from '../components/Navbar'
import api from '../services/api'
import type { Tank, TankRequest } from '../types/tank'
import type { Species, PagedResponse } from '../types/species'

interface Item { species: Species; quantity: number }

export default function TankFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [length, setLength] = useState<number | ''>('')
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')
  const [interval, setInterval] = useState<number | ''>('')
  const [lastChange, setLastChange] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // species search
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Species[]>([])
  const [showDrop, setShowDrop] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isEdit) return
    api.get<Tank>(`/api/tanks/${id}`)
      .then(r => {
        const t = r.data
        setName(t.name)
        setLength(t.lengthCm)
        setWidth(t.widthCm)
        setHeight(t.heightCm)
        setInterval(t.waterChangeIntervalDays ?? '')
        setLastChange(t.lastWaterChangeDate ?? '')
        setItems((t.species ?? []).map(s => ({ species: s.species, quantity: s.quantity })))
      })
      .catch(() => setError('Không tải được bể'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSpecies = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setShowDrop(false); return }
    try {
      const res = await api.get<PagedResponse<Species>>('/api/species', { params: { search: q, size: 10, page: 0 } })
      setResults(res.data.data)
      setShowDrop(true)
    } catch { setResults([]) }
  }, [])

  function onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSpecies(q), 300)
  }

  function addSpecies(sp: Species) {
    setItems(prev => prev.some(i => i.species.id === sp.id) ? prev : [...prev, { species: sp, quantity: 1 }])
    setQuery(''); setResults([]); setShowDrop(false)
  }
  function removeItem(sid: number) { setItems(prev => prev.filter(i => i.species.id !== sid)) }
  function changeQty(sid: number, delta: number) {
    setItems(prev => prev.map(i => i.species.id === sid ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
  }

  const L = Number(length), W = Number(width), H = Number(height)
  const hasValidDims = length !== '' && width !== '' && height !== '' && L > 0 && W > 0 && H > 0
  const volume = hasValidDims ? (L * W * H) / 1000 : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Vui lòng nhập tên bể'); return }
    if (!hasValidDims) { setError('Kích thước phải lớn hơn 0'); return }
    if (interval !== '' && Number(interval) < 1) { setError('Chu kỳ thay nước phải ít nhất 1 ngày'); return }

    const payload: TankRequest = {
      name: name.trim(),
      lengthCm: L,
      widthCm: W,
      heightCm: H,
      waterChangeIntervalDays: interval === '' ? null : Number(interval),
      lastWaterChangeDate: lastChange || null,
      species: items.map(i => ({ speciesId: i.species.id, quantity: i.quantity })),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/api/tanks/${id}`, payload)
      } else {
        await api.post('/api/tanks', payload)
      }
      navigate('/tanks')
    } catch {
      setError('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-6 max-w-lg mx-auto w-full">
        <button onClick={() => navigate('/tanks')} className="text-sm text-ink-muted hover:text-primary mb-6">
          ← Bể của tôi
        </button>
        <h1 className="text-2xl font-bold text-ink mb-6">{isEdit ? 'Sửa bể' : 'Thêm bể mới'}</h1>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <Field label="Tên bể">
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: Bể phòng khách"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Dài (cm)', value: length, set: setLength },
              { label: 'Rộng (cm)', value: width, set: setWidth },
              { label: 'Cao (cm)', value: height, set: setHeight },
            ].map(({ label, value, set }) => (
              <Field key={label} label={label}>
                <input
                  type="number" min="1" value={value}
                  onChange={e => set(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </Field>
            ))}
          </div>

          <div className="bg-background rounded-lg px-3 py-2 border border-border">
            <span className="text-xs text-ink-muted">Thể tích: </span>
            <span className="text-sm font-semibold text-ink">
              {volume !== null ? `${volume.toFixed(1)} lít` : '—'}
            </span>
          </div>

          {/* Species composition */}
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Cá trong bể (để mô phỏng)</p>
            <div className="relative" ref={searchRef}>
              <input
                type="text" value={query} onChange={onSearch}
                onFocus={() => results.length > 0 && setShowDrop(true)}
                placeholder="Tìm loài cá... (≥2 ký tự)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {showDrop && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {results.length === 0
                    ? <p className="px-3 py-2 text-xs text-ink-muted">Không tìm thấy loài nào</p>
                    : results.map(sp => (
                      <button key={sp.id} type="button" onClick={() => addSpecies(sp)}
                        className="w-full text-left px-3 py-2 hover:bg-background border-b border-border last:border-0">
                        <p className="text-sm text-ink leading-tight">{sp.commonName}</p>
                        <p className="text-xs text-ink-muted italic">{sp.scientificName}</p>
                      </button>
                    ))}
                </div>
              )}
            </div>
            {items.length === 0
              ? <p className="text-xs text-ink-disabled">Chưa có cá nào. Thêm cá để mô phỏng tương thích & bioload.</p>
              : <div className="space-y-2">
                  {items.map(it => (
                    <div key={it.species.id} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                      <span className="flex-1 min-w-0 text-xs font-medium text-ink truncate">{it.species.commonName}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => changeQty(it.species.id, -1)} disabled={it.quantity <= 1}
                          className="w-6 h-6 rounded text-sm font-bold text-ink-muted hover:bg-border disabled:opacity-30">−</button>
                        <span className="w-6 text-center text-sm font-semibold text-ink">{it.quantity}</span>
                        <button type="button" onClick={() => changeQty(it.species.id, 1)}
                          className="w-6 h-6 rounded text-sm font-bold text-ink-muted hover:bg-border">+</button>
                      </div>
                      <button type="button" onClick={() => removeItem(it.species.id)}
                        className="text-ink-disabled hover:text-danger ml-1 text-base leading-none" aria-label="Xóa">×</button>
                    </div>
                  ))}
                </div>}
          </div>

          <div className="pt-2 border-t border-border space-y-4">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Lịch thay nước (tùy chọn)</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Chu kỳ (ngày)">
                <input
                  type="number" min="1" value={interval}
                  onChange={e => setInterval(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="VD: 7"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </Field>
              <Field label="Lần thay gần nhất">
                <input
                  type="date" value={lastChange} onChange={e => setLastChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </Field>
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            type="submit" disabled={saving}
            className="w-full text-sm font-medium bg-primary text-white rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bể'}
          </button>
        </form>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1">{label}</label>
      {children}
    </div>
  )
}

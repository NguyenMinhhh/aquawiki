import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import Navbar from '../components/Navbar'
import TankCanvas from '../components/TankCanvas'
import CompatibilityWarning from '../components/CompatibilityWarning'
import { useCompatibility } from '../hooks/useCompatibility'
import type { Species, PagedResponse } from '../types/species'
import type { Tank } from '../types/tank'
import api from '../services/api'

interface TankItem {
  species: Species
  quantity: number
}

type BioloadColor = 'success' | 'warning' | 'danger' | null

function getBioloadColor(pct: number | null): BioloadColor {
  if (pct === null) return null
  if (pct < 80) return 'success'
  if (pct <= 100) return 'warning'
  return 'danger'
}

export default function SimulatorPage() {
  // Dimension state
  const [length, setLength] = useState<number | ''>('')
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')

  // Species list state
  const [tankItems, setTankItems] = useState<TankItem[]>([])

  // Load a saved tank into the simulator (from "Bể của tôi" → Mô phỏng)
  const [searchParams] = useSearchParams()
  const tankId = searchParams.get('tankId')
  const [loadedTankName, setLoadedTankName] = useState<string | null>(null)

  useEffect(() => {
    if (!tankId) return
    api.get<Tank>(`/api/tanks/${tankId}`)
      .then(r => {
        const t = r.data
        setLength(t.lengthCm)
        setWidth(t.widthCm)
        setHeight(t.heightCm)
        setTankItems((t.species ?? []).map(s => ({ species: s.species, quantity: s.quantity })))
        setLoadedTankName(t.name)
      })
      .catch(() => { /* tank not found / not owned — leave simulator empty */ })
  }, [tankId])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Species[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Computed values
  const L = Number(length)
  const W = Number(width)
  const H = Number(height)

  const hasValidDims = length !== '' && width !== '' && height !== '' && L > 0 && W > 0 && H > 0
  const hasOversize = (length !== '' && L > 1000) || (width !== '' && W > 1000) || (height !== '' && H > 1000)
  const hasZeroOrNeg = (length !== '' && L <= 0) || (width !== '' && W <= 0) || (height !== '' && H <= 0)

  const tankVolume = hasValidDims ? (L * W * H) / 1000 : null

  const bioloadPercent =
    tankVolume && tankVolume > 0
      ? (tankItems.reduce((sum, item) => sum + item.species.bioloadFactor * item.quantity, 0) / tankVolume) * 100
      : null

  const bioloadColor = getBioloadColor(bioloadPercent)
  const totalFish = tankItems.reduce((sum, item) => sum + item.quantity, 0)

  // Compatibility check
  const speciesIds = tankItems.map(i => i.species.id)
  const { result: compatResult, loading: compatLoading, error: compatError } = useCompatibility(speciesIds)

  const compatibilityColor: 'success' | 'warning' | 'danger' | null =
    compatResult === null ? null :
    compatResult.groupResult === 'INCOMPATIBLE' ? 'danger' :
    compatResult.groupResult === 'CAUTION' ? 'warning' : 'success'

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Species search with debounce
  const fetchSpecies = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    setSearching(true)
    try {
      const res = await api.get<PagedResponse<Species>>('/api/species', {
        params: { search: q, size: 10, page: 0 },
      })
      setSearchResults(res.data.data)
      setShowDropdown(true)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSpecies(q), 300)
  }

  function addSpecies(species: Species) {
    if (tankItems.some(item => item.species.id === species.id)) {
      setSearchQuery('')
      setShowDropdown(false)
      return
    }
    setTankItems(prev => [...prev, { species, quantity: 1 }])
    setSearchQuery('')
    setShowDropdown(false)
    setSearchResults([])
  }

  function removeSpecies(id: number) {
    setTankItems(prev => prev.filter(item => item.species.id !== id))
  }

  function updateQty(id: number, delta: number) {
    setTankItems(prev =>
      prev.map(item =>
        item.species.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  function clearAll() {
    setLength('')
    setWidth('')
    setHeight('')
    setTankItems([])
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr_300px] gap-4 md:gap-6 h-full">

          {/* ───── LEFT PANEL: Inputs + Species list ───── */}
          <aside className="overflow-y-auto space-y-4 pr-1">

            {loadedTankName && (
              <div className="bg-primary-light border border-primary/30 rounded-lg px-3 py-2 text-xs text-primary font-medium">
                Đang mô phỏng bể: {loadedTankName}
              </div>
            )}

            {/* Dimension inputs */}
            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-sm font-semibold text-ink">Bể cá của bạn</h2>

              <div className="space-y-2">
                {[
                  { label: 'Chiều dài (cm)', value: length, set: setLength },
                  { label: 'Chiều rộng (cm)', value: width, set: setWidth },
                  { label: 'Chiều cao (cm)', value: height, set: setHeight },
                ].map(({ label, value, set }) => (
                  <div key={label}>
                    <label className="text-xs text-ink-muted block mb-1">{label}</label>
                    <input
                      type="number"
                      min="1"
                      value={value}
                      onChange={e => set(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                ))}
              </div>

              {/* Validation messages */}
              {hasZeroOrNeg && (
                <p className="text-xs text-danger">Kích thước phải lớn hơn 0</p>
              )}
              {hasOversize && !hasZeroOrNeg && (
                <p className="text-xs text-warning">Kích thước rất lớn, kiểm tra lại đơn vị (cm)</p>
              )}

              {/* Volume display */}
              <div className="pt-1 border-t border-border">
                <p className="text-xs text-ink-muted">Thể tích bể</p>
                <p className="text-lg font-bold text-ink">
                  {tankVolume !== null ? `${tankVolume.toFixed(1)} lít` : '—'}
                </p>
              </div>
            </section>

            {/* Species search */}
            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-sm font-semibold text-ink">Thêm loài cá</h2>

              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  placeholder="Tìm loài cá... (nhập ≥2 ký tự)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 max-h-52 overflow-y-auto">
                    {searching && (
                      <p className="px-3 py-2 text-xs text-ink-muted">Đang tìm...</p>
                    )}
                    {!searching && searchResults.length === 0 && (
                      <p className="px-3 py-2 text-xs text-ink-muted">Không tìm thấy loài nào</p>
                    )}
                    {searchResults.map(sp => (
                      <button
                        key={sp.id}
                        onClick={() => addSpecies(sp)}
                        className="w-full text-left px-3 py-2 hover:bg-background transition-colors border-b border-border last:border-0"
                      >
                        <p className="text-sm text-ink leading-tight">{sp.commonName}</p>
                        <p className="text-xs text-ink-muted italic">{sp.scientificName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tank items list */}
              {tankItems.length === 0 ? (
                <p className="text-xs text-ink-disabled text-center py-2">
                  Chưa có loài nào trong bể
                </p>
              ) : (
                <div className="space-y-2">
                  {tankItems.map(item => (
                    <div
                      key={item.species.id}
                      className="flex items-center gap-2 bg-background rounded-lg px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{item.species.commonName}</p>
                        <p className="text-xs text-ink-muted">
                          bioload ×{item.species.bioloadFactor}
                        </p>
                      </div>
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQty(item.species.id, -1)}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 rounded text-sm font-bold text-ink-muted hover:bg-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.species.id, 1)}
                          className="w-6 h-6 rounded text-sm font-bold text-ink-muted hover:bg-border transition-colors"
                        >
                          +
                        </button>
                      </div>
                      {/* Remove */}
                      <button
                        onClick={() => removeSpecies(item.species.id)}
                        className="text-ink-disabled hover:text-danger transition-colors ml-1 text-base leading-none"
                        aria-label="Xóa"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={clearAll}
                    className="w-full text-xs text-ink-disabled hover:text-danger transition-colors text-center py-1"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </section>
          </aside>

          {/* ───── CENTER PANEL: Tank Canvas ───── */}
          <section className="bg-surface border border-border rounded-xl p-4 overflow-hidden flex flex-col min-h-0">
            <h2 className="text-sm font-semibold text-ink mb-3 shrink-0">Mô phỏng 3D</h2>
            <TankCanvas
              length={length}
              width={width}
              height={height}
              tankItems={tankItems}
              bioloadColor={bioloadColor}
              compatibilityColor={compatibilityColor}
            />
          </section>

          {/* ───── RIGHT PANEL: Bioload stats ───── */}
          <aside className="overflow-y-auto space-y-4 pl-1">
            {/* Compatibility warnings — above bioload */}
            <CompatibilityWarning
              result={compatResult}
              loading={compatLoading}
              error={compatError}
              speciesCount={tankItems.length}
            />

            <section className="bg-surface border border-border rounded-xl p-4 space-y-4">
              <h2 className="text-sm font-semibold text-ink">Tình trạng bể</h2>

              {/* Volume + count summary */}
              <div className="space-y-1 text-xs text-ink-muted">
                <p>Thể tích: <span className="text-ink font-medium">{tankVolume !== null ? `${tankVolume.toFixed(1)} lít` : '—'}</span></p>
                <p>Số loài: <span className="text-ink font-medium">{tankItems.length}</span></p>
                <p>Tổng cá: <span className="text-ink font-medium">{totalFish} con</span></p>
              </div>

              {/* Bioload display */}
              <div>
                <p className="text-xs text-ink-muted mb-1">Chỉ số Bioload</p>
                <p className={`text-3xl font-bold ${
                  bioloadColor === 'success' ? 'text-success' :
                  bioloadColor === 'warning' ? 'text-warning' :
                  bioloadColor === 'danger' ? 'text-danger' :
                  'text-ink-disabled'
                }`}>
                  {bioloadPercent !== null ? `${bioloadPercent.toFixed(1)}%` : '—'}
                </p>

                {/* Progress bar */}
                {bioloadPercent !== null && (
                  <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bioloadColor === 'success' ? 'bg-success' :
                        bioloadColor === 'warning' ? 'bg-warning' :
                        'bg-danger'
                      }`}
                      style={{ width: `${Math.min(bioloadPercent, 100)}%` }}
                    />
                  </div>
                )}

                {/* Status message */}
                {bioloadColor && (
                  <p className={`text-xs mt-1 font-medium ${
                    bioloadColor === 'success' ? 'text-success' :
                    bioloadColor === 'warning' ? 'text-warning' :
                    'text-danger'
                  }`}>
                    {bioloadColor === 'success' ? '✓ Bể ổn định' :
                     bioloadColor === 'warning' ? '⚠ Gần giới hạn' :
                     '✗ Bể quá tải!'}
                  </p>
                )}

                {bioloadPercent === null && tankItems.length === 0 && (
                  <p className="text-xs text-ink-disabled mt-1">Thêm cá để tính bioload</p>
                )}
                {bioloadPercent === null && tankItems.length > 0 && (
                  <p className="text-xs text-ink-disabled mt-1">Nhập kích thước bể để tính bioload</p>
                )}
              </div>

              {/* Formula info */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-ink-muted">Công thức:</p>
                <p className="text-xs text-ink-disabled font-mono mt-1">
                  Σ(bioload × qty) / thể tích × 100
                </p>
              </div>

              {/* Species breakdown */}
              {tankItems.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-ink-muted mb-2">Chi tiết:</p>
                  <div className="space-y-1">
                    {tankItems.map(item => {
                      const contribution = tankVolume
                        ? ((item.species.bioloadFactor * item.quantity) / tankVolume) * 100
                        : null
                      return (
                        <div key={item.species.id} className="flex items-center justify-between text-xs">
                          <span className="text-ink truncate max-w-[140px]">
                            {item.species.commonName} ×{item.quantity}
                          </span>
                          <span className="text-ink-muted shrink-0 ml-2">
                            {contribution !== null ? `${contribution.toFixed(1)}%` : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Bioload guide */}
            <section className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Hướng dẫn</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span className="text-ink-muted">Dưới 80% — Bể ổn định</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                  <span className="text-ink-muted">80–100% — Gần giới hạn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
                  <span className="text-ink-muted">Trên 100% — Bể quá tải</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

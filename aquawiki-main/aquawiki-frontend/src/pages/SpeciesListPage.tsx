import { useState } from 'react'
import Navbar from '../components/Navbar'
import SpeciesCard from '../components/SpeciesCard'
import { useSpeciesList } from '../hooks/useSpecies'
import type { Species } from '../types/species'

const BEHAVIOR_OPTIONS: { value: Species['behaviorTag'] | ''; label: string }[] = [
  { value: '', label: 'Tất cả hành vi' },
  { value: 'PEACEFUL', label: 'Hiền' },
  { value: 'SEMI_AGGRESSIVE', label: 'Trung tính' },
  { value: 'AGGRESSIVE', label: 'Hung dữ' },
]

const CARE_OPTIONS: { value: Species['careDifficulty'] | ''; label: string }[] = [
  { value: '', label: 'Tất cả mức độ' },
  { value: 'EASY', label: 'Dễ nuôi' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó nuôi' },
]

export default function SpeciesListPage() {
  const [search, setSearch] = useState('')
  const [behaviorTag, setBehaviorTag] = useState('')
  const [careDifficulty, setCareDifficulty] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const { data, loading, error } = useSpeciesList({
    search: search.length >= 2 ? search : undefined,
    behaviorTag: behaviorTag || undefined,
    careDifficulty: careDifficulty || undefined,
    page,
    size: PAGE_SIZE,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0
  const hasFilters = search.length >= 2 || behaviorTag || careDifficulty

  function clearFilters() {
    setSearch('')
    setBehaviorTag('')
    setCareDifficulty('')
    setPage(0)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-6 py-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Bách khoa cá cảnh</h1>
          <p className="text-sm text-ink-muted mt-1">
            Tra cứu thông tin và thông số kỹ thuật các loài cá
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled"
              width="16" height="16" viewBox="0 0 16 16" fill="none"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Tìm tên loài... (ít nhất 2 ký tự)"
              className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-disabled transition-colors duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {/* Behavior filter */}
          <select
            value={behaviorTag}
            onChange={e => { setBehaviorTag(e.target.value); setPage(0) }}
            className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink transition-colors duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {BEHAVIOR_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Care difficulty filter */}
          <select
            value={careDifficulty}
            onChange={e => { setCareDifficulty(e.target.value); setPage(0) }}
            className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink transition-colors duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {CARE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {data && !loading && (
          <p className="text-sm text-ink-muted mb-4">
            {data.total > 0
              ? `${data.total} loài được tìm thấy`
              : null}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16 text-sm text-danger">{error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && data?.data.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink-muted mb-3">Không tìm thấy loài nào phù hợp.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-primary hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.data.map(species => (
                <SpeciesCard key={species.id} species={species} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg text-ink-muted hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  ← Trước
                </button>
                <span className="text-sm text-ink-muted px-2">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg text-ink-muted hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useParams, Link } from 'react-router'
import Navbar from '../components/Navbar'
import FlagModal from '../components/FlagModal'
import { useSpeciesDetail } from '../hooks/useSpecies'
import { useAuth } from '../context/AuthContext'
import type { Species } from '../types/species'
import heroPng from '../assets/hero.png'

const BEHAVIOR_LABEL: Record<Species['behaviorTag'], string> = {
  PEACEFUL: 'Hiền',
  SEMI_AGGRESSIVE: 'Trung tính',
  AGGRESSIVE: 'Hung dữ',
}

const BEHAVIOR_CLASS: Record<Species['behaviorTag'], string> = {
  PEACEFUL: 'bg-success-light text-success border-success/30',
  SEMI_AGGRESSIVE: 'bg-warning-light text-warning border-warning/30',
  AGGRESSIVE: 'bg-danger-light text-danger border-danger/30',
}

const CARE_LABEL: Record<Species['careDifficulty'], string> = {
  EASY: 'Dễ nuôi',
  MEDIUM: 'Trung bình',
  HARD: 'Khó nuôi',
}

export default function SpeciesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numericId = id ? parseInt(id, 10) : null
  const { species, loading, error } = useSpeciesDetail(numericId)
  const { user } = useAuth()
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [flagged, setFlagged] = useState(false)

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

  if (error || !species) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-ink-muted">Không tìm thấy loài này.</p>
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-6 py-6 max-w-3xl mx-auto w-full">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary transition-colors duration-300 mb-6">
          ← Danh sách loài
        </Link>

        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {/* Image */}
          <div className="aspect-[16/7] bg-primary-light flex items-center justify-center">
            {true ? (
              <img
                src={species.imageUrl
                  ? (species.imageUrl.startsWith('/uploads/') ? `http://localhost:8080${species.imageUrl}` : species.imageUrl)
                  : heroPng}
                alt={species.commonName}
                onError={e => { (e.currentTarget as HTMLImageElement).src = heroPng }}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="80" height="80" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="opacity-30">
                <ellipse cx="14" cy="14" rx="12" ry="8" fill="var(--color-primary-light)" />
                <path d="M6 14c2-4 8-7 14-4-6-1-10 2-12 6 2 4 6 6 12 5-6 3-12 0-14-7z" fill="var(--color-primary)" />
                <circle cx="9" cy="12" r="1.2" fill="var(--color-primary)" />
              </svg>
            )}
          </div>

          <div className="p-6 md:p-8">
            {/* Name + badges */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-bold text-ink">{species.commonName}</h1>
                <p className="text-sm text-ink-muted italic mt-0.5">{species.scientificName}</p>
              </div>
              {user && (
                <button
                  onClick={() => !flagged && setShowFlagModal(true)}
                  disabled={flagged}
                  className={`shrink-0 text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors duration-300 ${
                    flagged
                      ? 'border-border text-ink-disabled cursor-not-allowed'
                      : 'border-border text-ink-muted hover:border-warning hover:text-warning'
                  }`}
                >
                  {flagged ? 'Đã báo cáo' : 'Báo cáo'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${BEHAVIOR_CLASS[species.behaviorTag]}`}>
                {BEHAVIOR_LABEL[species.behaviorTag]}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-border text-ink-muted">
                {CARE_LABEL[species.careDifficulty]}
              </span>
            </div>

            {/* Parameters grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <ParamCard label="pH" value={`${species.phMin} – ${species.phMax}`} />
              <ParamCard label="Nhiệt độ" value={`${species.tempMin} – ${species.tempMax}°C`} />
              <ParamCard label="Kích thước tối đa" value={`${species.maxSizeCm} cm`} />
              <ParamCard label="Bioload" value={`×${species.bioloadFactor}`} />
            </div>

            {/* Description */}
            {species.description && (
              <div>
                <h2 className="text-sm font-semibold text-ink mb-2">Mô tả</h2>
                <p className="text-sm text-ink-muted leading-relaxed">{species.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      {showFlagModal && numericId && (
        <FlagModal
          speciesId={numericId}
          onSuccess={() => { setShowFlagModal(false); setFlagged(true) }}
          onClose={() => setShowFlagModal(false)}
        />
      )}
    </div>
  )
}

function ParamCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-xl p-4 border border-border">
      <p className="text-xs text-ink-disabled mb-1">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

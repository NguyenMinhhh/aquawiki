import { Link } from 'react-router'
import type { Species } from '../types/species'
import heroPng from '../assets/hero.png'

const BEHAVIOR_LABEL: Record<Species['behaviorTag'], string> = {
  PEACEFUL: 'Hiền',
  SEMI_AGGRESSIVE: 'Trung tính',
  AGGRESSIVE: 'Hung dữ',
}

const BEHAVIOR_CLASS: Record<Species['behaviorTag'], string> = {
  PEACEFUL: 'bg-success-light text-success',
  SEMI_AGGRESSIVE: 'bg-warning-light text-warning',
  AGGRESSIVE: 'bg-danger-light text-danger',
}

const CARE_LABEL: Record<Species['careDifficulty'], string> = {
  EASY: 'Dễ nuôi',
  MEDIUM: 'Trung bình',
  HARD: 'Khó nuôi',
}

interface Props {
  species: Species
}

function resolveImageUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('/uploads/')) return `http://localhost:8080${url}`
  return url
}

export default function SpeciesCard({ species }: Props) {
  const imgSrc = resolveImageUrl(species.imageUrl)

  return (
    <Link
      to={`/species/${species.id}`}
      className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary hover:shadow-sm transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-primary-light flex items-center justify-center overflow-hidden">
        <img
          src={imgSrc ?? heroPng}
          alt={species.commonName}
          onError={e => { (e.currentTarget as HTMLImageElement).src = heroPng }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-ink truncate group-hover:text-primary transition-colors duration-300">
          {species.commonName}
        </h3>
        <p className="text-xs text-ink-muted italic truncate mt-0.5">
          {species.scientificName}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BEHAVIOR_CLASS[species.behaviorTag]}`}>
            {BEHAVIOR_LABEL[species.behaviorTag]}
          </span>
          <span className="text-xs text-ink-disabled">
            {CARE_LABEL[species.careDifficulty]}
          </span>
        </div>
      </div>
    </Link>
  )
}

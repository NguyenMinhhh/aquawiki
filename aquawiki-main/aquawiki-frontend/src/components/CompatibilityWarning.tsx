import type { CompatibilityCheckResponse, CompatibilityLevel } from '../types/compatibility'

interface Props {
  result: CompatibilityCheckResponse | null
  loading: boolean
  error: string | null
  speciesCount: number
}

function LevelBadge({ level }: { level: CompatibilityLevel }) {
  if (level === 'INCOMPATIBLE') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-light text-danger">
        🔴 Rủi ro cao
      </span>
    )
  }
  if (level === 'CAUTION') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning">
        🟡 Cần chú ý
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-light text-success">
      🟢 Tương thích
    </span>
  )
}

export default function CompatibilityWarning({ result, loading, error, speciesCount }: Props) {
  if (speciesCount < 2) return null

  return (
    <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-ink">Tương thích loài</h2>

      {loading && (
        <p className="text-xs text-ink-muted animate-pulse">Đang kiểm tra...</p>
      )}

      {error && !loading && (
        <div className="flex items-start gap-2 p-3 bg-warning-light border border-warning/30 rounded-lg">
          <span className="text-warning text-sm">⚠</span>
          <p className="text-xs text-warning">{error}</p>
        </div>
      )}

      {!loading && !error && result && (
        <>
          {/* Group result summary */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Tổng thể:</span>
            <LevelBadge level={result.groupResult} />
          </div>

          {/* Non-compatible pairs */}
          {result.pairs.filter(p => p.level !== 'COMPATIBLE').length === 0 ? (
            <p className="text-xs text-success font-medium">✓ Tất cả loài tương thích với nhau</p>
          ) : (
            <div className="space-y-2">
              {result.pairs
                .filter(p => p.level !== 'COMPATIBLE')
                .map((pair, i) => (
                  <div key={i} className="border border-border rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-medium text-ink">
                        {pair.speciesA.commonName} + {pair.speciesB.commonName}
                      </span>
                      <LevelBadge level={pair.level} />
                    </div>
                    {pair.reason && (
                      <p className="text-xs text-ink-muted leading-relaxed">{pair.reason}</p>
                    )}
                    {pair.source === 'EXCEPTION' && (
                      <span className="text-xs text-ink-disabled">✓ Đã xác minh</span>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Compatible pairs count */}
          {result.pairs.filter(p => p.level === 'COMPATIBLE').length > 0 && (
            <p className="text-xs text-ink-disabled">
              {result.pairs.filter(p => p.level === 'COMPATIBLE').length} cặp tương thích
            </p>
          )}
        </>
      )}
    </section>
  )
}

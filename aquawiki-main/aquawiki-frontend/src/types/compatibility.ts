export type CompatibilityLevel = 'COMPATIBLE' | 'CAUTION' | 'INCOMPATIBLE'

export interface SpeciesSummary {
  id: number
  commonName: string
  scientificName: string
}

export interface PairResult {
  speciesA: SpeciesSummary
  speciesB: SpeciesSummary
  level: CompatibilityLevel
  reason: string | null
  source: 'EXCEPTION' | 'RULE_ENGINE'
}

export interface CompatibilityCheckResponse {
  groupResult: CompatibilityLevel
  pairs: PairResult[]
}

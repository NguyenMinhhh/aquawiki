export interface Species {
  id: number
  commonName: string
  scientificName: string
  imageUrl: string | null
  phMin: number
  phMax: number
  tempMin: number
  tempMax: number
  maxSizeCm: number
  behaviorTag: 'PEACEFUL' | 'SEMI_AGGRESSIVE' | 'AGGRESSIVE'
  careDifficulty: 'EASY' | 'MEDIUM' | 'HARD'
  description: string | null
  bioloadFactor: number
  status: 'DRAFT' | 'APPROVED'
  createdAt: string
}

export interface PagedResponse<T> {
  data: T[]
  total: number
  page: number
  size: number
}

export interface SpeciesListParams {
  search?: string
  behaviorTag?: string
  careDifficulty?: string
  phMin?: number
  phMax?: number
  tempMin?: number
  tempMax?: number
  page?: number
  size?: number
}

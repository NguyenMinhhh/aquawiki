import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'
import type { Species, PagedResponse, SpeciesListParams } from '../types/species'

export function useSpeciesList(params: SpeciesListParams) {
  const [data, setData] = useState<PagedResponse<Species> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)

    const query = new URLSearchParams()
    if (params.search)        query.set('search', params.search)
    if (params.behaviorTag)   query.set('behaviorTag', params.behaviorTag)
    if (params.careDifficulty) query.set('careDifficulty', params.careDifficulty)
    if (params.phMin != null) query.set('phMin', String(params.phMin))
    if (params.phMax != null) query.set('phMax', String(params.phMax))
    if (params.tempMin != null) query.set('tempMin', String(params.tempMin))
    if (params.tempMax != null) query.set('tempMax', String(params.tempMax))
    query.set('page', String(params.page ?? 0))
    query.set('size', String(params.size ?? 20))

    api.get<PagedResponse<Species>>(`/api/species?${query.toString()}`)
      .then(res => setData(res.data))
      .catch(() => setError('Không thể tải danh sách loài.'))
      .finally(() => setLoading(false))
  }, [
    params.search, params.behaviorTag, params.careDifficulty,
    params.phMin, params.phMax, params.tempMin, params.tempMax,
    params.page, params.size,
  ])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    // Debounce search, immediate for filter/page changes
    const delay = params.search !== undefined ? 300 : 0
    debounceRef.current = setTimeout(fetch, delay)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [fetch, params.search])

  return { data, loading, error, refetch: fetch }
}

export function useSpeciesDetail(id: number | null) {
  const [species, setSpecies] = useState<Species | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id == null) return
    setLoading(true)
    setError(null)
    api.get<Species>(`/api/species/${id}`)
      .then(res => setSpecies(res.data))
      .catch(() => setError('Không tìm thấy loài này.'))
      .finally(() => setLoading(false))
  }, [id])

  return { species, loading, error }
}

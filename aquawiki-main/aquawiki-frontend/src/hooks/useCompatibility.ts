import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import type { CompatibilityCheckResponse } from '../types/compatibility'

export function useCompatibility(speciesIds: number[]) {
  const [result, setResult] = useState<CompatibilityCheckResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (speciesIds.length < 2) {
      setResult(null)
      setError(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.post<CompatibilityCheckResponse>(
          '/api/compatibility/check',
          { speciesIds }
        )
        setResult(res.data)
        setError(null)
      } catch {
        setError('Không thể kiểm tra tương thích — vui lòng thử lại')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [JSON.stringify(speciesIds)]) // eslint-disable-line react-hooks/exhaustive-deps

  return { result, loading, error }
}

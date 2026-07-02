import { useState, useRef } from 'react'
import { Link } from 'react-router'
import { AxiosError } from 'axios'
import Navbar from '../components/Navbar'
import api from '../services/api'
import type { IdentifyResponse, SpeciesMatch } from '../types/tank'

export default function IdentifyPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IdentifyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setResult(null)
    setError(null)
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function identify() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post<IdentifyResponse>('/api/identify', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
    } catch (e) {
      const status = (e as AxiosError).response?.status
      if (status === 400) setError('Ảnh không hợp lệ. Chỉ chấp nhận jpg, jpeg, png, webp (tối đa 8MB).')
      else if (status === 503) setError('Tính năng nhận diện cá chưa được cấu hình trên máy chủ.')
      else if (status === 502) setError('Dịch vụ nhận diện tạm thời không khả dụng. Vui lòng thử lại sau.')
      else setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-6 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink mb-1">Nhận diện cá</h1>
        <p className="text-sm text-ink-muted mb-6">Tải ảnh một con cá để tìm loài khớp trong AquaWiki.</p>

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <input
            ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={pickFile} className="hidden"
          />

          <button
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-border bg-background hover:border-primary transition-colors flex items-center justify-center overflow-hidden"
          >
            {preview
              ? <img src={preview} alt="Xem trước" className="w-full h-full object-contain" />
              : <span className="text-sm text-ink-muted">Bấm để chọn ảnh cá</span>}
          </button>

          <button
            onClick={identify} disabled={!file || loading}
            className="w-full text-sm font-medium bg-primary text-white rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? 'Đang nhận diện...' : 'Nhận diện'}
          </button>

          {error && (
            <div className="bg-danger-light border border-danger/30 rounded-lg p-3 text-sm text-danger">
              {error}
            </div>
          )}

          {result && result.noMatch && (
            <div className="bg-warning-light border border-warning/30 rounded-lg p-3 text-sm text-warning">
              Không tìm thấy loài cá khớp. Hãy thử ảnh rõ nét hơn, chụp cận con cá.
            </div>
          )}

          {result && !result.noMatch && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Kết quả</p>
              {result.candidates.map(c => <MatchRow key={c.speciesId} match={c} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function MatchRow({ match }: { match: SpeciesMatch }) {
  const pct = Math.round(match.confidence * 100)
  return (
    <Link
      to={`/species/${match.speciesId}`}
      className="flex items-center justify-between gap-3 bg-background border border-border rounded-lg px-3 py-2.5 hover:border-primary transition-colors"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{match.commonName}</p>
        <p className="text-xs text-ink-muted italic truncate">{match.scientificName}</p>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-sm font-semibold text-primary">{pct}%</span>
        <p className="text-[10px] text-ink-disabled">độ tin cậy</p>
      </div>
    </Link>
  )
}

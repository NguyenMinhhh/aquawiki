import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import api from '../services/api'
import type { Species } from '../types/species'

interface FormData {
  commonName: string
  scientificName: string
  phMin: string
  phMax: string
  tempMin: string
  tempMax: string
  maxSizeCm: string
  behaviorTag: string
  careDifficulty: string
  description: string
  bioloadFactor: string
}

const EMPTY_FORM: FormData = {
  commonName: '',
  scientificName: '',
  phMin: '',
  phMax: '',
  tempMin: '',
  tempMax: '',
  maxSizeCm: '',
  behaviorTag: 'PEACEFUL',
  careDifficulty: 'EASY',
  description: '',
  bioloadFactor: '1',
}

export default function SpeciesFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit) return
    api.get<Species>(`/api/species/${id}`)
      .then(r => {
        const s = r.data
        setForm({
          commonName: s.commonName,
          scientificName: s.scientificName,
          phMin: String(s.phMin),
          phMax: String(s.phMax),
          tempMin: String(s.tempMin),
          tempMax: String(s.tempMax),
          maxSizeCm: String(s.maxSizeCm),
          behaviorTag: s.behaviorTag,
          careDifficulty: s.careDifficulty,
          description: s.description ?? '',
          bioloadFactor: String(s.bioloadFactor),
        })
        if (s.imageUrl) setImagePreview(`http://localhost:8080${s.imageUrl}`)
      })
      .catch(() => setError('Không tìm thấy loài này.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        commonName: form.commonName,
        scientificName: form.scientificName,
        phMin: Number(form.phMin),
        phMax: Number(form.phMax),
        tempMin: Number(form.tempMin),
        tempMax: Number(form.tempMax),
        maxSizeCm: Number(form.maxSizeCm),
        behaviorTag: form.behaviorTag,
        careDifficulty: form.careDifficulty,
        description: form.description || null,
        bioloadFactor: Number(form.bioloadFactor),
      }

      let speciesId: number
      if (isEdit) {
        await api.put(`/api/species/${id}`, payload)
        speciesId = Number(id)
      } else {
        const res = await api.post<Species>('/api/species', payload)
        speciesId = res.data.id
      }

      // Upload image in same action if file was selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        await api.put(`/api/species/${speciesId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      const msg = isEdit
        ? `Đã cập nhật "${form.commonName}" thành công.`
        : `Đã tạo "${form.commonName}" thành công.`
      navigate('/admin/species', { state: { success: msg } })
    } catch {
      setError('Lưu thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-ink-muted">Đang tải...</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/species')}
          className="text-ink-muted hover:text-ink transition-colors"
        >
          ← Quay lại
        </button>
        <h1 className="text-xl font-bold text-ink">
          {isEdit ? 'Chỉnh sửa loài cá' : 'Thêm loài cá mới'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger-light text-danger rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Main fields */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <Row label="Tên thường gọi" required>
              <Input value={form.commonName} onChange={v => set('commonName', v)} placeholder="Cá Betta" required />
            </Row>

            <Row label="Tên khoa học" required>
              <Input value={form.scientificName} onChange={v => set('scientificName', v)} placeholder="Betta splendens" required />
            </Row>

            <div className="grid grid-cols-2 gap-4">
              <Row label="pH tối thiểu" required>
                <Input type="number" step="0.1" value={form.phMin} onChange={v => set('phMin', v)} placeholder="6.0" required />
              </Row>
              <Row label="pH tối đa" required>
                <Input type="number" step="0.1" value={form.phMax} onChange={v => set('phMax', v)} placeholder="8.0" required />
              </Row>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Row label="Nhiệt độ tối thiểu (°C)" required>
                <Input type="number" step="0.5" value={form.tempMin} onChange={v => set('tempMin', v)} placeholder="24" required />
              </Row>
              <Row label="Nhiệt độ tối đa (°C)" required>
                <Input type="number" step="0.5" value={form.tempMax} onChange={v => set('tempMax', v)} placeholder="30" required />
              </Row>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Row label="Kích thước tối đa (cm)" required>
                <Input type="number" step="0.1" value={form.maxSizeCm} onChange={v => set('maxSizeCm', v)} placeholder="7" required />
              </Row>
              <Row label="Hệ số bioload" required>
                <Input type="number" step="0.1" value={form.bioloadFactor} onChange={v => set('bioloadFactor', v)} placeholder="1" required />
              </Row>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Row label="Hành vi" required>
                <select
                  value={form.behaviorTag}
                  onChange={e => set('behaviorTag', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="PEACEFUL">Hiền lành</option>
                  <option value="SEMI_AGGRESSIVE">Bán hung dữ</option>
                  <option value="AGGRESSIVE">Hung dữ</option>
                </select>
              </Row>
              <Row label="Độ khó nuôi" required>
                <select
                  value={form.careDifficulty}
                  onChange={e => set('careDifficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </Row>
            </div>

            <Row label="Mô tả">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                placeholder="Thông tin chi tiết về loài cá..."
              />
            </Row>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving
                  ? (selectedFile ? 'Đang lưu & upload ảnh...' : 'Đang lưu...')
                  : isEdit ? 'Cập nhật' : 'Tạo loài'}
              </button>
            </div>
          </div>

          {/* Image picker — available immediately */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-ink mb-3">Ảnh đại diện</h2>

            {/* Preview */}
            <div
              className="w-full aspect-square rounded-xl mb-3 border-2 border-dashed border-border overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary transition-colors group"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink-muted group-hover:text-primary transition-colors">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-medium">Chọn ảnh</span>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full px-3 py-2 text-xs font-medium text-primary bg-primary-light rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Đổi ảnh
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full px-3 py-2 text-xs font-medium text-ink-muted border border-border rounded-lg hover:text-ink transition-colors"
              >
                Chọn ảnh (tùy chọn)
              </button>
            )}
            <p className="text-xs text-ink-muted text-center mt-2">JPG, PNG, WEBP — tối đa 5MB</p>
          </div>
        </div>
      </form>
    </div>
  )
}

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({
  value, onChange, type = 'text', placeholder, required, step,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  step?: string
}) {
  return (
    <input
      type={type}
      step={step}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
    />
  )
}

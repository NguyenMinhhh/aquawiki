import { useState, type FormEvent } from 'react'
import api from '../services/api'

interface Props {
  speciesId: number
  onSuccess: () => void
  onClose: () => void
}

export default function FlagModal({ speciesId, onSuccess, onClose }: Props) {
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError('')
    setApiError('')

    if (!reason.trim()) {
      setValidationError('Vui lòng mô tả vấn đề bạn phát hiện')
      return
    }

    setLoading(true)
    try {
      await api.post(`/api/species/${speciesId}/flags`, { reason: reason.trim() })
      onSuccess()
    } catch {
      setApiError('Không thể gửi báo cáo. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-ink/20 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Báo cáo dữ liệu không chính xác</h2>
          <button
            onClick={onClose}
            className="text-ink-disabled hover:text-ink transition-colors duration-300 p-1"
            aria-label="Đóng"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-ink-muted mb-4">
          Mô tả thông tin nào có vẻ sai để admin có thể xem xét và chỉnh sửa.
        </p>

        {apiError && (
          <div className="alert-enter mb-4 px-4 py-3 bg-danger-light border border-danger/30 rounded-lg text-sm text-danger">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="flag-reason" className="block text-sm font-medium text-ink">
              Mô tả vấn đề <span className="text-danger">*</span>
            </label>
            <textarea
              id="flag-reason"
              rows={4}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setValidationError('') }}
              placeholder="Ví dụ: Nhiệt độ ghi sai, nên là 26–30°C thay vì 20–25°C"
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-disabled resize-none transition-colors duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {validationError && (
              <p className="text-xs text-danger">{validationError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-ink-muted hover:bg-background transition-colors duration-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

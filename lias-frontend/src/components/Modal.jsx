import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const maxW = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg'

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(22,24,29,.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full ${maxW} max-h-[90vh] flex flex-col`}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-float)',
          animation: 'slideUp .20s var(--ease) both',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 99, flexShrink: 0 }} />
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.05rem',
              fontWeight: 600,
              color: 'var(--text-1)',
              letterSpacing: '-.02em',
            }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Fermer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto" style={{ fontFamily: 'var(--font-sans)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

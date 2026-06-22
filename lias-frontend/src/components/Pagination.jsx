import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages   = Array.from({ length: totalPages }, (_, i) => i)
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="page-btn"
        aria-label="Page précédente"
      >
        <ChevronLeft size={14} />
      </button>

      {visible.map((p, idx) => {
        const prev = visible[idx - 1]
        return (
          <span key={p} className="flex items-center gap-1">
            {prev !== undefined && p - prev > 1 && (
              <span className="mono-sm px-1" style={{ color: 'var(--text-3)' }}>…</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={`page-btn ${p === page ? 'page-btn-active' : ''}`}
            >
              {p + 1}
            </button>
          </span>
        )
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="page-btn"
        aria-label="Page suivante"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

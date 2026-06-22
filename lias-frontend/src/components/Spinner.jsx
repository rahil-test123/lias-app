export default function Spinner({ size = 'md' }) {
  const dim = size === 'sm' ? 14 : size === 'lg' ? 34 : 22
  return (
    <div
      className="animate-spin rounded-full shrink-0"
      style={{
        width: dim, height: dim,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
      }}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" />
      <p className="mono-sm" style={{ color: 'var(--text-3)' }}>Chargement…</p>
    </div>
  )
}

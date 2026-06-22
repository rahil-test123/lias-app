/**
 * PageHeader — titre Fraunces + sous-titre mono + action droite
 * Usage :
 *   <PageHeader title="Membres" subtitle="24 membres au total">
 *     <button className="btn-primary">Nouveau</button>
 *   </PageHeader>
 */
export default function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`page-header flex items-end justify-between gap-4 page-in ${className}`}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}

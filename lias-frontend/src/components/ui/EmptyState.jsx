/**
 * EmptyState — état vide soigné
 * Usage : <EmptyState icon={Users} title="Aucun membre" desc="Créez votre premier membre." />
 */
export default function EmptyState({ icon: Icon, title, desc, children }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {Icon && <Icon size={22} strokeWidth={1.4} />}
      </div>
      {title && <p className="empty-title">{title}</p>}
      {desc  && <p className="empty-desc">{desc}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

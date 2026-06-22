/**
 * Badge — pastille mono désaturée
 * variant : 'permanent' | 'associe' | 'doctorant' | 'retraite' | 'ancien'
 *           'admin' | 'directeur' | 'membre'
 *           'article' | 'conference' | 'these' | 'rapport' | 'brevet' | 'livre'
 *           'conf-ev' | 'seminaire' | 'workshop' | 'avenir'
 *           'enattente' | 'acceptee' | 'refusee'
 */

const DOT_COLORS = {
  permanent:  '#15803D',
  associe:    '#374151',
  doctorant:  '#5B21B6',
  retraite:   '#9CA3AF',
  ancien:     '#92400E',
  admin:      '#991B1B',
  directeur:  '#C2410C',
  membre:     '#374151',
  article:    '#1D4ED8',
  conference: '#15803D',
  these:      '#5B21B6',
  rapport:    '#92400E',
  brevet:     '#BE185D',
  livre:      '#166534',
  'conf-ev':  '#1D4ED8',
  seminaire:  '#5B21B6',
  workshop:   '#C2410C',
  avenir:     '#15803D',
  enattente:  '#92400E',
  acceptee:   '#15803D',
  refusee:    '#991B1B',
}

// Map variant → CSS class in index.css
const CLASS_MAP = {
  permanent:  'badge-permanent',
  associe:    'badge-associe',
  doctorant:  'badge-doctorant',
  retraite:   'badge-retraite',
  ancien:     'badge-ancien',
  admin:      'badge-admin',
  directeur:  'badge-directeur',
  membre:     'badge-membre',
  article:    'badge-article',
  conference: 'badge-conf',
  these:      'badge-these',
  rapport:    'badge-rapport',
  brevet:     'badge-brevet',
  livre:      'badge-livre',
  'conf-ev':  'badge-conference',
  seminaire:  'badge-seminaire',
  workshop:   'badge-workshop',
  avenir:     'badge-avenir',
  enattente:  'badge-enattente',
  acceptee:   'badge-acceptee',
  refusee:    'badge-refusee',
}

export default function Badge({ variant = 'neutral', children, className = '' }) {
  const cls   = CLASS_MAP[variant] ?? ''
  const dot   = DOT_COLORS[variant]

  return (
    <span className={`badge ${cls} ${className}`}>
      {dot && <span className="badge-dot" style={{ background: dot }} />}
      {children}
    </span>
  )
}

/** Helpers pratiques */
export function StatutBadge({ statut }) {
  const v = statut?.toLowerCase()
  return <Badge variant={v}>{statut}</Badge>
}

export function RoleBadge({ role }) {
  const clean = role?.replace('ROLE_', '') ?? ''
  const v = clean.toLowerCase()
  return <Badge variant={v}>{clean}</Badge>
}

export function TypePubBadge({ type }) {
  const v = type?.toLowerCase()
  return <Badge variant={v}>{type}</Badge>
}

export function TypeEvBadge({ type }) {
  const MAP = { CONFERENCE: 'conf-ev', SEMINAIRE: 'seminaire', WORKSHOP: 'workshop' }
  return <Badge variant={MAP[type] ?? 'neutral'}>{type}</Badge>
}

export function AdhesionBadge({ statut }) {
  const MAP = { EN_ATTENTE: 'enattente', ACCEPTEE: 'acceptee', REFUSEE: 'refusee' }
  const LABEL = { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REFUSEE: 'Refusée' }
  return <Badge variant={MAP[statut] ?? 'neutral'}>{LABEL[statut] ?? statut}</Badge>
}

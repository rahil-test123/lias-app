import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, MapPin, FileText, Download } from 'lucide-react'
import { getEvenement } from '../../api/evenements'
import { getDocsByEvenement, downloadDocument } from '../../api/documents'
import { PageSpinner } from '../../components/Spinner'
import { TypeEvBadge } from '../../components/ui/Badge'

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
}

export default function EvenementDetailPage() {
  const { id } = useParams()
  const { data: ev, isLoading } = useQuery({ queryKey: ['evenement', id], queryFn: () => getEvenement(id) })
  const { data: docs } = useQuery({ queryKey: ['docs-evenement', id], queryFn: () => getDocsByEvenement(id) })

  if (isLoading) return <PageSpinner />
  if (!ev) return (
    <div className="card py-14 text-center">
      <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-serif)' }}>Événement introuvable</p>
    </div>
  )

  const upcoming = ev.dateDebut >= new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <div className="page-in">
        <Link
          to="/evenements"
          className="inline-flex items-center gap-1.5 mono-sm mb-4 transition-colors"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
        >
          <ArrowLeft size={13} /> Retour aux événements
        </Link>

        <div className="flex items-start gap-3 flex-wrap mb-1">
          <TypeEvBadge type={ev.type} />
          {upcoming && (
            <span className="badge badge-avenir">
              <span className="badge-dot" style={{ background: 'var(--success)' }} />
              À venir
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.025em', lineHeight: 1.25, marginTop: '.5rem' }}>
          {ev.titre}
        </h1>
      </div>

      {/* Détails */}
      <div className="card p-6 space-y-5 page-in s1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 32, height: 32, borderRadius: 'var(--r)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
            </div>
            <div>
              <p className="section-label">Dates</p>
              <p className="mono-sm" style={{ color: 'var(--text-1)', marginTop: 1 }}>
                {fmt(ev.dateDebut)}
                {ev.dateFin && ev.dateFin !== ev.dateDebut && ` → ${fmt(ev.dateFin)}`}
              </p>
            </div>
          </div>

          {ev.lieu && (
            <div className="flex items-center gap-2.5">
              <div style={{ width: 32, height: 32, borderRadius: 'var(--r)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={14} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
              </div>
              <div>
                <p className="section-label">Lieu</p>
                <p className="mono-sm" style={{ color: 'var(--text-1)', marginTop: 1 }}>{ev.lieu}</p>
              </div>
            </div>
          )}
        </div>

        {ev.description && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <p className="section-label mb-2">Description</p>
            <p style={{ fontSize: '.875rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{ev.description}</p>
          </div>
        )}

        {ev.organisateurNom && (
          <p className="mono-sm" style={{ color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: '.75rem' }}>
            Organisé par {ev.organisateurNom}
          </p>
        )}
      </div>

      {/* Documents */}
      <div className="card p-5 page-in s2">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)', marginBottom: '.75rem' }}>
          Documents liés <span className="mono-sm" style={{ color: 'var(--text-3)' }}>({docs?.length || 0})</span>
        </h2>
        <div className="space-y-1">
          {docs?.map(doc => (
            <div key={doc.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div style={{ width: 30, height: 30, borderRadius: 'var(--r)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={13} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
                </div>
                <div className="min-w-0">
                  <p style={{ fontSize: '.84rem', fontWeight: 500, color: 'var(--text-1)' }} className="truncate">{doc.titre}</p>
                  <p className="mono-sm" style={{ color: 'var(--text-3)' }}>{doc.membreNom}</p>
                </div>
              </div>
              <a
                href={downloadDocument(doc.id)}
                target="_blank"
                rel="noreferrer"
                className="btn-icon shrink-0 ml-2"
                aria-label="Télécharger"
              >
                <Download size={13} />
              </a>
            </div>
          ))}
          {!docs?.length && (
            <p className="mono-sm py-6 text-center" style={{ color: 'var(--text-3)' }}>Aucun document associé</p>
          )}
        </div>
      </div>
    </div>
  )
}

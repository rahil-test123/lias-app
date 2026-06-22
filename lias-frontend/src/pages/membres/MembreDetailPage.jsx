import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Building, BookOpen, Package } from 'lucide-react'
import { getMembre } from '../../api/membres'
import { getPublications } from '../../api/publications'
import { getAttributionsByMembre } from '../../api/materiels'
import { PageSpinner } from '../../components/Spinner'
import { StatutBadge, RoleBadge, TypePubBadge } from '../../components/ui/Badge'

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '—'
}

const AVATAR_COLORS = [
  { bg: 'rgba(194,65,12,.10)', color: 'var(--accent)' },
  { bg: 'rgba(91,33,182,.10)', color: '#5B21B6' },
  { bg: 'rgba(21,128,61,.10)', color: '#15803D' },
  { bg: 'rgba(30,64,175,.10)', color: '#1E40AF' },
  { bg: 'rgba(107,114,128,.10)', color: 'var(--text-2)' },
]

export default function MembreDetailPage() {
  const { id } = useParams()

  const { data: membre, isLoading } = useQuery({ queryKey: ['membre', id], queryFn: () => getMembre(id) })
  const { data: pubs } = useQuery({
    queryKey: ['pubs-membre', id],
    queryFn: () => getPublications({ page: 0, size: 50 }),
    select: d => d.content?.filter(p => p.membreId == id),
  })
  const { data: attributions } = useQuery({
    queryKey: ['attributions-membre', id],
    queryFn: () => getAttributionsByMembre(id),
  })

  if (isLoading) return <PageSpinner />
  if (!membre) return (
    <div className="card py-14 text-center">
      <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-serif)' }}>Membre introuvable</p>
    </div>
  )

  const initials = `${membre.prenom?.[0] ?? ''}${membre.nom?.[0] ?? ''}`
  const av = AVATAR_COLORS[(membre.prenom?.charCodeAt(0) || 0) % AVATAR_COLORS.length]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + titre */}
      <div className="page-in">
        <Link
          to="/membres"
          className="inline-flex items-center gap-1.5 mono-sm mb-4 transition-colors"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
        >
          <ArrowLeft size={13} /> Retour aux membres
        </Link>
        <div className="flex items-center gap-3">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.025em' }}>
            {membre.prenom} {membre.nom}
          </h1>
          <StatutBadge statut={membre.statut} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Colonne info */}
        <div className="card p-5 space-y-5 md:col-span-1 page-in s1">
          {/* Avatar */}
          <div className="flex justify-center">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: av.bg, color: av.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.4rem',
            }}>
              {initials}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2.5">
            <Mail size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <span className="mono-sm" style={{ color: 'var(--text-2)', wordBreak: 'break-all' }}>{membre.email}</span>
          </div>

          {/* Établissement */}
          {membre.etablissementOrigine && (
            <div className="flex items-center gap-2.5">
              <Building size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>{membre.etablissementOrigine}</span>
            </div>
          )}

          {/* Séparateur */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }} className="space-y-3">
            <div>
              <p className="section-label">Rôle</p>
              <div className="mt-1"><RoleBadge role={membre.role} /></div>
            </div>
            {membre.dateEmbauche && (
              <div>
                <p className="section-label">Date d'embauche</p>
                <p className="mono-sm" style={{ color: 'var(--text-1)', marginTop: 2 }}>{fmt(membre.dateEmbauche)}</p>
              </div>
            )}
            <div>
              <p className="section-label">Compte</p>
              <span className={`badge mt-1 ${membre.actif ? 'badge-acceptee' : 'badge-refusee'}`}>
                <span className="badge-dot" style={{ background: membre.actif ? 'var(--success)' : 'var(--error)' }} />
                {membre.actif ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Colonne contenu */}
        <div className="md:col-span-2 space-y-5">
          {/* Biographie */}
          {membre.biographie && (
            <div className="card p-5 page-in s2">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)', marginBottom: '.75rem' }}>
                Biographie
              </h2>
              <p style={{ fontSize: '.84rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{membre.biographie}</p>
            </div>
          )}

          {/* Publications */}
          <div className="card p-5 page-in s3">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)', marginBottom: '.75rem' }}>
              Publications <span className="mono-sm" style={{ color: 'var(--text-3)' }}>({pubs?.length || 0})</span>
            </h2>
            <div className="space-y-2">
              {pubs?.map(p => (
                <div key={p.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 'var(--r)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={13} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <TypePubBadge type={p.type} />
                      <span className="mono-sm" style={{ color: 'var(--text-3)' }}>{p.annee}</span>
                    </div>
                    <p style={{ fontSize: '.84rem', fontWeight: 500, color: 'var(--text-1)' }} className="truncate">{p.titre}</p>
                    <p className="mono-sm" style={{ color: 'var(--text-2)' }}>{p.auteurs}</p>
                  </div>
                </div>
              ))}
              {!pubs?.length && (
                <p className="mono-sm py-4 text-center" style={{ color: 'var(--text-3)' }}>Aucune publication</p>
              )}
            </div>
          </div>

          {/* Matériels */}
          <div className="card p-5 page-in s4">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)', marginBottom: '.75rem' }}>
              Matériels attribués <span className="mono-sm" style={{ color: 'var(--text-3)' }}>({attributions?.length || 0})</span>
            </h2>
            <div className="space-y-1">
              {attributions?.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Package size={13} style={{ color: 'var(--text-3)' }} />
                    <span style={{ fontSize: '.84rem', color: 'var(--text-1)' }}>{a.materielNom}</span>
                  </div>
                  <span className="mono-sm" style={{ color: 'var(--text-3)' }}>
                    Qté {a.quantite} · {fmt(a.dateAttribution)}
                  </span>
                </div>
              ))}
              {!attributions?.length && (
                <p className="mono-sm py-4 text-center" style={{ color: 'var(--text-3)' }}>Aucun matériel attribué</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

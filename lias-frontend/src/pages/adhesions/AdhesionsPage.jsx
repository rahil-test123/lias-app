import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, Mail, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAdhesions, traiterAdhesion } from '../../api/adhesions'
import { PageSpinner } from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import PageHeader from '../../components/ui/PageHeader'
import { AdhesionBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—' }

const STATUTS = [null, 'EN_ATTENTE', 'ACCEPTEE', 'REFUSEE']
const FILTRE_LABELS = { null: 'Toutes', EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptées', REFUSEE: 'Refusées' }

// Palette avatars sobre
const AVATAR_COLORS = [
  { bg: '#F5F4F0', color: '#374151' },
  { bg: '#FFF4F0', color: '#7A3B28' },
  { bg: '#F0FDF4', color: '#166534' },
  { bg: '#F5F3FF', color: '#4C1D95' },
]
function avatarStyle(name = '') {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function AdhesionsPage() {
  const qc = useQueryClient()
  const [page, setPage]     = useState(0)
  const [filtre, setFiltre] = useState('EN_ATTENTE')

  const { data, isLoading } = useQuery({
    queryKey: ['adhesions', page, filtre],
    queryFn: () => getAdhesions({ page, size: 10, sort: 'dateSoumission,desc' }),
  })

  const traiterMutation = useMutation({
    mutationFn: ({ id, statut }) => traiterAdhesion(id, statut),
    onSuccess: () => { toast.success('Demande traitée'); qc.invalidateQueries(['adhesions']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />

  const all       = data?.content || []
  const adhesions = filtre ? all.filter(a => a.statut === filtre) : all
  const enAttente = all.filter(a => a.statut === 'EN_ATTENTE').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes d'adhésion"
        subtitle={`${data?.totalElements ?? '—'} demandes — ${enAttente} en attente`}
      />

      {/* Filtres tabs */}
      <div className="flex gap-2 flex-wrap page-in s1">
        {STATUTS.map(s => (
          <button
            key={s ?? 'all'}
            onClick={() => setFiltre(s)}
            className={`filter-tab ${filtre === s ? 'filter-tab-active' : ''}`}
          >
            {FILTRE_LABELS[s ?? 'null'] ?? FILTRE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3 page-in s2">
        {adhesions.map((a, i) => {
          const av = avatarStyle(a.nom)
          return (
            <div
              key={a.id}
              className="card card-hover p-5"
              style={{ animationDelay: `${.04 + i * .04}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Identité */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="avatar shrink-0"
                      style={{ width: 36, height: 36, background: av.bg, color: av.color, fontSize: '.78rem', fontWeight: 700 }}
                    >
                      {a.prenom?.[0]}{a.nom?.[0]}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '.96rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
                        {a.prenom} {a.nom}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail size={11} style={{ color: 'var(--text-3)' }} />
                        <span className="mono-sm" style={{ color: 'var(--text-2)' }}>{a.email}</span>
                      </div>
                    </div>
                    <AdhesionBadge statut={a.statut} />
                  </div>

                  {/* Motivation */}
                  {a.motivation && (
                    <p
                      className="line-clamp-3"
                      style={{
                        fontSize: '.82rem',
                        color: 'var(--text-2)',
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        padding: '.75rem 1rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {a.motivation}
                    </p>
                  )}

                  <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: '0.5rem' }}>
                    Soumis le {fmtDate(a.dateSoumission)}
                  </p>
                </div>

                {/* Actions */}
                {a.statut === 'EN_ATTENTE' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => traiterMutation.mutate({ id: a.id, statut: 'ACCEPTEE' })}
                      className="btn-success"
                      style={{ fontSize: '.78rem', padding: '5px 12px' }}
                    >
                      <CheckCircle size={13} /> Accepter
                    </button>
                    <button
                      onClick={() => traiterMutation.mutate({ id: a.id, statut: 'REFUSEE' })}
                      className="btn-danger"
                      style={{ fontSize: '.78rem', padding: '5px 12px' }}
                    >
                      <XCircle size={13} /> Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {!adhesions.length && (
          <div className="card">
            <EmptyState
              icon={ClipboardList}
              title="Aucune demande"
              desc={filtre ? `Aucune demande avec le statut "${FILTRE_LABELS[filtre]}"` : 'Aucune demande reçue.'}
            />
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />
    </div>
  )
}

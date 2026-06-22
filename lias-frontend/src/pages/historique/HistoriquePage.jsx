import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History, User } from 'lucide-react'
import { getHistorique } from '../../api/historique'
import { PageSpinner } from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

function fmt(d) {
  return d ? new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'
}

const ACTION_MAP = {
  CREATION_MEMBRE:      { dot: 'var(--success)',  label: 'Création membre' },
  CHANGEMENT_STATUT:    { dot: '#2563EB',          label: 'Changement statut' },
  CHANGEMENT_ACTIF:     { dot: 'var(--warning)',   label: 'Activation compte' },
  ACCEPTATION_ADHESION: { dot: 'var(--success)',   label: 'Adhésion acceptée' },
  REFUS_ADHESION:       { dot: 'var(--error)',     label: 'Adhésion refusée' },
  ATTRIBUTION_MATERIEL: { dot: 'var(--purple)',    label: 'Attribution matériel' },
  CREATION_EVENEMENT:   { dot: 'var(--accent)',    label: 'Création événement' },
  MODIFICATION_PROFIL:  { dot: 'var(--text-3)',    label: 'Modification profil' },
}

function ActionBadge({ action }) {
  const m = ACTION_MAP[action] || { dot: 'var(--text-3)', label: action }
  return (
    <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  )
}

export default function HistoriquePage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useQuery({
    queryKey: ['historique', page],
    queryFn: () => getHistorique({ page, size: 20, sort: 'dateAction,desc' }),
  })

  if (isLoading) return <PageSpinner />
  const actions = data?.content || []

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Historique des actions"
        subtitle={`${data?.totalElements ?? '—'} actions enregistrées`}
      />

      <div className="card overflow-hidden page-in s1">
        <table className="table-base">
          <thead>
            <tr>
              <th>Action</th>
              <th>Détails</th>
              <th>Effectué par</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {actions.map(h => (
              <tr key={h.id}>
                <td><ActionBadge action={h.action} /></td>
                <td className="max-w-xs">
                  <p className="truncate" style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>
                    {h.details || '—'}
                  </p>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'var(--surface-alt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={12} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <span style={{ fontSize: '.84rem', fontWeight: 500, color: 'var(--text-1)' }}>
                      {h.membreNom || '—'}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="mono-sm" style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {fmt(h.dateAction)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!actions.length && (
          <EmptyState icon={History} title="Aucune action" desc="L'historique est vide." />
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />
    </div>
  )
}

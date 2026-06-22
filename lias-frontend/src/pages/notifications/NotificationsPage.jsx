import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { getNotifications, marquerLue, marquerToutesLues } from '../../api/notifications'
import { PageSpinner } from '../../components/Spinner'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

function fmtDate(d) {
  return d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  })

  const lireMutation = useMutation({
    mutationFn: marquerLue,
    onSuccess: () => {
      qc.invalidateQueries(['notifications'])
      qc.invalidateQueries(['notifications-nonlues'])
    },
  })

  const lireToutesMutation = useMutation({
    mutationFn: marquerToutesLues,
    onSuccess: () => {
      toast.success('Toutes marquées comme lues')
      qc.invalidateQueries(['notifications'])
      qc.invalidateQueries(['notifications-nonlues'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />

  const nonLues = notifs.filter(n => !n.lu).length

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle={nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Tout est à jour'}
      >
        {nonLues > 0 && (
          <button onClick={() => lireToutesMutation.mutate()} className="btn-secondary">
            <CheckCheck size={13} /> Tout marquer comme lu
          </button>
        )}
      </PageHeader>

      <div className="space-y-1.5 page-in s1">
        {notifs.map((n, i) => (
          <div
            key={n.id}
            className={`card flex items-start gap-4 px-5 py-4 ${!n.lu ? 'notif-unread' : ''}`}
            style={{ animationDelay: `${.02 + i * .02}s` }}
          >
            {/* Icône */}
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: !n.lu ? 'var(--accent-dim)' : 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bell size={14} strokeWidth={1.5} style={{ color: !n.lu ? 'var(--accent)' : 'var(--text-3)' }} />
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <p style={{
                fontSize: '.84rem',
                color: !n.lu ? 'var(--text-1)' : 'var(--text-2)',
                fontWeight: !n.lu ? 500 : 400,
                lineHeight: 1.5,
              }}>
                {n.message}
              </p>
              <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                {fmtDate(n.dateCreation)}
              </p>
            </div>

            {/* Bouton marquer lu */}
            {!n.lu && (
              <button
                onClick={() => lireMutation.mutate(n.id)}
                className="btn-icon shrink-0"
                aria-label="Marquer comme lu"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Check size={14} />
              </button>
            )}
          </div>
        ))}

        {!notifs.length && (
          <div className="card">
            <EmptyState icon={Bell} title="Aucune notification" desc="Vous êtes à jour !" />
          </div>
        )}
      </div>
    </div>
  )
}

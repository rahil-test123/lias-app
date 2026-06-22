import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, Calendar, ClipboardList, Bell, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getMembresActifs } from '../../api/membres'
import { getPublications } from '../../api/publications'
import { getEvenements } from '../../api/evenements'
import { getAdhesions } from '../../api/adhesions'
import { getNonLues } from '../../api/notifications'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { TypeEvBadge } from '../../components/ui/Badge'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r)',
      padding: '8px 12px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p className="mono-sm" style={{ color: 'var(--text-3)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-1)', fontSize: '.9rem' }}>
        {payload[0].value} pub.
      </p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent, to, delay = 0 }) {
  const inner = (
    <div className="card card-hover p-5" style={{ animation: `pageIn .30s var(--ease) ${delay}s both` }}>
      <div style={{
        width: 34, height: 34, borderRadius: 7,
        background: `${accent}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1rem',
      }}>
        <Icon size={16} style={{ color: accent }} strokeWidth={1.8} />
      </div>
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        fontWeight: 600,
        color: 'var(--text-1)',
        letterSpacing: '-.04em',
        lineHeight: 1,
        marginBottom: '.3rem',
      }}>
        {value ?? <span className="skeleton inline-block" style={{ width: 44, height: 28 }} />}
      </p>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '.63rem',
        color: 'var(--text-3)',
        textTransform: 'uppercase',
        letterSpacing: '.09em',
      }}>
        {label}
      </p>
      <div style={{ height: 1, background: `${accent}20`, marginTop: '1rem' }} />
    </div>
  )
  return to ? <Link to={to} className="block">{inner}</Link> : inner
}

export default function DashboardPage() {
  const { user, isPrivileged } = useAuth()

  const { data: membres }      = useQuery({ queryKey: ['membres-actifs'],            queryFn: getMembresActifs })
  const { data: publications }  = useQuery({ queryKey: ['publications-all'],          queryFn: () => getPublications({ size: 100, sort: 'annee,asc' }) })
  const { data: pubRecent }    = useQuery({ queryKey: ['publications', { size: 5 }], queryFn: () => getPublications({ size: 5, sort: 'id,desc' }) })
  const { data: evenements }   = useQuery({ queryKey: ['evenements'],                 queryFn: () => getEvenements({ size: 50 }), staleTime: 0 })
  const { data: adhesions }    = useQuery({ queryKey: ['adhesions'],                  queryFn: () => getAdhesions({ size: 100 }), enabled: isPrivileged })
  const { data: nonLues = [] } = useQuery({ queryKey: ['notifications-nonlues'],     queryFn: getNonLues, initialData: [] })

  const todayStr  = new Date().toISOString().split('T')[0]
  const aVenir    = (evenements?.content || []).filter(e => e.dateDebut >= todayStr).sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))
  const enAttente = (adhesions?.content || []).filter(a => a.statut === 'EN_ATTENTE')

  const chartData = (() => {
    const map = {}
    ;(publications?.content || []).forEach(p => { map[p.annee] = (map[p.annee] || 0) + 1 })
    return Object.entries(map).sort(([a], [b]) => a - b).slice(-8).map(([annee, total]) => ({ annee: String(annee), total }))
  })()

  const stats = [
    { icon: Users,        label: 'Membres actifs',     value: membres?.length,            accent: '#16181D', to: '/membres' },
    { icon: BookOpen,     label: 'Publications',        value: publications?.totalElements, accent: '#C2410C', to: '/publications' },
    { icon: Calendar,     label: 'Événements à venir', value: aVenir.length,              accent: '#15803D', to: '/evenements' },
    { icon: Bell,         label: 'Notifications',       value: nonLues?.length ?? 0,       accent: '#5B21B6', to: '/notifications' },
    ...(isPrivileged ? [{ icon: ClipboardList, label: 'En attente', value: enAttente.length, accent: '#92400E', to: '/adhesions' }] : []),
  ]

  return (
    <div className="space-y-8">

      {/* Salutation */}
      <div className="page-in">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '.5rem' }}>
          {greeting()}
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.03em', lineHeight: 1.2 }}>
          {user?.prenom} {user?.nom}
        </h1>
        <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: '.25rem', textTransform: 'capitalize' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div style={{ height: 1, background: 'var(--border)', marginTop: '1.25rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: -1, height: 2, width: 36, background: 'var(--accent)', borderRadius: 99 }} />
        </div>
      </div>

      {/* Stats */}
      <div className={`grid gap-4 ${stats.length >= 5 ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={0.03 + i * 0.05} />)}
      </div>

      {/* Graphique + Événements */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="card p-5 lg:col-span-3 page-in s3">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '.95rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
                Publications par année
              </h2>
              <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 2 }}>
                {publications?.totalElements ?? 0} au total
              </p>
            </div>
            <Link to="/publications" className="flex items-center gap-1 mono-sm" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Voir tout <ArrowRight size={11} />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={chartData} barCategoryGap="45%">
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="annee" tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={20} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-warm)' }} />
                <Bar dataKey="total" radius={[3, 3, 0, 0]} fill="var(--text-1)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center mono-sm" style={{ color: 'var(--text-3)' }}>
              Aucune publication
            </div>
          )}
        </div>

        <div className="card overflow-hidden lg:col-span-2 page-in s4">
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '.92rem', fontWeight: 600, color: 'var(--text-1)' }}>
              Événements à venir
            </h2>
            <Link to="/evenements" className="flex items-center gap-1 mono-sm" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Tout <ArrowRight size={11} />
            </Link>
          </div>
          {aVenir.slice(0, 5).map(ev => (
            <Link
              key={ev.id} to={`/evenements/${ev.id}`}
              className="flex items-start gap-3 px-4 py-2.5"
              style={{ borderBottom: '1px solid var(--border)', textDecoration: 'none', transition: 'background var(--dur) var(--ease)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-warm)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <TypeEvBadge type={ev.type} />
              <div className="min-w-0">
                <p style={{ fontSize: '.80rem', fontWeight: 500, color: 'var(--text-1)' }} className="truncate">{ev.titre}</p>
                <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 1 }}>{fmtDate(ev.dateDebut)}</p>
              </div>
            </Link>
          ))}
          {!aVenir.length && (
            <div className="py-8 text-center mono-sm" style={{ color: 'var(--text-3)' }}>Aucun événement à venir</div>
          )}
        </div>
      </div>

      {/* Publications récentes */}
      <div className="card overflow-hidden page-in s5">
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '.92rem', fontWeight: 600, color: 'var(--text-1)' }}>
            Dernières publications
          </h2>
          <Link to="/publications" className="flex items-center gap-1 mono-sm" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Voir tout <ArrowRight size={11} />
          </Link>
        </div>
        <table className="table-base">
          <thead>
            <tr><th>Titre</th><th>Auteurs</th><th>Année</th><th>Type</th></tr>
          </thead>
          <tbody>
            {(pubRecent?.content || []).map(pub => (
              <tr key={pub.id}>
                <td><span className="truncate block max-w-xs" style={{ fontWeight: 500 }}>{pub.titre}</span></td>
                <td className="mono-sm" style={{ color: 'var(--text-2)' }}>{pub.auteurs}</td>
                <td className="mono" style={{ color: 'var(--text-2)', fontWeight: 600 }}>{pub.annee}</td>
                <td><span className="badge" style={{ background: 'var(--surface-alt)', color: 'var(--text-2)' }}>{pub.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!(pubRecent?.content?.length) && (
          <div className="py-8 text-center mono-sm" style={{ color: 'var(--text-3)' }}>Aucune publication</div>
        )}
      </div>
    </div>
  )
}

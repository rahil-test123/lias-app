import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, BookOpen, Calendar, Users, ClipboardList } from 'lucide-react'
import { getRapportActivite } from '../../api/rapports'
import { PageSpinner } from '../../components/Spinner'
import PageHeader from '../../components/ui/PageHeader'
import { TypePubBadge, TypeEvBadge } from '../../components/ui/Badge'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

function StatCard({ icon: Icon, label, value, iconColor, iconBg }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--r)',
        background: iconBg || 'var(--surface-alt)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={18} strokeWidth={1.5} style={{ color: iconColor || 'var(--text-2)' }} />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1, letterSpacing: '-.03em' }}>
          {value ?? '—'}
        </p>
        <p className="mono-sm" style={{ color: 'var(--text-2)', marginTop: 3 }}>{label}</p>
      </div>
    </div>
  )
}

function fmt(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—' }

export default function RapportsPage() {
  const [annee, setAnnee] = useState(CURRENT_YEAR)

  const { data, isLoading } = useQuery({
    queryKey: ['rapport', annee],
    queryFn: () => getRapportActivite({ annee }),
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Rapports d'activité" subtitle="Statistiques annuelles du laboratoire">
        <select
          className="input w-auto"
          value={annee}
          onChange={e => setAnnee(Number(e.target.value))}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '.84rem' }}
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </PageHeader>

      {isLoading ? <PageSpinner /> : data ? (
        <>
          {/* Stats principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 page-in s1">
            <StatCard icon={Users}         label="Membres actifs"     value={data.nbMembres}          iconColor="var(--accent)"  iconBg="var(--accent-dim)" />
            <StatCard icon={BookOpen}      label="Publications"        value={data.nbPublications}     iconColor="#2563EB"         iconBg="rgba(37,99,235,.08)" />
            <StatCard icon={Calendar}      label="Événements"          value={data.nbEvenements}       iconColor="var(--success)" iconBg="var(--success-bg)" />
            <StatCard icon={ClipboardList} label="En attente"          value={data.nbDemandesAdhesion} iconColor="var(--warning)" iconBg="var(--warning-bg)" />
          </div>

          {/* Stats secondaires */}
          <div className="grid grid-cols-3 gap-4 page-in s2">
            {[
              { val: data.nbMembersPermanents, label: 'Permanents' },
              { val: data.nbDoctorants,        label: 'Doctorants' },
              { val: data.nbDemandesAcceptees, label: 'Adhésions acceptées' },
            ].map(({ val, label }) => (
              <div key={label} className="card p-5 text-center">
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.03em', lineHeight: 1 }}>
                  {val ?? '—'}
                </p>
                <p className="mono-sm" style={{ color: 'var(--text-2)', marginTop: 6 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Publications */}
          {data.topPublications?.length > 0 && (
            <div className="card p-5 page-in s3">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)', marginBottom: '.75rem' }}>
                Publications {annee}
              </h2>
              <div className="space-y-0">
                {data.topPublications.map(p => (
                  <div key={p.id} className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 'var(--r)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={13} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <TypePubBadge type={p.type} />
                      </div>
                      <p style={{ fontSize: '.84rem', fontWeight: 500, color: 'var(--text-1)' }} className="truncate">{p.titre}</p>
                      <p className="mono-sm" style={{ color: 'var(--text-2)' }}>{p.auteurs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Événements */}
          {data.evenements?.length > 0 && (
            <div className="card p-5 page-in s4">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)', marginBottom: '.75rem' }}>
                Événements {annee}
              </h2>
              <div className="space-y-0">
                {data.evenements.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <TypeEvBadge type={e.type} />
                      </div>
                      <p style={{ fontSize: '.84rem', fontWeight: 500, color: 'var(--text-1)' }}>{e.titre}</p>
                      <p className="mono-sm" style={{ color: 'var(--text-3)' }}>{fmt(e.dateDebut)}</p>
                    </div>
                    {e.lieu && <p className="mono-sm" style={{ color: 'var(--text-3)' }}>{e.lieu}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card py-14 text-center page-in s1">
          <BarChart2 size={32} style={{ color: 'var(--border)', margin: '0 auto .75rem' }} />
          <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-3)' }}>Aucune donnée pour {annee}</p>
        </div>
      )}
    </div>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Save } from 'lucide-react'
import { getMonProfil, updateProfil } from '../../api/membres'
import toast from 'react-hot-toast'
import { PageSpinner } from '../../components/Spinner'
import PageHeader from '../../components/ui/PageHeader'
import { StatutBadge, RoleBadge } from '../../components/ui/Badge'

const AVATAR_COLORS = [
  { bg: 'rgba(194,65,12,.10)', color: 'var(--accent)' },
  { bg: 'rgba(91,33,182,.10)', color: '#5B21B6' },
  { bg: 'rgba(21,128,61,.10)', color: '#15803D' },
  { bg: 'rgba(30,64,175,.10)', color: '#1E40AF' },
]

export default function MonProfilPage() {
  const qc = useQueryClient()
  const { data: profil, isLoading } = useQuery({ queryKey: ['mon-profil'], queryFn: getMonProfil })
  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm()

  useEffect(() => {
    if (profil) reset({
      biographie:           profil.biographie || '',
      centresInteret:       profil.centresInteret || '',
      etablissementOrigine: profil.etablissementOrigine || '',
      laboratoireOrigine:   profil.laboratoireOrigine || '',
    })
  }, [profil, reset])

  const mutation = useMutation({
    mutationFn: updateProfil,
    onSuccess: () => { toast.success('Profil mis à jour'); qc.invalidateQueries(['mon-profil']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />

  const initials = `${profil?.prenom?.[0] ?? ''}${profil?.nom?.[0] ?? ''}`
  const av = AVATAR_COLORS[(profil?.prenom?.charCodeAt(0) || 0) % AVATAR_COLORS.length]

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Mon profil" subtitle="Informations visibles par les membres du laboratoire" />

      {/* Identité */}
      <div className="card p-6 page-in s1">
        <div className="flex items-center gap-5 pb-5 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: av.bg, color: av.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.2rem',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
              {profil?.prenom} {profil?.nom}
            </h2>
            <p className="mono-sm" style={{ color: 'var(--text-2)', marginTop: 3 }}>{profil?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {profil?.statut && <StatutBadge statut={profil.statut} />}
              {profil?.role && <RoleBadge role={profil.role} />}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
          <div>
            <label className="label">Biographie</label>
            <textarea
              rows={4}
              className="input resize-none"
              placeholder="Présentez-vous brièvement…"
              {...register('biographie')}
            />
          </div>
          <div>
            <label className="label">Centres d'intérêt</label>
            <textarea
              rows={2}
              className="input resize-none"
              placeholder="Intelligence artificielle, Vision par ordinateur…"
              {...register('centresInteret')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Établissement d'origine</label>
              <input className="input" placeholder="Université Hassan II…" {...register('etablissementOrigine')} />
            </div>
            <div>
              <label className="label">Laboratoire d'origine</label>
              <input className="input" placeholder="LabXYZ…" {...register('laboratoireOrigine')} />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
              <Save size={13} />
              {isSubmitting ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

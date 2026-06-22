import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Calendar, MapPin, Trash2, ChevronRight, Edit2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getEvenements, createEvenement, updateEvenement, deleteEvenement } from '../../api/evenements'
import { useAuth } from '../../context/AuthContext'
import { PageSpinner } from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { TypeEvBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const TYPES = ['CONFERENCE', 'SEMINAIRE', 'WORKSHOP']

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}
function isUpcoming(dateDebut) {
  return dateDebut >= new Date().toISOString().split('T')[0]
}

export default function EvenementsPage() {
  const { isPrivileged } = useAuth()
  const qc = useQueryClient()
  const [page, setPage]         = useState(0)
  const [editing, setEditing]   = useState(null)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['evenements', page],
    queryFn: () => getEvenements({ page, size: 12, sort: 'dateDebut,desc' }),
  })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const openCreate = () => { reset(); setEditing(null); setShowForm(true) }
  const openEdit = (ev) => {
    setEditing(ev)
    setValue('titre', ev.titre); setValue('type', ev.type)
    setValue('dateDebut', ev.dateDebut); setValue('dateFin', ev.dateFin)
    setValue('lieu', ev.lieu); setValue('description', ev.description)
    setShowForm(true)
  }

  const mutation = useMutation({
    mutationFn: (d) => editing ? updateEvenement(editing.id, d) : createEvenement(d),
    onSuccess: () => {
      toast.success(editing ? 'Événement mis à jour' : 'Événement créé')
      qc.invalidateQueries({ queryKey: ['evenements'], refetchType: 'all' })
      setShowForm(false); reset(); setEditing(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEvenement,
    onSuccess: () => { toast.success('Événement supprimé'); qc.invalidateQueries(['evenements']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />
  const evs = data?.content || []

  return (
    <div className="space-y-6">
      <PageHeader title="Événements" subtitle={`${data?.totalElements ?? '—'} événements au total`}>
        {isPrivileged && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={14} /> Nouvel événement
          </button>
        )}
      </PageHeader>

      {/* Grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 page-in s1">
        {evs.map((ev, i) => {
          const upcoming = isUpcoming(ev.dateDebut)
          return (
            <div
              key={ev.id}
              className="card card-hover p-5 flex flex-col gap-3"
              style={{ animationDelay: `${.03 + i * .04}s` }}
            >
              {/* Badges + actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeEvBadge type={ev.type} />
                  {upcoming && (
                    <span className="badge badge-avenir">
                      <span className="badge-dot" style={{ background: 'var(--success)' }} />
                      À venir
                    </span>
                  )}
                </div>
                {isPrivileged && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(ev)} className="btn-icon" aria-label="Modifier">
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer cet événement ?')) deleteMutation.mutate(ev.id) }}
                      className="btn-icon"
                      aria-label="Supprimer"
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Titre */}
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '.96rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.02em' }} className="line-clamp-2">
                {ev.titre}
              </h3>

              {/* Méta */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  <span className="mono-sm" style={{ color: 'var(--text-2)' }}>
                    {fmtDate(ev.dateDebut)}
                    {ev.dateFin && ev.dateFin !== ev.dateDebut && ` → ${fmtDate(ev.dateFin)}`}
                  </span>
                </div>
                {ev.lieu && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                    <span className="mono-sm" style={{ color: 'var(--text-2)' }}>{ev.lieu}</span>
                  </div>
                )}
              </div>

              {/* Lien */}
              <div className="pt-2 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
                <Link
                  to={`/evenements/${ev.id}`}
                  className="flex items-center gap-1 mono-sm"
                  style={{ color: 'var(--accent)', fontWeight: 600 }}
                >
                  Voir les détails <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {!evs.length && (
        <div className="card">
          <EmptyState icon={Calendar} title="Aucun événement" desc="Planifiez votre premier événement." />
        </div>
      )}

      <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />

      {/* Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); reset(); setEditing(null) }} title={editing ? "Modifier l'événement" : 'Nouvel événement'}>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Titre</label>
            <input className="input" {...register('titre', { required: true })} />
            {errors.titre && <p className="mono-sm mt-1" style={{ color: 'var(--error)' }}>Obligatoire</p>}
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" {...register('type', { required: true })}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date début</label>
              <input type="date" className="input" {...register('dateDebut', { required: true })} />
            </div>
            <div>
              <label className="label">Date fin</label>
              <input type="date" className="input" {...register('dateFin')} />
            </div>
          </div>
          <div>
            <label className="label">Lieu</label>
            <input className="input" {...register('lieu')} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" {...register('description')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); reset(); setEditing(null) }} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{editing ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

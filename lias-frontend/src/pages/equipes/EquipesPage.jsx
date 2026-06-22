import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Users, ChevronRight, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEquipes, createEquipe, updateEquipe, deleteEquipe } from '../../api/equipes'
import { useAuth } from '../../context/AuthContext'
import { PageSpinner } from '../../components/Spinner'
import Modal from '../../components/Modal'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

// Palette sobre — une variation du même ton charcoal/terracotta
const CARD_ACCENTS = [
  { border: '#E8E6E0', dot: '#C2410C' },
  { border: '#E8E6E0', dot: '#15803D' },
  { border: '#E8E6E0', dot: '#1D4ED8' },
  { border: '#E8E6E0', dot: '#5B21B6' },
  { border: '#E8E6E0', dot: '#92400E' },
  { border: '#E8E6E0', dot: '#374151' },
]

export default function EquipesPage() {
  const { isPrivileged, isAdmin } = useAuth()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)

  const { data: equipes = [], isLoading } = useQuery({ queryKey: ['equipes'], queryFn: getEquipes })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const openCreate = () => { reset(); setEditing(null); setShowForm(true) }
  const openEdit = (eq) => {
    setEditing(eq)
    setValue('nom', eq.nom); setValue('description', eq.description); setValue('dateCreation', eq.dateCreation)
    setShowForm(true)
  }

  const mutation = useMutation({
    mutationFn: (d) => editing ? updateEquipe(editing.id, d) : createEquipe(d),
    onSuccess: () => {
      toast.success(editing ? 'Équipe mise à jour' : 'Équipe créée')
      qc.invalidateQueries(['equipes']); setShowForm(false); reset(); setEditing(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEquipe,
    onSuccess: () => { toast.success('Équipe supprimée'); qc.invalidateQueries(['equipes']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <PageHeader title="Équipes de recherche" subtitle={`${equipes.length} équipe${equipes.length !== 1 ? 's' : ''}`}>
        {isPrivileged && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={14} /> Nouvelle équipe
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 page-in s1">
        {equipes.map((eq, i) => {
          const acc = CARD_ACCENTS[i % CARD_ACCENTS.length]
          return (
            <div
              key={eq.id}
              className="card card-hover p-5 flex flex-col gap-4"
              style={{ animationDelay: `${.03 + i * .05}s` }}
            >
              {/* En-tête carte */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: acc.dot, flexShrink: 0 }} />
                  <p className="section-label">{`EQ-${String(i + 1).padStart(2, '0')}`}</p>
                </div>
                {isPrivileged && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(eq)} className="btn-icon" aria-label="Modifier">
                      <Edit2 size={13} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { if (confirm('Supprimer cette équipe ?')) deleteMutation.mutate(eq.id) }}
                        className="btn-icon"
                        aria-label="Supprimer"
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1">
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: '.4rem' }}>
                  {eq.nom}
                </h3>
                {eq.description && (
                  <p style={{ fontSize: '.80rem', color: 'var(--text-2)', lineHeight: 1.6 }} className="line-clamp-2">
                    {eq.description}
                  </p>
                )}
                {eq.dateCreation && (
                  <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: '.5rem' }}>
                    Depuis {new Date(eq.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-1.5">
                  <Users size={13} style={{ color: 'var(--text-3)' }} />
                  <span className="mono-sm" style={{ color: 'var(--text-2)' }}>
                    {eq.nbMembres ?? 0} membre{eq.nbMembres !== 1 ? 's' : ''}
                  </span>
                </div>
                <Link
                  to={`/equipes/${eq.id}`}
                  className="flex items-center gap-1 mono-sm"
                  style={{ color: 'var(--accent)', fontWeight: 600 }}
                >
                  Voir <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {!equipes.length && (
        <div className="card">
          <EmptyState icon={FlaskConical} title="Aucune équipe" desc="Créez votre première équipe de recherche." />
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); reset(); setEditing(null) }}
        title={editing ? "Modifier l'équipe" : 'Nouvelle équipe'}
      >
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Nom de l'équipe</label>
            <input className="input" {...register('nom', { required: true })} />
            {errors.nom && <p className="mono-sm mt-1" style={{ color: 'var(--error)' }}>Obligatoire</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" {...register('description')} />
          </div>
          <div>
            <label className="label">Date de création</label>
            <input type="date" className="input" {...register('dateCreation')} />
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

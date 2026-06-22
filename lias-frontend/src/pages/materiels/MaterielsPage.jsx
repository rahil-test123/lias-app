import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Package, Edit2, Trash2, UserPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getMateriels, createMateriel, updateMateriel, deleteMateriel,
  getAttributionsByMateriel, attribuerMateriel, revoquerAttribution,
} from '../../api/materiels'
import { getMembresActifs } from '../../api/membres'
import { useAuth } from '../../context/AuthContext'
import { PageSpinner } from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

function availColor(pct) {
  if (pct >= 100) return 'var(--error)'
  if (pct >= 75)  return 'var(--warning)'
  return 'var(--success)'
}

export default function MaterielsPage() {
  const { isPrivileged, isAdmin } = useAuth()
  const qc = useQueryClient()
  const [page, setPage]             = useState(0)
  const [editing, setEditing]       = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [attribuerFor, setAttribuerFor]     = useState(null)
  const [showAttributions, setShowAttributions] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['materiels', page],
    queryFn: () => getMateriels({ page, size: 12, sort: 'nom,asc' }),
  })

  const { data: membres } = useQuery({ queryKey: ['membres-actifs'], queryFn: getMembresActifs })

  const { data: attributions } = useQuery({
    queryKey: ['attributions-materiel', showAttributions],
    queryFn: () => getAttributionsByMateriel(showAttributions),
    enabled: !!showAttributions,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()
  const { register: regA, handleSubmit: handleA, reset: resetA, formState: { isSubmitting: subA } } = useForm()

  const openCreate = () => { reset(); setEditing(null); setShowForm(true) }
  const openEdit = (m) => {
    setEditing(m)
    setValue('nom', m.nom); setValue('description', m.description)
    setValue('quantiteTotal', m.quantiteTotal); setValue('dateArrivage', m.dateArrivage)
    setShowForm(true)
  }

  const mutation = useMutation({
    mutationFn: (d) => editing ? updateMateriel(editing.id, d) : createMateriel(d),
    onSuccess: () => { toast.success(editing ? 'Mis à jour' : 'Créé'); qc.invalidateQueries(['materiels']); setShowForm(false); reset(); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMateriel,
    onSuccess: () => { toast.success('Supprimé'); qc.invalidateQueries(['materiels']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const attribMutation = useMutation({
    mutationFn: attribuerMateriel,
    onSuccess: () => {
      toast.success('Attribution effectuée')
      qc.invalidateQueries(['materiels']); qc.invalidateQueries(['attributions-materiel'])
      setAttribuerFor(null); resetA()
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const revoquerMutation = useMutation({
    mutationFn: revoquerAttribution,
    onSuccess: () => { toast.success('Attribution révoquée'); qc.invalidateQueries(['attributions-materiel']); qc.invalidateQueries(['materiels']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />
  const mats = data?.content || []

  return (
    <div className="space-y-6">
      <PageHeader title="Matériels" subtitle={`${data?.totalElements ?? '—'} références`}>
        {isPrivileged && (
          <button onClick={openCreate} className="btn-primary"><Plus size={14} /> Nouveau matériel</button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 page-in s1">
        {mats.map((m, i) => {
          const dispo    = m.quantiteDisponible ?? m.quantiteTotal
          const total    = m.quantiteTotal ?? 0
          const attribue = total - dispo
          const pct      = total > 0 ? Math.round((attribue / total) * 100) : 0
          const ac       = availColor(pct)

          return (
            <div key={m.id} className="card card-hover p-5 flex flex-col gap-4" style={{ animationDelay: `${.03 + i * .04}s` }}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div style={{
                  width: 36, height: 36,
                  background: 'var(--surface-alt)',
                  borderRadius: 'var(--r)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Package size={17} strokeWidth={1.5} style={{ color: 'var(--text-2)' }} />
                </div>
                {isPrivileged && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="btn-icon" aria-label="Modifier"><Edit2 size={13} /></button>
                    {isAdmin && (
                      <button
                        onClick={() => { if (confirm(`Supprimer "${m.nom}" ?`)) deleteMutation.mutate(m.id) }}
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
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '.96rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
                  {m.nom}
                </h3>
                {m.description && (
                  <p className="line-clamp-2" style={{ fontSize: '.78rem', color: 'var(--text-2)', marginTop: '.25rem', lineHeight: 1.5 }}>
                    {m.description}
                  </p>
                )}
                {m.dateArrivage && (
                  <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: '.3rem' }}>
                    Arrivage {new Date(m.dateArrivage).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>

              {/* Barre disponibilité */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '.75rem' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="section-label">Disponibilité</span>
                  <span className="mono-sm" style={{ color: ac, fontWeight: 600 }}>
                    {dispo} / {total}
                  </span>
                </div>
                <div className="avail-bar">
                  <div className="avail-fill" style={{ width: `${pct}%`, background: ac }} />
                </div>
                <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: '.3rem' }}>
                  {attribue} attribué{attribue > 1 ? 's' : ''}
                </p>
              </div>

              {/* Actions */}
              {isPrivileged && (
                <div className="flex gap-2">
                  <button onClick={() => { setAttribuerFor(m); resetA() }} className="btn-secondary flex-1 justify-center" style={{ fontSize: '.78rem', padding: '5px 8px' }}>
                    <UserPlus size={12} /> Attribuer
                  </button>
                  <button onClick={() => setShowAttributions(m.id)} className="btn-secondary flex-1 justify-center" style={{ fontSize: '.78rem', padding: '5px 8px' }}>
                    Attributions
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!mats.length && (
        <div className="card">
          <EmptyState icon={Package} title="Aucun matériel" desc="Ajoutez votre premier équipement." />
        </div>
      )}

      <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />

      {/* Modal création/édition */}
      <Modal open={showForm} onClose={() => { setShowForm(false); reset(); setEditing(null) }} title={editing ? 'Modifier le matériel' : 'Nouveau matériel'}>
        <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, quantiteTotal: Number(d.quantiteTotal) }))} className="space-y-4">
          <div>
            <label className="label">Nom</label>
            <input className="input" {...register('nom', { required: true })} />
            {errors.nom && <p className="mono-sm mt-1" style={{ color: 'var(--error)' }}>Obligatoire</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantité totale</label>
              <input type="number" min={0} className="input" style={{ fontFamily: 'var(--font-mono)' }} {...register('quantiteTotal', { required: true, min: 1 })} />
            </div>
            <div>
              <label className="label">Date d'arrivage</label>
              <input type="date" className="input" {...register('dateArrivage')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); reset(); setEditing(null) }} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{editing ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal attribution */}
      <Modal open={!!attribuerFor} onClose={() => { setAttribuerFor(null); resetA() }} title={`Attribuer : ${attribuerFor?.nom}`} size="sm">
        <form onSubmit={handleA(d => attribMutation.mutate({ ...d, materielId: attribuerFor?.id, quantite: Number(d.quantite) }))} className="space-y-4">
          <div>
            <label className="label">Membre</label>
            <select className="input" {...regA('membreId', { required: true })}>
              <option value="">— Sélectionner —</option>
              {membres?.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantité</label>
            <input type="number" min={1} defaultValue={1} className="input" style={{ fontFamily: 'var(--font-mono)' }} {...regA('quantite', { required: true })} />
          </div>
          <div>
            <label className="label">Date d'attribution</label>
            <input type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} {...regA('dateAttribution')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAttribuerFor(null)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={subA} className="btn-primary">Attribuer</button>
          </div>
        </form>
      </Modal>

      {/* Modal liste attributions */}
      <Modal open={!!showAttributions} onClose={() => setShowAttributions(null)} title="Liste des attributions">
        <div className="space-y-1">
          {attributions?.map(a => (
            <div key={a.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '.84rem', color: 'var(--text-1)' }}>{a.membreNom}</p>
                <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 1 }}>
                  Qté : {a.quantite} — {a.dateAttribution || '—'}
                </p>
              </div>
              <button
                onClick={() => revoquerMutation.mutate(a.id)}
                className="btn-icon"
                aria-label="Révoquer"
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {!attributions?.length && (
            <p className="mono-sm py-6 text-center" style={{ color: 'var(--text-3)' }}>Aucune attribution</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

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
import { useAuth } from '../../context/useAuth'
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

export default function MaterielsPage({ records }) {
  const { isPrivileged, isAdmin } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [operationKey, setOperationKey] = useState('')
  const [page, setPage]             = useState(0)
  const [editing, setEditing]       = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [attribuerFor, setAttribuerFor]     = useState(null)
  const [showAttributions, setShowAttributions] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['materiels', page],
    enabled: !records,
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
    setValue('categorie', m.categorie); setValue('etat', m.etat); setValue('remarques', m.remarques);
    setValue('nom', m.nom); setValue('description', m.description)
    setValue('quantiteTotal', m.quantiteTotal); setValue('dateArrivage', m.dateArrivage)
    setShowForm(true)
  }

  const mutation = useMutation({
    mutationFn: (d) => editing ? updateMateriel(editing.id, d) : createMateriel(d),
    onSuccess: () => { toast.success(editing ? 'Mis à jour' : 'Créé'); qc.invalidateQueries({ queryKey: ['materiels'] }); qc.invalidateQueries({ queryKey: ['stock-vue'] }); setShowForm(false); reset(); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMateriel,
    onSuccess: () => { toast.success('Matériel archivé, historique conservé'); qc.invalidateQueries({ queryKey: ['materiels'] }); qc.invalidateQueries({ queryKey: ['stock-vue'] }) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const attribMutation = useMutation({
    mutationFn: attribuerMateriel,
    onSuccess: () => {
      toast.success('Attribution effectuée')
      qc.invalidateQueries({ queryKey: ['materiels'] }); qc.invalidateQueries({ queryKey: ['stock-vue'] }); qc.invalidateQueries({ queryKey: ['attributions-materiel'] }); qc.invalidateQueries({ queryKey: ['stock-vue'] })
      setAttribuerFor(null); resetA()
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const revoquerMutation = useMutation({
    mutationFn: revoquerAttribution,
    onSuccess: () => { toast.success('Attribution révoquée'); qc.invalidateQueries({ queryKey: ['attributions-materiel'] }); qc.invalidateQueries({ queryKey: ['stock-vue'] }); qc.invalidateQueries({ queryKey: ['materiels'] }); qc.invalidateQueries({ queryKey: ['stock-vue'] }) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />
  const source = records || data?.content || []
  const mats = source.filter(m => (showArchived || !m.archive) && (!search || `${m.nom} ${m.description || ''}`.toLowerCase().includes(search.toLowerCase())) && (!category || m.categorie === category))

  return (
    <div className="space-y-6">
      <PageHeader title="Matériels" subtitle={`${records?.length ?? data?.totalElements ?? '—'} références`}>
        {isPrivileged && (
          <button onClick={openCreate} className="btn-primary"><Plus size={14} /> Nouveau matériel</button>
        )}
      </PageHeader>

      <div className="flex flex-wrap gap-3"><input aria-label="Rechercher dans le stock" className="input flex-1" placeholder="Rechercher un matériel…" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Filtrer par catégorie" className="input" value={category} onChange={e => setCategory(e.target.value)}><option value="">Toutes les catégories</option>{[...new Set(source.map(m => m.categorie))].filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      <label className="text-sm flex gap-2"><input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />Inclure les matériels archivés</label>
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
                        onClick={() => { if (confirm(`Archiver "${m.nom}" ? Les anciennes affectations seront conservées.`)) deleteMutation.mutate(m.id) }}
                        className="btn-icon"
                        aria-label="Archiver"
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
                <h3 className="break-words" style={{ fontFamily: 'var(--font-serif)', fontSize: '.96rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
                  {m.nom}{m.archive && <span className="badge ml-2">Archivé</span>}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{m.categorie} · {m.etat || 'État non renseigné'}</p>
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
                  <button disabled={m.archive} onClick={() => { setOperationKey(crypto.randomUUID()); setAttribuerFor(m); resetA() }} className="btn-secondary flex-1 justify-center" style={{ fontSize: '.78rem', padding: '5px 8px' }}>
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

      {!records && <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />}

      {/* Modal création/édition */}
      <Modal open={showForm} onClose={() => { setShowForm(false); reset(); setEditing(null) }} title={editing ? 'Modifier le matériel' : 'Nouveau matériel'}>
        <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, quantiteTotal: Number(d.quantiteTotal) }))} className="space-y-4">
          <div>
            <label className="label">Nom</label>
            <input className="input" {...register('nom', { required: true })} />
            {errors.nom && <p className="mono-sm mt-1" style={{ color: 'var(--error)' }}>Obligatoire</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="label">Type / catégorie<input className="input w-full" required maxLength={100} list="materiel-categories" {...register('categorie', { required: true })} /><datalist id="materiel-categories">{['PC portable','PC fixe','Imprimante','Écran','Clavier et souris','Mobilier','Fournitures','Autre'].map(c => <option key={c} value={c} />)}</datalist></label>
            <label className="label">État<select className="input w-full" {...register('etat')}><option>Neuf</option><option>Bon état</option><option>Usagé</option><option>À réparer</option></select></label>
          </div>
          <label className="label block">Remarques / motif de correction<textarea className="input w-full" maxLength={2000} {...register('remarques')} /></label>
          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantité totale</label>
              <input type="number" min={0} className="input" style={{ fontFamily: 'var(--font-mono)' }} {...register('quantiteTotal', { required: true, min: 0 })} />
            </div>
            <div>
              <label className="label">Date d'arrivage</label>
              <input type="date" className="input" {...register('dateArrivage')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); reset(); setEditing(null) }} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">{editing ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal attribution */}
      <Modal open={!!attribuerFor} onClose={() => { setAttribuerFor(null); resetA() }} title={`Attribuer : ${attribuerFor?.nom}`} size="sm">
        <form onSubmit={handleA(d => attribMutation.mutate({ ...d, materielId: attribuerFor?.id, quantite: Number(d.quantite), cleOperation: operationKey }))} className="space-y-4">
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
            <button type="submit" disabled={subA || attribMutation.isPending} className="btn-primary">Attribuer</button>
          </div>
        </form>
      </Modal>

      {/* Modal liste attributions */}
      <Modal open={!!showAttributions} onClose={() => setShowAttributions(null)} title="Liste des attributions">
        <div className="space-y-1">
          {attributions?.map(a => (
            <div key={`${a.gestionDemande ? 'demande' : 'direct'}-${a.id}`} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '.84rem', color: 'var(--text-1)' }}>{a.membreNom}</p>
                <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 1 }}>
                  {a.annule ? 'Annulée · ' : ''}Qté : {a.quantite} — {a.dateAttribution || '—'}
                </p>
              </div>
              <button
                disabled={a.annule} onClick={() => { const motif = prompt('Motif de révocation (le matériel doit être rendu au stock) :'); if (motif?.trim()) revoquerMutation.mutate({ id: a.id, motif, gestionDemande: a.gestionDemande }) }}
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

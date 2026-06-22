import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Search, Edit2, Trash2, ExternalLink, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPublications, createPublication, updatePublication, deletePublication } from '../../api/publications'
import { useAuth } from '../../context/AuthContext'
import { PageSpinner } from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { TypePubBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const TYPES = ['ARTICLE', 'CONFERENCE', 'THESE', 'RAPPORT', 'BREVET', 'LIVRE']

export default function PublicationsPage() {
  const { user, isAdmin } = useAuth()
  const qc = useQueryClient()
  const [page, setPage]         = useState(0)
  const [search, setSearch]     = useState('')
  const [editing, setEditing]   = useState(null)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['publications', page],
    queryFn: () => getPublications({ page, size: 10, sort: 'annee,desc' }),
  })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const openCreate = () => { reset(); setEditing(null); setShowForm(true) }
  const openEdit = (pub) => {
    setEditing(pub)
    setValue('titre', pub.titre); setValue('auteurs', pub.auteurs)
    setValue('annee', pub.annee); setValue('type', pub.type); setValue('lien', pub.lien)
    setShowForm(true)
  }

  const mutation = useMutation({
    mutationFn: (d) => editing ? updatePublication(editing.id, d) : createPublication(d),
    onSuccess: () => {
      toast.success(editing ? 'Publication mise à jour' : 'Publication créée')
      qc.invalidateQueries(['publications']); setShowForm(false); reset(); setEditing(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePublication,
    onSuccess: () => { toast.success('Publication supprimée'); qc.invalidateQueries(['publications']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />

  const pubs     = data?.content || []
  const filtered = search
    ? pubs.filter(p => `${p.titre} ${p.auteurs}`.toLowerCase().includes(search.toLowerCase()))
    : pubs

  return (
    <div className="space-y-6">
      <PageHeader title="Publications" subtitle={`${data?.totalElements ?? '—'} publications au total`}>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} /> Nouvelle publication
        </button>
      </PageHeader>

      {/* Recherche */}
      <div className="search-wrap page-in s1">
        <Search size={14} className="search-icon" />
        <input className="input" placeholder="Titre, auteurs…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Liste */}
      <div className="space-y-2 page-in s2">
        {filtered.map((pub, i) => {
          const canEdit = isAdmin || pub.membreId === user?.id
          return (
            <div
              key={pub.id}
              className="card card-hover flex items-start gap-4 px-5 py-4"
              style={{ animationDelay: `${.03 + i * .03}s` }}
            >
              {/* Icône */}
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r)',
                background: 'var(--surface-alt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <BookOpen size={16} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TypePubBadge type={pub.type} />
                  <span className="mono-sm" style={{ color: 'var(--text-3)' }}>{pub.annee}</span>
                </div>
                <p style={{ fontWeight: 500, fontSize: '.875rem', color: 'var(--text-1)' }} className="truncate">
                  {pub.titre}
                </p>
                <p className="mono-sm" style={{ color: 'var(--text-2)', marginTop: 2 }}>{pub.auteurs}</p>
                {pub.membreNom && (
                  <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 3 }}>
                    Soumis par {pub.membreNom}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {pub.lien && (
                  <a href={pub.lien} target="_blank" rel="noreferrer" className="btn-icon" aria-label="Lien externe">
                    <ExternalLink size={13} />
                  </a>
                )}
                {canEdit && (
                  <>
                    <button onClick={() => openEdit(pub)} className="btn-icon" aria-label="Modifier">
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer cette publication ?')) deleteMutation.mutate(pub.id) }}
                      className="btn-icon"
                      aria-label="Supprimer"
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}

        {!filtered.length && (
          <div className="card">
            <EmptyState icon={BookOpen} title="Aucune publication" desc={search ? `Aucun résultat pour "${search}"` : 'Ajoutez votre première publication.'} />
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />

      {/* Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); reset(); setEditing(null) }} title={editing ? 'Modifier la publication' : 'Nouvelle publication'}>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Titre</label>
            <input className="input" {...register('titre', { required: true })} />
            {errors.titre && <p className="mono-sm mt-1" style={{ color: 'var(--error)' }}>Obligatoire</p>}
          </div>
          <div>
            <label className="label">Auteurs</label>
            <input className="input" placeholder="A. Nom, B. Prénom, …" style={{ fontFamily: 'var(--font-mono)', fontSize: '.82rem' }} {...register('auteurs', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Année</label>
              <input type="number" className="input" style={{ fontFamily: 'var(--font-mono)' }} {...register('annee', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" {...register('type', { required: true })}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Lien DOI / URL</label>
            <input className="input" placeholder="https://…" style={{ fontFamily: 'var(--font-mono)', fontSize: '.82rem' }} {...register('lien')} />
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

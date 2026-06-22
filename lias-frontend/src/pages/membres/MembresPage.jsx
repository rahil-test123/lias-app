import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Plus, ChevronRight, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { getMembres, createMembre, updateStatut, toggleActif } from '../../api/membres'
import { useAuth } from '../../context/AuthContext'
import { PageSpinner } from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { StatutBadge, RoleBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const STATUTS = ['PERMANENT', 'ASSOCIE', 'DOCTORANT', 'RETRAITE', 'ANCIEN']
const ROLES   = ['ROLE_ADMIN', 'ROLE_DIRECTEUR', 'ROLE_MEMBRE', 'ROLE_DOCTORANT']

// Palette sobre pour les avatars — une par initiale
const AVATAR_COLORS = [
  { bg: '#F0F4FF', color: '#3B4A6B' },
  { bg: '#FFF4F0', color: '#7A3B28' },
  { bg: '#F0FDF4', color: '#166534' },
  { bg: '#F5F3FF', color: '#4C1D95' },
  { bg: '#FFFBEB', color: '#78350F' },
]
function avatarStyle(name = '') {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function MembresPage() {
  const { isAdmin } = useAuth()
  const qc = useQueryClient()
  const [page, setPage]         = useState(0)
  const [search, setSearch]     = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['membres', page],
    queryFn: () => getMembres({ page, size: 10, sort: 'nom,asc' }),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const createMutation = useMutation({
    mutationFn: createMembre,
    onSuccess: () => { toast.success('Membre créé'); qc.invalidateQueries(['membres']); setShowCreate(false); reset() },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const statutMutation = useMutation({
    mutationFn: ({ id, statut }) => updateStatut(id, statut),
    onSuccess: () => { toast.success('Statut mis à jour'); qc.invalidateQueries(['membres']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleActif(id),
    onSuccess: (res) => { toast.success(res.actif ? 'Compte activé' : 'Compte désactivé'); qc.invalidateQueries(['membres']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />

  const membres  = data?.content || []
  const filtered = search
    ? membres.filter(m => `${m.nom} ${m.prenom} ${m.email}`.toLowerCase().includes(search.toLowerCase()))
    : membres

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membres"
        subtitle={`${data?.totalElements ?? '—'} membres au total`}
      >
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={14} /> Nouveau membre
          </button>
        )}
      </PageHeader>

      {/* Recherche */}
      <div className="search-wrap page-in s1">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou email…"
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden page-in s2">
        <table className="table-base">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Rôle</th>
              <th>Actif</th>
              {isAdmin && <th>Actions</th>}
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const av = avatarStyle(m.nom)
              return (
                <tr key={m.id}>
                  {/* Membre */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="avatar shrink-0"
                        style={{ width: 32, height: 32, background: av.bg, color: av.color, fontSize: '.68rem', fontWeight: 700 }}
                      >
                        {m.prenom?.[0]}{m.nom?.[0]}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '.84rem' }}>{m.prenom} {m.nom}</span>
                    </div>
                  </td>

                  {/* Email — monospace */}
                  <td className="mono-sm" style={{ color: 'var(--text-2)' }}>{m.email}</td>

                  {/* Statut */}
                  <td><StatutBadge statut={m.statut} /></td>

                  {/* Rôle */}
                  <td><RoleBadge role={m.role} /></td>

                  {/* Actif */}
                  <td>
                    {m.actif
                      ? <UserCheck size={15} style={{ color: 'var(--success)' }} />
                      : <UserX    size={15} style={{ color: 'var(--error)' }} />
                    }
                  </td>

                  {/* Actions admin */}
                  {isAdmin && (
                    <td>
                      <div className="flex items-center gap-2">
                        <select
                          className="input py-1 text-xs"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: '.72rem', fontFamily: 'var(--font-mono)' }}
                          value={m.statut}
                          onChange={e => statutMutation.mutate({ id: m.id, statut: e.target.value })}
                        >
                          {STATUTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button
                          onClick={() => toggleMutation.mutate(m.id)}
                          className={m.actif ? 'btn-danger' : 'btn-success'}
                          style={{ padding: '3px 10px', fontSize: '.72rem', fontFamily: 'var(--font-mono)' }}
                        >
                          {m.actif ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Lien détail */}
                  <td>
                    <Link to={`/membres/${m.id}`} className="btn-icon" aria-label="Voir le profil">
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyState
            icon={Users => <Search size={22} strokeWidth={1.4} />}
            title="Aucun membre trouvé"
            desc={search ? `Aucun résultat pour "${search}"` : 'Créez votre premier membre.'}
          />
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />

      {/* Modal création */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); reset() }} title="Nouveau membre" size="lg">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom</label>
              <input className="input" {...register('prenom', { required: true })} />
              {errors.prenom && <p className="mono-sm mt-1" style={{ color: 'var(--error)' }}>Obligatoire</p>}
            </div>
            <div>
              <label className="label">Nom</label>
              <input className="input" {...register('nom', { required: true })} />
              {errors.nom && <p className="mono-sm mt-1" style={{ color: 'var(--error)' }}>Obligatoire</p>}
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" style={{ fontFamily: 'var(--font-mono)' }} {...register('email', { required: true })} />
          </div>
          <div>
            <label className="label">Mot de passe temporaire</label>
            <input type="password" className="input" {...register('password', { required: true, minLength: 6 })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Statut</label>
              <select className="input" {...register('statut')}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Rôle</label>
              <select className="input" {...register('role')}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); reset() }} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">Créer le membre</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

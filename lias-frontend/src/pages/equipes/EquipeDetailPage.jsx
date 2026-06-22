import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserMinus, Award, Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEquipe, ajouterMembre, retirerMembre, ajouterMandat, terminerMandat } from '../../api/equipes'
import { getMembresActifs } from '../../api/membres'
import { useAuth } from '../../context/AuthContext'
import { PageSpinner } from '../../components/Spinner'
import Modal from '../../components/Modal'

const ROLES_MANDAT = ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE']
const ROLE_LABEL   = { DIRECTEUR: 'Directeur', VICE_DIRECTEUR: 'Vice-Directeur', CHEF_EQUIPE: "Chef d'équipe" }

// Désaturés — dot only
const ROLE_DOT = {
  DIRECTEUR:      'var(--accent)',
  VICE_DIRECTEUR: 'var(--warning)',
  CHEF_EQUIPE:    '#2563EB',
}

const AVATAR_COLORS = [
  { bg: 'rgba(194,65,12,.10)', color: 'var(--accent)' },
  { bg: 'rgba(91,33,182,.10)', color: '#5B21B6' },
  { bg: 'rgba(21,128,61,.10)', color: '#15803D' },
  { bg: 'rgba(30,64,175,.10)', color: '#1E40AF' },
  { bg: 'rgba(107,114,128,.10)', color: 'var(--text-2)' },
]
function av(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]
}

function fmt(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : 'En cours' }

export default function EquipeDetailPage() {
  const { id } = useParams()
  const { isPrivileged } = useAuth()
  const qc = useQueryClient()

  const [showAddMembre, setShowAddMembre] = useState(false)
  const [showAddMandat, setShowAddMandat] = useState(false)
  const [selectedMembre, setSelectedMembre] = useState('')
  const [mandatForm, setMandatForm] = useState({ membreId: '', role: 'DIRECTEUR', dateDebut: '' })

  const { data: equipe, isLoading } = useQuery({ queryKey: ['equipe', id], queryFn: () => getEquipe(id) })
  const { data: tousLesMembres = [] } = useQuery({ queryKey: ['membres-actifs'], queryFn: getMembresActifs })

  const addMembreMutation = useMutation({
    mutationFn: (membreId) => ajouterMembre(id, membreId),
    onSuccess: () => {
      toast.success("Membre ajouté")
      qc.invalidateQueries(['equipe', id]); qc.invalidateQueries(['equipes'])
      setShowAddMembre(false); setSelectedMembre('')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const removeMembreMutation = useMutation({
    mutationFn: retirerMembre,
    onSuccess: () => {
      toast.success("Membre retiré")
      qc.invalidateQueries(['equipe', id]); qc.invalidateQueries(['equipes'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const addMandatMutation = useMutation({
    mutationFn: ajouterMandat,
    onSuccess: () => {
      toast.success('Mandat créé')
      qc.invalidateQueries(['equipe', id]); setShowAddMandat(false)
      setMandatForm({ membreId: '', role: 'DIRECTEUR', dateDebut: '' })
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const terminerMandatMutation = useMutation({
    mutationFn: terminerMandat,
    onSuccess: () => { toast.success('Mandat terminé'); qc.invalidateQueries(['equipe', id]) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />
  if (!equipe) return (
    <div className="card py-14 text-center">
      <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-serif)' }}>Équipe introuvable</p>
    </div>
  )

  const membresEquipeIds = (equipe.membres || []).map(m => m.membreId)
  const membresDisponibles = tousLesMembres.filter(m => !membresEquipeIds.includes(m.id))

  const handleAjouterMembre = () => {
    if (!selectedMembre) { toast.error('Sélectionne un membre'); return }
    addMembreMutation.mutate(Number(selectedMembre))
  }

  const handleAjouterMandat = () => {
    if (!mandatForm.membreId) { toast.error('Sélectionne un membre'); return }
    addMandatMutation.mutate({
      membreId: Number(mandatForm.membreId),
      role: mandatForm.role,
      dateDebut: mandatForm.dateDebut || null,
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="page-in">
        <Link
          to="/equipes"
          className="inline-flex items-center gap-1.5 mono-sm mb-4 transition-colors"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
        >
          <ArrowLeft size={13} /> Retour aux équipes
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.025em' }}>
              {equipe.nom}
            </h1>
            {equipe.description && (
              <p style={{ fontSize: '.875rem', color: 'var(--text-2)', marginTop: '.4rem', lineHeight: 1.5 }}>{equipe.description}</p>
            )}
            {equipe.dateCreation && (
              <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: '.3rem' }}>
                Créée le {fmt(equipe.dateCreation)}
              </p>
            )}
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r)',
            background: 'var(--surface-alt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Users size={20} strokeWidth={1.5} style={{ color: 'var(--text-2)' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Membres ── */}
        <div className="card p-5 page-in s1">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)' }}>
              Membres <span className="mono-sm" style={{ color: 'var(--text-3)' }}>({(equipe.membres || []).length})</span>
            </h2>
            {isPrivileged && membresDisponibles.length > 0 && (
              <button onClick={() => setShowAddMembre(true)} className="btn-secondary" style={{ fontSize: '.75rem', padding: '4px 10px' }}>
                <UserPlus size={12} /> Ajouter
              </button>
            )}
          </div>
          <div className="space-y-0">
            {(equipe.membres || []).map(m => {
              const a = av(m.membreNom || '')
              return (
                <div key={m.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: a.bg, color: a.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.72rem',
                      flexShrink: 0,
                    }}>
                      {m.membreNom?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <Link
                        to={`/membres/${m.membreId}`}
                        style={{ fontSize: '.84rem', fontWeight: 500, color: 'var(--text-1)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-1)')}
                      >
                        {m.membreNom}
                      </Link>
                      <p className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 1 }}>
                        {m.membreStatut} · depuis {fmt(m.dateDebut)}
                      </p>
                    </div>
                  </div>
                  {isPrivileged && (
                    <button
                      onClick={() => { if (confirm('Retirer ce membre ?')) removeMembreMutation.mutate(m.id) }}
                      className="btn-icon"
                      aria-label="Retirer"
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <UserMinus size={13} />
                    </button>
                  )}
                </div>
              )
            })}
            {!(equipe.membres || []).length && (
              <p className="mono-sm text-center py-6" style={{ color: 'var(--text-3)' }}>Aucun membre</p>
            )}
          </div>
        </div>

        {/* ── Mandats ── */}
        <div className="card p-5 page-in s2">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.96rem', color: 'var(--text-1)' }}>
              Mandats actifs <span className="mono-sm" style={{ color: 'var(--text-3)' }}>({(equipe.mandats || []).length})</span>
            </h2>
            {isPrivileged && (
              <button onClick={() => setShowAddMandat(true)} className="btn-secondary" style={{ fontSize: '.75rem', padding: '4px 10px' }}>
                <Plus size={12} /> Nouveau
              </button>
            )}
          </div>
          <div className="space-y-0">
            {(equipe.mandats || []).map(m => (
              <div key={m.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ROLE_DOT[m.role] || 'var(--text-3)', display: 'inline-block', flexShrink: 0 }} />
                    <span className="mono-sm" style={{ color: 'var(--text-2)', fontWeight: 600 }}>{ROLE_LABEL[m.role] || m.role}</span>
                  </div>
                  <p style={{ fontSize: '.84rem', fontWeight: 500, color: 'var(--text-1)' }}>{m.membreNom}</p>
                  <p className="mono-sm" style={{ color: 'var(--text-3)' }}>Depuis {fmt(m.dateDebut)}</p>
                </div>
                {isPrivileged && (
                  <button
                    onClick={() => { if (confirm('Terminer ce mandat ?')) terminerMandatMutation.mutate(m.id) }}
                    className="btn-icon"
                    aria-label="Terminer"
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
            {!(equipe.mandats || []).length && (
              <p className="mono-sm text-center py-6" style={{ color: 'var(--text-3)' }}>Aucun mandat actif</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal ajouter membre */}
      <Modal open={showAddMembre} onClose={() => { setShowAddMembre(false); setSelectedMembre('') }} title="Ajouter un membre" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Membre</label>
            <select className="input" value={selectedMembre} onChange={e => setSelectedMembre(e.target.value)}>
              <option value="">— Choisir —</option>
              {membresDisponibles.map(m => (
                <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.statut})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowAddMembre(false); setSelectedMembre('') }} className="btn-secondary">Annuler</button>
            <button type="button" onClick={handleAjouterMembre} disabled={!selectedMembre || addMembreMutation.isPending} className="btn-primary">
              {addMembreMutation.isPending ? 'Ajout…' : 'Ajouter'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal ajouter mandat */}
      <Modal open={showAddMandat} onClose={() => { setShowAddMandat(false); setMandatForm({ membreId: '', role: 'DIRECTEUR', dateDebut: '' }) }} title="Nouveau mandat" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Membre</label>
            <select className="input" value={mandatForm.membreId} onChange={e => setMandatForm(f => ({ ...f, membreId: e.target.value }))}>
              <option value="">— Choisir —</option>
              {tousLesMembres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Rôle</label>
            <select className="input" value={mandatForm.role} onChange={e => setMandatForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES_MANDAT.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date de début</label>
            <input type="date" className="input" value={mandatForm.dateDebut} onChange={e => setMandatForm(f => ({ ...f, dateDebut: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowAddMandat(false); setMandatForm({ membreId: '', role: 'DIRECTEUR', dateDebut: '' }) }} className="btn-secondary">Annuler</button>
            <button type="button" onClick={handleAjouterMandat} disabled={!mandatForm.membreId || addMandatMutation.isPending} className="btn-primary">
              {addMandatMutation.isPending ? 'Création…' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import api from '../../api/axios'
import { downloadPdf } from '../../api/download'
import PageHeader from '../../components/ui/PageHeader'

export default function DossiersPage() {
  const [q,setQ] = useState('')
  const { data = [], error, isLoading } = useQuery({ queryKey: ['dossiers'], queryFn: () => api.get('/admin/dossiers').then(r => r.data) })
  const { data: stats = {} } = useQuery({ queryKey: ['indicateurs'], queryFn: () => api.get('/admin/dossiers/indicateurs').then(r => r.data) })
  return <div className="space-y-6"><PageHeader title="Utilisateurs & CV" subtitle="Les comptes du laboratoire et leurs dossiers." /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[['utilisateurs','Utilisateurs'],['cv','CV déposés'],['reunions','Réunions'],['candidatures','Candidatures']].map(([key,label]) => <div className="card p-5" key={key}><p className="text-sm text-gray-500">{label}</p><p className="text-3xl mt-2">{stats[key] ?? '—'}</p></div>)}</div><div className="flex gap-3 flex-wrap"><Link to="/membres" className="btn-secondary">Gérer les membres</Link><Link to="/adhesions" className="btn-secondary">Examiner les candidatures</Link></div><input aria-label="Rechercher un utilisateur" className="input w-full" placeholder="Rechercher un nom ou un email…" value={q} onChange={e => setQ(e.target.value)} />{error && <p role="alert">Impossible de charger les utilisateurs.</p>}{isLoading ? <p>Chargement…</p> : <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="p-4 text-left">Utilisateur</th><th className="text-left">Rôle</th><th className="text-left">Statut</th><th className="p-4 text-left">CV</th></tr></thead><tbody>{data.filter(m => `${m.nom} ${m.prenom} ${m.email}`.toLowerCase().includes(q.toLowerCase())).map(m => <tr key={m.id} className="border-t"><td className="p-4"><p className="font-semibold">{m.prenom} {m.nom}</p><p className="text-gray-500">{m.email}</p></td><td>{m.role.replace('ROLE_','')}</td><td>{m.actif ? 'Actif' : 'Désactivé'}</td><td className="p-4">{m.cvDisponible ? <button className="btn-secondary" onClick={() => downloadPdf(`/admin/dossiers/${m.id}/cv`, `cv-${m.id}.pdf`)}><Download size={14} />Télécharger le CV</button> : 'Non déposé'}</td></tr>)}</tbody></table>{!data.length && <p className="p-5">Aucun utilisateur.</p>}</div>}</div>
}

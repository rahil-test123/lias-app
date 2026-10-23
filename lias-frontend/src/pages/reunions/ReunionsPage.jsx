import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Plus, Download, MapPin, Video, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { downloadPdf } from '../../api/download'
import { useAuth } from '../../context/useAuth'
import Modal from '../../components/Modal'
import PageHeader from '../../components/ui/PageHeader'

const blank = { titre: '', description: '', dateHeure: '', lieu: '', lien: '', participants: [] }
export default function ReunionsPage() {
  const { isPrivileged } = useAuth()
  const qc = useQueryClient()
  const [q, setQ] = useState(''), [date, setDate] = useState('')
  const [form, setForm] = useState(null), [detail, setDetail] = useState(null), [remove, setRemove] = useState(null)
  const [busy, setBusy] = useState(false)
  const { data: rows = [], isLoading, error } = useQuery({ queryKey: ['reunions', q, date], queryFn: () => api.get('/reunions', { params: { q, date: date || undefined } }).then(r => r.data) })
  const { data: members = [] } = useQuery({ queryKey: ['participants'], queryFn: () => api.get('/membres/actifs').then(r => r.data), enabled: isPrivileged })
  const refresh = () => qc.invalidateQueries({ queryKey: ['reunions'] })
  async function save(e) {
    e.preventDefault(); setBusy(true)
    try {
      const body = { ...form, dateHeure: form.dateHeure.length === 16 ? `${form.dateHeure}:00` : form.dateHeure }
      await (form.id ? api.put(`/reunions/${form.id}`, body) : api.post('/reunions', body))
      toast.success('Réunion enregistrée'); setForm(null); refresh()
    } catch(e) { toast.error(e.response?.data?.message || 'Enregistrement impossible') } finally { setBusy(false) }
  }
  async function upload(id, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf')) return toast.error('Choisissez un PDF de 5 Mo maximum')
    setBusy(true)
    try { const body = new FormData(); body.append('fichier', file); const { data } = await api.post(`/reunions/${id}/pv`, body); setDetail(data); refresh(); toast.success('PV enregistré') }
    catch(e) { toast.error(e.response?.data?.message || 'Téléversement impossible') } finally { setBusy(false) }
  }
  async function destroy() {
    setBusy(true)
    try { await api.delete(`/reunions/${remove.id}`); setRemove(null); refresh(); toast.success('Réunion supprimée') }
    catch { toast.error('Suppression impossible') } finally { setBusy(false) }
  }
  return <div className="space-y-6">
    <PageHeader title="Réunions & procès-verbaux" subtitle="Préparer les échanges, conserver les décisions." action={null} />
    <div className="flex flex-wrap gap-3"><input aria-label="Rechercher une réunion" className="input flex-1" placeholder="Rechercher par titre…" value={q} onChange={e => setQ(e.target.value)} /><input aria-label="Filtrer par date" className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />{isPrivileged && <button className="btn-primary" onClick={() => setForm({ ...blank })}><Plus size={16} />Nouvelle réunion</button>}</div>
    {error && <p role="alert">Impossible de charger les réunions. <button onClick={refresh}>Réessayer</button></p>}
    {isLoading ? <p>Chargement…</p> : !rows.length && !error ? <div className="card p-8 text-center"><Calendar className="mx-auto mb-3" /><h2>Aucune réunion</h2><p>Les réunions auxquelles vous avez accès apparaîtront ici.</p></div> : <div className="grid md:grid-cols-2 gap-4">{rows.map(r => <article className="card p-6 space-y-4" key={r.id}>
      <div className="flex justify-between gap-2"><span className="mono-sm text-orange-800">{new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</span><span className="badge">{r.pvDisponible ? 'PV disponible' : 'PV à venir'}</span></div>
      <h2 className="text-xl font-semibold">{r.titre}</h2><p className="text-sm text-gray-600 line-clamp-2">{r.description}</p><p className="flex gap-2 text-sm"><MapPin size={16} />{r.lieu || 'Visioconférence'}</p>
      <div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={async () => { try { setDetail((await api.get(`/reunions/${r.id}`)).data) } catch { toast.error('Réunion inaccessible') } }}>Consulter</button>{r.pvDisponible && <button className="btn-secondary" onClick={() => downloadPdf(`/reunions/${r.id}/pv`, `pv-${r.id}.pdf`)}><Download size={14} />Télécharger le PV</button>}{isPrivileged && <><button aria-label={`Modifier ${r.titre}`} className="btn-icon" onClick={() => setForm({ ...r, dateHeure: r.dateHeure.slice(0,16) })}><Pencil size={16} /></button><button aria-label={`Supprimer ${r.titre}`} className="btn-icon" onClick={() => setRemove(r)}><Trash2 size={16} /></button></>}</div>
    </article>)}</div>}
    {form && <Modal open title={form.id ? 'Modifier la réunion' : 'Nouvelle réunion'} onClose={() => setForm(null)}><form onSubmit={save} className="space-y-4 p-2">
      {[['titre','Titre','text'],['dateHeure','Date et heure','datetime-local'],['lieu','Lieu','text'],['lien','Lien de visioconférence','url']].map(([key,label,type]) => <label className="block text-sm" key={key}>{label}<input className="input w-full mt-1" type={type} required={['titre','dateHeure'].includes(key)} maxLength={key==='titre'?200:key==='lieu'?300:1000} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
      <label className="block text-sm">Description<textarea className="input w-full" rows={3} maxLength={5000} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <fieldset><legend className="text-sm font-medium">Participants</legend><p className="text-xs text-gray-500 mb-2">Sans sélection : accessible à tous les membres. Sinon : participants et responsables uniquement.</p><div className="max-h-36 overflow-auto grid sm:grid-cols-2 gap-2">{members.map(m => <label key={m.id} className="text-sm flex gap-2"><input type="checkbox" checked={form.participants.includes(m.id)} onChange={e => setForm({ ...form, participants: e.target.checked ? [...form.participants, m.id] : form.participants.filter(id => id !== m.id) })} />{m.prenom} {m.nom}</label>)}</div></fieldset>
      <button className="btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
    </form></Modal>}
    {detail && <Modal open title={detail.titre} onClose={() => setDetail(null)}><div className="space-y-4"><p>{new Date(detail.dateHeure).toLocaleString('fr-FR')}</p><p className="whitespace-pre-wrap">{detail.description || 'Aucune description.'}</p><p>{detail.lieu}</p>{detail.lien && <a className="btn-secondary" href={detail.lien} target="_blank" rel="noreferrer"><Video size={16} />Rejoindre la visioconférence</a>}<p>{detail.participants.length ? `${detail.participants.length} participant(s) sélectionné(s)` : 'Ouverte à tous les membres'}</p>{detail.pvDisponible ? <button className="btn-primary" onClick={() => downloadPdf(`/reunions/${detail.id}/pv`, `pv-${detail.id}.pdf`)}><Download size={16} />Télécharger le PV</button> : <p className="text-gray-500">Aucun PV ajouté pour cette réunion.</p>}{isPrivileged && <label className="block text-sm">{detail.pvDisponible ? 'Remplacer le PV' : 'Ajouter le PV'} — PDF, 5 Mo maximum<input disabled={busy} className="block mt-2" type="file" accept="application/pdf,.pdf" onChange={e => upload(detail.id, e.target.files[0])} /></label>}</div></Modal>}
    {remove && <Modal open title="Supprimer la réunion ?" onClose={() => setRemove(null)}><p className="mb-4">La réunion « {remove.titre} » et son PV seront supprimés.</p><button disabled={busy} className="btn-danger" onClick={destroy}>Confirmer la suppression</button></Modal>}
  </div>
}

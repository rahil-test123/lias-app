import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Search, Download, Trash2, FileText, File } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDocuments, uploadDocument, deleteDocument, downloadDocument } from '../../api/documents'
import { getEvenements } from '../../api/evenements'
import { useAuth } from '../../context/AuthContext'
import { PageSpinner } from '../../components/Spinner'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

function fmt(d) {
  return d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

export default function DocumentsPage() {
  const { user, isAdmin } = useAuth()
  const qc = useQueryClient()
  const [page, setPage]       = useState(0)
  const [search, setSearch]   = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [titre, setTitre]     = useState('')
  const [evenementId, setEvenementId] = useState('')
  const [file, setFile]       = useState(null)
  const fileRef               = useRef()

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page],
    queryFn: () => getDocuments({ page, size: 10, sort: 'dateUpload,desc' }),
  })

  const { data: evts } = useQuery({
    queryKey: ['evenements-liste'],
    queryFn: () => getEvenements({ size: 100 }),
    select: d => d.content,
  })

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Sélectionnez un fichier')
      const fd = new FormData()
      fd.append('file', file)
      if (titre) fd.append('titre', titre)
      if (evenementId) fd.append('evenementId', evenementId)
      return uploadDocument(fd)
    },
    onSuccess: () => {
      toast.success('Document uploadé'); qc.invalidateQueries(['documents'])
      setShowUpload(false); setFile(null); setTitre(''); setEvenementId('')
    },
    onError: (e) => toast.error(e.response?.data?.message || e.message || 'Erreur upload'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => { toast.success('Document supprimé'); qc.invalidateQueries(['documents']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (isLoading) return <PageSpinner />

  const docs     = data?.content || []
  const filtered = search ? docs.filter(d => d.titre?.toLowerCase().includes(search.toLowerCase())) : docs

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" subtitle={`${data?.totalElements ?? '—'} au total`}>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <Upload size={14} /> Uploader
        </button>
      </PageHeader>

      {/* Recherche */}
      <div className="search-wrap page-in s1">
        <Search size={14} className="search-icon" />
        <input className="input" placeholder="Rechercher par titre…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden page-in s2">
        <table className="table-base">
          <thead>
            <tr>
              <th>Document</th>
              <th>Uploadé par</th>
              <th>Événement</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => {
              const canDelete = isAdmin || doc.membreId === user?.id
              const Icon = doc.type?.includes('pdf') ? FileText : File
              return (
                <tr key={doc.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 30, height: 30, borderRadius: 'var(--r)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '.84rem', color: 'var(--text-1)' }} className="truncate max-w-[200px]">
                        {doc.titre}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>{doc.membreNom}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-2)' }} className="truncate max-w-[140px] block">
                      {doc.evenementTitre || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="mono-sm" style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{fmt(doc.dateUpload)}</span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => downloadDocument(doc.id, doc.titre).catch(() => toast.error('Erreur téléchargement'))}
                        className="btn-icon"
                        aria-label="Télécharger"
                      >
                        <Download size={13} />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => { if (confirm('Supprimer ce document ?')) deleteMutation.mutate(doc.id) }}
                          className="btn-icon"
                          aria-label="Supprimer"
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!filtered.length && (
          <EmptyState icon={File} title="Aucun document" desc={search ? `Aucun résultat pour "${search}"` : 'Uploadez votre premier document.'} />
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages || 0} onPageChange={setPage} />

      {/* Modal upload */}
      <Modal
        open={showUpload}
        onClose={() => { setShowUpload(false); setFile(null); setTitre(''); setEvenementId('') }}
        title="Uploader un document"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Fichier</label>
            <div
              onClick={() => fileRef.current.click()}
              className="flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
              style={{
                border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--r)',
                padding: '1.5rem',
                background: file ? 'var(--accent-dim)' : 'var(--surface-alt)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = file ? 'var(--accent)' : 'var(--border)')}
            >
              <Upload size={22} style={{ color: file ? 'var(--accent)' : 'var(--text-3)' }} />
              <p style={{ fontSize: '.82rem', color: file ? 'var(--accent)' : 'var(--text-2)', fontWeight: file ? 600 : 400, textAlign: 'center' }}>
                {file ? file.name : 'Cliquez ou glissez un fichier ici'}
              </p>
              <p className="mono-sm" style={{ color: 'var(--text-3)' }}>PDF, Word, Excel, images — max 20 Mo</p>
              <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </div>
          </div>
          <div>
            <label className="label">Titre (optionnel)</label>
            <input className="input" placeholder="Laissez vide pour utiliser le nom du fichier" value={titre} onChange={e => setTitre(e.target.value)} />
          </div>
          <div>
            <label className="label">Événement associé (optionnel)</label>
            <select className="input" value={evenementId} onChange={e => setEvenementId(e.target.value)}>
              <option value="">— Aucun —</option>
              {evts?.map(ev => <option key={ev.id} value={ev.id}>{ev.titre}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowUpload(false); setFile(null); setTitre(''); setEvenementId('') }} className="btn-secondary">Annuler</button>
            <button onClick={() => uploadMutation.mutate()} disabled={!file || uploadMutation.isPending} className="btn-primary">
              {uploadMutation.isPending ? 'Upload…' : 'Uploader'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

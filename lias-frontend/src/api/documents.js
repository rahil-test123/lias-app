import api from './axios'

export const getDocuments      = (params)  => api.get('/documents', { params }).then((r) => r.data)
export const getDocument       = (id)      => api.get(`/documents/${id}`).then((r) => r.data)
export const getDocsByMembre   = (membreId, params) =>
  api.get(`/documents/membre/${membreId}`, { params }).then((r) => r.data)
export const getDocsByEvenement = (evenementId) =>
  api.get(`/documents/evenement/${evenementId}`).then((r) => r.data)
export const rechercherDocs    = (q)      => api.get('/documents/recherche', { params: { q } }).then((r) => r.data)
export const uploadDocument    = (formData) =>
  api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
export const deleteDocument    = (id)     => api.delete(`/documents/${id}`)
export const downloadDocument  = (id, filename = 'document') =>
  api.get(`/documents/${id}/download`, { responseType: 'blob' }).then((r) => {
    const url = window.URL.createObjectURL(new Blob([r.data]))
    const link = document.createElement('a')
    link.href = url
    const disposition = r.headers['content-disposition']
    const match = disposition && disposition.match(/filename="?([^"]+)"?/)
    link.download = match ? match[1] : filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  })

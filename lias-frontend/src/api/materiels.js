import api from './axios'

export const getMateriels      = (params) => api.get('/materiels', { params }).then((r) => r.data)
export const getMaterielListe  = ()       => api.get('/materiels/liste').then((r) => r.data)
export const getMateriel       = (id)     => api.get(`/materiels/${id}`).then((r) => r.data)
export const rechercherMateriels = (q)    =>
  api.get('/materiels/recherche', { params: { q } }).then((r) => r.data)
export const createMateriel    = (data)   => api.post('/materiels', data).then((r) => r.data)
export const updateMateriel    = (id, data) => api.put(`/materiels/${id}`, data).then((r) => r.data)
export const deleteMateriel    = (id)     => api.delete(`/materiels/${id}`)

export const getAttributionsByMembre   = (membreId) =>
  api.get(`/materiels/attributions/membre/${membreId}`).then((r) => r.data)
export const getAttributionsByMateriel = (materielId) =>
  api.get(`/materiels/${materielId}/attributions`).then((r) => r.data)
export const attribuerMateriel = (data)          => api.post('/materiels/attributions', data).then((r) => r.data)
export const revoquerAttribution = (attributionId) => api.delete(`/materiels/attributions/${attributionId}`)

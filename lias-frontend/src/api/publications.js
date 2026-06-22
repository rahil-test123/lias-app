import api from './axios'

export const getPublications    = (params) => api.get('/publications', { params }).then((r) => r.data)
export const getPublication     = (id)     => api.get(`/publications/${id}`).then((r) => r.data)
export const createPublication  = (data)   => api.post('/publications', data).then((r) => r.data)
export const updatePublication  = (id, data) => api.put(`/publications/${id}`, data).then((r) => r.data)
export const deletePublication  = (id)     => api.delete(`/publications/${id}`)
export const rechercherPublications = (q)  =>
  api.get('/publications/recherche', { params: { q } }).then((r) => r.data)

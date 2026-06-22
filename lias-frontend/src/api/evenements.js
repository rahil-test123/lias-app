import api from './axios'

export const getEvenements   = (params) => api.get('/evenements', { params }).then((r) => r.data)
export const getEvenement    = (id)     => api.get(`/evenements/${id}`).then((r) => r.data)
export const createEvenement = (data)   => api.post('/evenements', data).then((r) => r.data)
export const updateEvenement = (id, data) => api.put(`/evenements/${id}`, data).then((r) => r.data)
export const deleteEvenement = (id)     => api.delete(`/evenements/${id}`)

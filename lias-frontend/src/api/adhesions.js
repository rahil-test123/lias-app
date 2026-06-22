import api from './axios'

export const getAdhesions     = (params) => api.get('/adhesions', { params }).then((r) => r.data)
export const getAdhesion      = (id)     => api.get(`/adhesions/${id}`).then((r) => r.data)
export const soumettreDemande = (data)   => api.post('/adhesions', data).then((r) => r.data)
export const traiterAdhesion  = (id, statut) =>
  api.put(`/adhesions/${id}/traiter`, null, { params: { statut } }).then((r) => r.data)

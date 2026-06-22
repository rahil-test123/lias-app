import api from './axios'

export const getMembres     = (params) => api.get('/membres', { params }).then((r) => r.data)
export const getMembresActifs = ()      => api.get('/membres/actifs').then((r) => r.data)
export const getMembre      = (id)     => api.get(`/membres/${id}`).then((r) => r.data)
export const getMonProfil   = ()       => api.get('/membres/profil').then((r) => r.data)
export const updateProfil   = (data)   => api.put('/membres/profil', data).then((r) => r.data)
export const updateStatut   = (id, statut) =>
  api.put(`/membres/${id}/statut`, null, { params: { statut } }).then((r) => r.data)
export const toggleActif    = (id) =>
  api.put(`/membres/${id}/toggle-actif`).then((r) => r.data)
export const rechercherMembres = (q)   => api.get('/membres/recherche', { params: { q } }).then((r) => r.data)
export const createMembre   = (data)   => api.post('/auth/register', data).then((r) => r.data)

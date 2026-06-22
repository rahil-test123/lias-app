import api from './axios'

export const getEquipes       = ()          => api.get('/equipes').then(r => r.data)
export const getEquipe        = (id)        => api.get(`/equipes/${id}`).then(r => r.data)
export const createEquipe     = (data)      => api.post('/equipes', data).then(r => r.data)
export const updateEquipe     = (id, data)  => api.put(`/equipes/${id}`, data).then(r => r.data)
export const deleteEquipe     = (id)        => api.delete(`/equipes/${id}`)

export const ajouterMembre    = (equipeId, membreId) =>
  api.post(`/equipes/${equipeId}/membres/${membreId}`).then(r => r.data)
export const retirerMembre    = (affiliationId) =>
  api.delete(`/equipes/affiliations/${affiliationId}`)

export const getMandats       = ()          => api.get('/equipes/mandats').then(r => r.data)
export const ajouterMandat    = (data)      => api.post('/equipes/mandats', data).then(r => r.data)
export const terminerMandat   = (id)        => api.delete(`/equipes/mandats/${id}`)

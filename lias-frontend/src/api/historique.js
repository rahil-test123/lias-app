import api from './axios'

export const getHistorique = (params) =>
  api.get('/historique', { params }).then((r) => r.data)

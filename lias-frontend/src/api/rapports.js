import api from './axios'

export const getRapportActivite = (params) =>
  api.get('/rapports/activite', { params }).then((r) => r.data)

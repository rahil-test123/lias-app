import api from './axios'

export const getNotifications   = () => api.get('/notifications').then((r) => r.data)
export const getNonLues         = () => api.get('/notifications/non-lues').then((r) => r.data)
export const countNonLues       = () => api.get('/notifications/count').then((r) => r.data.count)
export const marquerLue         = (id) => api.put(`/notifications/${id}/lire`).then((r) => r.data)
export const marquerToutesLues  = () => api.put('/notifications/lire-toutes').then((r) => r.data)

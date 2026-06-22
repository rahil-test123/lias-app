import api from './axios'

export const login = (data) => api.post('/auth/login', data).then((r) => r.data)

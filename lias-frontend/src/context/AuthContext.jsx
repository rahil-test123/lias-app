import { useState, useCallback } from 'react'
import { login as apiLogin } from '../api/auth'

import { AuthContext } from './useAuth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const data = await apiLogin({ email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isAdmin      = user?.role === 'ROLE_ADMIN'
  const isDirecteur  = user?.role === 'ROLE_DIRECTEUR'
  const isPrivileged = isAdmin || isDirecteur

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isDirecteur, isPrivileged }}>
      {children}
    </AuthContext.Provider>
  )
}

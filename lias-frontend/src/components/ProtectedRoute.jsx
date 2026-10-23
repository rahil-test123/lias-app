import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth()
  if (user && roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

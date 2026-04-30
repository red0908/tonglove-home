import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

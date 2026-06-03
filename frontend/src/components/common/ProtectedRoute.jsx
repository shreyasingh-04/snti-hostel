// src/components/common/ProtectedRoute.jsx
// Redirect to /login if not authenticated. Redirect to /dashboard if wrong role.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="spinner" />

  if (!user) return <Navigate to="/login" replace />

  // If a required role is specified and doesn't match, redirect
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}

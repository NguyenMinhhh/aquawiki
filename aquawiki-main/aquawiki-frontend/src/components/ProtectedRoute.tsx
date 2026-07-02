import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

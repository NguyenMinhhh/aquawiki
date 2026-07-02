import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { setAuthHandlers } from '../services/api'

export default function AuthInterceptorSetup() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    setAuthHandlers({ logout, navigate })
  }, [logout, navigate])

  return null
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const TOKEN_KEY = 'aquawiki_token'
const USER_KEY = 'aquawiki_user'

export interface AuthUser {
  id: number
  email: string
  displayName: string | null
  role: 'USER' | 'ADMIN'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeJwtPayload(token: string): { exp: number; id: number; role: string; sub: string } | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload) return false
  return payload.exp * 1000 > Date.now()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token && isTokenValid(token)) {
      const saved = localStorage.getItem(USER_KEY)
      if (saved) {
        setUser(JSON.parse(saved))
      } else {
        const payload = decodeJwtPayload(token)!
        setUser({ id: payload.id, email: payload.sub, displayName: null, role: payload.role as 'USER' | 'ADMIN' })
      }
    }
    setLoading(false)
  }, [])

  function login(token: string, userData: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

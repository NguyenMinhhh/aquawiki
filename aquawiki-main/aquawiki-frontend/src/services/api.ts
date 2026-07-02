import axios from 'axios'

const TOKEN_KEY = 'aquawiki_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type AuthHandlers = {
  logout: () => void
  navigate: (path: string) => void
}

let _handlers: AuthHandlers | null = null

export function setAuthHandlers(handlers: AuthHandlers) {
  _handlers = handlers
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && _handlers) {
      localStorage.removeItem(TOKEN_KEY)
      _handlers.logout()
      _handlers.navigate('/login')
    }
    return Promise.reject(error)
  }
)

export default api

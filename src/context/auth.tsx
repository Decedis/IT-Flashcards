import { createContext, useContext, useState, useCallback } from 'react'

const TOKEN_KEY = 'itfc_token'
const USER_KEY  = 'itfc_user'

export interface AuthUser {
  id: number
  username: string
}

interface AuthCtxValue {
  user: AuthUser | null
  token: string | null
  login:  (username: string, password: string) => Promise<string | null>
  register: (username: string, password: string) => Promise<string | null>
  logout: () => void
}

const AuthCtx = createContext<AuthCtxValue>({
  user: null, token: null,
  login: async () => null, register: async () => null, logout: () => {},
})

export const useAuth = () => useContext(AuthCtx)

function loadStored(): { user: AuthUser | null; token: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw   = localStorage.getItem(USER_KEY)
    const user  = raw ? JSON.parse(raw) as AuthUser : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = loadStored()
  const [token, setToken] = useState<string | null>(stored.token)
  const [user,  setUser]  = useState<AuthUser | null>(stored.user)

  const persist = (t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY,  JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const login = useCallback(async (username: string, password: string) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await r.json()
    if (!r.ok) return data.error as string
    persist(data.token, data.user)
    return null
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await r.json()
    if (!r.ok) return data.error as string
    persist(data.token, data.user)
    return null
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

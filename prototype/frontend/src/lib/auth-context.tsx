import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  apiGet,
  apiPost,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  registerForceLogout,
  setTokens,
} from './api'
import type { LoginResponse, User } from './types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (...roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registerForceLogout(() => setUser(null))

    async function restoreSession() {
      if (!getAccessToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await apiGet<User>('/api/auth/me')
        setUser(me)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  async function login(email: string, password: string) {
    const res = await apiPost<LoginResponse>('/api/auth/login', { email, password })
    setTokens(res)
    setUser(res.user)
  }

  async function logout() {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) {
        await apiPost('/api/auth/logout', { refresh_token: refreshToken })
      }
    } catch {
      // 서버 호출이 실패해도 로컬 세션은 반드시 정리한다.
    }
    clearTokens()
    setUser(null)
  }

  function hasRole(...roles: string[]) {
    return !!user && user.roles.some((r) => roles.includes(r))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다')
  return ctx
}

"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { loginAdmin } from "@/lib/api"

type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = "franes_admin_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      setToken(stored)
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setError(null)
    try {
      const accessToken = await loginAdmin(username, password)
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
      }
      setToken(accessToken)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível autenticar"
      setError(message)
      throw err
    }
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
    setToken(null)
  }

  const clearError = () => setError(null)

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      error,
      clearError,
    }),
    [token, isLoading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

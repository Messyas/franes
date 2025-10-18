"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

type AdminLayoutProps = {
  children: ReactNode
}

const NAVIGATION = [
  { label: "Blog", href: "/admin/blog" },
  { label: "Currículo", href: "/admin/curriculum" },
  { label: "Roteiros", href: "/admin/story-scripts" },
  { label: "Artes", href: "/admin/artworks" },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading, login, logout, error, clearError } = useAuth()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!credentials.username || !credentials.password) return

    setIsSubmitting(true)
    clearError()

    try {
      await login(credentials.username, credentials.password)
      setCredentials({ username: "", password: "" })
      void router.push("/admin/blog")
    } catch {
      /* handled in auth context */
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3 rounded-lg bg-background/80 px-6 py-4 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando painel...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
        <section className="glass mx-auto w-full max-w-md rounded-lg p-8 shadow-lg">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold neon-glow">Painel Administrativo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Insira suas credenciais para acessar as ferramentas de gestão.
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="admin-username" className="text-sm font-medium">
                Usuário
              </label>
              <Input
                id="admin-username"
                name="username"
                placeholder="Seu usuário"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, username: event.target.value }))
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                placeholder="********"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, password: event.target.value }))
                }
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 flex-col border-r border-primary/20 bg-background/80 px-6 py-8 shadow-lg shadow-primary/10 md:flex">
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-foreground">Painel Administrativo</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie conteúdo e recursos do site.
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {NAVIGATION.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <Button
          variant="outline"
          className="mt-auto w-full gap-2 border-primary/40 text-foreground hover:bg-primary/10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="space-y-3 border-b border-primary/10 bg-background/80 px-6 py-4 shadow-sm shadow-primary/10 md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Painel</h2>
              <p className="text-xs text-muted-foreground">Selecione uma área para gerenciar.</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAVIGATION.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-md px-3 py-2 text-xs font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}

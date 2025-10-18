"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, PenSquare, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import {
  type BlogPost,
  type BlogPostInput,
  createBlogPost,
  deleteBlogPost,
  fetchBlogPosts,
  updateBlogPost,
} from "@/lib/api"

type FormState = {
  title: string
  reading_time: string
  content: string
}

const emptyForm: FormState = {
  title: "",
  reading_time: "",
  content: "",
}

const MAX_TITLE_LENGTH = 100

export default function BlogAdminPage() {
  const { token } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isFetchingPosts, setIsFetchingPosts] = useState(false)
  const [postsError, setPostsError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const isEditing = useMemo(() => selectedPostId !== null, [selectedPostId])

  useEffect(() => {
    const loadPosts = async () => {
      setIsFetchingPosts(true)
      setPostsError(null)
      try {
        const data = await fetchBlogPosts()
        setPosts(data)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os posts."
        setPostsError(msg)
      } finally {
        setIsFetchingPosts(false)
      }
    }

    void loadPosts()
  }, [])

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPostId(post.id)
    setForm({
      title: post.title,
      reading_time: String(post.reading_time),
      content: post.content,
    })
    setFormError(null)
  }

  const resetForm = () => {
    setSelectedPostId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const handleDeletePost = async (post: BlogPost) => {
    if (!token) {
      setFormError("Token de acesso não disponível. Faça login novamente.")
      return
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja remover o post "${post.title}"?`,
    )
    if (!confirmDelete) return

    try {
      await deleteBlogPost(post.id, token)
      setPosts((prev) => prev.filter((item) => item.id !== post.id))
      if (selectedPostId === post.id) {
        resetForm()
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível remover o post selecionado."
      setFormError(msg)
    }
  }

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setFormError("Token de acesso não disponível. Faça login novamente.")
      return
    }

    const trimmedTitle = form.title.trim()
    if (!trimmedTitle) {
      setFormError("Título é obrigatório.")
      return
    }

    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setFormError(`Título deve ter no máximo ${MAX_TITLE_LENGTH} caracteres.`)
      return
    }

    const readingTimeNumber = Number(form.reading_time)
    if (!Number.isFinite(readingTimeNumber) || readingTimeNumber <= 0) {
      setFormError("Tempo de leitura deve ser um número inteiro positivo.")
      return
    }

    const trimmedContent = form.content.trim()
    if (!trimmedContent) {
      setFormError("Conteúdo é obrigatório.")
      return
    }

    const payload: BlogPostInput = {
      title: trimmedTitle,
      reading_time: Math.round(readingTimeNumber),
      content: trimmedContent,
    }

    setIsSaving(true)
    setFormError(null)

    try {
      if (isEditing && selectedPostId !== null) {
        const updated = await updateBlogPost(selectedPostId, payload, token)
        setPosts((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        )
      } else {
        const created = await createBlogPost(payload, token)
        setPosts((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o post. Tente novamente."
      setFormError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold neon-glow">Gerenciar Blog</h1>
        <p className="text-sm text-muted-foreground">
          Crie, edite ou remova publicações do blog.
        </p>
      </header>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Post {isEditing ? "em edição" : "novo"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Preencha os campos para {isEditing ? "editar" : "criar"} um post.
            </p>
          </div>
          {isEditing && (
            <Button
              variant="ghost"
              onClick={resetForm}
              className="self-start text-muted-foreground hover:text-primary"
            >
              Cancelar edição
            </Button>
          )}
        </header>

        <form className="space-y-5" onSubmit={handleSubmitPost}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Nome do post"
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reading_time" className="text-sm font-medium">
                Tempo de leitura (min)
              </label>
              <Input
                id="reading_time"
                name="reading_time"
                type="number"
                min={1}
                placeholder="Ex: 5"
                value={form.reading_time}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Conteúdo
            </label>
            <Textarea
              id="content"
              name="content"
              rows={10}
              placeholder="Escreva o conteúdo em Markdown ou texto puro..."
              value={form.content}
              onChange={handleFormChange}
              required
            />
          </div>

          {formError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Atualizar post"
            ) : (
              "Criar post"
            )}
          </Button>
        </form>
      </section>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Posts publicados</h2>
          <p className="text-sm text-muted-foreground">
            Clique em um post para editar ou use as ações para gerenciar.
          </p>
        </header>

        {isFetchingPosts ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando posts...
          </div>
        ) : postsError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {postsError}
          </p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum post cadastrado ainda. Crie o primeiro acima!
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className={`group flex flex-col gap-3 rounded-lg border border-primary/10 bg-background/70 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 md:flex-row md:items-center md:justify-between ${
                  selectedPostId === post.id ? "border-primary bg-primary/10" : ""
                }`}
              >
                <button
                  type="button"
                  className="text-left"
                  onClick={() => handleSelectPost(post)}
                >
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("pt-BR")} •{" "}
                    {post.reading_time} min de leitura
                  </p>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-primary/30 hover:bg-primary/10"
                    onClick={() => handleSelectPost(post)}
                  >
                    <PenSquare className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDeletePost(post)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

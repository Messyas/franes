"use client"

import { useEffect, useMemo, useState } from "react"
import { BookOpen, Loader2, PenSquare, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import {
  type CloudinaryAsset,
  type StoryScriptInput,
  type StoryScriptRecord,
  createStoryScript,
  deleteStoryScript,
  fetchStoryScripts,
  updateStoryScript,
} from "@/lib/api"

type StoryScriptFormState = {
  title: string
  sub_title: string
  author_note: string
  content: string
  author_final_comment: string
  cover_image_url: string
  cover_image_public_id: string
}

const emptyForm: StoryScriptFormState = {
  title: "",
  sub_title: "",
  author_note: "",
  content: "",
  author_final_comment: "",
  cover_image_url: "",
  cover_image_public_id: "",
}

function buildCoverImage(form: StoryScriptFormState): CloudinaryAsset | null {
  const url = form.cover_image_url.trim()
  const publicId = form.cover_image_public_id.trim()

  if (!url) {
    return null
  }

  if (!publicId) {
    throw new Error("Informe o public_id da imagem de capa.")
  }

  return {
    public_id: publicId,
    url,
  }
}

export default function StoryScriptsAdminPage() {
  const { token } = useAuth()
  const [scripts, setScripts] = useState<StoryScriptRecord[]>([])
  const [isLoadingScripts, setIsLoadingScripts] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [form, setForm] = useState<StoryScriptFormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const isEditing = useMemo(() => selectedId !== null, [selectedId])

  useEffect(() => {
    const loadScripts = async () => {
      setIsLoadingScripts(true)
      setListError(null)
      try {
        const data = await fetchStoryScripts()
        setScripts(data)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os roteiros."
        setListError(msg)
      } finally {
        setIsLoadingScripts(false)
      }
    }

    void loadScripts()
  }, [])

  const handleSelectScript = (script: StoryScriptRecord) => {
    setSelectedId(script.id)
    setForm({
      title: script.title,
      sub_title: script.sub_title,
      author_note: script.author_note,
      content: script.content,
      author_final_comment: script.author_final_comment,
      cover_image_url: script.cover_image?.url ?? "",
      cover_image_public_id: script.cover_image?.public_id ?? "",
    })
    setFormError(null)
  }

  const resetForm = () => {
    setSelectedId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const handleDelete = async (script: StoryScriptRecord) => {
    if (!token) {
      setListError("Token de acesso não disponível. Faça login novamente.")
      return
    }

    const confirmDelete = window.confirm(
      `Deseja remover o roteiro "${script.title}"?`,
    )
    if (!confirmDelete) return

    try {
      await deleteStoryScript(script.id, token)
      setScripts((prev) => prev.filter((item) => item.id !== script.id))
      if (selectedId === script.id) {
        resetForm()
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível remover o roteiro selecionado."
      setListError(msg)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setFormError("Token de acesso não disponível. Faça login novamente.")
      return
    }

    if (
      !form.title.trim() ||
      !form.sub_title.trim() ||
      !form.author_note.trim() ||
      !form.content.trim() ||
      !form.author_final_comment.trim()
    ) {
      setFormError("Preencha todos os campos obrigatórios.")
      return
    }

    let coverImage: CloudinaryAsset | null = null
    try {
      coverImage = buildCoverImage(form)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Verifique os dados da imagem de capa.")
      return
    }

    const payload: StoryScriptInput = {
      title: form.title.trim(),
      sub_title: form.sub_title.trim(),
      author_note: form.author_note.trim(),
      content: form.content.trim(),
      author_final_comment: form.author_final_comment.trim(),
      cover_image: coverImage,
    }

    setIsSaving(true)
    setFormError(null)

    try {
      if (isEditing && selectedId !== null) {
        const updated = await updateStoryScript(selectedId, payload, token)
        setScripts((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        )
      } else {
        const created = await createStoryScript(payload, token)
        setScripts((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o roteiro. Tente novamente."
      setFormError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold neon-glow">Gerenciar Roteiros</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre novos roteiros, atualize conteúdos e mantenha as histórias em dia.
        </p>
      </header>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Roteiro {isEditing ? "em edição" : "novo"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Preencha os detalhes para {isEditing ? "editar" : "criar"} um roteiro.
            </p>
          </div>
          {isEditing && (
            <Button
              variant="ghost"
              className="self-start text-muted-foreground hover:text-primary"
              onClick={resetForm}
            >
              Cancelar edição
            </Button>
          )}
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="script-title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="script-title"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="script-subtitle" className="text-sm font-medium">
                Subtítulo
              </label>
              <Input
                id="script-subtitle"
                value={form.sub_title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sub_title: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="script-author-note" className="text-sm font-medium">
              Nota do autor
            </label>
            <Textarea
              id="script-author-note"
              rows={3}
              value={form.author_note}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, author_note: event.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="script-content" className="text-sm font-medium">
              Conteúdo
            </label>
            <Textarea
              id="script-content"
              rows={8}
              value={form.content}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, content: event.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="script-final-comment" className="text-sm font-medium">
              Comentário final do autor
            </label>
            <Textarea
              id="script-final-comment"
              rows={3}
              value={form.author_final_comment}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  author_final_comment: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="script-cover-url" className="text-sm font-medium">
                URL da capa (Cloudinary)
              </label>
              <Input
                id="script-cover-url"
                placeholder="https://res.cloudinary.com/..."
                value={form.cover_image_url}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    cover_image_url: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="script-cover-public-id" className="text-sm font-medium">
                Public ID da capa
              </label>
              <Input
                id="script-cover-public-id"
                placeholder="portfolio/roteiros/minha-imagem"
                value={form.cover_image_public_id}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    cover_image_public_id: event.target.value,
                  }))
                }
              />
            </div>
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
              "Atualizar roteiro"
            ) : (
              "Criar roteiro"
            )}
          </Button>
        </form>
      </section>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Roteiros cadastrados</h2>
          <p className="text-sm text-muted-foreground">
            Histórico das histórias já publicadas.
          </p>
        </header>

        {isLoadingScripts ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando roteiros...
          </div>
        ) : listError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {listError}
          </p>
        ) : scripts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum roteiro cadastrado.</p>
        ) : (
          <ul className="space-y-4">
            {scripts.map((script) => (
              <li
                key={script.id}
                className={`flex flex-col gap-3 rounded-lg border border-primary/10 bg-background/70 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 md:flex-row md:items-center md:justify-between ${
                  selectedId === script.id ? "border-primary bg-primary/10" : ""
                }`}
              >
                <button
                  type="button"
                  className="flex flex-1 items-start gap-3 text-left"
                  onClick={() => handleSelectScript(script)}
                >
                  <div className="rounded-md bg-primary/10 p-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{script.title}</h3>
                    <p className="text-sm text-muted-foreground">{script.sub_title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(script.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-primary/30 hover:bg-primary/10"
                    onClick={() => handleSelectScript(script)}
                  >
                    <PenSquare className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDelete(script)}
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

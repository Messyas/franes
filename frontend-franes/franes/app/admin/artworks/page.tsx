"use client"

import { useEffect, useMemo, useState } from "react"
import { ImageIcon, Loader2, PenSquare, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import {
  type ArtInput,
  type ArtRecord,
  type CloudinaryAsset,
  createArtwork,
  deleteArtwork,
  fetchArtworks,
  updateArtwork,
} from "@/lib/api"

type ArtFormState = {
  title: string
  description: string
  image_url: string
  image_secure_url: string
  image_public_id: string
}

const emptyForm: ArtFormState = {
  title: "",
  description: "",
  image_url: "",
  image_secure_url: "",
  image_public_id: "",
}

function buildImage(form: ArtFormState): CloudinaryAsset | null {
  const url = form.image_url.trim()
  const secureUrl = form.image_secure_url.trim()
  const publicId = form.image_public_id.trim()

  if (!url) {
    return null
  }

  if (!publicId) {
    throw new Error("Informe o public_id da imagem.")
  }

  return {
    public_id: publicId,
    url,
    secure_url: secureUrl || undefined,
  }
}

export default function ArtworksAdminPage() {
  const { token } = useAuth()
  const [artworks, setArtworks] = useState<ArtRecord[]>([])
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [form, setForm] = useState<ArtFormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const isEditing = useMemo(() => selectedId !== null, [selectedId])

  useEffect(() => {
    const loadArtworks = async () => {
      setIsLoadingArtworks(true)
      setListError(null)
      try {
        const data = await fetchArtworks()
        setArtworks(data)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as artes."
        setListError(msg)
      } finally {
        setIsLoadingArtworks(false)
      }
    }

    void loadArtworks()
  }, [])

  const handleSelectArtwork = (art: ArtRecord) => {
    setSelectedId(art.id)
    setForm({
      title: art.title,
      description: art.description,
      image_url: art.image?.url ?? "",
      image_secure_url: art.image?.secure_url ?? "",
      image_public_id: art.image?.public_id ?? "",
    })
    setFormError(null)
  }

  const resetForm = () => {
    setSelectedId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const handleDelete = async (art: ArtRecord) => {
    if (!token) {
      setListError("Token de acesso não disponível. Faça login novamente.")
      return
    }

    const confirmDelete = window.confirm(
      `Deseja remover a arte "${art.title}"?`,
    )
    if (!confirmDelete) return

    try {
      await deleteArtwork(art.id, token)
      setArtworks((prev) => prev.filter((item) => item.id !== art.id))
      if (selectedId === art.id) {
        resetForm()
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível remover a arte selecionada."
      setListError(msg)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setFormError("Token de acesso não disponível. Faça login novamente.")
      return
    }

    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Informe título e descrição.")
      return
    }

    let image: CloudinaryAsset | null = null
    try {
      image = buildImage(form)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Verifique os dados da imagem.")
      return
    }

    const payload: ArtInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      image,
    }

    setIsSaving(true)
    setFormError(null)

    try {
      if (isEditing && selectedId !== null) {
        const updated = await updateArtwork(selectedId, payload, token)
        setArtworks((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        )
      } else {
        const created = await createArtwork(payload, token)
        setArtworks((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a arte. Tente novamente."
      setFormError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold neon-glow">Gerenciar Artes</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre novas imagens vindas do Cloudinary ou atualize as existentes.
        </p>
      </header>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Arte {isEditing ? "em edição" : "nova"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Informe os dados abaixo para {isEditing ? "editar" : "cadastrar"} uma arte.
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
          <div className="space-y-2">
            <label htmlFor="art-title" className="text-sm font-medium">
              Título
            </label>
            <Input
              id="art-title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="art-description" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="art-description"
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="art-image-url" className="text-sm font-medium">
                URL da imagem (Cloudinary)
              </label>
              <Input
                id="art-image-url"
                placeholder="https://res.cloudinary.com/..."
                value={form.image_url}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, image_url: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="art-image-public-id" className="text-sm font-medium">
                Public ID
              </label>
              <Input
                id="art-image-public-id"
                placeholder="portfolio/artes/minha-imagem"
                value={form.image_public_id}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    image_public_id: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="art-image-secure-url" className="text-sm font-medium">
              Secure URL (opcional)
            </label>
            <Input
              id="art-image-secure-url"
              placeholder="https://res.cloudinary.com/... (https)"
              value={form.image_secure_url}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  image_secure_url: event.target.value,
                }))
              }
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
              "Atualizar arte"
            ) : (
              "Cadastrar arte"
            )}
          </Button>
        </form>
      </section>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Artes cadastradas</h2>
          <p className="text-sm text-muted-foreground">Lista de imagens utilizadas no site.</p>
        </header>

        {isLoadingArtworks ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando artes...
          </div>
        ) : listError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {listError}
          </p>
        ) : artworks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma arte cadastrada.</p>
        ) : (
          <ul className="space-y-4">
            {artworks.map((art) => (
              <li
                key={art.id}
                className={`flex flex-col gap-3 rounded-lg border border-primary/10 bg-background/70 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 md:flex-row md:items-center md:justify-between ${
                  selectedId === art.id ? "border-primary bg-primary/10" : ""
                }`}
              >
                <button
                  type="button"
                  className="flex flex-1 items-start gap-3 text-left"
                  onClick={() => handleSelectArtwork(art)}
                >
                  <div className="rounded-md bg-primary/10 p-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{art.title}</h3>
                    <p className="text-sm text-muted-foreground">{art.description}</p>
                    {art.image?.url && (
                      <p className="mt-1 break-all text-xs text-muted-foreground">{art.image.url}</p>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-primary/30 hover:bg-primary/10"
                    onClick={() => handleSelectArtwork(art)}
                  >
                    <PenSquare className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDelete(art)}
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

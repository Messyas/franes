"use client"

import { useEffect, useMemo, useState } from "react"
import { FileText, Loader2, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import {
  ApiError,
  type CurriculumInput,
  type CurriculumRecord,
  createCurriculumEntry,
  deleteCurriculumEntry,
  fetchCurriculumEntries,
} from "@/lib/api"

type CurriculumFormState = {
  title: string
  description: string
  fileName: string
  fileBase64: string
}

const emptyForm: CurriculumFormState = {
  title: "",
  description: "",
  fileName: "",
  fileBase64: "",
}

export default function CurriculumAdminPage() {
  const { token, logout } = useAuth()
  const [entries, setEntries] = useState<CurriculumRecord[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [form, setForm] = useState<CurriculumFormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  useEffect(() => {
    const loadEntries = async () => {
      setIsLoadingEntries(true)
      setListError(null)
      try {
        const data = await fetchCurriculumEntries()
        setEntries(data)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os currículos."
        setListError(msg)
      } finally {
        setIsLoadingEntries(false)
      }
    }

    void loadEntries()
  }, [])

  const isFormValid = useMemo(() => {
    return Boolean(form.title.trim() && form.fileName && form.fileBase64)
  }, [form])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setForm((prev) => ({ ...prev, fileName: "", fileBase64: "" }))
      return
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    if (!isPdf) {
      setFormError("Selecione um arquivo PDF válido.")
      setForm((prev) => ({ ...prev, fileName: "", fileBase64: "" }))
      return
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (typeof result === "string") {
            const [, data] = result.split(",")
            resolve(data ?? "")
          } else {
            reject(new Error("Formato de arquivo inválido."))
          }
        }
        reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler o arquivo selecionado."))
        reader.readAsDataURL(file)
      })
      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileBase64: base64,
      }))
      setFormError(null)
    } catch {
      setFormError("Não foi possível ler o arquivo PDF selecionado.")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setFormError("Token de acesso não disponível. Faça login novamente.")
      return
    }
    if (!isFormValid) {
      setFormError("Informe o título e selecione um arquivo PDF válido.")
      return
    }

    const payload: CurriculumInput = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      file_name: form.fileName,
      pdf_base64: form.fileBase64,
    }

    setIsSaving(true)
    setFormError(null)

    try {
      const created = await createCurriculumEntry(payload, token)
      setEntries((prev) => [created, ...prev])
      setForm(emptyForm)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        setFormError("Sessão expirada. Faça login novamente para enviar o currículo.")
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Não foi possível enviar o currículo. Tente novamente."
        setFormError(msg)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (entry: CurriculumRecord) => {
    if (!token) {
      setListError("Token de acesso não disponível. Faça login novamente.")
      return
    }

    const confirmDelete = window.confirm(
      `Deseja realmente remover o currículo "${entry.title}"?`,
    )
    if (!confirmDelete) return

    try {
      await deleteCurriculumEntry(entry.id, token)
      setEntries((prev) => prev.filter((item) => item.id !== entry.id))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        setListError("Sessão expirada. Faça login novamente para continuar.")
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Não foi possível remover o currículo selecionado."
        setListError(msg)
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold neon-glow">Gerenciar Currículo</h1>
        <p className="text-sm text-muted-foreground">
          Envie novos arquivos PDF ou remova versões antigas do currículo.
        </p>
      </header>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Novo arquivo</h2>
          <p className="text-sm text-muted-foreground">
            Preencha as informações e selecione o arquivo PDF atualizado.
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="curriculum-title" className="text-sm font-medium">
              Título
            </label>
            <Input
              id="curriculum-title"
              name="title"
              placeholder="Ex: Currículo atualizado - Outubro/2024"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="curriculum-description" className="text-sm font-medium">
              Descrição (opcional)
            </label>
            <Textarea
              id="curriculum-description"
              name="description"
              placeholder="Contextualize a atualização do currículo..."
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="curriculum-file" className="text-sm font-medium">
              Arquivo PDF
            </label>
            <div className="flex flex-col gap-2 rounded-md border border-primary/20 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {form.fileName ? (
                    <>
                      <span className="font-medium text-foreground">{form.fileName}</span>
                    </>
                  ) : (
                    "Nenhum arquivo selecionado."
                  )}
                </p>
                <label
                  htmlFor="curriculum-file"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4" />
                  Selecionar
                </label>
              </div>
              <Input
                id="curriculum-file"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
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
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar currículo"
            )}
          </Button>
        </form>
      </section>

      <section className="glass rounded-lg p-6 shadow-lg">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Versões enviadas</h2>
          <p className="text-sm text-muted-foreground">
            Histórico das versões do currículo disponíveis para download.
          </p>
        </header>

        {isLoadingEntries ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando registros...
          </div>
        ) : listError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {listError}
          </p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum currículo enviado ainda.
          </p>
        ) : (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-3 rounded-lg border border-primary/10 bg-background/70 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Arquivo: <span className="font-medium">{entry.file_name}</span> •{" "}
                      {new Date(entry.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDelete(entry)}
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

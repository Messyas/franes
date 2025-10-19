"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import CardItemHobby from "@/componentes/CardItemHobby"
import { useContentCache } from "@/contexts/content-cache-context"
import {
  type ArtRecord,
  type StoryScriptRecord,
} from "@/lib/api"

type CategoriaId = "roteiros" | "desenhos"

interface ItemHobby {
  id: string
  titulo: string
  descricao: string
  data: string
  imagem: string
  detalhes?: string
  timestamp: number
}

interface CategoriaHobby {
  id: CategoriaId
  titulo: string
  descricao: string
  aspectRatio: "1:1" | "A4"
  itens: ItemHobby[]
}

type ItemsByCategory = Record<CategoriaId, ItemHobby[]>

const CATEGORY_CONFIG: ReadonlyArray<Omit<CategoriaHobby, "itens">> = [
  {
    id: "roteiros",
    titulo: "Roteiros",
    descricao: "Histórias originais explorando tecnologia, ficção científica e humanidade.",
    aspectRatio: "1:1",
  },
  {
    id: "desenhos",
    titulo: "Desenhos",
    descricao: "Concept art e ilustrações digitais com estética sci-fi e cyberpunk.",
    aspectRatio: "A4",
  },
]

/**
 * Seção Hobbies - Apresenta roteiros e desenhos em grade
 * Layout em grid com imagens e modal de detalhes
 */
export default function SecaoHobbies() {
  const [itemSelecionado, setItemSelecionado] = useState<{
    item: ItemHobby
    aspectRatio: "1:1" | "A4"
  } | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaId>("roteiros")

  const {
    artworks,
    artworksStatus,
    artworksError,
    loadArtworks,
    storyScripts,
    storyScriptsStatus,
    storyScriptsError,
    loadStoryScripts,
  } = useContentCache()

  useEffect(() => {
    void loadStoryScripts()
    void loadArtworks()
  }, [loadArtworks, loadStoryScripts])

  const itensPorCategoria = useMemo<ItemsByCategory>(
    () => ({
      roteiros: sortByTimestamp((storyScripts ?? []).map(mapStoryScriptToItem)),
      desenhos: sortByTimestamp((artworks ?? []).map(mapArtToItem)),
    }),
    [artworks, storyScripts],
  )

  const isLoading =
    artworksStatus === "idle" ||
    storyScriptsStatus === "idle" ||
    artworksStatus === "loading" ||
    storyScriptsStatus === "loading"
  
  const categorias: CategoriaHobby[] = CATEGORY_CONFIG.map((config) => ({
    ...config,
    itens: itensPorCategoria[config.id],
  }))

  const categoriaAtual =
    categorias.find((categoria) => categoria.id === categoriaAtiva) ??
    categorias[0]

  const itensCategoriaAtual = categoriaAtual?.itens ?? []
  const categoriaAtivaErro =
    categoriaAtiva === "roteiros"
      ? storyScriptsStatus === "error" && (storyScripts?.length ?? 0) === 0
        ? storyScriptsError
        : null
      : artworksStatus === "error" && (artworks?.length ?? 0) === 0
        ? artworksError
        : null

  const handleSelectItem = (item: ItemHobby, aspectRatio: "1:1" | "A4") => {
    setItemSelecionado({ item, aspectRatio })
  }

  const shouldShowEmptyState =
    !isLoading && (itensCategoriaAtual.length ?? 0) === 0
  const shouldShowSkeletonPlaceholders =
    categoriaAtual?.id === "desenhos"
      ? (artworksStatus === "idle" || artworksStatus === "loading") &&
        (itensCategoriaAtual.length ?? 0) === 0
      : categoriaAtual?.id === "roteiros"
        ? (storyScriptsStatus === "idle" || storyScriptsStatus === "loading") &&
          (itensCategoriaAtual.length ?? 0) === 0
        : false
  const skeletonCount =
    categoriaAtual?.aspectRatio === "1:1"
      ? 4
      : 3
  const skeletonTitle =
    categoriaAtual?.id === "desenhos"
      ? "Carregando desenho"
      : categoriaAtual?.id === "roteiros"
        ? "Carregando roteiro"
        : "Carregando item"

  return (
    <section
      className="h-full w-full overflow-y-auto px-6 py-12 md:px-12 lg:px-24"
      aria-labelledby="titulo-hobbies"
    >
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <header className="mb-12 animate-fade-in text-center">
          <h1
            id="titulo-hobbies"
            className="text-5xl md:text-6xl font-bold text-foreground mb-4 neon-glow"
          >
            Hobbies
          </h1>
        </header>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categorias.map((categoria) => (
            <Button
              key={categoria.id}
              variant="outline"
              onClick={() => setCategoriaAtiva(categoria.id)}
              className={`glass hover:glass-strong transition-all ${
                categoriaAtiva === categoria.id
                  ? "neon-glow animate-neon-flicker border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {categoria.titulo}
            </Button>
          ))}
        </div>

        {/* Descrição da categoria */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-muted-foreground">{categoriaAtual?.descricao}</p>
        </div>

        <div
          className={`grid gap-6 ${
            categoriaAtual?.aspectRatio === "1:1"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {categoriaAtivaErro ? (
            <div className="col-span-full glass-strong rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
              {categoriaAtivaErro}
            </div>
          ) : shouldShowSkeletonPlaceholders ? (
            Array.from({ length: skeletonCount }).map((_, index) => (
              <CardItemHobby
                key={`skeleton-${categoriaAtual?.id ?? "categoria"}-${index}`}
                titulo={skeletonTitle}
                descricao=""
                data=""
                imagem=""
                aspectRatio={categoriaAtual?.aspectRatio ?? "1:1"}
                categoria={categoriaAtual?.id ?? "roteiros"}
                delay={index * 0.1}
                isSkeleton
              />
            ))
          ) : shouldShowEmptyState ? (
            <p className="col-span-full text-center text-muted-foreground">
              Nenhum item disponível nesta categoria ainda.
            </p>
          ) : (
            itensCategoriaAtual.map((item, index) => (
              <CardItemHobby
                key={item.id}
                titulo={item.titulo}
                descricao={item.descricao}
                data={item.data}
                imagem={item.imagem}
                aspectRatio={categoriaAtual?.aspectRatio ?? "1:1"}
                categoria={categoriaAtual?.id ?? "roteiros"}
                delay={index * 0.1}
                onClick={() =>
                  handleSelectItem(item, categoriaAtual?.aspectRatio ?? "1:1")
                }
              />
            ))
          )}
        </div>
      </div>

      {itemSelecionado && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setItemSelecionado(null)}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto glass-strong rounded-lg p-8 neon-border animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-foreground neon-glow">
                {itemSelecionado.item.titulo}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setItemSelecionado(null)}
                className="text-muted-foreground hover:text-primary"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Calendar className="w-4 h-4" />
              <span>{itemSelecionado.item.data}</span>
            </div>

            {/* Imagem em tamanho maior */}
            <div
              className={`relative w-full ${
                itemSelecionado.aspectRatio === "1:1"
                  ? "aspect-square"
                  : "aspect-[1/1.414]"
              } mb-6 rounded-lg overflow-hidden`}
            >
              <Image
                src={itemSelecionado.item.imagem || "/placeholder.svg"}
                alt={itemSelecionado.item.titulo}
                fill
                className="object-cover"
              />
            </div>

            <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
              {itemSelecionado.item.detalhes ?? itemSelecionado.item.descricao}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

function sortByTimestamp(items: ItemHobby[]): ItemHobby[] {
  return [...items].sort((a, b) => b.timestamp - a.timestamp)
}

function mapArtToItem(art: ArtRecord): ItemHobby {
  const date = parseIsoDate(art.created_at)
  const description = art.description?.trim() || "Sem descrição disponível"

  return {
    id: `art-${art.id}`,
    titulo: art.title,
    descricao: description,
    detalhes: description,
    data: formatDateLabel(date),
    imagem: extractImageUrl(art.image),
    timestamp: date.getTime(),
  }
}

function mapStoryScriptToItem(script: StoryScriptRecord): ItemHobby {
  const date = parseIsoDate(script.created_at)
  const resumoBase =
    script.sub_title ||
    script.author_note ||
    script.content

  const detalhes = [
    script.author_note,
    script.content,
    script.author_final_comment,
  ]
    .map((chunk) => chunk?.trim())
    .filter(Boolean)
    .join("\n\n")

  return {
    id: `story-${script.id}`,
    titulo: script.title,
    descricao: createSummary(resumoBase),
    detalhes: detalhes || undefined,
    data: formatDateLabel(date),
    imagem: extractImageUrl(script.cover_image),
    timestamp: date.getTime(),
  }
}

function extractImageUrl(asset: ArtRecord["image"]): string {
  if (!asset) {
    return ""
  }

  if (asset.secure_url && asset.secure_url.trim().length > 0) {
    return asset.secure_url
  }

  return asset.url ?? ""
}

function parseIsoDate(value: string | undefined | null): Date {
  if (!value) {
    return new Date(NaN)
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  const normalized = hasTimezone ? value : `${value}Z`
  return new Date(normalized)
}

function formatDateLabel(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "Data indisponível"
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function createSummary(text: string | undefined | null, maxLength = 160): string {
  if (!text) {
    return "Conteúdo ainda não disponível."
  }

  const normalized = text.replace(/\s+/g, " ").trim()
  if (!normalized) {
    return "Conteúdo ainda não disponível."
  }

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

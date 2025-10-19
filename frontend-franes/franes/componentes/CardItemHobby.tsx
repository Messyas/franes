"use client"

import { Calendar } from "lucide-react"
import Image from "next/image"

const PLACEHOLDER_IMAGE = "/placeholder.svg"
const DEFAULT_ALLOWED_HOSTS = ["res.cloudinary.com"]

const allowedImageHosts = new Set(
  DEFAULT_ALLOWED_HOSTS.concat(
    (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS ?? "")
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean),
  ),
)

function resolveImageSrc(src?: string | null): string {
  if (!src) {
    return PLACEHOLDER_IMAGE
  }

  if (src.startsWith("/")) {
    return src
  }

  if (src.startsWith("data:image/")) {
    return src
  }

  try {
    const url = new URL(src)
    const isHttpProtocol = url.protocol === "http:" || url.protocol === "https:"

    if (!isHttpProtocol) {
      return PLACEHOLDER_IMAGE
    }

    if (!allowedImageHosts.has(url.hostname)) {
      return PLACEHOLDER_IMAGE
    }

    return url.toString()
  } catch {
    return PLACEHOLDER_IMAGE
  }
}

interface CardItemHobbyProps {
  titulo: string
  descricao: string
  data: string
  imagem: string
  aspectRatio: "1:1" | "A4"
  delay?: number
  onClick: () => void
}

/**
 * Card para item individual de hobby (roteiro ou desenho)
 * Exibe imagem com aspect ratio específico
 */
export default function CardItemHobby({
  titulo,
  descricao,
  data,
  imagem,
  aspectRatio,
  delay = 0,
  onClick,
}: CardItemHobbyProps) {
  const aspectClass = aspectRatio === "1:1" ? "aspect-square" : "aspect-[1/1.414]"
  const imageSrc = resolveImageSrc(imagem)

  return (
    <article
      className="group cursor-pointer animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      {/* Container da imagem */}
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-lg mb-4 glass hover:glass-strong neon-border transition-all duration-300`}
      >
        <Image
          src={imageSrc}
          alt={titulo}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Informações */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary group-hover:neon-glow transition-all">
          {titulo}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{descricao}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{data}</span>
        </div>
      </div>
    </article>
  )
}

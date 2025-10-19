"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

type CategoriaId = "roteiros" | "desenhos"

const loadedImageCache = new Set<string>()
const FLIP_DELAY_MS = 700
const FLIP_DURATION_MS = 700

interface CardItemHobbyProps {
  titulo: string
  descricao: string
  data: string
  imagem: string
  aspectRatio: "1:1" | "A4"
  categoria: CategoriaId
  delay?: number
  isSkeleton?: boolean
  onClick?: () => void
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
  categoria,
  delay = 0,
  isSkeleton: isSkeletonProp = false,
  onClick = () => {},
}: CardItemHobbyProps) {
  const aspectClass = aspectRatio === "1:1" ? "aspect-square" : "aspect-[1/1.414]"
  const imageSrc = useMemo(() => resolveImageSrc(imagem), [imagem])
  const isArtworkCard = categoria === "desenhos"
  const isSkeleton = isArtworkCard && isSkeletonProp
  const cachedImage = useMemo(() => loadedImageCache.has(imageSrc), [imageSrc])
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(() =>
    isSkeleton ? false : cachedImage,
  )
  const [shouldShowFront, setShouldShowFront] = useState<boolean>(() =>
    isSkeleton ? false : cachedImage,
  )
  const [isAnimatingFlip, setIsAnimatingFlip] = useState<boolean>(false)
  const hasAnimatedOnceRef = useRef<boolean>(isSkeleton ? false : cachedImage)
  const flipDelayTimeoutRef = useRef<number | null>(null)
  const flipAnimationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isArtworkCard || isSkeleton) {
      return
    }

    const alreadyKnown = loadedImageCache.has(imageSrc)
    setIsImageLoaded(alreadyKnown)
    setShouldShowFront(alreadyKnown)
    setIsAnimatingFlip(false)
    hasAnimatedOnceRef.current = alreadyKnown

    return () => {
      if (flipDelayTimeoutRef.current !== null) {
        window.clearTimeout(flipDelayTimeoutRef.current)
        flipDelayTimeoutRef.current = null
      }
      if (flipAnimationTimeoutRef.current !== null) {
        window.clearTimeout(flipAnimationTimeoutRef.current)
        flipAnimationTimeoutRef.current = null
      }
    }
  }, [imageSrc, isArtworkCard, isSkeleton])

  const handleImageComplete = useCallback(() => {
    if (!isArtworkCard || isSkeleton) {
      return
    }

    loadedImageCache.add(imageSrc)
    setIsImageLoaded(true)

    if (isArtworkCard && !hasAnimatedOnceRef.current) {
      hasAnimatedOnceRef.current = true
      if (flipDelayTimeoutRef.current !== null) {
        window.clearTimeout(flipDelayTimeoutRef.current)
      }
      if (flipAnimationTimeoutRef.current !== null) {
        window.clearTimeout(flipAnimationTimeoutRef.current)
      }

      flipDelayTimeoutRef.current = window.setTimeout(() => {
        flipDelayTimeoutRef.current = null
        setShouldShowFront(true)
        setIsAnimatingFlip(true)
        flipAnimationTimeoutRef.current = window.setTimeout(() => {
          flipAnimationTimeoutRef.current = null
          setIsAnimatingFlip(false)
        }, FLIP_DURATION_MS)
      }, FLIP_DELAY_MS)
    } else if (isArtworkCard) {
      setShouldShowFront(true)
    }
  }, [imageSrc, isArtworkCard, isSkeleton])

  const handleImageError = useCallback(() => {
    handleImageComplete()
  }, [handleImageComplete])

  const articleClasses = `group ${
    isSkeleton ? "cursor-default" : "cursor-pointer"
  } animate-slide-up`

  return (
    <article
      className={articleClasses}
      style={{ animationDelay: `${delay}s` }}
      onClick={isSkeleton ? undefined : onClick}
      aria-disabled={isSkeleton}
    >
      {/* Container da imagem */}
      {isArtworkCard ? (
        <div className={`relative ${aspectClass} w-full mb-4`}>
          <div
            className={`relative h-full w-full [perspective:1600px] ${
              isSkeleton ? "animate-pulse" : ""
            }`}
          >
            <div
              className={`relative h-full w-full [transform-style:preserve-3d] ${
                shouldShowFront ? "[transform:rotateY(180deg)]" : ""
              } ${
                isSkeleton
                  ? ""
                  : isAnimatingFlip
                    ? "transition-transform duration-700 ease-out"
                    : "transition-none"
              }`}
            >
              {/* Verso da carta */}
              <div className="absolute inset-0 overflow-hidden rounded-lg glass group-hover:glass-strong neon-border transition-all duration-300 [backface-visibility:hidden]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background/80 to-background/95 opacity-90" />
                <div className="absolute inset-3 rounded-xl border border-primary/40" />
                <div className="absolute inset-6 rounded-lg border border-primary/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-primary">
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-primary/60 bg-primary/10 shadow-[0_0_35px_rgba(59,130,246,0.35)]" />
                    <div className="absolute w-12 h-12 border-2 border-primary/60 rounded-full animate-pulse-glow" />
                  </div>
                  <span className="font-semibold uppercase tracking-[0.4em] text-xs text-primary/80">
                    Art
                  </span>
                  <div className="absolute top-4 left-4 text-xs font-mono text-primary/70 rotate-[-10deg]">
                    FR
                  </div>
                  <div className="absolute bottom-4 right-4 text-xs font-mono text-primary/70 rotate-[10deg]">
                    NES
                  </div>
                </div>
              </div>

              {!isSkeleton && (
                <div className="absolute inset-0 overflow-hidden rounded-lg glass group-hover:glass-strong neon-border transition-all duration-300 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <Image
                    src={imageSrc}
                    alt={titulo}
                    fill
                    onLoadingComplete={handleImageComplete}
                    onError={handleImageError}
                    className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                      isImageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity duration-300 ${
                      isImageLoaded ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative ${aspectClass} w-full overflow-hidden rounded-lg mb-4 glass hover:glass-strong neon-border transition-all duration-300`}
        >
          <Image
            src={imageSrc}
            alt={titulo}
            fill
            onLoadingComplete={handleImageComplete}
            onError={handleImageError}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Informações */}
      {isSkeleton ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-3/4 rounded bg-muted/30" />
          <div className="h-4 w-full rounded bg-muted/20" />
          <div className="h-4 w-2/5 rounded bg-muted/20" />
        </div>
      ) : (
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
      )}
    </article>
  )
}

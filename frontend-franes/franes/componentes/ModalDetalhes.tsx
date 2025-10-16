"use client"

import type React from "react"

import { X } from "lucide-react"
import { useEffect } from "react"

interface PropsModalDetalhes {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  conteudo: React.ReactNode
}

/**
 * Modal para exibir detalhes expandidos dos cards
 * Usa glassmorphism e animações suaves
 */
export default function ModalDetalhes({ aberto, aoFechar, titulo, conteudo }: PropsModalDetalhes) {
  // Previne scroll do body quando modal está aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [aberto])

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar()
    }
    if (aberto) {
      window.addEventListener("keydown", handleEsc)
    }
    return () => window.removeEventListener("keydown", handleEsc)
  }, [aberto, aoFechar])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={aoFechar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-strong border border-primary/30 rounded-2xl p-8 animate-slide-up neon-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 id="modal-titulo" className="text-3xl font-bold text-foreground neon-glow">
            {titulo}
          </h2>
          <button
            onClick={aoFechar}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors group"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="text-foreground/90">{conteudo}</div>
      </div>
    </div>
  )
}

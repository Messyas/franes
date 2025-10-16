"use client"

import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"

interface PropsCardSobre {
  titulo: string
  descricao: string
  icone: LucideIcon
  delay?: number
  onClick?: () => void
}

/**
 * Card informativo para a seção Sobre
 * Apresenta informações com ícone, título e descrição
 */
export default function CardSobre({ titulo, descricao, icone: Icone, delay = 0, onClick }: PropsCardSobre) {
  return (
    <div
      className="group p-6 bg-card/50 border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 hover:scale-105 transition-all duration-300 neon-border animate-slide-up cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.()
        }
      }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icone className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {titulo}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{descricao}</p>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  )
}

"use client"

import type { LucideIcon } from "lucide-react"
import { ExternalLink } from "lucide-react"

interface PropsBotaoSocial {
  nome: string
  icone: LucideIcon
  url: string
  delay?: number
}

/**
 * Botão de link para redes sociais
 * Apresenta animação de hover e feedback visual
 */
export default function BotaoSocial({ nome, icone: Icone, url, delay = 0 }: PropsBotaoSocial) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between p-4 bg-card/50 border border-border rounded-lg hover:border-primary hover:bg-card/80 hover:scale-105 transition-all duration-300 neon-border animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icone className="w-5 h-5 text-primary" />
        </div>
        <span className="text-foreground font-medium group-hover:text-primary transition-colors">{nome}</span>
      </div>

      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  )
}

"use client"

import type { LucideIcon } from "lucide-react"

interface PropsCardHobby {
  titulo: string
  descricao: string
  icone: LucideIcon
  categoria: string
  itens: string[]
  delay?: number
}

/**
 * Card para exibir hobbies e interesses pessoais
 * Inclui categoria, descrição e lista de itens relacionados
 */
export default function CardHobby({ titulo, descricao, icone: Icone, categoria, itens, delay = 0 }: PropsCardHobby) {
  return (
    <article
      className="group p-6 bg-card/50 border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 hover:scale-105 transition-all duration-300 neon-border animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Cabeçalho do card */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:animate-pulse-glow transition-all">
          <Icone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{titulo}</h3>
          <span className="text-sm text-muted-foreground font-mono">{categoria}</span>
        </div>
      </div>

      {/* Descrição */}
      <p className="text-muted-foreground mb-4 leading-relaxed">{descricao}</p>

      {/* Lista de itens */}
      <ul className="space-y-2">
        {itens.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}

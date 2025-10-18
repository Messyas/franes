"use client"

import { GithubIcon, Instagram, LinkedinIcon } from "lucide-react"
import BotaoSocial from "@/componentes/BotaoSocial"

/**
 * Seção Contatos - Links sociais e formas de contato
 */
export default function SecaoContatos() {
  const redesSociais = [
    {
      nome: "GitHub",
      icone: GithubIcon,
      url: "https://github.com/messyas",
    },
    {
      nome: "LinkedIn",
      icone: LinkedinIcon,
      url: "https://linkedin.com/in/messyas",
    },
    {
      nome: "Instagram",
      icone: Instagram,
      url: "https://instagram.com/messyas",
    },
  ]

  return (
    <section
      className="h-full w-full overflow-y-auto px-6 py-12 md:px-12 lg:px-24"
      aria-labelledby="titulo-contatos"
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* Cabeçalho */}
        <header className="mb-12 animate-fade-in text-left">
          <h1
            id="titulo-contatos"
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 neon-glow"
          >
            Vamos Conversar
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Entre em contato para projetos, colaborações ou apenas para dizer olá!
          </p>
          <div className="mt-4 h-1 w-24 bg-primary rounded-full neon-border" />
        </header>

        <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="mx-auto w-full max-w-xl space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Redes Sociais</h2>
            {redesSociais.map((rede, index) => (
              <BotaoSocial
                key={rede.nome}
                nome={rede.nome}
                icone={rede.icone}
                url={rede.url}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

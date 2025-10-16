"use client"

import { useState } from "react"
import { Calendar, Clock, X } from "lucide-react"
import { obterPostsBlog } from "@/lib/funcoesAuxiliares"
import { Button } from "@/components/ui/button"

interface Post {
  id: string
  titulo: string
  resumo: string
  conteudo: string
  data: string
  tempoLeitura: string
}

/**
 * Seção Blog - Lista vertical de posts de texto
 * Desktop: sem scroll, mobile: com scroll vertical
 */
export default function SecaoBlog() {
  const [postSelecionado, setPostSelecionado] = useState<Post | null>(null)
  const posts = obterPostsBlog()

  return (
    <section className="h-full w-full overflow-y-auto px-6 py-12 md:px-12 lg:px-24" aria-labelledby="titulo-blog">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <header className="mb-12 animate-fade-in">
          <h1 id="titulo-blog" className="text-5xl md:text-6xl font-bold text-foreground mb-4 neon-glow">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground">Pensamentos sobre tecnologia, desenvolvimento e aprendizado</p>
        </header>

        {/* Lista de posts */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="group p-6 glass hover:glass-strong hover:border-primary/50 rounded-lg transition-all duration-300 cursor-pointer neon-border animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setPostSelecionado(post)}
            >
              <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary group-hover:neon-glow transition-all">
                {post.titulo}
              </h2>

              <p className="text-muted-foreground mb-4 leading-relaxed">{post.resumo}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.data}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.tempoLeitura}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {postSelecionado && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setPostSelecionado(null)}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto glass-strong rounded-lg p-8 neon-border animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-foreground neon-glow">{postSelecionado.titulo}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPostSelecionado(null)}
                className="text-muted-foreground hover:text-primary"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {postSelecionado.data}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {postSelecionado.tempoLeitura}
              </span>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{postSelecionado.conteudo}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

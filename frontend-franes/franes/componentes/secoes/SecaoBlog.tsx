"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Clock, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BlogPost, fetchBlogPosts } from "@/lib/api"

type PostViewModel = {
  id: number
  title: string
  summary: string
  content: string
  dateLabel: string
  readingTimeLabel: string
}

function createSummary(content: string): string {
  const stripped = content.replace(/\s+/g, " ").trim()
  if (stripped.length <= 200) {
    return stripped
  }
  return `${stripped.slice(0, 200)}...`
}

function mapPostToView(post: BlogPost): PostViewModel {
  const createdAt = new Date(post.created_at)
  return {
    id: post.id,
    title: post.title,
    summary: createSummary(post.content),
    content: post.content,
    dateLabel: createdAt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    readingTimeLabel: `${post.reading_time} min`,
  }
}

/**
 * Seção Blog - Lista vertical de posts de texto
 * Desktop: sem scroll, mobile: com scroll vertical
 */
export default function SecaoBlog() {
  const [postSelecionado, setPostSelecionado] = useState<PostViewModel | null>(null)
  const [rawPosts, setRawPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchBlogPosts()
        setRawPosts(data)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível carregar os posts do blog."
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadPosts()
  }, [])

  const posts = useMemo(() => rawPosts.map(mapPostToView), [rawPosts])

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
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Carregando posts...
          </div>
        ) : error ? (
          <div className="glass-strong rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">Nenhum post publicado ainda.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="group p-6 glass hover:glass-strong hover:border-primary/50 rounded-lg transition-all duration-300 cursor-pointer neon-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setPostSelecionado(post)}
              >
                <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary group-hover:neon-glow transition-all">
                  {post.title}
                </h2>

                <p className="text-muted-foreground mb-4 leading-relaxed">{post.summary}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.dateLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readingTimeLabel}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
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
              <h2 className="text-3xl font-bold text-foreground neon-glow">{postSelecionado.title}</h2>
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
                {postSelecionado.dateLabel}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {postSelecionado.readingTimeLabel}
              </span>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{postSelecionado.content}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

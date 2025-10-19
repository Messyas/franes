"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"

import { Button } from "@/components/ui/button"

type Role = "user" | "bot"

type ChatMessage = {
  id: number
  role: Role
  text: string
  timestamp: number
}

const BOT_NAME = "Messyas Fake"

const BOT_RESPONSES = [
  "Olá! Curioso para saber mais sobre meus projetos? Posso te indicar alguns favoritos.",
  "Se quiser, posso mandar um resumo do meu currículo ou sugerir algo que combine com o que você está procurando.",
  "Gosto de falar sobre tecnologia, games e ficção científica. Em que posso ajudar agora?",
  "Tenho experimentado bastante com IA e experiências interativas, que tal a gente testar alguma ideia juntos?",
  "Se quiser um link rápido, posso encaminhar meu portfólio completo e GitHub.",
]

function createInitialMessages(): ChatMessage[] {
  const now = Date.now()
  return [
    {
      id: 1,
      role: "bot",
      text: "👋 Ei! Sou o Messyas Fake. Um clone treinado para conversar como se fosse um WhatsApp, topa bater um papo?",
      timestamp: now - 1000,
    },
    {
      id: 2,
      role: "bot",
      text: "Manda uma mensagem aqui embaixo que eu respondo rapidinho.",
      timestamp: now - 500,
    },
  ]
}

const INITIAL_MESSAGES = createInitialMessages()

export default function FakeChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...INITIAL_MESSAGES])
  const [inputValue, setInputValue] = useState("")
  const [pendingReply, setPendingReply] = useState<ReturnType<typeof setTimeout> | null>(null)

  const nextIdRef = useRef<number>(INITIAL_MESSAGES.length + 1)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const isSending = useMemo(() => Boolean(pendingReply), [pendingReply])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages])

  useEffect(() => {
    return () => {
      if (pendingReply) {
        clearTimeout(pendingReply)
      }
    }
  }, [pendingReply])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) {
      return
    }

    const userMessage: ChatMessage = {
      id: nextIdRef.current++,
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    const timeout = setTimeout(() => {
      const responseText =
        BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)]
      const botMessage: ChatMessage = {
        id: nextIdRef.current++,
        role: "bot",
        text: responseText,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, botMessage])
      setPendingReply(null)
    }, 900 + Math.random() * 900)

    setPendingReply(timeout)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground neon-glow">
              Bate-papo com {BOT_NAME}
            </h1>
            <p className="text-sm text-muted-foreground">
              Simulação de conversa estilo WhatsApp — respostas instantâneas e cheias de energia.
            </p>
          </div>
        </header>

        <section className="glass flex flex-1 flex-col rounded-3xl border border-primary/40 bg-background/70 shadow-2xl neon-border">
          <div className="flex items-center gap-3 border-b border-primary/20 bg-primary/10 px-6 py-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                {BOT_NAME
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{BOT_NAME}</p>
              <span className="text-xs uppercase tracking-wide text-emerald-500">
                Online agora
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg md:max-w-sm ${
                      message.role === "user"
                        ? "rounded-br-none bg-primary text-primary-foreground"
                        : "rounded-bl-none border border-primary/20 bg-background/90 text-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            className="flex flex-col gap-3 border-t border-primary/20 bg-background/80 p-4 md:flex-row md:items-center"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="fake-chat-input">
              Escreva sua mensagem
            </label>
            <input
              id="fake-chat-input"
              className="flex-1 rounded-2xl border border-primary/20 bg-background/70 px-4 py-3 text-sm text-foreground shadow-inner transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Digite sua mensagem..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              autoComplete="off"
            />
            <Button
              type="submit"
              className="group flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-primary-foreground hover:bg-primary/90"
              disabled={!inputValue.trim()}
            >
              {isSending ? (
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Digitando...
                </span>
              ) : (
                <>
                  Enviar
                  <Send className="h-4 w-4 transition-transform duration-200 group-hover:-rotate-12 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}

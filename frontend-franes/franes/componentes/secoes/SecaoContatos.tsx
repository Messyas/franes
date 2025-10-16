"use client"

import type React from "react"

import { useState } from "react"
import { Github, Linkedin, Mail, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import BotaoSocial from "@/componentes/BotaoSocial"
import { validarFormularioContato } from "@/lib/funcoesAuxiliares"

/**
 * Seção Contatos - Formulário de contato e links sociais
 */
export default function SecaoContatos() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  })
  const [erros, setErros] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Valida os dados do formulário
    const resultadoValidacao = validarFormularioContato(formData)

    if (!resultadoValidacao.valido) {
      setErros(resultadoValidacao.erros)
      return
    }

    setErros({})
    setEnviando(true)

    // Simula envio (aqui você implementaria a lógica real)
    setTimeout(() => {
      console.log("Mensagem enviada:", formData)
      setEnviando(false)
      setFormData({ nome: "", email: "", mensagem: "" })
      alert("Mensagem enviada com sucesso!")
    }, 1500)
  }

  const redesSociais = [
    {
      nome: "GitHub",
      icone: Github,
      url: "https://github.com/messyas",
      cor: "hover:text-primary",
    },
    {
      nome: "LinkedIn",
      icone: Linkedin,
      url: "https://linkedin.com/in/messyas",
      cor: "hover:text-primary",
    },
    {
      nome: "Email",
      icone: Mail,
      url: "mailto:messyas@email.com",
      cor: "hover:text-primary",
    },
    {
      nome: "WhatsApp",
      icone: MessageSquare,
      url: "https://wa.me/5592999999999",
      cor: "hover:text-primary",
    },
  ]

  return (
    <section className="h-full w-full overflow-y-auto px-6 py-12 md:px-12 lg:px-24" aria-labelledby="titulo-contatos">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <header className="mb-12 animate-fade-in text-center">
          <h1 id="titulo-contatos" className="text-5xl md:text-6xl font-bold text-foreground mb-4 neon-glow">
            Vamos Conversar
          </h1>
          <p className="text-lg text-muted-foreground">
            Entre em contato para projetos, colaborações ou apenas para dizer olá!
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulário de contato */}
          <div className="animate-slide-up glass p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Envie uma Mensagem</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Seu Nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={`glass-light border-border focus:border-primary text-foreground ${
                    erros.nome ? "border-destructive" : ""
                  }`}
                />
                {erros.nome && <p className="text-destructive text-sm mt-1">{erros.nome}</p>}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Seu Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`glass-light border-border focus:border-primary text-foreground ${
                    erros.email ? "border-destructive" : ""
                  }`}
                />
                {erros.email && <p className="text-destructive text-sm mt-1">{erros.email}</p>}
              </div>

              <div>
                <Textarea
                  placeholder="Sua Mensagem"
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  className={`glass-light border-border focus:border-primary text-foreground min-h-[150px] ${
                    erros.mensagem ? "border-destructive" : ""
                  }`}
                />
                {erros.mensagem && <p className="text-destructive text-sm mt-1">{erros.mensagem}</p>}
              </div>

              <Button
                type="submit"
                disabled={enviando}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold neon-border"
              >
                {enviando ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Links sociais */}
          <div className="animate-slide-in-right">
            <h2 className="text-2xl font-bold text-foreground mb-6">Redes Sociais</h2>

            <div className="space-y-4">
              {redesSociais.map((rede, index) => (
                <BotaoSocial key={rede.nome} nome={rede.nome} icone={rede.icone} url={rede.url} delay={index * 0.1} />
              ))}
            </div>

            {/* Informações adicionais */}
            <div className="mt-12 glass p-6 rounded-lg neon-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">Disponibilidade</h3>
              <p className="text-muted-foreground">
                Atualmente aberto para projetos freelance e oportunidades de colaboração.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

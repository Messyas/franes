"use client"

import { useState } from "react"
import { X, Calendar } from "lucide-react"
import { obterDadosHobbies } from "@/lib/funcoesAuxiliares"
import { Button } from "@/components/ui/button"
import CardItemHobby from "@/componentes/CardItemHobby"
import Image from "next/image"

interface ItemHobby {
  id: string
  titulo: string
  descricao: string
  data: string
  imagem: string
}

interface CategoriaHobby {
  id: string
  titulo: string
  descricao: string
  aspectRatio: "1:1" | "A4"
  itens: ItemHobby[]
}

/**
 * Seção Hobbies - Apresenta roteiros e desenhos em grade
 * Layout em grid com imagens e modal de detalhes
 */
export default function SecaoHobbies() {
  const [itemSelecionado, setItemSelecionado] = useState<{
    item: ItemHobby
    aspectRatio: "1:1" | "A4"
  } | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("roteiros")

  const hobbies = obterDadosHobbies() as CategoriaHobby[]
  const categoriaAtual = hobbies.find((h) => h.id === categoriaAtiva) || hobbies[0]

  return (
    <section className="h-full w-full overflow-y-auto px-6 py-12 md:px-12 lg:px-24" aria-labelledby="titulo-hobbies">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <header className="mb-12 animate-fade-in text-center">
          <h1 id="titulo-hobbies" className="text-5xl md:text-6xl font-bold text-foreground mb-4 neon-glow">
            Hobbies & Criações
          </h1>
          <p className="text-lg text-muted-foreground">Explorando narrativas e arte visual</p>
        </header>

        <div className="flex justify-center gap-4 mb-12">
          {hobbies.map((hobby) => (
            <Button
              key={hobby.id}
              variant={categoriaAtiva === hobby.id ? "default" : "outline"}
              onClick={() => setCategoriaAtiva(hobby.id)}
              className={`glass hover:glass-strong transition-all ${
                categoriaAtiva === hobby.id ? "neon-glow border-primary" : ""
              }`}
            >
              {hobby.titulo}
            </Button>
          ))}
        </div>

        {/* Descrição da categoria */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-muted-foreground">{categoriaAtual.descricao}</p>
        </div>

        <div
          className={`grid gap-6 ${
            categoriaAtual.aspectRatio === "1:1"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {categoriaAtual.itens.map((item, index) => (
            <CardItemHobby
              key={item.id}
              titulo={item.titulo}
              descricao={item.descricao}
              data={item.data}
              imagem={item.imagem}
              aspectRatio={categoriaAtual.aspectRatio}
              delay={index * 0.1}
              onClick={() => setItemSelecionado({ item, aspectRatio: categoriaAtual.aspectRatio })}
            />
          ))}
        </div>
      </div>

      {itemSelecionado && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setItemSelecionado(null)}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto glass-strong rounded-lg p-8 neon-border animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-foreground neon-glow">{itemSelecionado.item.titulo}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setItemSelecionado(null)}
                className="text-muted-foreground hover:text-primary"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Calendar className="w-4 h-4" />
              <span>{itemSelecionado.item.data}</span>
            </div>

            {/* Imagem em tamanho maior */}
            <div
              className={`relative w-full ${
                itemSelecionado.aspectRatio === "1:1" ? "aspect-square" : "aspect-[1/1.414]"
              } mb-6 rounded-lg overflow-hidden`}
            >
              <Image
                src={itemSelecionado.item.imagem || "/placeholder.svg"}
                alt={itemSelecionado.item.titulo}
                fill
                className="object-cover"
              />
            </div>

            <p className="text-foreground/90 leading-relaxed">{itemSelecionado.item.descricao}</p>
          </div>
        </div>
      )}
    </section>
  )
}

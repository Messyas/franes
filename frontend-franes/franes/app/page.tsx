"use client"

import { useState } from "react"
import NavegacaoInferior from "@/componentes/NavegacaoInferior"
import SecaoSobre from "@/componentes/secoes/SecaoSobre"
import SecaoContatos from "@/componentes/secoes/SecaoContatos"
import SecaoBlog from "@/componentes/secoes/SecaoBlog"
import SecaoHobbies from "@/componentes/secoes/SecaoHobbies"
import FundoEnergia3D from "@/componentes/FundoEnergia3D"

/**
 * Tipo para as seções disponíveis no site
 */
export type TipoSecao = "sobre" | "contatos" | "blog" | "hobbies"

/**
 * Página principal do portfólio de Messyas
 * Gerencia a navegação entre seções full-screen com transições animadas
 */
export default function PaginaPrincipal() {
  // Estado para controlar qual seção está ativa
  const [secaoAtiva, setSecaoAtiva] = useState<TipoSecao>("sobre")

  // Estado para controlar a animação de transição
  const [estaTransicionando, setEstaTransicionando] = useState(false)

  /**
   * Função para mudar de seção com animação suave
   * Implementa um delay para criar efeito de fade out/in
   */
  const mudarSecao = (novaSecao: TipoSecao) => {
    if (novaSecao === secaoAtiva || estaTransicionando) return

    setEstaTransicionando(true)

    // Fade out
    setTimeout(() => {
      setSecaoAtiva(novaSecao)
      setEstaTransicionando(false)
    }, 300)
  }

  /**
   * Renderiza a seção ativa baseada no estado
   */
  const renderizarSecao = () => {
    switch (secaoAtiva) {
      case "sobre":
        return <SecaoSobre />
      case "contatos":
        return <SecaoContatos />
      case "blog":
        return <SecaoBlog />
      case "hobbies":
        return <SecaoHobbies />
      default:
        return <SecaoSobre />
    }
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <FundoEnergia3D />

      {/* Container da seção ativa com transição */}
      <div
        className={`h-full w-full transition-opacity duration-300 ${estaTransicionando ? "opacity-0" : "opacity-100"}`}
      >
        {renderizarSecao()}
      </div>

      {/* Navegação inferior flutuante estilo iPhone */}
      <NavegacaoInferior secaoAtiva={secaoAtiva} aoMudarSecao={mudarSecao} />
    </main>
  )
}

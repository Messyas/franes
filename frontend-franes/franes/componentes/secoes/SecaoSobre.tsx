"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import CardSobre from "@/componentes/CardSobre";
import ModalDetalhes from "@/componentes/ModalDetalhes";
import { obterDadosSobre } from "@/lib/funcoesAuxiliares";

/**
 * Seção Sobre - Apresenta informações sobre Messyas
 * Inclui educação, habilidades e projetos destacados
 */
export default function SecaoSobre() {
  const dadosSobre = obterDadosSobre();
  const [modalAberto, setModalAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<
    (typeof dadosSobre)[0] | null
  >(null);

  const abrirModal = (item: (typeof dadosSobre)[0]) => {
    setItemSelecionado(item);
    setModalAberto(true);
  };

  const renderizarConteudoModal = () => {
    if (!itemSelecionado?.detalhes) return null;

    const { detalhes } = itemSelecionado;

    // Educação
    if ("instituicao" in detalhes) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              {detalhes.instituicao}
            </h3>
            <p className="text-lg text-muted-foreground mb-1">
              {detalhes.curso}
            </p>
            <p className="text-sm text-muted-foreground">{detalhes.periodo}</p>
          </div>
          <p className="text-foreground/90 leading-relaxed">
            {detalhes.descricaoCompleta}
          </p>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">
              Destaques do Curso
            </h4>
            <ul className="space-y-2">
              {detalhes.destaques.map((destaque: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1">▹</span>
                  <span className="text-foreground/80">{destaque}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // Experiência
    if ("cargo" in detalhes) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              {detalhes.cargo}
            </h3>
            <p className="text-sm text-muted-foreground">{detalhes.periodo}</p>
          </div>
          <p className="text-foreground/90 leading-relaxed">
            {detalhes.descricaoCompleta}
          </p>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">
              Tecnologias
            </h4>
            <ul className="space-y-2">
              {detalhes.tecnologias.map((tech: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1">▹</span>
                  <span className="text-foreground/80">{tech}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">
              Conquistas
            </h4>
            <ul className="space-y-2">
              {detalhes.conquistas.map((conquista: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground/80">{conquista}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // Projetos
    if ("projetos" in detalhes) {
      return (
        <div className="space-y-6">
          <p className="text-foreground/90 leading-relaxed">
            {detalhes.descricaoCompleta}
          </p>
          <div className="space-y-4">
            {detalhes.projetos.map(
              (
                projeto: {
                  nome: string;
                  descricao: string;
                  tecnologias: string[];
                  status: string;
                },
                index: number
              ) => (
                <div
                  key={index}
                  className="p-4 glass border border-primary/20 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-foreground">
                      {projeto.nome}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        projeto.status === "Concluído"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {projeto.status}
                    </span>
                  </div>
                  <p className="text-foreground/80 mb-3">{projeto.descricao}</p>
                  <div className="flex flex-wrap gap-2">
                    {projeto.tecnologias.map(
                      (tech: string, techIndex: number) => (
                        <span
                          key={techIndex}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/30"
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      );
    }

    // Objetivos
    if ("objetivosCurto" in detalhes) {
      return (
        <div className="space-y-6">
          <p className="text-foreground/90 leading-relaxed">
            {detalhes.descricaoCompleta}
          </p>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">
              Objetivos de Curto Prazo
            </h4>
            <ul className="space-y-2">
              {detalhes.objetivosCurto.map(
                (objetivo: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span className="text-foreground/80">{objetivo}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">
              Objetivos de Longo Prazo
            </h4>
            <ul className="space-y-2">
              {detalhes.objetivosLongo.map(
                (objetivo: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary mt-1">⟶</span>
                    <span className="text-foreground/80">{objetivo}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">
              Valores
            </h4>
            <div className="flex flex-wrap gap-2">
              {detalhes.valores.map((valor: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-2 glass border border-primary/30 rounded-lg text-foreground/90 text-sm"
                >
                  {valor}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <section
      className="h-full w-full overflow-y-auto px-6 py-12 md:px-12 lg:px-24"
      aria-labelledby="titulo-sobre"
    >
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho da seção */}
        <header className="mb-12 animate-fade-in">
          <h1
            id="titulo-sobre"
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 neon-glow"
          >
            Messyas
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-mono">
            Desenvolvedor Full-Stack
          </p>
          <div className="mt-4 h-1 w-24 bg-primary rounded-full neon-border" />
        </header>

        {/* Grid de cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {dadosSobre.map((item, index) => (
            <CardSobre
              key={item.id}
              titulo={item.titulo}
              descricao={item.descricao}
              icone={item.icone}
              delay={index * 0.1}
              onClick={() => abrirModal(item)}
            />
          ))}
        </div>

        {/* Seção de habilidades técnicas */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Habilidades Técnicas
          </h2>

          <div className="flex flex-wrap gap-3">
            {[
              "React",
              "Next.js",
              "TypeScript",
              "Node.js",
              "Python",
              "TailwindCSS",
              "PostgreSQL",
              "Git",
            ].map((skill, index) => (
              <span
                key={skill}
                className="px-4 py-2 glass border-primary/30 rounded-lg text-foreground font-mono text-sm hover:glass-strong hover:border-primary hover:scale-105 transition-all duration-300 cursor-default neon-border"
                style={{ animationDelay: `${0.5 + index * 0.05}s` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ModalDetalhes
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo={itemSelecionado?.titulo || ""}
        conteudo={renderizarConteudoModal()}
      />
    </section>
  );
}

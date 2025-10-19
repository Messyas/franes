"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Download, MessageCircle } from "lucide-react";
import CardSobre from "@/componentes/CardSobre";
import ModalDetalhes from "@/componentes/ModalDetalhes";
import {
  buildApiUrl,
  fetchLatestCurriculum,
  type CurriculumRecord,
} from "@/lib/api";
import { obterDadosSobre } from "@/lib/funcoesAuxiliares";

/**
 * Seção Sobre - Apresenta informações sobre Messyas
 * Inclui educação, habilidades e projetos destacados
 */
export default function SecaoSobre() {
  const dadosSobre = obterDadosSobre();
  const cardCurriculo = dadosSobre.find((item) => item.id === "curriculo");
  const detalhesCurriculo = cardCurriculo?.detalhes as
    | {
        resumo?: string;
        conteudo?: string[];
        arquivo?: string;
      }
    | undefined;
  const [curriculoDados, setCurriculoDados] = useState<CurriculumRecord | null>(
    null
  );
  const [curriculoErro, setCurriculoErro] = useState<string | null>(null);
  const [curriculoCarregando, setCurriculoCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<
    (typeof dadosSobre)[0] | null
  >(null);

  const abrirModal = (item: (typeof dadosSobre)[0]) => {
    setItemSelecionado(item);
    setModalAberto(true);
  };

  useEffect(() => {
    let ativo = true;

    async function carregarCurriculo() {
      try {
        const dados = await fetchLatestCurriculum();
        if (!ativo) {
          return;
        }
        setCurriculoDados(dados);
        setCurriculoErro(null);
      } catch (error) {
        if (!ativo) {
          return;
        }
        let mensagem = "Não foi possível carregar o currículo.";
        if (error instanceof Error) {
          const texto = error.message.trim();
          mensagem = texto || mensagem;
          if (texto.toLowerCase().includes("not found")) {
            mensagem = "Currículo ainda não foi publicado.";
          }
        }
        setCurriculoErro(mensagem);
        setCurriculoDados(null);
      } finally {
        if (ativo) {
          setCurriculoCarregando(false);
        }
      }
    }

    void carregarCurriculo();

    return () => {
      ativo = false;
    };
  }, []);

  const curriculoDownloadUrl = useMemo(() => {
    if (!curriculoDados) {
      return null;
    }
    const rawUrl = curriculoDados.pdf_url;
    if (!rawUrl) {
      return buildApiUrl("/curriculum/latest/download");
    }
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    return buildApiUrl(rawUrl);
  }, [curriculoDados]);

  const curriculoTitulo =
    curriculoDados?.title ?? cardCurriculo?.titulo ?? "Currículo";

  const curriculoDescricao = curriculoCarregando
    ? "Carregando currículo..."
    : curriculoErro
    ? "Currículo indisponível no momento. Tente novamente mais tarde."
    : curriculoDados?.description ??
      cardCurriculo?.descricao ??
      "Visualize e baixe o currículo atualizado.";

  const curriculoResumoModal = curriculoCarregando
    ? "Estamos carregando as informações do currículo."
    : curriculoErro ?? curriculoDescricao;

  const curriculoConteudoParaExibicao =
    curriculoCarregando
      ? ["Carregando currículo..."]
      : curriculoErro
      ? ["Currículo indisponível no momento. Tente novamente mais tarde."]
      : curriculoDados?.description
      ? [curriculoDados.description]
      : detalhesCurriculo?.conteudo ?? [
          "Confira o currículo completo no PDF disponível para download.",
        ];

  const curriculoDetalhesCombinados = {
    ...(detalhesCurriculo ?? {}),
    resumo: curriculoResumoModal,
    conteudo: curriculoConteudoParaExibicao,
    arquivo: curriculoDownloadUrl ?? detalhesCurriculo?.arquivo,
  };

  const curriculoItem = cardCurriculo
    ? ({
        ...cardCurriculo,
        titulo: curriculoTitulo,
        descricao: curriculoDescricao,
        detalhes: curriculoDetalhesCombinados,
      } as (typeof dadosSobre)[0])
    : null;

  const cardsParaExibicao = dadosSobre.map((item) =>
    item.id === "curriculo" && curriculoItem ? curriculoItem : item
  );

  const handleCurriculoDownload = (
    event: MouseEvent<HTMLAnchorElement>,
    url: string | undefined
  ) => {
    if (url && url.trim()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const message = "Currículo indisponível para download no momento.";
    if (typeof window !== "undefined") {
      window.alert(message);
    } else {
      console.warn(message);
    }
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

    // Currículo
    if ("conteudo" in detalhes && Array.isArray(detalhes.conteudo)) {
      return (
        <div className="space-y-5">
          {"resumo" in detalhes && detalhes.resumo && (
            <p className="text-foreground/90 leading-relaxed">
              {detalhes.resumo}
            </p>
          )}
          <ul className="space-y-3">
            {detalhes.conteudo.map((linha: string, index: number) => (
              <li key={index} className="text-foreground/80 leading-relaxed">
                {linha}
              </li>
            ))}
          </ul>
          <a
            href={detalhes.arquivo ?? "#"}
            download={detalhes.arquivo ? "" : undefined}
            onClick={(event) => handleCurriculoDownload(event, detalhes.arquivo)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar currículo (PDF)
          </a>
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
          {cardsParaExibicao.map((item, index) => (
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

        {/* Call to action para chat fake */}
        <div
          className="animate-slide-up flex flex-col items-start"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-4">
            <MessageCircle className="w-8 h-8 text-primary" />
            Fale com meu fake
          </h2>
          <Link
            href="/fake-chat"
            className="group mt-10 inline-flex items-center gap-4 rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background neon-border"
          >
            <span className="text-lg font-semibold tracking-wide transition-colors group-hover:text-primary">
              Começar chat
            </span>
          </Link>
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

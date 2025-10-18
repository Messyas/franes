"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Zap } from "lucide-react";
import CardSobre from "@/componentes/CardSobre";
import ModalDetalhes from "@/componentes/ModalDetalhes";
import {
  buildApiUrl,
  fetchLatestCurriculum,
  type CurriculumRecord,
} from "@/lib/api";
import { obterDadosSobre } from "@/lib/funcoesAuxiliares";

function parseCurriculumCsv(csv: string): string[] {
  if (!csv) {
    return [];
  }

  const rows = csv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((cell) => cell.replace(/^"|"$/g, "").trim())
    );

  if (!rows.length) {
    return [];
  }

  const [firstRow, ...rest] = rows;
  const headerIndicators = ["campo", "field", "chave", "header", "key"];
  const isHeader =
    firstRow.length >= 2 &&
    headerIndicators.includes(firstRow[0].toLowerCase());

  const dataRows = isHeader ? rest : rows;

  return dataRows
    .map((cells) => {
      if (!cells.length) {
        return null;
      }
      if (cells.length >= 2) {
        const [key, ...values] = cells;
        const value = values.join(", ").trim();
        return `${key}: ${value || ""}`.trim();
      }
      return cells[0];
    })
    .filter((value): value is string => Boolean(value && value.trim()));
}

/**
 * Seção Sobre - Apresenta informações sobre Messyas
 * Inclui educação, habilidades e projetos destacados
 */
export default function SecaoSobre() {
  const dadosSobre = obterDadosSobre();
  const cardCurriculo = dadosSobre.find((item) => item.id === "curriculo");
  const detalhesCurriculo =
    cardCurriculo?.detalhes as
      | {
          resumo?: string;
          conteudo?: string[];
          arquivo?: string;
        }
      | undefined;
  const IconeCurriculo = cardCurriculo?.icone;
  const cardsInformativos = dadosSobre.filter(
    (item) => item.id !== "curriculo"
  );
  const [curriculoDados, setCurriculoDados] =
    useState<CurriculumRecord | null>(null);
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

  const curriculoConteudo = useMemo(() => {
    if (!curriculoDados) {
      return [];
    }
    return parseCurriculumCsv(curriculoDados.csv_content);
  }, [curriculoDados]);

  const curriculoDownloadUrl = useMemo(() => {
    if (!curriculoDados) {
      return null;
    }
    return buildApiUrl("/curriculum/latest/download");
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

  const curriculoConteudoDisponivel =
    !curriculoErro && curriculoConteudo.length > 0;

  const curriculoConteudoParaExibicao = curriculoConteudoDisponivel
    ? curriculoConteudo
    : curriculoErro
    ? ["Currículo indisponível no momento. Tente novamente mais tarde."]
    : curriculoCarregando
    ? ["Carregando currículo..."]
    : detalhesCurriculo?.conteudo ?? [];

  const abrirModalCurriculo = () => {
    if (!cardCurriculo) {
      return;
    }

    const itemComCurriculo = {
      ...cardCurriculo,
      titulo: curriculoTitulo,
      descricao: curriculoDescricao,
      detalhes: {
        resumo: curriculoResumoModal,
        conteudo: curriculoConteudoParaExibicao,
        arquivo: curriculoDownloadUrl ?? undefined,
      },
    } as (typeof dadosSobre)[0];

    setItemSelecionado(itemComCurriculo);
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

    // Currículo
    if ("conteudo" in detalhes && Array.isArray(detalhes.conteudo)) {
      return (
        <div className="space-y-5">
          {"resumo" in detalhes && detalhes.resumo && (
            <p className="text-foreground/90 leading-relaxed">{detalhes.resumo}</p>
          )}
          <ul className="space-y-3">
            {detalhes.conteudo.map((linha: string, index: number) => (
              <li key={index} className="text-foreground/80 leading-relaxed">
                {linha}
              </li>
            ))}
          </ul>
          {"arquivo" in detalhes && detalhes.arquivo && (
            <a
              href={detalhes.arquivo}
              download
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar currículo (CSV)
            </a>
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {cardsInformativos.map((item, index) => (
            <CardSobre
              key={item.id}
              titulo={item.titulo}
              descricao={item.descricao}
              icone={item.icone}
              delay={index * 0.1}
              onClick={() => abrirModal(item)}
            />
          ))}
          {cardCurriculo && (
            <div
              key={cardCurriculo.id}
              className="group p-6 bg-card/50 border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 hover:scale-105 transition-all duration-300 neon-border animate-slide-up cursor-pointer flex flex-col justify-between md:aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ animationDelay: `${cardsInformativos.length * 0.1}s` }}
              onClick={abrirModalCurriculo}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  abrirModalCurriculo();
                }
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  {IconeCurriculo && (
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconeCurriculo className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {curriculoTitulo}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {curriculoDescricao}
                  </p>
                </div>
              </div>
              {curriculoDownloadUrl ? (
                <a
                  href={curriculoDownloadUrl}
                  download
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all group-hover:translate-y-1"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                  Baixar CSV
                </a>
              ) : (
                <button
                  type="button"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground shadow cursor-not-allowed"
                  disabled
                  onClick={(event) => event.stopPropagation()}
                >
                  {curriculoCarregando ? "Carregando..." : "Indisponível"}
                </button>
              )}
            </div>
          )}
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

"use client";

import { User, Mail, FileText, Heart } from "lucide-react";
import type { TipoSecao } from "@/app/page";

interface PropsNavegacaoInferior {
  secaoAtiva: TipoSecao;
  aoMudarSecao: (secao: TipoSecao) => void;
}

/**
 * Componente de navegação inferior flutuante estilo iPhone
 * Apresenta animações de escala e brilho ao clicar nos ícones
 */
export default function NavegacaoInferior({
  secaoAtiva,
  aoMudarSecao,
}: PropsNavegacaoInferior) {
  /**
   * Configuração dos itens de navegação
   */
  const itensNavegacao = [
    { id: "sobre" as TipoSecao, icone: User, label: "Sobre" },
    { id: "contatos" as TipoSecao, icone: Mail, label: "Contatos" },
    { id: "blog" as TipoSecao, icone: FileText, label: "Blog" },
    { id: "hobbies" as TipoSecao, icone: Heart, label: "Hobbies" },
  ];
  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      aria-label="Navegação principal"
    >
      {/* Container da barra de navegação com efeito glassmorphism e shimmer */}
      <div className="flex items-center gap-2 px-4 py-3 glass-strong rounded-full neon-border shimmer-effect animate-shimmer sm:gap-3 sm:px-6 sm:py-4">
        {itensNavegacao.map((item) => {
          const Icone = item.icone;
          const estaAtivo = secaoAtiva === item.id;

          return (
            <button
              key={item.id}
              onClick={() => aoMudarSecao(item.id)}
              className={`
                relative flex flex-col items-center justify-center gap-1 rounded-2xl
                transition-all duration-300 ease-out
                hover:scale-110 active:scale-95
                w-14 h-14 sm:w-16 sm:h-16 xl:w-[4.75rem] xl:h-[4.75rem]
                ${
                  estaAtivo
                    ? "scale-110 bg-primary/20 glass-light"
                    : "hover:bg-secondary/50"
                }
              `}
              aria-label={item.label}
              aria-current={estaAtivo ? "page" : undefined}
            >
              {/* Ícone com animação de brilho neon verde quando ativo */}
              <Icone
                className={`
                  w-5 h-5 transition-all duration-300 sm:w-6 sm:h-6
                  ${
                    estaAtivo
                      ? "text-primary drop-shadow-[0_0_12px_rgba(0,255,136,0.8)]"
                      : "text-muted-foreground"
                  }
                `}
                strokeWidth={estaAtivo ? 2.5 : 2}
              />

              {/* Label do ícone */}
              <span
                className={`
                  text-[0.65rem] font-medium transition-all duration-300 sm:text-xs
                  ${
                    estaAtivo
                      ? "text-primary font-semibold neon-glow"
                      : "text-muted-foreground"
                  }
                `}
              >
                {item.label}
              </span>

              {estaAtivo && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-slide-up"
                  style={{
                    boxShadow:
                      "0 0 15px rgba(0, 255, 136, 1), 0 0 30px rgba(0, 255, 136, 0.5)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

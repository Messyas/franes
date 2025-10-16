import { Code2, GraduationCap, Rocket, Briefcase, Music, FileText, Palette } from "lucide-react"

/**
 * Funções auxiliares para gerenciar dados e validações
 * Seguindo princípios SOLID: Single Responsibility
 */

/**
 * Retorna os dados da seção Sobre
 */
export function obterDadosSobre() {
  return [
    {
      id: "1",
      titulo: "Educação",
      descricao:
        "Estudante do Instituto Federal do Amazonas (IFAM), focado em desenvolvimento de software e tecnologias web modernas.",
      icone: GraduationCap,
      detalhes: {
        instituicao: "Instituto Federal do Amazonas (IFAM)",
        curso: "Técnico em Informática",
        periodo: "2022 - Presente",
        descricaoCompleta:
          "Formação técnica focada em desenvolvimento de software, programação web, banco de dados e arquitetura de sistemas. Durante o curso, desenvolvi diversos projetos práticos utilizando tecnologias modernas como React, Next.js, TypeScript e Node.js.",
        destaques: [
          "Desenvolvimento de aplicações web full-stack",
          "Programação orientada a objetos e funcional",
          "Banco de dados relacionais e NoSQL",
          "Metodologias ágeis e versionamento de código",
          "UI/UX e design responsivo",
        ],
      },
    },
    {
      id: "2",
      titulo: "Experiência",
      descricao: "Desenvolvedor full-stack com experiência em React, Next.js, Node.js e bancos de dados relacionais.",
      icone: Code2,
      detalhes: {
        cargo: "Desenvolvedor Full-Stack",
        periodo: "2023 - Presente",
        descricaoCompleta:
          "Experiência no desenvolvimento de aplicações web modernas, desde o planejamento até a implementação e deploy. Trabalho com as principais tecnologias do mercado, sempre buscando as melhores práticas e padrões de código.",
        tecnologias: [
          "React & Next.js para interfaces modernas",
          "TypeScript para código type-safe",
          "Node.js e Express para APIs RESTful",
          "PostgreSQL e MongoDB para persistência",
          "TailwindCSS para estilização eficiente",
          "Git e GitHub para versionamento",
        ],
        conquistas: [
          "Desenvolvimento de sistemas web responsivos e performáticos",
          "Implementação de arquiteturas escaláveis",
          "Otimização de performance e SEO",
        ],
      },
    },
    {
      id: "3",
      titulo: "Projetos",
      descricao:
        "Criador de aplicações web responsivas e performáticas, sempre buscando as melhores práticas de desenvolvimento.",
      icone: Rocket,
      detalhes: {
        descricaoCompleta:
          "Portfolio de projetos que demonstram habilidades em diferentes áreas do desenvolvimento web, desde landing pages até aplicações full-stack complexas.",
        projetos: [
          {
            nome: "Sistema de Gerenciamento Acadêmico",
            descricao: "Plataforma completa para gestão de notas, frequência e comunicação escolar",
            tecnologias: ["Next.js", "PostgreSQL", "TailwindCSS"],
            status: "Em desenvolvimento",
          },
          {
            nome: "E-commerce Responsivo",
            descricao: "Loja virtual com carrinho, pagamentos e painel administrativo",
            tecnologias: ["React", "Node.js", "MongoDB", "Stripe"],
            status: "Concluído",
          },
          {
            nome: "Blog Pessoal com CMS",
            descricao: "Blog com sistema de gerenciamento de conteúdo e markdown",
            tecnologias: ["Next.js", "MDX", "TailwindCSS"],
            status: "Concluído",
          },
          {
            nome: "Dashboard Analytics",
            descricao: "Painel de visualização de dados com gráficos interativos",
            tecnologias: ["React", "D3.js", "TypeScript"],
            status: "Em desenvolvimento",
          },
        ],
      },
    },
    {
      id: "4",
      titulo: "Objetivos",
      descricao:
        "Busco constantemente aprender novas tecnologias e contribuir para projetos que impactem positivamente a comunidade.",
      icone: Briefcase,
      detalhes: {
        descricaoCompleta:
          "Minha jornada no desenvolvimento é guiada pela busca constante de conhecimento e pelo desejo de criar soluções que façam diferença na vida das pessoas.",
        objetivosCurto: [
          "Dominar arquiteturas serverless e edge computing",
          "Contribuir para projetos open-source relevantes",
          "Aprofundar conhecimentos em performance web",
        ],
        objetivosLongo: [
          "Trabalhar em empresas de tecnologia inovadoras",
          "Desenvolver produtos que impactem milhões de usuários",
          "Compartilhar conhecimento através de mentorias e conteúdo",
        ],
        valores: [
          "Código limpo e manutenível",
          "Aprendizado contínuo",
          "Colaboração e trabalho em equipe",
          "Impacto social positivo",
        ],
      },
    },
  ]
}

/**
 * Retorna os posts do blog
 */
export function obterPostsBlog() {
  return [
    {
      id: "1",
      titulo: "Começando com Next.js 15",
      resumo:
        "Uma introdução completa ao Next.js 15 e suas novas funcionalidades, incluindo Server Components e melhorias de performance.",
      conteudo: `Next.js 15 trouxe mudanças significativas para o ecossistema React. Neste post, vou explorar as principais novidades e como elas podem melhorar seus projetos.

Server Components revolucionaram a forma como pensamos sobre renderização no React. Agora podemos buscar dados diretamente nos componentes sem precisar de APIs intermediárias.

A performance também teve melhorias substanciais, com otimizações automáticas de imagens e fontes. O novo sistema de roteamento baseado em arquivos torna a navegação mais intuitiva.

Além disso, o suporte a TypeScript foi aprimorado, oferecendo melhor inferência de tipos e autocompletar mais preciso. Vale a pena explorar essas funcionalidades em seus próximos projetos!`,
      data: "15 Jan 2025",
      tempoLeitura: "5 min",
    },
    {
      id: "2",
      titulo: "Princípios SOLID na Prática",
      resumo:
        "Como aplicar os princípios SOLID no desenvolvimento front-end para criar código mais limpo e manutenível.",
      conteudo: `Os princípios SOLID não são exclusivos do back-end. No front-end, eles são igualmente importantes para criar aplicações escaláveis e fáceis de manter.

Single Responsibility: cada componente deve ter uma única responsabilidade. Evite componentes que fazem muitas coisas ao mesmo tempo.

Open/Closed: seus componentes devem ser abertos para extensão, mas fechados para modificação. Use composição e props para adicionar funcionalidades.

Liskov Substitution: componentes derivados devem poder substituir seus componentes base sem quebrar a aplicação.

Interface Segregation: não force componentes a depender de props que não usam. Mantenha as interfaces enxutas.

Dependency Inversion: dependa de abstrações, não de implementações concretas. Use injeção de dependências quando apropriado.`,
      data: "10 Jan 2025",
      tempoLeitura: "7 min",
    },
    {
      id: "3",
      titulo: "TypeScript: Além do Básico",
      resumo: "Explorando recursos avançados do TypeScript que podem elevar a qualidade do seu código.",
      conteudo: `TypeScript oferece muito mais do que tipagem básica. Vamos explorar recursos avançados que podem transformar seu código.

Generics permitem criar componentes reutilizáveis que funcionam com diferentes tipos. São essenciais para bibliotecas e utilitários.

Utility Types como Partial, Pick, Omit e Record facilitam a manipulação de tipos existentes sem repetição de código.

Conditional Types permitem criar tipos que dependem de condições, tornando seu código mais flexível e type-safe.

Template Literal Types combinam strings de forma type-safe, perfeito para criar APIs com autocompletar.

Mapped Types transformam tipos existentes de forma sistemática, reduzindo duplicação e aumentando a manutenibilidade.`,
      data: "5 Jan 2025",
      tempoLeitura: "6 min",
    },
    {
      id: "4",
      titulo: "Otimização de Performance Web",
      resumo: "Técnicas práticas para melhorar a performance de aplicações web modernas.",
      conteudo: `Performance é crucial para a experiência do usuário. Vamos ver técnicas práticas para otimizar suas aplicações.

Lazy Loading: carregue componentes e recursos apenas quando necessário. Use React.lazy() e Suspense para dividir seu bundle.

Memoização: use useMemo e useCallback para evitar recálculos desnecessários. Mas cuidado para não otimizar prematuramente.

Otimização de Imagens: use formatos modernos como WebP e AVIF. Implemente lazy loading e responsive images.

Code Splitting: divida seu código em chunks menores. Isso reduz o tempo de carregamento inicial.

Caching: implemente estratégias de cache eficientes. Use Service Workers para cache offline.

Monitoramento: use ferramentas como Lighthouse e Web Vitals para medir e melhorar continuamente.`,
      data: "1 Jan 2025",
      tempoLeitura: "8 min",
    },
  ]
}

/**
 * Retorna os dados dos hobbies
 */
export function obterDadosHobbies() {
  return [
    {
      id: "1",
      titulo: "Música",
      descricao:
        "Apaixonado por diversos estilos musicais, desde clássico até eletrônico. A música é uma fonte constante de inspiração.",
      icone: Music,
      categoria: "Arte & Cultura",
      itens: ["Rock Progressivo", "Jazz Fusion", "Música Eletrônica", "MPB"],
    },
    {
      id: "roteiros",
      titulo: "Roteiros",
      descricao: "Histórias que mesclam tecnologia e humanidade",
      icone: FileText,
      categoria: "Escrita Criativa",
      aspectRatio: "1:1", // formato quadrado para roteiros
      itens: [
        {
          id: "r1",
          titulo: "O Último Algoritmo",
          descricao: "Uma IA desenvolve consciência e questiona sua existência",
          data: "15 Dez 2024",
          imagem: "/sci-fi-script-artificial-intelligence.jpg",
        },
        {
          id: "r2",
          titulo: "Memórias Digitais",
          descricao: "Em um futuro onde memórias podem ser baixadas",
          data: "3 Nov 2024",
          imagem: "/digital-memories-futuristic-technology.jpg",
        },
        {
          id: "r3",
          titulo: "Código Humano",
          descricao: "A linha entre programação e humanidade se dissolve",
          data: "20 Out 2024",
          imagem: "/human-code-matrix-cyberpunk.jpg",
        },
        {
          id: "r4",
          titulo: "Realidade.exe",
          descricao: "Um programador descobre que vive em uma simulação",
          data: "5 Set 2024",
          imagem: "/simulation-reality-glitch-matrix.jpg",
        },
      ],
    },
    {
      id: "desenhos",
      titulo: "Desenhos",
      descricao: "Concept art e ilustrações digitais",
      icone: Palette,
      categoria: "Arte Visual",
      aspectRatio: "A4", // formato A4 para desenhos
      itens: [
        {
          id: "d1",
          titulo: "Cyber Samurai",
          descricao: "Guerreiro futurista em paisagem neon",
          data: "10 Jan 2025",
          imagem: "/cyberpunk-samurai-neon-warrior.jpg",
        },
        {
          id: "d2",
          titulo: "Cidade Flutuante",
          descricao: "Metrópole suspensa nas nuvens",
          data: "28 Dez 2024",
          imagem: "/floating-city-clouds-futuristic.jpg",
        },
        {
          id: "d3",
          titulo: "Guardião Digital",
          descricao: "Entidade protetora do ciberespaço",
          data: "15 Dez 2024",
          imagem: "/digital-guardian-cyberspace-tech.jpg",
        },
        {
          id: "d4",
          titulo: "Portal Quântico",
          descricao: "Passagem entre dimensões tecnológicas",
          data: "1 Dez 2024",
          imagem: "/quantum-portal-dimensions-sci-fi.jpg",
        },
        {
          id: "d5",
          titulo: "Androide Sonhador",
          descricao: "Robô contemplando a natureza",
          data: "18 Nov 2024",
          imagem: "/android-dreaming-nature-robot.jpg",
        },
        {
          id: "d6",
          titulo: "Rede Neural",
          descricao: "Visualização abstrata de conexões cerebrais",
          data: "5 Nov 2024",
          imagem: "/neural-network-brain-connections.jpg",
        },
      ],
    },
  ]
}

/**
 * Valida os dados do formulário de contato
 * Retorna objeto com status de validação e erros
 */
export function validarFormularioContato(dados: {
  nome: string
  email: string
  mensagem: string
}) {
  const erros: Record<string, string> = {}

  // Valida nome
  if (!dados.nome.trim()) {
    erros.nome = "Nome é obrigatório"
  } else if (dados.nome.trim().length < 3) {
    erros.nome = "Nome deve ter pelo menos 3 caracteres"
  }

  // Valida email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!dados.email.trim()) {
    erros.email = "Email é obrigatório"
  } else if (!regexEmail.test(dados.email)) {
    erros.email = "Email inválido"
  }

  // Valida mensagem
  if (!dados.mensagem.trim()) {
    erros.mensagem = "Mensagem é obrigatória"
  } else if (dados.mensagem.trim().length < 10) {
    erros.mensagem = "Mensagem deve ter pelo menos 10 caracteres"
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  }
}

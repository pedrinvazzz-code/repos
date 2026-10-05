/*
 * Conteúdo do site.
 * Para mudar textos, projetos, stack, certificados ou contatos, edite só este arquivo.
 */
window.SITE = {
  name: "Pedro Henrique Borges",
  brand: "Pedro Henrique",
  footerName: "Pedro",
  city: "Uberlândia",
  timeZone: "America/Sao_Paulo",
  email: "phenrriquevaz@gmail.com",
  status: "Disponível para trabalho",
  statusShort: "Disponível",

  hero: {
    // O título começa com `start` e é "editado ao vivo" até virar o texto final.
    start: "Planilhas que\nninguém entende.",
    edits: [
      { peer: "etl", find: "Planilhas", replace: "Dados" },
      { peer: "pedro", find: "ninguém entende", replace: "fazem sentido", serif: true }
    ],
    sub: "Engenharia e análise de dados em Uberlândia. Agora: pipelines ETL que alimentam dashboards usados todo dia."
  },

  projects: [
    {
      id: "cairo-special-bikes",
      title: "Cairo Special Bikes",
      tagline: "Plataforma de dados para uma loja de bicicletas consignadas, do app de campo ao dashboard.",
      tags: ["ETL", "Supabase", "Power BI"],
      stack: ["Python", "pandas", "PostgreSQL", "Supabase", "GitHub Actions", "Apps Script", "Power BI"],
      year: "2026",
      url: "https://github.com/pedrinvazzz-code/Cairo-Special-Bikes",
      media: [
        {
          type: "image",
          src: "assets/img/cairo-dashboard.webp",
          width: 1400, height: 791,
          alt: "Painel Visão Geral no Power BI com total de consignações, vendas, giro mediano e meta de faturamento.",
          caption: "Base de demonstração: nomes fictícios e valores alterados."
        },
        {
          type: "phones",
          caption: "App de campo rodando sobre uma base simulada.",
          items: [
            { src: "assets/img/cairo-app-estoque.webp", width: 600, height: 1298, alt: "Aba Estoque do app, com valor em estoque e itens parados há mais de 90 dias." },
            { src: "assets/img/cairo-app-ficha.webp", width: 600, height: 1298, alt: "Ficha do proprietário com histórico de consignações." },
            { src: "assets/img/cairo-app-correcao.webp", width: 600, height: 1298, alt: "Tela de correção de registro com trilha de auditoria." }
          ]
        }
      ],
      sections: [
        {
          heading: "O problema",
          body: "A loja operava em 12 planilhas mantidas à mão, com datas inconsistentes, números em formatos misturados e regras de negócio duplicadas. Faturamento e giro de estoque não eram confiáveis."
        },
        {
          heading: "Uma direção de escrita",
          body: "Um app em Apps Script grava na planilha, que é o único lugar onde se escreve. Um ETL em Python roda a cada 2 horas pelo GitHub Actions e carrega tudo no PostgreSQL do Supabase, com 7 views semânticas alimentando o Power BI."
        },
        {
          heading: "Qualidade que aparece",
          body: "Uma auditoria mostrou que dois terços da receita histórica estavam contaminados por estimativas. Hoje são 99 testes automatizados, verificação depois de cada carga e falhas que param o processo em vez de passar em silêncio."
        },
        {
          heading: "Perguntas em linguagem natural",
          body: "Um assistente com IA responde perguntas sobre a loja usando só 7 ferramentas parametrizadas, sem gerar SQL livre. A plataforma está em produção desde abril de 2026."
        }
      ]
    },
    {
      id: "nettrac-nfse-etl",
      title: "NetTRAC NFS-e ETL",
      tagline: "Pipeline que transforma notas fiscais de serviço em análise financeira para uma empresa de rastreamento veicular.",
      tags: ["Python", "XML e PDF", "Supabase"],
      stack: ["Python", "lxml", "PyMuPDF", "watchdog", "PostgreSQL", "Supabase", "Power BI"],
      year: "2026",
      url: "https://github.com/pedrinvazzz-code/NetTRAC-NFSe-ETL",
      media: [
        {
          type: "image",
          src: "assets/img/nettrac-dashboard.webp",
          width: 1024, height: 572,
          alt: "Wireframe do painel da NetTRAC no Power BI com faturamento, notas pendentes e distribuição por serviço.",
          caption: "Wireframe do painel, sem dados da empresa."
        }
      ],
      sections: [
        {
          heading: "O problema",
          body: "O Portal Nacional da NFS-e só deixa consultar uma nota por vez. Sem exportação em lote, analisar receita por cliente, período ou tipo de serviço era impossível."
        },
        {
          heading: "Três formas de entrada",
          body: "Um watcher monitora pastas em tempo real, uma sincronização automática usa o certificado digital e-CNPJ e um importador em lote cuida do histórico. XML e PDF caem no mesmo modelo de dados."
        },
        {
          heading: "Sem duplicidade",
          body: "A deduplicação usa a chave de acesso nacional da nota, não o número, então reprocessar é seguro. As placas dos veículos são extraídas das descrições com expressões regulares."
        },
        {
          heading: "Resultado",
          body: "Um painel no Power BI, atualizado por gateway, mostra receita total, ticket médio, sazonalidade por cliente e impostos. 11 consultas SQL cobrem as análises do dia a dia."
        }
      ]
    },
    {
      id: "voebem-analytics",
      title: "VoeBem Analytics",
      tagline: "Mais de 1 milhão de voos da ANAC em arquitetura medalhão, com um agente que responde em português.",
      tags: ["Databricks", "PySpark", "Delta Lake"],
      stack: ["Databricks", "PySpark", "SQL", "Delta Lake", "Unity Catalog", "Genie"],
      year: "2026",
      url: "https://github.com/pedrinvazzz-code/-voebem-analytics-anac",
      media: [
        {
          type: "image",
          src: "assets/img/voebem-genie.webp",
          width: 1263, height: 807,
          alt: "Agente Genie respondendo qual companhia tem melhor pontualidade, com gráfico de barras por companhia aérea.",
          caption: "O agente Genie respondendo sobre pontualidade das companhias."
        },
        {
          type: "image",
          src: "assets/img/voebem-pipeline.webp",
          width: 1277, height: 622,
          alt: "Grafo do pipeline declarativo de qualidade no Databricks.",
          caption: "Pipeline declarativo com as expectativas de qualidade."
        }
      ],
      sections: [
        {
          heading: "A pergunta",
          body: "Quais voos, companhias e rotas mais atrasam no Brasil, e por quê? Os dados da ANAC vêm espalhados em vários arquivos CSV."
        },
        {
          heading: "Bronze, Silver e Gold",
          body: "15 CSVs somam 1.014.705 linhas na camada Bronze. A Silver tipa e documenta cada coluna, e a Gold entrega dim_aeroporto, fato_voos e uma tabela única pensada para consumo por IA."
        },
        {
          heading: "Qualidade declarativa",
          body: "12 expectativas monitoram completude, coerência temporal e integridade referencial. Nada é descartado em silêncio: o que falha vai para uma tabela de quarentena, para diagnóstico."
        },
        {
          heading: "Respostas sem joins",
          body: "Um agente Genie sobre a camada Gold responde quais aeroportos mais atrasam e como as companhias se comparam em pontualidade. Linhagem e documentação ficam no Unity Catalog."
        }
      ]
    },
    {
      id: "segmentacao-clientes",
      title: "Segmentação de Clientes",
      tagline: "Dashboard que analisa 2.000 clientes para entender por que as campanhas de marketing convertiam pouco.",
      tags: ["Power BI", "DAX", "marketing"],
      stack: ["Power BI", "DAX", "Modelagem de dados"],
      year: "2026",
      url: "https://github.com/pedrinvazzz-code/Segmenta-o-Clientes-Marketing-Powerbi",
      media: [],
      sections: [
        {
          heading: "O problema",
          body: "Campanhas com baixa conversão por causa de uma segmentação fraca, sem clareza sobre quem eram os clientes de maior valor."
        },
        {
          heading: "O que os dados mostraram",
          body: "US$ 1 milhão em receita, gasto médio de US$ 602 por cliente e 16% de conversão nas campanhas. Renda e gasto andam juntos, e clientes sem filhos compram mais."
        },
        {
          heading: "Para que serve",
          body: "Estado civil e escolaridade pesam no comportamento de compra, o que permite campanhas mais direcionadas para cada perfil."
        }
      ]
    },
    {
      id: "phishing-sql",
      title: "Phishing SQL",
      tagline: "Análise exploratória em SQL para descobrir quais características de uma URL denunciam phishing.",
      tags: ["SQL", "SQLite", "análise"],
      stack: ["SQL", "SQLite", "Dataset do Kaggle"],
      year: "2026",
      url: "https://github.com/pedrinvazzz-code/Phishing-SQL",
      media: [],
      sections: [
        {
          heading: "A pergunta",
          body: "Quais características estruturais de uma URL têm mais relação com páginas de phishing?"
        },
        {
          heading: "Como",
          body: "Consultas SQL em SQLite sobre um dataset com 20 variáveis de URL, como contagens de caracteres e comprimentos, além do rótulo que separa páginas legítimas de maliciosas."
        },
        {
          heading: "Resultado",
          body: "A força da relação de cada variável com o rótulo, os indicadores mais fortes e uma avaliação de se essas variáveis bastam para um detector real."
        }
      ]
    }
  ],

  stack: [
    { id: "dados", label: "Dados", blurb: "Extrair, limpar e mover dados sem perder nada no caminho.", items: ["Python", "Pandas", "PySpark", "SQL"] },
    { id: "plataforma", label: "Plataforma", blurb: "Onde os dados moram e como chegam lá sozinhos.", items: ["PostgreSQL", "Supabase", "Databricks", "Delta Lake", "GitHub Actions"] },
    { id: "analise", label: "Análise", blurb: "Painéis que respondem perguntas de negócio.", items: ["Power BI", "DAX", "Matplotlib", "Genie"] },
    { id: "codigo", label: "Código", blurb: "A base por trás de tudo isso.", items: ["C#", "Git", "Google Apps Script", "SQLite"] }
  ],

  about: [
    "Sou o Pedro, estudante de Gestão da Informação na UFU. Gosto da parte do trabalho que quase ninguém vê. A planilha bagunçada que vira uma tabela confiável. O pipeline que roda sozinho a cada duas horas. O número do painel que bate com o caixa.",
    "Hoje estou no 7º período e construo pipelines ETL e dashboards para negócios reais, como a plataforma de dados que uma loja de bicicletas usa todos os dias. Meu foco agora é engenharia de dados, automação e boas práticas de desenvolvimento."
  ],

  certificatesUrl: "https://github.com/pedrinvazzz-code/Certificados---Pedro-Henrique",
  certificates: [
    { issuer: "IBM", items: ["Introduction to Data Engineering", "Python for Data Science", "Databases and SQL with Python", "Python Project for Data Engineering"] },
    { issuer: "DataCamp", items: ["Introduction to SQL", "Intermediate SQL", "Joining Data in SQL"] },
    { issuer: "LinkedIn Learning", items: ["Python for Data Engineering", "Hands-On Advanced Python: Data Engineering Basics", "Career Skills in Data Analytics"] },
    { issuer: "Data Science Academy", items: ["Power BI para Business Intelligence e Data Science"] },
    { issuer: "Google", items: ["Introduction to Git and GitHub"] },
    { issuer: "Fluency Academy", items: ["Essentials", "Level Up", "Expert", "Business English"] }
  ],

  contacts: [
    { id: "email", label: "Copiar e-mail", hint: "phenrriquevaz@gmail.com", keywords: "email mail contato", action: "copy" },
    { id: "github", label: "GitHub", hint: "pedrinvazzz-code", keywords: "código repositórios", action: "open", url: "https://github.com/pedrinvazzz-code" },
    { id: "linkedin", label: "LinkedIn", hint: "pedro-henrique-ferreira-borges-vaz", keywords: "currículo trabalho", action: "open", url: "https://www.linkedin.com/in/pedro-henrique-ferreira-borges-vaz" },
    { id: "instagram", label: "Instagram", hint: "@ph_bggg", keywords: "rede social", action: "open", url: "https://www.instagram.com/ph_bggg" }
  ]
};

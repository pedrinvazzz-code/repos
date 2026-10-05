/*
 * Conteúdo do site.
 * Para mudar textos, projetos, o laboratório, os adesivos ou os contatos, edite só este arquivo.
 */
window.SITE = {
  name: "Pedro Henrique",
  role: "engenharia de dados",
  timeZone: "America/Sao_Paulo",
  email: "phenrriquevaz@gmail.com",
  updated: "10/26",

  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/pedro-henrique-borges-b24556b9", icon: "linkedin-logo", hint: "pedro-henrique-borges-b24556b9" },
    { label: "GitHub", url: "https://github.com/pedrinvazzz-code", icon: "github-logo", hint: "pedrinvazzz-code" },
    { label: "Instagram", url: "https://www.instagram.com/ph_bggg", icon: "instagram-logo", hint: "@ph_bggg" },
    { label: "E-mail", url: "mailto:phenrriquevaz@gmail.com", icon: "envelope-simple", hint: "phenrriquevaz@gmail.com" }
  ],

  // Pôster da página inicial: "<saudação> Dados viram [console] Sistemas"
  poster: {
    left: "Dados viram",
    right: "Sistemas",
    subLeft: "engenharia de dados",
    subRight: { text: "agora: gestão da informação", handle: "@ufu", url: "https://ufu.br" }
  },

  // Abas da página de projetos. "category" de cada projeto diz em qual aba ele aparece.
  projectTabs: [
    { id: "profissional", label: "Profissional" },
    { id: "pessoal", label: "Pessoal" }
  ],

  // Ferramentas que aparecem como chips nos cartões e nas janelas dos projetos.
  // "icon" é um logo do Simple Icons ou um ícone do Phosphor (ver icons.js).
  tools: {
    python: { label: "Python", icon: "python", color: "#3776AB" },
    pandas: { label: "pandas", icon: "pandas", color: "#150458" },
    matplotlib: { label: "Matplotlib", icon: "chart-line-up-fill", color: "#11557C" },
    postgresql: { label: "PostgreSQL", icon: "postgresql", color: "#4169E1" },
    supabase: { label: "Supabase", icon: "supabase", color: "#3ECF8E" },
    databricks: { label: "Databricks", icon: "databricks", color: "#FF3621" },
    pyspark: { label: "PySpark", icon: "apachespark", color: "#E25A1C" },
    sql: { label: "SQL", icon: "database-fill", color: "#5B6B7F" },
    powerbi: { label: "Power BI", icon: "powerbi", color: "#E0A800" },
    githubactions: { label: "GitHub Actions", icon: "githubactions", color: "#2088FF" },
    git: { label: "Git", icon: "git", color: "#F05032" }
  },

  // Stack da página inicial, em teclas. Use as chaves de "tools" acima.
  homeStack: ["python", "pandas", "sql", "postgresql", "supabase", "databricks", "pyspark", "powerbi", "githubactions", "git"],

  // Aviso que aparece junto de toda imagem de projeto. Um projeto pode trocar o texto com "mediaNote"
  // (e "realData: true" para usar a etiqueta verde de dados reais).
  mediaNote: "dados fictícios",

  projects: [
    {
      id: "cairo-special-bikes",
      company: "Cairo Special Bikes",
      status: "Entregue",
      title: "Sistema de dados ponta a ponta",
      file: "cairo-special-bikes.md",
      category: "profissional",
      tools: ["python", "supabase", "powerbi"],
      cover: { logo: "assets/img/logo-cairo.webp", alt: "Logo da Cairo Special Bikes", bg: "#141416", pad: "17% 22%", fit: "contain" },
      tagline: "Plataforma de dados para uma loja de bicicletas consignadas, do app de campo ao dashboard.",
      stack: ["Python", "pandas", "PostgreSQL", "Supabase", "GitHub Actions", "Apps Script", "Power BI"],
      url: "https://github.com/pedrinvazzz-code/Cairo-Special-Bikes",
      media: [
        { type: "image", src: "assets/img/cairo-dashboard.webp", width: 1400, height: 791, alt: "Painel Visão Geral no Power BI com consignações, vendas, giro mediano e meta de faturamento.", caption: "Painel com a base de demonstração." },
        {
          type: "phones", caption: "App de campo rodando sobre uma base simulada.",
          items: [
            { src: "assets/img/cairo-app-estoque.webp", width: 600, height: 1298, alt: "Aba Estoque do app, com valor em estoque e itens parados há mais de 90 dias." },
            { src: "assets/img/cairo-app-ficha.webp", width: 600, height: 1298, alt: "Ficha do proprietário com histórico de consignações." },
            { src: "assets/img/cairo-app-correcao.webp", width: 600, height: 1298, alt: "Tela de correção de registro com trilha de auditoria." }
          ]
        }
      ],
      sections: [
        { heading: "O problema", body: "A loja operava em 12 planilhas mantidas à mão, com datas inconsistentes, números em formatos misturados e regras de negócio duplicadas. Faturamento e giro de estoque não eram confiáveis." },
        { heading: "Uma direção de escrita", body: "Um app em Apps Script grava na planilha, que é o único lugar onde se escreve. Um ETL em Python roda a cada 2 horas pelo GitHub Actions e carrega tudo no PostgreSQL do Supabase, com 7 views semânticas alimentando o Power BI." },
        { heading: "Qualidade que aparece", body: "Uma auditoria mostrou que dois terços da receita histórica estavam contaminados por estimativas. Hoje são 99 testes automatizados, verificação depois de cada carga e falhas que param o processo em vez de passar em silêncio." },
        { heading: "Perguntas em linguagem natural", body: "Um assistente com IA responde perguntas sobre a loja usando só 7 ferramentas parametrizadas, sem gerar SQL livre. A plataforma está em produção desde abril de 2026." }
      ]
    },
    {
      id: "nettrac-nfse-etl",
      company: "NetTRAC Rastreadores",
      status: "Entregue",
      title: "Pipeline ETL de notas fiscais",
      file: "nettrac-nfse-etl.md",
      category: "profissional",
      tools: ["python", "postgresql", "powerbi"],
      cover: { logo: "assets/img/logo-nettrac.webp", alt: "Logo da NetTRAC Rastreadores", bg: "#ffffff", pad: "6% 14%", fit: "contain" },
      tagline: "Pipeline que transforma notas fiscais de serviço em análise financeira para uma empresa de rastreamento veicular.",
      stack: ["Python", "lxml", "PyMuPDF", "watchdog", "PostgreSQL", "Supabase", "Power BI"],
      url: "https://github.com/pedrinvazzz-code/NetTRAC-NFSe-ETL",
      media: [
        { type: "image", src: "assets/img/nettrac-dashboard.webp", width: 1024, height: 572, alt: "Wireframe do painel da NetTRAC no Power BI com faturamento, notas pendentes e distribuição por serviço.", caption: "Wireframe do painel." }
      ],
      sections: [
        { heading: "O problema", body: "O Portal Nacional da NFS-e só deixa consultar uma nota por vez. Sem exportação em lote, analisar receita por cliente, período ou tipo de serviço era impossível." },
        { heading: "Três formas de entrada", body: "Um watcher monitora pastas em tempo real, uma sincronização automática usa o certificado digital e-CNPJ e um importador em lote cuida do histórico. XML e PDF caem no mesmo modelo de dados." },
        { heading: "Sem duplicidade", body: "A deduplicação usa a chave de acesso nacional da nota, não o número, então reprocessar é seguro. As placas dos veículos são extraídas das descrições com expressões regulares." },
        { heading: "Resultado", body: "Um painel no Power BI, atualizado por gateway, mostra receita total, ticket médio, sazonalidade por cliente e impostos. 11 consultas SQL cobrem as análises do dia a dia." }
      ]
    },
    {
      id: "voebem-analytics",
      company: "Dados abertos da ANAC",
      title: "Lakehouse de voos no Databricks",
      file: "voebem-analytics.md",
      category: "pessoal",
      mediaNote: "dados públicos da ANAC",
      realData: true,
      tools: ["databricks", "pyspark", "sql"],
      // O principal aprendizado do projeto foi o Databricks, então ele vai na capa.
      cover: { icon: "databricks", label: "Databricks", color: "#FF3621", bg: "radial-gradient(80% 100% at 50% 0%, #ffffff, #fdeeea 75%)" },
      tagline: "Mais de 1 milhão de voos da ANAC em arquitetura medalhão, com um agente que responde em português.",
      stack: ["Databricks", "PySpark", "SQL", "Delta Lake", "Unity Catalog", "Genie"],
      url: "https://github.com/pedrinvazzz-code/-voebem-analytics-anac",
      media: [
        { type: "image", src: "assets/img/voebem-genie.webp", width: 1263, height: 807, alt: "Agente Genie respondendo qual companhia tem melhor pontualidade, com gráfico de barras por companhia aérea.", caption: "O agente Genie respondendo sobre pontualidade das companhias." },
        { type: "image", src: "assets/img/voebem-pipeline.webp", width: 1277, height: 622, alt: "Grafo do pipeline declarativo de qualidade no Databricks.", caption: "Pipeline declarativo com as expectativas de qualidade." }
      ],
      sections: [
        { heading: "A pergunta", body: "Quais voos, companhias e rotas mais atrasam no Brasil, e por quê? Os dados da ANAC vêm espalhados em vários arquivos CSV." },
        { heading: "Bronze, Silver e Gold", body: "15 CSVs somam 1.014.705 linhas na camada Bronze. A Silver tipa e documenta cada coluna, e a Gold entrega dim_aeroporto, fato_voos e uma tabela única pensada para consumo por IA." },
        { heading: "Qualidade declarativa", body: "12 expectativas monitoram completude, coerência temporal e integridade referencial. Nada é descartado em silêncio: o que falha vai para uma tabela de quarentena, para diagnóstico." },
        { heading: "Respostas sem joins", body: "Um agente Genie sobre a camada Gold responde quais aeroportos mais atrasam e como as companhias se comparam em pontualidade. Linhagem e documentação ficam no Unity Catalog." }
      ]
    },
    {
      id: "dominando-pandas",
      company: "Estudo autodirigido",
      title: "Prática diária com pandas",
      file: "dominando-pandas.md",
      category: "pessoal",
      tools: ["python", "pandas", "matplotlib"],
      cover: { icon: "pandas", label: "pandas", color: "#150458", bg: "radial-gradient(80% 100% at 50% 0%, #ffffff, #efedf8 75%)" },
      tagline: "Uma análise de dados por dia com Python e pandas, cada uma com um dataset e perguntas de negócio, aumentando a dificuldade aos poucos.",
      stack: ["Python", "pandas", "Matplotlib"],
      url: "https://github.com/pedrinvazzz-code/Dominando-Pandas",
      media: [
        { type: "image", src: "assets/img/roas.webp", width: 1000, height: 600, alt: "Gráfico de barras do ROAS por canal de marketing, com Email Marketing muito à frente.", caption: "Dia 8: ROAS por canal, a partir de 1.200 registros de campanhas." },
        { type: "image", src: "assets/img/pandas-faturamento.webp", width: 1000, height: 600, alt: "Gráfico de barras do faturamento total por categoria: Acessórios, Informática e Áudio.", caption: "Dia 5: faturamento por categoria, depois do merge de produtos e vendas." }
      ],
      sections: [
        { heading: "A ideia", body: "Cada dia tem uma pasta com um dataset e um script que responde perguntas de negócio sobre ele. A dificuldade aumenta aos poucos, de Series e DataFrames até merge, limpeza e ETL." },
        { heading: "Limpeza de dados", body: "O dia 6 é o mais importante: datasets gerados com valores faltantes, duplicatas, datas em formatos misturados e texto inconsistente. O script diagnostica cada problema, trata e valida o resultado antes de analisar." },
        { heading: "Perguntas de negócio", body: "Um e-commerce com 3.000 pedidos e 28 colunas rende KPIs de faturamento, margem, cancelamento e entrega. Já os 1.200 registros de campanhas trazem ROAS, CTR e CPC, num arquivo em latin-1 que quebra o read_csv padrão." },
        { heading: "Do script ao pipeline", body: "No último dia, um ETL completo: extração, transformação e carga dos dados limpos, com logging em todo o código." }
      ]
    }
  ],

  // Laboratório: um bloco por projeto, com o código (ou imagem) e uma anotação ao lado.
  lab: {
    title: "Construindo para aprender",
    sub: "Exercícios, estudos e projetos menores, separados por projeto. Cada janela abre o repositório no GitHub.",
    projects: [
      {
        id: "pandas", name: "Dominando Pandas", origin: "estudo próprio",
        url: "https://github.com/pedrinvazzz-code/Dominando-Pandas",
        files: [
          {
            name: "etl_sqlite3.py", lang: "py",
            code: String.raw`def extract(file_path: str) -> pd.DataFrame:
  logging.info(f"Extracting data from {file_path}")
  try:
      df = pd.read_csv(file_path)
      logging.info(f"Data extracted successfully!")
      return df
  except Exception as e:
    logging.error(f"Error extracting data from {file_path} : {e}")
    raise

def transform(df: pd.DataFrame) -> pd.DataFrame:
    logging.info(f"Transforming data from {df}")
    try:
        treated_df = df.dropna().drop_duplicates()`
          },
          { name: "roas_por_canal.png", image: { src: "assets/img/roas.webp", width: 1000, height: 600, alt: "Gráfico de barras do ROAS por canal de marketing, com Email Marketing muito à frente." } }
        ],
        note: {
          text: "Uma análise por dia, cada uma com um dataset e perguntas de negócio. No fim, um ETL completo.",
          points: [
            "extract e transform registram cada etapa no log, e o erro para o processo em vez de passar em silêncio.",
            "dropna e drop_duplicates fazem a limpeza básica antes da carga.",
            "O gráfico é do dia 8: ROAS por canal a partir de 1.200 campanhas."
          ]
        }
      },
      {
        id: "avl", name: "Índice remissivo com árvore AVL", origin: "disciplina · UFU",
        url: "https://github.com/pedrinvazzz-code/indice-remissivo-avl-python",
        files: [
          {
            name: "avl.py", lang: "py",
            code: String.raw`def __RotacaoLL(self, A):
    self.rotacoes += 1
    B = A.esq
    A.esq = B.dir
    B.dir = A

    A.altura = self.__maior(self.__altura(A.esq), self.__altura(A.dir)) + 1
    B.altura = self.__maior(self.__altura(B.esq), self.__altura(B.dir)) + 1
    return B`
          }
        ],
        note: {
          text: "Um índice que lista cada palavra de um texto e as linhas em que ela aparece.",
          points: [
            "Cada nó guarda a palavra e um set de linhas, então repetir a palavra na mesma linha não duplica nada.",
            "A rotação LL rebalanceia a árvore depois de uma inserção do lado esquerdo e recalcula as alturas.",
            "Também tem busca por prefixo e a palavra mais frequente."
          ]
        }
      },
      {
        id: "eleicoes", name: "Eleições municipais 2024", origin: "disciplina · UFU",
        url: "https://github.com/pedrinvazzz-code/banco-de-dados-eleicoes-2024",
        files: [
          {
            name: "eleicoes_2024.sql", lang: "sql",
            code: String.raw`CREATE SCHEMA ELEICAO_2024;
SET SEARCH_PATH TO ELEICAO_2024;

CREATE TABLE CARGO (
  CD_CARGO INTEGER PRIMARY KEY,
  DS_CARGO TEXT
);

CREATE TABLE PARTIDO (
  NR_PARTIDO INTEGER PRIMARY KEY,
  SG_PARTIDO TEXT,
  NM_PARTIDO TEXT
);`
          }
        ],
        note: {
          text: "Modelo relacional com os candidatos de 2024, a partir de dados públicos do TSE.",
          points: [
            "O schema separa candidato, partido, cargo, coligação e bens declarados.",
            "Em cima dele, consultas com JOIN, GROUP BY, HAVING e subconsultas.",
            "A base completa passa de 900 mil linhas de INSERT."
          ]
        }
      },
      {
        id: "phishing", name: "URLs de phishing em SQL", origin: "estudo próprio",
        url: "https://github.com/pedrinvazzz-code/Phishing-SQL",
        files: [
          {
            name: "phishing.sql", lang: "sql",
            code: String.raw`SELECT
    phishing,
    AVG(url_length) AS avg_url_length,
    AVG(n_dots) AS avg_n_dots,
    AVG(n_hypens) AS avg_n_hypens,
    AVG(n_slash) AS avg_n_slash,
    AVG(n_equal) AS avg_n_equal,
    AVG(n_redirection) AS avg_n_redirection
FROM phishing_data
GROUP BY phishing;`
          }
        ],
        note: {
          text: "Quais características de uma URL indicam fraude? Análise exploratória em SQLite com um dataset do Kaggle.",
          points: [
            "Comparar as médias de cada grupo mostra o que separa uma URL legítima de uma de phishing.",
            "URLs de phishing têm, em média, uns 43 caracteres a mais e mais barras.",
            "Conclusão: a estrutura da URL ajuda como sinal de risco, mas sozinha não basta."
          ]
        }
      },
      {
        id: "csharp", name: "POO em C#: locadora", origin: "disciplina · UFU",
        url: "https://github.com/pedrinvazzz-code/POO-em-Csharp-",
        files: [
          {
            name: "Locadora.cs", lang: "cs",
            code: String.raw`interface ISeguravel
{
    double CalcularDiariaSeguro();
}

public Cliente(string nome, string endereco)
{
    contador++;
    codigo = contador;
    this.nome = nome;
    this.endereco = endereco;
}`
          }
        ],
        note: {
          text: "Projeto final da disciplina: uma locadora de veículos em console, escrita à mão, sem IA.",
          points: [
            "A interface ISeguravel obriga cada tipo de veículo e cliente a calcular o próprio seguro.",
            "O contador estático gera o código de cada cliente de forma incremental.",
            "Junta herança, classes abstratas, polimorfismo e List<T>."
          ]
        }
      },
      {
        id: "ibm", name: "PIB dos países: ETL com web scraping", origin: "curso · IBM",
        url: "https://github.com/pedrinvazzz-code/IBM_project",
        files: [
          {
            name: "etl_country_gdp.py", lang: "py",
            code: String.raw`def transform(df):
    GDP_list = df["GDP_USD_millions"].tolist()
    GDP_list = [float("".join(x.split(','))) for x in GDP_list]
    GDP_list = [np.round(x/1000,2) for x in GDP_list]
    df["GDP_USD_millions"] = GDP_list
    df=df.rename(columns = {"GDP_USD_millions":"GDP_USD_billions"})
    return df`
          }
        ],
        note: {
          text: "Do curso Python Project for Data Engineering, da IBM: tabela da Wikipédia até o SQLite.",
          points: [
            "A extração lê a tabela de PIB da página com Requests e BeautifulSoup.",
            "O transform tira as vírgulas e converte milhões em bilhões de dólares.",
            "A carga vai para CSV e para o SQLite, com uma consulta dos países acima de 100 bilhões."
          ]
        }
      }
    ]
  },

  board: {
    title: "Antes de ir, cola um adesivo.",
    stickers: [
      { id: "python", label: "Python", color: "#3776AB" },
      { id: "pandas", label: "pandas", color: "#150458" },
      { id: "postgresql", label: "PostgreSQL", color: "#4169E1" },
      { id: "supabase", label: "Supabase", color: "#3ECF8E" },
      { id: "databricks", label: "Databricks", color: "#FF3621" },
      { id: "powerbi", label: "Power BI", color: "#F2C811" },
      { id: "aws", label: "AWS", color: "#FF9900" },
      { id: "git", label: "Git", color: "#F05032" }
    ],
    todo: [
      { text: "Estudar Databricks", done: true },
      { text: "Estudar PySpark", done: true },
      { text: "Montar meu portfólio", done: true },
      { text: "Construir o próximo pipeline", done: false }
    ]
  },

  profile: {
    heading: "Sobre mim",
    paragraphs: [
      "Sou estudante de Gestão da Informação na Universidade Federal de Uberlândia (UFU), atualmente no 7º período.",
      "Venho aprendendo a construir soluções de dados na <em>prática</em>, desde planilhas e APIs até bancos de dados na nuvem, pipelines de ETL e dashboards em Power BI. A plataforma que construí para a Cairo Special Bikes roda em produção todos os dias."
    ],
    prints: [
      { src: "assets/img/avatar.webp", alt: "Arte em ASCII de uma caneca com a frase not my cup of tea.", stamp: "10 05 26", position: "50% 50%" },
      { src: "assets/img/cairo-app-estoque.webp", alt: "Tela de estoque do app da Cairo Special Bikes.", stamp: "04 26", position: "50% 8%" }
    ],
    facts: [
      { file: "aprendendo.txt", text: "engenharia de dados, automação e boas práticas de desenvolvimento" },
      { file: "pergunte-me.txt", text: "Python, C#, SQL, Power BI e ETL" },
      { file: "certificados.txt", text: "16 certificados de IBM, Google, DataCamp, Data Science Academy, LinkedIn Learning e Fluency", link: { label: "ver todos", url: "https://github.com/pedrinvazzz-code/Certificados---Pedro-Henrique" } }
    ]
  }
};

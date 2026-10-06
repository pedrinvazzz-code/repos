# Plano: site de apuração ao vivo do 2º turno 2026

> **Para o Claude que recebe este documento:** este é o briefing completo do projeto. Leia tudo antes de escrever código. As seções 3 (restrições) e 13 (ordem de execução) mandam no resto. Itens marcados com **[VERIFICAR]** não foram confirmados e precisam ser checados contra a fonte real antes de virar código.

---

## 1. Contexto

- **Eleição:** 2º turno presidencial no Brasil, **domingo, 25 de outubro de 2026**. O confronto é Lula × Flávio Bolsonaro. Alguns estados também têm 2º turno para governador **[VERIFICAR quais UFs]**.
- **Hoje:** 6 de outubro de 2026. São **19 dias** até a eleição.
- **Referência:** em eleições anteriores, um site de apuração feito por um adolescente viralizou no X (Twitter) só pelo visual. Era um mapa bonito com filtro por região. Marcas pagaram cerca de R$ 100 mil para aparecer nele durante a apuração. A ideia é repetir esse resultado com mais preparo.
- **Autor:** desenvolvedor focado em dados. O projeto precisa render **três coisas**: (1) tráfego e patrocínio no dia, (2) uma peça forte de portfólio em engenharia de dados e (3) um case público depois ("como fiz um site que aguentou X milhões de acessos").

## 2. Objetivo e métrica de sucesso

| Meta | Mínimo aceitável | Ótimo |
|---|---|---|
| Site no ar, estável, de 17h às 23h do dia 25 | zero queda | p95 < 1 s no celular em 4G |
| Visitantes únicos no dia 25 | 100 mil | 1 milhão ou mais |
| Patrocínio fechado **antes** do dia 25 | 1 marca | patrocinador master + 2 cotas |
| Portfólio | repositório público + README técnico | case com números reais + vídeo timelapse da apuração |

## 3. Restrições inegociáveis

1. **Divulgação 100% autêntica.** Nada de contas falsas, perfis "fingindo ser usuário", bots, compra de engajamento ou spam de respostas. Isso viola as regras do X contra manipulação de plataforma. Na eleição a fiscalização aperta e o risco é perder as contas e ter o link marcado como spam, justamente no canal principal. Permitido: uma conta oficial do projeto, a conta pessoal do autor e amigos e parentes compartilhando das contas reais deles.
2. **Neutralidade política total.** Nada de opinião, nenhum adjetivo sobre candidato, cores que não remetam a partido e ordem dos candidatos pelo número de urna ou alfabética, nunca por preferência. Neutralidade é o que faz os dois lados compartilharem e o que permite vender patrocínio.
3. **Não se passar pelo TSE.** O nome, o logo e o visual não podem imitar o TSE nem o governo. O rodapé fixo diz: "Site independente e não oficial. Fonte: TSE (resultados.tse.jus.br)." Cada número tem um link para a fonte.
4. **Nada de projeção de vencedor.** Mostrar só o que o TSE divulgou. Nada de "projeção", "tendência estatística" ou "vencedor provável". Só anunciar "eleito" quando o próprio TSE marcar o candidato como eleito no JSON.
5. **Patrocínio só comercial.** Nada de dinheiro de partido, candidato, campanha ou entidade política. Nada de anúncio com conteúdo eleitoral. Evitar redes de anúncio automáticas que possam exibir conteúdo político. O ideal é patrocínio direto.
6. **Os navegadores nunca acessam o TSE.** Um único coletor nosso conversa com o TSE. O público só lê arquivos estáticos na nossa CDN. Isso protege o TSE, evita bloqueio e é o que faz o site aguentar o pico.
7. **Privacidade (LGPD).** Analytics sem cookie (Plausible, Umami ou Cloudflare Web Analytics). Geolocalização só com clique explícito e nunca enviada ao servidor.

## 4. Linha do tempo (de 6 a 25 de outubro)

| Datas | Técnica | Visual | Marketing |
|---|---|---|---|
| **6–8 out** | Descobrir os endpoints do TSE para 2026; coletor do 1º turno (resultado final); mapa IBGE → TopoJSON; de-para TSE↔IBGE | Direção visual, paleta, tipografia, 3 telas no papel | Escolher nome e domínio; criar a conta oficial (X, Instagram, TikTok, Threads, Bluesky); primeiro post de "construindo em público" |
| **9–12 out** | **Lançar o mapa do 1º turno** (estático, já com dados reais); OG images por UF e município | Mapa + painel nacional + página do município, só mobile primeiro | Lançamento do mapa do 1º turno; 1 conteúdo de dados por dia (seção 10.2) |
| **13–18 out** | Simulador de apuração progressiva; modo "ao vivo" ligado ao simulador; histórico em Parquet | Animações, cabo de guerra, cartograma "terra não vota", imagens para compartilhar | Contato com criadores e jornalistas; embed; mídia kit; prospecção de patrocínio; posts no LinkedIn e no TabNews |
| **19–22 out** | Teste de carga (k6); coletor redundante; alertas; runbook | Polimento, acessibilidade, modo claro e escuro, tela de "aguardando 17h" | Fechar patrocínio; página "anuncie"; canal de WhatsApp e Telegram com aviso "salva o link" |
| **23–24 out** | **Congelar código** (só correção de bug); ensaio geral com o simulador | Encaixar a marca do patrocinador | Contagem regressiva; avisar a rede de amigos e parentes com o kit de compartilhamento |
| **25 out** | Plantão a partir das 15h (seção 11) | — | Posts a cada marco da apuração (seção 11) |
| **26 out em diante** | Congelar o histórico; publicar o dataset | Timelapse em vídeo | Case "como fiz", números reais, agradecimento ao patrocinador |

## 5. Arquitetura

```
             a cada 15–30 s
 TSE (resultados.tse.jus.br) ──► COLETOR (Python, VPS) ──► normaliza + valida (pydantic)
                                    │                         │
                                    │                         ├─► R2 / object storage:  /v1/*.json  (estado atual)
                                    │                         └─► Parquet/DuckDB: snapshots (histórico)
                                    └─ coletor reserva em outra região (assume se o principal parar)

 Navegador ──► Cloudflare CDN ──► Cloudflare Pages (site estático)  +  R2 (JSON de dados)
                                  Worker opcional: OG image dinâmica
```

### 5.1 Stack recomendada

- **Coletor:** Python 3.12, `httpx` assíncrono, `pydantic` (validação de schema), `orjson`, `boto3` (API S3 do R2), `duckdb`/`pyarrow` para o histórico. Roda num VPS pequeno (Hetzner ou Fly.io) com `systemd` e reinício automático, mais um reserva. **Não usar GitHub Actions cron** (mínimo de 5 min e atrasos imprevisíveis).
- **Armazenamento e entrega:** Cloudflare R2 (sem custo de saída de dados) atrás da CDN da Cloudflare. Site no Cloudflare Pages.
- **Frontend:** Vite + React (ou Svelte, se o autor preferir) + TypeScript. Mapa com **MapLibre GL JS sem mapa base** (só os nossos polígonos, colorindo via `feature-state`) ou `d3-geo` em `<canvas>`. Evitar SVG para os 5.570 municípios, que fica pesado no celular.
- **Geometria:** malhas do IBGE (API `servicodados.ibge.gov.br/api/v3/malhas/...`) simplificadas com `mapshaper` e convertidas para TopoJSON quantizado. Carregar os estados primeiro e os municípios depois (lazy).
- **Observabilidade:** Better Stack ou UptimeRobot (uptime), métricas próprias do coletor (último ciclo OK, latência, erros), Cloudflare Analytics + Plausible/Umami (números para o mídia kit).
- **Teste de carga:** k6 contra a CDN, simulando o padrão real (HTML + JSON a cada 15 s por cliente).

### 5.2 Cache e consistência

- `/v1/meta.json`: `Cache-Control: public, max-age=5, stale-while-revalidate=30`. Contém `versao` (timestamp do snapshot) e `atualizado_em`.
- Dados pesados em caminho **versionado e imutável**: `/v1/snap/{versao}/mapa-mun.json` com `max-age=31536000, immutable`. O cliente lê `meta.json` e depois busca o snapshot daquela versão. Isso evita mistura de versões entre arquivos e deixa a CDN servir quase tudo do cache.
- O cliente faz polling de `meta.json` a cada 15 s (com jitter) e pausa quando a aba fica oculta (`visibilitychange`).
- Se o coletor parar, o site continua servindo o último snapshot e mostra "atualizado há X min". Nunca exibe tela de erro.

## 6. Dados

### 6.1 Fontes

| Fonte | Uso |
|---|---|
| `resultados.tse.jus.br` (JSONs de divulgação) | Resultado ao vivo por Brasil, UF e município |
| `resultados.tse.jus.br/oficial/comum/config/ele-c.json` **[VERIFICAR]** | Lista de eleições e seus códigos; a partir dela se descobrem os códigos do 1º e do 2º turno de 2026 |
| `dadosabertos.tse.jus.br` | Histórico (2022) para comparação, boletins de urna, eleitorado por município |
| API de malhas do IBGE | Geometria de UFs e municípios |
| Tabela de correspondência TSE↔IBGE | O TSE usa código próprio de município (5 dígitos), diferente do IBGE (7 dígitos). Existem tabelas públicas; validar que cobrem os 5.570 municípios |

### 6.2 Padrão de URL de 2022 (ponto de partida, **[VERIFICAR] para 2026**)

Em 2022 a estrutura era parecida com esta (código de eleição `544` = 1º turno presidente, `545` = 2º turno; cargo `c0001` = presidente):

```
/oficial/ele2022/545/dados-simplificados/br/br-c0001-e000545-r.json        # Brasil
/oficial/ele2022/545/dados-simplificados/{uf}/{uf}-c0001-e000545-r.json    # por UF
/oficial/ele2022/545/config/mun-e000545-cm.json                            # lista de municípios
/oficial/ele2022/545/dados/{uf}/{uf}{cdmun}-c0001-e000545-v.json           # por município
```

Campos que apareciam no JSON simplificado (confirmar nomes): `pst` (% de seções totalizadas), `cand[]` com `n` (número), `nm` (nome), `vap` (votos), `pvap` (%), `e` (eleito), mais brancos, nulos, abstenção e data/hora da última atualização.

**Primeira tarefa técnica:** baixar o `ele-c.json`, achar os códigos de 2026, baixar um exemplo de cada nível, salvar em `fixtures/` e escrever os modelos `pydantic` a partir dos arquivos reais. Nada de inventar campo.

> ⚠️ **Ambiente na nuvem:** a política de rede padrão do Claude Code na web pode bloquear `resultados.tse.jus.br` (aconteceu na sessão que gerou este plano: o proxy devolveu 403). Libere na configuração de rede do ambiente os domínios `resultados.tse.jus.br`, `dadosabertos.tse.jus.br` e `servicodados.ibge.gov.br`, ou rode a descoberta localmente.

### 6.3 Estratégia de coleta (o problema dos 5.570 municípios)

Buscar um arquivo por município a cada ciclo dá cerca de 5.570 requisições, o que é demais. Estratégia:

1. A cada ciclo (15–30 s): buscar `br` e as 27 UFs. São 28 requisições.
2. Investigar no dia 1 se existe arquivo agregado por UF com todos os municípios **[VERIFICAR]**. Se existir, use e o problema acaba.
3. Se não existir: varredura rotativa dos municípios com **GET condicional** (`If-None-Match`/`If-Modified-Since`), concorrência limitada (por exemplo, 20 ao mesmo tempo) e **prioridade** para as UFs cujo `pst` mudou desde o último ciclo. Municípios com 100% apurado saem da fila.
4. `User-Agent` identificável com contato. Backoff exponencial em 429/5xx. Nunca martelar.

### 6.4 Modelo de saída (o que o frontend consome)

```
/v1/meta.json                     { versao, atualizado_em, pst_br, status: "aguardando"|"apurando"|"encerrado" }
/v1/snap/{versao}/br.json         totais nacionais, candidatos, brancos, nulos, abstenção, pst
/v1/snap/{versao}/uf.json         27 UFs: [uf, votosA, votosB, pst, ...]
/v1/snap/{versao}/mapa-mun.json   compacto, 5.570 linhas: [ibge, pctA_x10, pst_x10]  (inteiros, alvo < 120 KB gzip)
/v1/mun/{ibge}.json               detalhe do município (atualizado na varredura)
/v1/serie/br.json                 série temporal: [(t, pst, pctA, pctB)]  (gráfico de evolução)
/v1/primeiro-turno/...            mesma estrutura, congelada, para comparação
```

- Cada snapshot também é gravado em Parquet (`historico/{versao}.parquet`). Isso alimenta o replay, o timelapse e o case de portfólio.
- **Validações antes de publicar:** a soma dos votos das UFs deve bater com o Brasil, `pst` nunca diminui, nenhum percentual fica fora de 0–100 e os 5.570 municípios estão presentes. Se falhar, **não publica** e alerta.

### 6.5 Simulador (essencial: o 2º turno só acontece uma vez)

Script que pega o resultado final do 1º turno (ou de 2022) e gera snapshots progressivos realistas: seções entrando em ondas, regiões com ritmos diferentes, `pst` subindo de 0 a 100% em cerca de 3 h. Ele escreve no mesmo formato `/v1/` e serve para três coisas: desenvolver o modo ao vivo, ensaiar o dia e fazer o teste de carga.

## 7. Produto: funcionalidades

### MVP (obrigatório para o dia 25)
1. **Painel nacional:** % apurado, os dois candidatos com votos e %, "cabo de guerra" com a linha de 50% dos válidos, brancos, nulos e abstenção.
2. **Mapa do Brasil** com troca de nível UF ↔ município, cor pela margem (escala divergente) e transparência pelo % apurado.
3. **Filtro por região** (Norte, Nordeste, Centro-Oeste, Sudeste, Sul) e por UF, com zoom suave.
4. **Busca de município** (autocomplete) e página própria do município com URL compartilhável (`/sp/campinas`).
5. **Atualização ao vivo** com "atualizado há X s" e destaque animado do que mudou.
6. **Compartilhar:** botão que gera imagem (1080×1350 e 1200×675) do Brasil, da UF ou do município, com URL e marca do patrocinador.
7. **Tela pré-17h:** contagem regressiva + mapa do 1º turno + "ative o aviso".

### Diferenciais (só se o MVP estiver pronto e testado)
- **Cartograma "terra não vota":** alterna entre o mapa geográfico e o mapa por eleitores (hexágonos ou bolhas proporcionais). É o tipo de visual que viraliza porque desmonta a leitura enganosa do mapa geográfico.
- **Mapa de variação 1º → 2º turno:** onde cada candidato ganhou ou perdeu votos.
- **Comparação com 2022.**
- **Governadores** nas UFs com 2º turno.
- **Replay:** linha do tempo arrastável da apuração.
- **Modo embed** (`/embed?uf=ba`) para sites e streamers.

## 8. Visual

### 8.1 Direção
**"Editorial de jornal premium, ao vivo, à noite."** Pense numa noite de eleição na TV, mas limpa: fundo escuro como padrão (o pico é de 17h às 22h e a maioria está no celular), números enormes, muito espaço e um mapa que brilha. Tem que ficar bonito num **print de tela**, porque o print é a unidade de viralização.

### 8.2 Regras
- **Mobile primeiro.** A maior parte do tráfego vem do app do X no celular. Projete em 390 px e depois expanda.
- **Tipografia:** uma sans grotesca forte para os títulos e números grandes (por exemplo Inter Display, Geist ou Space Grotesk) com algarismos tabulares (`font-variant-numeric: tabular-nums`) para os números não "dançarem" na atualização. Uma mono para os metadados (hora, % apurado).
- **Cores dos candidatos:** neutras e sem associação partidária. **Evitar vermelho, verde e amarelo** (associados aos lados). Sugestão: um laranja âmbar contra um azul-violeta ou azul-petróleo. Validar contraste e daltonismo (deuteranopia e protanopia). A escala do mapa é divergente: cor A ↔ cinza neutro (empate) ↔ cor B. Município com pouca apuração fica com cor dessaturada ou hachurado.
- **Movimento com propósito:** contagem animada dos números (curta, cerca de 400 ms), municípios que acabaram de atualizar pulsam uma vez e o cabo de guerra desliza. Respeitar `prefers-reduced-motion`.
- **Hierarquia por tela:** 1º quem está na frente e por quanto; 2º quanto já foi apurado; 3º o mapa; 4º os detalhes.
- **Identidade própria:** nome curto, logotipo simples e nada que lembre o brasão ou as cores do TSE.
- **Espaço do patrocinador desenhado desde o início:** uma faixa "oferecimento" elegante no topo e na base das imagens de compartilhamento. Não pode parecer banner de anúncio colado.

### 8.3 Orçamento de performance
- JS inicial abaixo de 150 KB gzip. Mapa municipal carregado depois do primeiro paint.
- LCP abaixo de 2 s em 4G. Nenhuma fonte bloqueante (usar `font-display: swap` e preload só do peso principal).
- Teste real num Android barato, não só no notebook.

## 9. Monetização

- **Produto à venda:** visibilidade **no momento de maior atenção do ano** e, principalmente, a **marca em cada imagem compartilhada**. Esse é o argumento mais forte: o patrocinador viaja junto com cada print.
- **Cotas** (preços definidos pelos números de audiência do 1º turno e da pré-campanha):
  - **Master:** "Apuração [nome], oferecimento [marca]" no topo, nas imagens de compartilhamento, na tela de contagem regressiva e no case pós-eleição.
  - **Apoio (2–3 cotas):** logo no rodapé e menção nos posts oficiais.
- **Página "Anuncie"** com formulário e um **mídia kit em PDF**: prints, audiência real (visitantes, picos, impressões dos posts), público, formatos e prazo.
- **Quem prospectar:** marcas jovens e digitais (fintechs, apps, delivery, bets **não**: risco de imagem e regulação), empresas de tecnologia, cursos de dados e programação e agências. A mensagem tem que caber em 3 linhas com um link.
- **Formalização:** contrato simples por escrito, pagamento antecipado (ou 50% na assinatura e 50% no dia 24) via Pix ou boleto, com nota fiscal. **O MEI tem teto de faturamento anual (cerca de R$ 81 mil hoje **[VERIFICAR]**).** Valores maiores pedem ME com contador. Se o autor for menor de idade, os responsáveis assinam.
- **Plano B:** botão "apoie o projeto" (Pix) e venda do dataset/histórico para jornalistas depois.

## 10. Marketing

### 10.1 Princípios
- **O site é o marketing.** Cada tela precisa ser printável e cada print carrega a URL.
- **Ciclo viral:** pessoa vê o print → abre o site → procura a própria cidade → compartilha a imagem da cidade → amigos da cidade veem → ...
- **Chegar antes do dia.** No dia 25 todo mundo já está procurando um lugar para acompanhar. Quem já conhece o site volta e quem não conhece não descobre a tempo.
- **Uma voz oficial, neutra, rápida e útil.** A conta do projeto publica números e imagens, nunca opinião.

### 10.2 Conteúdo de pré-lançamento (1º turno, todos neutros e baseados em dados)
- "Como cada um dos 5.570 municípios votou no 1º turno" (lançamento).
- "O mapa engana: o Brasil por eleitores, não por área" (cartograma).
- "As 10 cidades mais divididas do país" (margens mínimas).
- "Onde a abstenção foi maior."
- "O que mudou de 2022 para 2026 na sua cidade."
- "Construindo em público": vídeos curtos de tela mostrando o mapa sendo montado, a arquitetura e o teste de carga. Funciona muito bem no X, no TikTok e no LinkedIn.

### 10.3 Canais
| Canal | Ação |
|---|---|
| **X** | Conta oficial + conta pessoal; threads de dados; prints; responder com utilidade (imagem + dado) em conversas relevantes, sem repetir a mesma mensagem e sem volume de spam |
| **Instagram / TikTok / Reels** | Vídeos verticais de 10–20 s do mapa animado; carrossel "como sua cidade votou" |
| **LinkedIn** | História de engenharia (portfólio) e o melhor canal para atrair patrocinador |
| **TabNews, Reddit (r/brasil, r/brdev), Bluesky, Threads** | Post de lançamento técnico e de dados, seguindo as regras de cada comunidade |
| **WhatsApp (canal) e Telegram** | "Ative o aviso: mandamos o link às 16h55 do dia 25." No Brasil isso tem um alcance enorme |
| **Imprensa e criadores** | E-mail curto para jornalistas de dados, newsletters de política e tecnologia, perfis de dados e streamers, oferecendo **embed gratuito** com crédito |
| **Rede pessoal** | Kit pronto para amigos e parentes: link, 3 imagens e 2 textos sugeridos. Cada um posta da própria conta, do jeito dele |

### 10.4 Kit de imprensa e embed
Página `/imprensa` com logotipo, prints em alta resolução, descrição de 2 linhas, contato e código de `<iframe>` do embed.

## 11. Dia D: runbook (25 de outubro)

| Horário (Brasília) | Ação |
|---|---|
| 13h | Checar coletor principal e reserva, alertas, CDN e cache. Ensaio rápido com o simulador em staging |
| 15h | Plantão começa. Painel de monitoramento aberto (coletor, erros, tráfego) |
| 16h | Post "Às 17h começa a apuração. Acompanhe aqui." Mensagem no canal de WhatsApp e no Telegram |
| 16h55 | Lembrete final. Site em "aguardando", contagem regressiva |
| 17h | Votação encerra no país inteiro (horário unificado de Brasília **[VERIFICAR]**). Coletor em ritmo máximo |
| A cada marco | Post com imagem gerada pelo site: 10%, 25%, 50%, 75%, 90% apurado; viradas; UF que fechou; "TSE declara eleito" |
| Contínuo | Responder dúvidas, repostar quem compartilhou, agradecer o patrocinador nos marcos |
| Fim | Post "apuração encerrada" com imagem final + o mapa completo |

**Planos de contingência:**
- **TSE mudou o formato:** a validação bloqueia a publicação e o site segue no último snapshot válido. Corrigir o modelo com o fixture novo e republicar.
- **TSE lento ou fora do ar:** backoff; banner "o TSE está demorando para atualizar".
- **Coletor principal caiu:** o reserva assume pelo lock (por exemplo, um arquivo `lock` no R2 com TTL).
- **Pico de tráfego:** tudo é estático na CDN. Se precisar, aumentar o `max-age` de `meta.json` para 15 s.
- **Bug no frontend:** rollback instantâneo de deploy no Cloudflare Pages.

## 12. Portfólio (o que fica depois)

- Repositório público com README em português e em inglês: diagrama da arquitetura, decisões e trade-offs, números reais (requisições, pico de RPS, taxa de acerto do cache, custo total) e lições.
- **Timelapse** de 30–60 s da apuração com o histórico em Parquet.
- **Dataset aberto** com os snapshots minuto a minuto (algo que o TSE não oferece desse jeito).
- Post de case: "Do zero a X milhões de acessos em 19 dias."
- O site continua no ar como arquivo da eleição.

## 13. Ordem de execução para o Claude (comece por aqui)

1. **Esqueleto do repositório:** `coletor/` (Python), `web/` (frontend), `geo/` (scripts de malha), `simulador/`, `fixtures/`, `docs/`. Mais um README com o objetivo e um CLAUDE.md curto com as restrições da seção 3.
2. **Descoberta do TSE:** baixar `ele-c.json`, identificar os códigos do 1º e do 2º turno de 2026, baixar exemplos de cada nível e salvar em `fixtures/`. Documentar em `docs/fontes-tse.md` o que foi confirmado. Se a rede bloquear, avisar o autor imediatamente (seção 6.2).
3. **Geo:** malha do IBGE → TopoJSON simplificado (UF e município) + tabela TSE↔IBGE validada nos 5.570.
4. **Coletor v1:** resultado final do 1º turno → `/v1/primeiro-turno/` e `/v1/` com validações e testes (`pytest` com fixtures).
5. **Frontend v1:** painel + mapa + busca + página de município sobre os dados do 1º turno. **Publicar** (meta: até 12 de outubro).
6. **Imagens de compartilhamento e OG images.**
7. **Simulador + modo ao vivo** (polling, animações, estados "aguardando/apurando/encerrado").
8. **Histórico em Parquet + série temporal.**
9. **Infra de produção:** VPS, coletor reserva, alertas, teste de carga k6.
10. **Diferenciais** (seção 7), na ordem: cartograma → variação 1º → 2º turno → embed → governadores → replay.
11. **Congelamento** no dia 23. Depois disso, só correção.

**Definição de pronto para o dia 25:** ensaio completo com o simulador de 0% a 100% sem erro; teste de carga com pelo menos 5.000 requisições/s na CDN sem degradação; alerta testado (derrubar o coletor de propósito e ver o reserva assumir); Lighthouse mobile ≥ 90; revisão de neutralidade (texto, cores e ordem); rodapé "não oficial + fonte TSE" presente em todas as páginas e imagens.

## 14. Decisões em aberto (perguntar ao autor)

- Nome do projeto e domínio (checar disponibilidade no registro.br; sem "TSE" no nome).
- React ou Svelte no frontend.
- Fotos dos candidatos (a DivulgaCand do TSE tem fotos oficiais) ou só nomes e iniciais.
- Orçamento de infra (estimativa: menos de R$ 200 para VPS + domínio; R2 e Pages devem caber no plano gratuito ou quase).
- Situação fiscal (MEI, ME ou pessoa física) e se há responsável legal para assinar contratos.

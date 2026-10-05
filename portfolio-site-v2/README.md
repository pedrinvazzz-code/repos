# Portfólio de Pedro Henrique (versão "mesa de trabalho")

Segunda versão do portfólio, inspirada no [cindyly.design](https://www.cindyly.design/) e adaptada para engenharia de dados.

O site é HTML, CSS e JavaScript puros, sem etapa de build. Funciona direto no GitHub Pages.

## O que tem

- **Início:** pôster "Dados viram *Sistemas*" com um videogame portátil retrô no meio (desenhado em CSS, sem logo nem nome de marca). A tela abre num menu com quatro jogos:
  - **Limpeza de dados:** pegue as linhas verdes com a tabela e desvie das vermelhas (← → ou arrastar).
  - **Pato debugger:** o pato voa entre as barras do gráfico (A ou toque).
  - **Deploy em produção:** o pato pula os bugs, cada vez mais rápido (A ou toque).
  - **Snake do pipeline:** a cobrinha come linhas de dados (direcionais ou deslizar).

  Segurar uma direção repete o movimento. Direcionais ou toque escolhem o jogo, **A** ou **START** começam, **B**, **SELECT** ou **MENU** voltam ao menu. Com o foco no console, o teclado também funciona. Os recordes ficam salvos no navegador de quem joga.
  Embaixo, a **stack** em teclas com os logos (`homeStack` no `data.js`).
- **Artes do fundo:** cada aba tem artes escondidas (estátua, coruja em meio-tom, pássaro em ASCII, flor pixelada e a mão com os alertas). No computador, elas aparecem num círculo em volta do mouse. No celular, o círculo passeia sozinho de arte em arte e o dedo também revela. As imagens ficam em `assets/img/` (`hero-art.webp` e `art-*.webp`) e a posição de cada uma por aba fica no `style.css`, na seção "Artes do fundo".
- **Dock de vidro:** troca entre projetos, lab e perfil. Os endereços `#projetos`, `#lab` e `#perfil` funcionam como links diretos.
- **Projetos:** abas **Profissional** (projetos entregues para empresas, com a logo na capa) e **Pessoal** (estudos, com a ferramenta principal na capa). Toda imagem de projeto leva o aviso "dados fictícios" ao lado da legenda (`mediaNote` no `data.js`). Cada cartão mostra as ferramentas usadas como chips, definidos em `tools` no `data.js`. Os cartões saem da pasta da dock e cada um abre uma janela com o estudo de caso (`#projetos/<id>`). A aba de cada projeto vem do campo `category` em `data.js`.
- **Lab:** um bloco por projeto, cada um com o trecho real de código (ou o gráfico) e uma anotação ao lado explicando o que ele faz.
- **Adesivos:** puxe um adesivo da cartela e ele descola de verdade: a borda dobra por cima (dá para ver o verso) e, quando quase tudo soltou, ele vira e vai para o cursor. Dá para colar em qualquer lugar do lab, mover depois ou devolver para a cartela. Um toque rápido descola sozinho e cola no papel. Ficam salvos no navegador de quem visita.
- **Perfil:** polaroids (clique para trocar a da frente), texto do README do GitHub, arquivos `.txt` e links.

## Como editar

Todo o conteúdo fica em **`assets/js/data.js`**:

| O que mudar | Onde |
|---|---|
| Frase do pôster e legendas | `poster` |
| Projetos e estudos de caso | `projects` |
| Projetos do lab, código e anotações | `lab.projects` |
| Teclas da stack no início | `homeStack` |
| Adesivos e lista de tarefas | `board` |
| Texto, fotos e arquivos do perfil | `profile` |
| Links do topo e do perfil | `links` |

As fotos das polaroids estão em `profile.prints`. Hoje são o avatar do GitHub e um print do app do Cairo. Para usar fotos suas, coloque os arquivos em `assets/img/` e troque o `src`.

## Rodar no computador

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Créditos

- Linguagem visual inspirada em [cindyly.design](https://www.cindyly.design/).
- Fontes: DM Sans e Geist Mono (SIL Open Font License).
- Ícones: [Phosphor Icons](https://phosphoricons.com) (MIT). Logos dos adesivos: [Simple Icons](https://simpleicons.org) (CC0); as marcas pertencem aos seus donos.

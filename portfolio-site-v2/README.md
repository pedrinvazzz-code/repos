# Portfólio de Pedro Henrique (versão "mesa de trabalho")

Segunda versão do portfólio, inspirada no [cindyly.design](https://www.cindyly.design/) e adaptada para engenharia de dados.

O site é HTML, CSS e JavaScript puros, sem etapa de build. Funciona direto no GitHub Pages.

## O que tem

- **Início:** pôster "dados com *sentido.*" com um console no estilo Nintendo Switch no meio (desenhado em CSS, sem logo nem nome da marca). A tela roda um mini pipeline: blocos de dados caem e fazem as barras crescerem.
  - **A** ou **+**: rodar ETL. **B**, **−** ou o botão de início: limpar. **X** ou **↑**: o pato pula. **Y** ou **↓**: cai um bloco. **← →**: o pato anda.
  - Tocar na tela derruba um bloco na barra mais próxima. Com o foco no console, o teclado também funciona (setas, A, B, X e Y).
- **Dock de vidro:** troca entre projetos, lab e perfil. Os endereços `#projetos`, `#lab` e `#perfil` funcionam como links diretos.
- **Projetos:** cartões que saem da pasta da dock. Cada um abre uma janela com o estudo de caso (`#projetos/<id>`).
- **Lab:** janelinhas com trechos reais de código dos repositórios menores, uma nota e um quadro de adesivos arrastáveis com as ferramentas da stack. Os adesivos ficam salvos no navegador de quem visita.
- **Perfil:** polaroids (clique para trocar a da frente), texto do README do GitHub, arquivos `.txt` e links.

## Como editar

Todo o conteúdo fica em **`assets/js/data.js`**:

| O que mudar | Onde |
|---|---|
| Frase do pôster e legendas | `poster` |
| Projetos e estudos de caso | `projects` |
| Janelas do lab e a nota | `lab` |
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
- Fontes: DM Sans, DM Mono e Instrument Serif (SIL Open Font License).
- Ícones: [Phosphor Icons](https://phosphoricons.com) (MIT). Logos dos adesivos: [Simple Icons](https://simpleicons.org) (CC0); as marcas pertencem aos seus donos.
